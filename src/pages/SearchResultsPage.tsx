// src/pages/SearchResultsPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchService, SearchResult } from "@/services/searchService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import TopBar from "@/components/TopBar";
import ResponsiveNavigation from "@/components/ResponsiveNavigation";
import { OfflineIndicator } from "@/components/OfflineIndicator";

export default function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const [query, setQuery] = useState(q);
  const [profiles, setProfiles] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (q.trim().length < 2) {
        setProfiles([]);
        return;
      }
      setLoading(true);
      const { data } = await searchService.searchProfiles(q, {});
      setProfiles(data || []);
      setLoading(false);
    };
    run();
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ q: query.trim() });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar onLogoClick={() => navigate("/")} />
      <OfflineIndicator />

      <div className="relative top-12 mx-auto grid h-screen w-full max-w-screen-xl grid-cols-12 px-4 pb-20 md:pb-8">
        <div className="hidden md:block col-span-3 bg-white">
          <ResponsiveNavigation loading={loading} />
        </div>

        <div className="xl:col-span-7 lg:col-span-9 col-span-12 md:col-start-4 space-y-6">
          <form onSubmit={submit} className="flex gap-2 pt-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, skills, or content..."
            />
            <Button type="submit">Search</Button>
          </form>

          {loading && <p className="text-sm text-muted-foreground">Searching…</p>}

          {!loading && profiles.length === 0 && q.trim().length >= 2 && (
            <p className="text-sm text-muted-foreground">No results for “{q}”.</p>
          )}

          <div className="space-y-3">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-3 p-3 rounded-lg border border-accent/20 hover:bg-accent/80 cursor-pointer"
                onClick={() => navigate(`/profile/${p.id}`)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={p.avatar || undefined} />
                  <AvatarFallback>{p.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate group-hover:text-accent-foreground">
                      {p.full_name || "Unknown"}
                    </p>
                    <Badge variant="outline" className="text-[10px] group-hover:text-accent-foreground group-hover:border-accent-foreground">
                      {p.user_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate group-hover:text-accent-foreground">
                    {p.profession || p.title || "No profession"}
                    {p.organization && ` • ${p.organization}`}
                  </p>
                  {p.skills && p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.skills.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}