
import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filterType?: string;
}

const ContentFilters = ({ activeFilter, onFilterChange, filterType = "home" }: ContentFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const homeFilters = [
		{ id: "latest", label: "Latest" },
		{ id: "industry", label: "Industry" },
		{ id: "projects", label: "Projects" },
		{ id: "opportunities", label: "Opportunities" },
  ]

  const skillUpFilters = [
    { id: "courses", label: "Courses" },
    { id: "webinars", label: "Webinars" },
    { id: "articles", label: "Articles" },
    { id: "certifications", label: "Certifications" },
  ];

  const filters = filterType === "skillup" ? skillUpFilters : homeFilters;

  return (
    <div className="mb-4 border-b border-border bg-background">
      <div className="px-4 py-2">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="flex space-x-1 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "ghost"}
                onClick={() => onFilterChange(filter.id)}
                size="sm"
                className={cn(
                  "whitespace-nowrap text-xs h-7",
                  activeFilter === filter.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-white hover:bg-accent"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentFilters;
