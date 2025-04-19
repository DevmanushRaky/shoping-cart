import { supabase } from '@/lib/supabase';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  stock: number;
  created_at: string;
}

export interface ProductFilters {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  searchQuery?: string;
}

export type SortOption = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest';

export const productService = {
  async getAllProducts(filters?: ProductFilters, sortBy?: SortOption): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*');

    // Apply filters
    if (filters) {
      if (filters.categories?.length) {
        query = query.in('category', filters.categories);
      }
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.inStockOnly) {
        query = query.gt('stock', 0);
      }
      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }
    }

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name_asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name_desc':
          query = query.order('name', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data || [];
  },

  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return [...new Set(data.map((item: { category: string }) => item.category))];
  },

  async updateProductStock(productId: number, quantity: number): Promise<void> {
    const { error } = await supabase
      .rpc('update_single_product_stock', {
        p_product_id: productId,
        p_quantity: quantity
      });

    if (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  },

  async updateMultipleProductsStock(items: { product_id: number; quantity: number }[]): Promise<void> {
    // Update each product's stock
    for (const item of items) {
      // First get current stock
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (fetchError || !product) {
        console.error('Error fetching product:', fetchError);
        throw fetchError;
      }

      // Then update if we have enough stock
      if (product.stock >= item.quantity) {
        const { error } = await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id);

        if (error) {
          console.error('Error updating product stock:', error);
          throw error;
        }
      } else {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }
    }
  }
}; 