import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { X, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { productService,  type ProductFilters, type SortOption } from '@/services/productService';

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFilters) => void;
  onSortChange: (sortBy: SortOption) => void;
  onSearch: (query: string) => void;
  isMobile: boolean;
}

export function ProductFilters({
  onFiltersChange,
  onSortChange,
  onSearch,
  isMobile,
}: ProductFiltersProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Create a stable filters object that only changes when filter values change
  const currentFilters = useMemo(() => {
    const filters: ProductFilters = {};
    
    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories;
    }
    if (priceRange[0] > 0) {
      filters.minPrice = priceRange[0];
    }
    if (priceRange[1] < 1000) {
      filters.maxPrice = priceRange[1];
    }
    if (inStockOnly) {
      filters.inStockOnly = true;
    }

    return filters;
  }, [selectedCategories, priceRange, inStockOnly]);

  // Debounced search handler - only trigger when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, onSearch]);

  // Apply filters when they change - consolidated into a single effect
  useEffect(() => {
    // Skip if we're currently dragging the price slider
    if (isDragging) return;
    
    // Apply filters with a small delay to prevent rapid re-renders
    const timeoutId = setTimeout(() => {
      onFiltersChange(currentFilters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentFilters, isDragging, onFiltersChange]);

  // Fetch categories on component mount - only runs once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await productService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load categories. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    fetchCategories();
  }, [toast]);

  // Handle sort change
  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
    onSortChange(option);
    
    let sortText = '';
    switch (option) {
      case 'price_asc':
        sortText = 'Price: Low to High';
        break;
      case 'price_desc':
        sortText = 'Price: High to Low';
        break;
      case 'name_asc':
        sortText = 'Name: A-Z';
        break;
      case 'name_desc':
        sortText = 'Name: Z-A';
        break;
      case 'newest':
        sortText = 'Newest First';
        break;
    }
    
    toast({
      title: 'Sorted',
      description: `Products sorted by ${sortText}`,
    });
  }, [onSortChange, toast]);

  // Handle search input
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    onSearch('');
  }, [onSearch]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy(null);
    onFiltersChange({});
    onSortChange('newest');
    onSearch('');
    
    toast({
      title: 'Filters Cleared',
      description: 'All filters have been reset.',
    });
  }, [onFiltersChange, onSortChange, onSearch, toast]);

  // Handle price range changes
  const handlePriceRangeChange = useCallback((value: number[]) => {
    setPriceRange([value[0], value[1]]);
  }, []);

  // Price range slider
  const handleSliderDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleSliderDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Toggle category selection
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  // Remove a specific filter
  const removeFilter = useCallback((type: string, value: string) => {
    switch (type) {
      case 'category':
        setSelectedCategories((prev) => prev.filter((c) => c !== value));
        break;
      case 'price':
        if (value === 'min') {
          setPriceRange((prev) => [0, prev[1]]);
        } else {
          setPriceRange((prev) => [prev[0], 1000]);
        }
        break;
      case 'stock':
        setInStockOnly(false);
        break;
      case 'search':
        clearSearch();
        break;
    }
  }, [clearSearch]);

  // Filter badges to display - memoized to prevent recalculation on every render
  const filterBadges = useMemo(() => [
    ...selectedCategories.map((category) => ({
      type: 'category',
      value: category,
      label: category,
    })),
    ...(priceRange[0] > 0
      ? [{ type: 'price', value: 'min', label: `Min: $${priceRange[0]}` }]
      : []),
    ...(priceRange[1] < 1000
      ? [{ type: 'price', value: 'max', label: `Max: $${priceRange[1]}` }]
      : []),
    ...(inStockOnly ? [{ type: 'stock', value: 'inStock', label: 'In Stock Only' }] : []),
    ...(searchQuery ? [{ type: 'search', value: 'search', label: `Search: ${searchQuery}` }] : []),
  ], [selectedCategories, priceRange, inStockOnly, searchQuery]);

  // Filter panel content - memoized to prevent recreation on every render
  const FilterPanel = useMemo(() => () => (
    <div className="space-y-6 p-4">
      {/* Categories */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <label
                htmlFor={`category-${category}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Price Range</h3>
        <div className="pt-2">
          <Slider
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            onPointerDown={handleSliderDragStart}
            onPointerUp={handleSliderDragEnd}
            className="w-full"
          />
          <div className="flex justify-between mt-2">
            <span className="text-sm">${priceRange[0]}</span>
            <span className="text-sm">${priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Stock Availability */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="in-stock"
          checked={inStockOnly}
          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
        />
        <label
          htmlFor="in-stock"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          In Stock Only
        </label>
      </div>

      {/* Clear All Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={clearAllFilters}
      >
        Clear All Filters
      </Button>
    </div>
  ), [categories, selectedCategories, priceRange, inStockOnly, toggleCategory, handlePriceRangeChange, handleSliderDragStart, handleSliderDragEnd, clearAllFilters]);

  // Mobile drawer - memoized to prevent recreation on every render
  const MobileFilterDrawer = useMemo(() => () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <div className="mt-6 max-h-[80vh] overflow-y-auto pr-6">
          <FilterPanel />
        </div>
      </DialogContent>
    </Dialog>
  ), [FilterPanel]);

  // Desktop collapsible - memoized to prevent recreation on every render
  const DesktopFilterCollapsible = useMemo(() => () => (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <FilterPanel />
      </CollapsibleContent>
    </Collapsible>
  ), [isOpen, FilterPanel]);

  return (
    <div className="space-y-4 mb-6">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchInput}
            className="pr-20"
          />
          <div className="absolute right-0 top-0 h-full flex">
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="h-full px-2"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-full px-2"
              onClick={() => onSearch(searchQuery)}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              {sortBy ? (
                <>
                  {sortBy === 'price_asc' && <SortAsc className="h-4 w-4 mr-2" />}
                  {sortBy === 'price_desc' && <SortDesc className="h-4 w-4 mr-2" />}
                  {sortBy === 'name_asc' && <SortAsc className="h-4 w-4 mr-2" />}
                  {sortBy === 'name_desc' && <SortDesc className="h-4 w-4 mr-2" />}
                  {sortBy === 'newest' && <Filter className="h-4 w-4 mr-2" />}
                  {sortBy === 'price_asc' && 'Price: Low to High'}
                  {sortBy === 'price_desc' && 'Price: High to Low'}
                  {sortBy === 'name_asc' && 'Name: A-Z'}
                  {sortBy === 'name_desc' && 'Name: Z-A'}
                  {sortBy === 'newest' && 'Newest First'}
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4 mr-2" />
                  Sort By
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange('price_asc')}>
              Price: Low to High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('price_desc')}>
              Price: High to Low
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSortChange('name_asc')}>
              Name: A-Z
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('name_desc')}>
              Name: Z-A
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSortChange('newest')}>
              Newest First
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter Controls */}
      {isMobile ? <MobileFilterDrawer /> : <DesktopFilterCollapsible />}

      {/* Active Filters */}
      {filterBadges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterBadges.map((badge, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {badge.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter(badge.type, badge.value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 