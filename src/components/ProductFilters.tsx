import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ProductFilters as ProductFiltersType, SortOption } from '@/services/productService';
import { Search, X, ChevronDown } from 'lucide-react';

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFiltersType) => void;
  onSortChange: (sortBy: SortOption) => void;
  categories: string[];
}

export function ProductFilters({ onFiltersChange, onSortChange, categories }: ProductFiltersProps) {
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    onFiltersChange({
      ...filters,
      categories: selectedCategories,
      inStockOnly,
      searchQuery: searchQuery || undefined
    });
  }, [selectedCategories, inStockOnly, searchQuery]);

  useEffect(() => {
    onSortChange(sortBy);
  }, [sortBy]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setInStockOnly(false);
    setSearchQuery('');
  };

  const FilterControls = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2.5 h-4 w-4 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategories.includes(category) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryToggle(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="in-stock"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="in-stock" className="text-sm font-medium">
          In Stock Only
        </label>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <FilterControls />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:hidden">
      <FilterControls />
    </div>
  );
} 