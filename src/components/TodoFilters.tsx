import { Button } from "@/components/ui/button";

export type FilterType = "all" | "active" | "completed";

interface TodoFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalCount: number;
  activeCount: number;
  completedCount: number;
}

export const TodoFilters = ({
  activeFilter,
  onFilterChange,
  totalCount,
  activeCount,
  completedCount,
}: TodoFiltersProps) => {
  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: totalCount },
    { key: "active", label: "Active", count: activeCount },
    { key: "completed", label: "Completed", count: completedCount },
  ];

  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex bg-gradient-card rounded-xl p-1 border border-border">
        {filters.map((filter) => (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange(filter.key)}
            className={`px-4 ${
              activeFilter === filter.key
                ? "bg-gradient-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            } transition-all duration-200`}
          >
            {filter.label}
            <span className="ml-2 text-xs opacity-75">({filter.count})</span>
          </Button>
        ))}
      </div>
    </div>
  );
};