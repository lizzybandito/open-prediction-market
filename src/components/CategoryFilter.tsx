import { Button } from "./ui/button";
import { useCategories } from "@/hooks/use-markets";
import { Loader2 } from "lucide-react";

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

// Standard categories that should always be available
const defaultCategories = ["All", "Politics", "Crypto", "Sports", "Business", "Entertainment", "Technology"];

export const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const { data: categories, isLoading } = useCategories();

  // Merge API categories with defaults, ensuring "All" is first
  const allCategories = categories && categories.length > 0
    ? ["All", ...Array.from(new Set([...defaultCategories.slice(1), ...categories])).sort()]
    : defaultCategories;

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(category)}
          className={selected === category ? "bg-primary text-primary-foreground" : ""}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};
