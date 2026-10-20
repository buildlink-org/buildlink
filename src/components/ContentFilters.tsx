
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface ContentFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filterType?: string;
}

const ContentFilters = ({ activeFilter, onFilterChange, filterType = "home" }: ContentFiltersProps) => {
  const homeFilters = [
    { id: "latest", label: "Latest" },
    { id: "industry", label: "Industry" },
    { id: "projects", label: "Projects" },
    { id: "opportunities", label: "Opportunities" },
  ];

  const skillUpFilters = [
    { id: "latest", label: "All Resources" },
    { id: "courses", label: "Courses" },
    { id: "webinars", label: "Webinars" },
    { id: "articles", label: "Articles" },
    { id: "certifications", label: "Certifications" },
  ];

  const filters = filterType === "skillup" ? skillUpFilters : homeFilters;

  return (
    <div className="mb-5 overflow-hidden">
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
        role="group"
        aria-label={filterType === "skillup" ? "Resource filters" : "Home feed filters"}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onFilterChange(filter.id)}
              aria-pressed={isActive}
              size="sm"
              className={cn(
                "h-8 shrink-0 whitespace-nowrap rounded-full px-3.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ContentFilters;
