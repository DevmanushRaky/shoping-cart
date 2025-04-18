import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { orderService } from '@/services/orderService'
import { useAuth } from '@/context/AuthContext'
import { ShoppingCartIcon } from 'lucide-react'
import { productService, Product } from '@/services/productService'

console.log('[ShoppingCart] Module loading...');

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CART_STORAGE_KEY = 'shopping-cart';

export function ShoppingCart() {
  console.log('[ShoppingCart] Component rendering...');
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isLoggedIn } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  console.log('[ShoppingCart] Current state:', {
    cartItems: cart.length,
    isPlacingOrder,
    productsCount: products.length
  });

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    console.log('[ShoppingCart] Adding product to cart:', product);
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id.toString())
      if (existingItem) {
        console.log('[ShoppingCart] Product already in cart, updating quantity');
        return prevCart.map((item) =>
          item.id === product.id.toString()
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      console.log('[ShoppingCart] Adding new product to cart');
      return [...prevCart, { id: product.id.toString(), name: product.name, price: product.price, quantity: 1 }]
    })

    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    console.log('[ShoppingCart] Updating quantity for product:', productId, 'New quantity:', newQuantity);

    if (newQuantity < 1) return

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    console.log('[ShoppingCart] Removing product from cart:', productId);
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
    toast({
      title: 'Removed from Cart',
      description: 'Item has been removed from your cart.',
    })
  }

  const handlePlaceOrder = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to place your order.',
        variant: 'destructive',
      });
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderItems = cart.map(item => ({
        product_id: parseInt(item.id),
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const orderData = {
        total: cartTotal,
        items: orderItems,
        status: 'pending' // Initial status for new orders
      };

      const result = await orderService.createOrder(orderData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Clear cart after successful order
      setCart([]);
      localStorage.removeItem(CART_STORAGE_KEY);

      toast({
        title: 'Order Placed Successfully',
        description: (
          <div className="mt-2">
            <p>Order #: {result.order.id}</p>
            <p>Total: ${cartTotal.toFixed(2)}</p>
            <p>Items: {cart.length}</p>
          </div>
        ),
        duration: 5000,
      });

      // Redirect to order confirmation page
      navigate(`/orders/${result.order.id}`);
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  console.log('[ShoppingCart] Rendering products and cart');
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button onClick={() => addToCart(product)}>
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:sticky lg:top-8">
          <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
          {cart.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <ShoppingCartIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add some products to your cart to get started.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} per item
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm font-medium mt-2">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-semibold">Total:</span>
                      <span className="text-xl font-semibold">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full"
                    >
                      {isPlacingOrder ? 'Processing Order...' : 'Place Order'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 