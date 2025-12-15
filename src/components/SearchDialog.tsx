import { useState, useEffect, useCallback } from 'react';
import { Search, X, User, FileText, Filter, GraduationCap, Briefcase, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { searchService, SearchFilters, SearchResult } from '@/services/searchService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import AccountTypeBadge from './AccountTypeBadge';

interface SearchDialogProps {
  children: React.ReactNode;
}

const SearchDialog = ({ children }: SearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Debounced search function
  const debouncedSearch = useCallback(
    searchService.debounce(async (searchQuery: string, searchFilters: SearchFilters) => {
      if (searchQuery.trim().length < 2) {
        setProfiles([]);
        return;
      }

      try {
        setLoading(true);
        const result = await searchService.searchProfiles(searchQuery, searchFilters);
        
        if (result.error) {
          console.error('Search error:', result.error);
          toast({
            title: "Search Error",
            description: "Failed to search profiles",
            variant: "destructive"
          });
        } else {
          setProfiles(result.data || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 400), // 400ms debounce
    []
  );

  // Trigger search when query or filters change
  useEffect(() => {
    if (query.trim().length >= 2) {
      debouncedSearch(query, filters);
    } else {
      setProfiles([]);
    }
  }, [query, filters, debouncedSearch]);

  const handleClose = () => {
    setOpen(false);
    setQuery('');
    setProfiles([]);
    setFilters({});
    setShowFilters(false);
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/profile/${profileId}`);
    handleClose();
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = filters.accountType || filters.experienceLevel || (filters.skills && filters.skills.length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Users
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users, skills, or content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-20"
              autoFocus
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery('')}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-8 ${hasActiveFilters ? 'bg-primary/10' : ''}`}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Filters</Label>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Type Filter */}
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select
                    value={filters.accountType || ''}
                    onValueChange={(value) => 
                      setFilters(prev => ({ 
                        ...prev, 
                        accountType: value ? value as any : undefined 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Student
                        </div>
                      </SelectItem>
                      <SelectItem value="professional">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Professional
                        </div>
                      </SelectItem>
                      <SelectItem value="company">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Company
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level Filter */}
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={filters.experienceLevel || ''}
                    onValueChange={(value) => 
                      setFilters(prev => ({ 
                        ...prev, 
                        experienceLevel: value ? value as any : undefined 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All levels</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid-level">Mid-level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {filters.accountType && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.accountType}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, accountType: undefined }))}
                      />
                    </Badge>
                  )}
                  {filters.experienceLevel && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.experienceLevel}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, experienceLevel: undefined }))}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {!loading && profiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Found {profiles.length} {profiles.length === 1 ? 'user' : 'users'}
                </h3>
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleProfileClick(profile.id)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar || undefined} />
                        <AvatarFallback>
                          {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {profile.full_name || 'Unknown User'}
                          </p>
                          <AccountTypeBadge userType={profile.user_type} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {profile.profession || profile.title || 'No profession'}
                          {profile.organization && ` • ${profile.organization}`}
                        </p>
                        {profile.skills && profile.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profile.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {profile.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleProfileClick(profile.id);
                      }}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.length >= 2 && !loading && profiles.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No users found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Empty State */}
            {query.length < 2 && !loading && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Start searching</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Search by name, profession, or skills
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
