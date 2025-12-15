import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { searchService, SearchResult, SearchFilters } from "@/services/searchService";

const DEBOUNCE_MS = 350;

export default function SearchDropdown() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<SearchResult[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    searchService.debounce(async (q: string) => {
      if (q.trim().length < 2) {
        setProfiles([]);
        setPosts([]);
        return;
      }
      setLoading(true);
      const [{ data: people, error: peopleError }, { data: postData, error: postsError }] =
        await Promise.all([
          searchService.searchProfiles(q, {} as SearchFilters),
          searchService.searchPosts(q),
        ]);

      if (!peopleError) setProfiles((people || []).slice(0, 5));
      if (!postsError) setPosts((postData || []).slice(0, 5));
      setLoading(false);
    }, DEBOUNCE_MS),
    []
  );

  useEffect(() => {
    if (open) debouncedSearch(query);
  }, [query, open, debouncedSearch]);

  const clear = () => {
    setQuery("");
    setProfiles([]);
    setPosts([]);
    setOpen(true);
  };

  const seeAll = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="relative w-full"
          onMouseDown={(e) => {
            // Ensure first tap focuses input and keeps popover open
            e.preventDefault();
            inputRef.current?.focus();
            setOpen(true);
          }}
        >
          <Input
            placeholder="Search users, skills, or content..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            ref={inputRef}
            onClick={() => setOpen(true)}
            className="pl-9 pr-16"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-10 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={clear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[360px] p-0 shadow-lg"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-[420px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary mr-2" />
              Searching…
            </div>
          )}

          {!loading && profiles.length === 0 && posts.length === 0 && query.trim().length >= 2 && (
            <div className="p-4 text-sm text-muted-foreground">No results found</div>
          )}

          {!loading && profiles.length > 0 && (
            <div className="divide-y">
              <div className="px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">People</div>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3"
                  onClick={() => {
                    navigate(`/profile/${p.id}`);
                    setOpen(false);
                  }}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={p.avatar || undefined} />
                    <AvatarFallback>{p.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{p.full_name || "Unknown"}</span>
                      <Badge variant="outline" className="text-[10px]">{p.user_type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.profession || p.title || "No profession"}
                    </p>
                    {p.skills && p.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.skills.slice(0, 2).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                        {p.skills.length > 2 && (
                          <Badge variant="secondary" className="text-[10px]">+{p.skills.length - 2}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="divide-y">
              <div className="px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">Content</div>
              {posts.map((post) => (
                <button
                  key={post.id}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3"
                  onClick={() => {
                    // Adjust when a post detail route exists
                    setOpen(false);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm line-clamp-2">{post.content}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {post.profiles?.full_name || "Unknown"} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t">
          <span className="text-xs text-muted-foreground">
            {query.trim().length < 2 ? "Type at least 2 characters" : `${profiles.length} shown · see all results`}
          </span>
          <Button variant="link" size="sm" onClick={seeAll} disabled={query.trim().length < 2}>
            See all results
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}