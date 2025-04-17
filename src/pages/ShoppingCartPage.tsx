import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

type Product = {
  id: string;
  name: string;
  price: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function ShoppingCartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const products: Product[] = [
    { id: '1', name: 'Product 1', price: 19.99 },
    { id: '2', name: 'Product 2', price: 29.99 },
    { id: '3', name: 'Product 3', price: 39.99 },
  ];

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const placeOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'Please sign in to place an order',
        });
        return;
      }

      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        items: cart,
        total: calculateTotal(),
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order placed successfully',
      });
      setCart([]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order',
      });
    }
  };

  return (
    <div className="app">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => addToCart(product)}>Add to Cart</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="cart-section">
        <h2 className="text-xl font-bold mb-4">Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            <ul className="space-y-2 mb-4">
              {cart.map(item => (
                <li key={item.product.id} className="flex items-center justify-between">
                  <span>
                    {item.product.name} - ${item.product.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e =>
                        updateQuantity(item.product.id, parseInt(e.target.value))
                      }
                      className="w-20"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold">
                Total: ${calculateTotal().toFixed(2)}
              </p>
              <Button onClick={placeOrder}>Place Order</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}