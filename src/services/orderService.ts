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
  },

  async updateOrderStatus(orderId: number, newStatus: string) {
    try {
      console.log(`[orderService] Attempting to update order ${orderId} to status: ${newStatus}`);

      // First check if the order exists
      const { data: existingOrder, error: checkError } = await supabase
        .from('orders')
        .select()
        .eq('id', orderId)
        .single();

      if (checkError) {
        console.error('[orderService] Error checking order existence:', checkError);
        if (checkError.code === 'PGRST116') {
          throw new Error(`Order with ID ${orderId} not found`);
        }
        throw checkError;
      }

      console.log('[orderService] Found existing order:', existingOrder);

      // Step 1: Update the order
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('[orderService] Error updating order:', updateError);
        throw updateError;
      }

      // Step 2: Fetch the updated order
      const { data: updatedOrder, error: fetchError } = await supabase
        .from('orders')
        .select()
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('[orderService] Error fetching updated order:', fetchError);
        throw fetchError;
      }

      if (!updatedOrder) {
        console.error('[orderService] Could not fetch updated order');
        throw new Error(`Failed to fetch updated order ${orderId}`);
      }

      console.log('[orderService] Successfully updated order:', updatedOrder);

      return { 
        success: true, 
        order: updatedOrder,
        message: `Order #${orderId} status updated to ${newStatus}`
      };
    } catch (error: any) {
      console.error('[orderService] Error in updateOrderStatus:', error);
      return {
        success: false,
        error: error.message || 'Failed to update order status',
        details: error
      };
    }
  }
}; 