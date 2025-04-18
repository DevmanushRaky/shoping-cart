import { supabase } from '@/lib/supabase';

interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface CreateOrderData {
  total: number;
  items: OrderItem[];
  status: string;
}

export const orderService = {
  async createOrder(orderData: CreateOrderData) {
    try {
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create the main order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total: orderData.total,
          items: orderData.items,
          status: orderData.status,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      return { order, success: true };
    } catch (error: any) {
      console.error('Error in createOrder:', error);
      return {
        success: false,
        error: error.message || 'Failed to create order'
      };
    }
  },

  async fetchAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { orders: data, success: true };
    } catch (error: any) {
      console.error('Error in fetchAllOrders:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch orders'
      };
    }
  }
}; 