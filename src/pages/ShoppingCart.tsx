import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { orderService } from "@/services/orderService"
import { useAuth } from "@/context/AuthContext"
import { ShoppingCartIcon, AlertCircle, ShoppingBag } from "lucide-react"
import { productService, type Product } from "@/services/productService"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

console.log("[ShoppingCart] Module loading...")

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

const CART_STORAGE_KEY = "shopping-cart"

export function ShoppingCart() {
  console.log("[ShoppingCart] Component rendering...")
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isLoggedIn } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  console.log("[ShoppingCart] Current state:", {
    cartItems: cart.length,
    isPlacingOrder,
    productsCount: products.length,
  })

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getAllProducts()
        setProducts(data)
      } catch (error) {
        console.error("Error loading products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [toast])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log("[ShoppingCart] Loaded cart from localStorage:", parsedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    } else {
      console.log("[ShoppingCart] No cart found in localStorage");
    }
  }, []); // Ensure this effect runs only once on mount

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (cart.length > 0) {
      console.log("[ShoppingCart] Saving cart to localStorage:", cart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } else if (localStorage.getItem(CART_STORAGE_KEY)) {
      // Only remove from localStorage if we're explicitly clearing the cart
      // This prevents accidental clearing when navigating between routes
      console.log("[ShoppingCart] Cart is empty, but keeping localStorage intact");
    }
  }, [cart]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    const cartItem = cart.find((item) => item.id === product.id.toString())
    const currentQuantity = cartItem ? cartItem.quantity : 0

    if (currentQuantity >= product.stock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${product.stock} units available in stock.`,
        variant: "destructive",
      })
      return
    }

    console.log("[ShoppingCart] Adding product to cart:", product)
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id.toString())
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Stock Limit Reached",
            description: `Only ${product.stock} units available in stock.`,
            variant: "destructive",
          })
          return prevCart
        }
        console.log("[ShoppingCart] Product already in cart, updating quantity")
        return prevCart.map((item) =>
          item.id === product.id.toString() ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      console.log("[ShoppingCart] Adding new product to cart")
      return [...prevCart, { id: product.id.toString(), name: product.name, price: product.price, quantity: 1 }]
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    console.log("[ShoppingCart] Updating quantity for product:", productId, "New quantity:", newQuantity)

    if (newQuantity < 1) return

    const product = products.find((p) => p.id.toString() === productId)
    if (!product) return

    if (newQuantity > product.stock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${product.stock} units available in stock.`,
        variant: "destructive",
      })
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
  }

  const removeFromCart = (productId: string) => {
    console.log("[ShoppingCart] Removing product from cart:", productId)
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
    toast({
      title: "Removed from Cart",
      description: "Item has been removed from your cart.",
    })
  }

  const clearCart = () => {
    console.log("[ShoppingCart] Clearing cart")
    setCart([])
    localStorage.removeItem(CART_STORAGE_KEY)
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    })
  }

  const handlePlaceOrder = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please login to place your order.",
        variant: "destructive",
      })
      navigate("/login", { state: { from: "/cart" } })
      return
    }

    setIsPlacingOrder(true)

    try {
      // Verify stock availability before placing order
      for (const item of cart) {
        const product = products.find((p) => p.id.toString() === item.id)
        if (!product || product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}`)
        }
      }

      const orderItems = cart.map((item) => ({
        product_id: Number.parseInt(item.id),
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const orderData = {
        total: totalWithTax, // Use total with tax
        items: orderItems,
        status: "pending", // Initial status for new orders
      }

      const result = await orderService.createOrder(orderData)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Update product stock quantities
      await productService.updateMultipleProductsStock(orderItems)

      // Refresh products list to show updated stock
      const updatedProducts = await productService.getAllProducts()
      setProducts(updatedProducts)

      // Clear cart after successful order
      setCart([])
      localStorage.removeItem(CART_STORAGE_KEY)

      toast({
        title: "Order Placed Successfully",
        description: (
          <div className="mt-2">
            <p>Order #: {result.order.id}</p>
            <p>Total: ${totalWithTax.toFixed(2)}</p>
            <p>Items: {cart.length}</p>
          </div>
        ),
        duration: 5000,
      })

      // Redirect to order confirmation page
      navigate(`/orders/${result.order.id}`)
    } catch (error: any) {
      console.error("Error placing order:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = cartTotal * 0.1 // 10% tax
  const totalWithTax = cartTotal + tax

  const CartSummary = () => (
    <div className="space-y-4">
      {cart.map((item) => (
        <div key={item.id} className="flex justify-between py-2 border-b">
          <span>
            {item.name} x {item.quantity}
          </span>
          <span>${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>${cartTotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax (10%):</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>Total:</span>
        <span>${totalWithTax.toFixed(2)}</span>
      </div>
      <div className="pt-4">
        <Button onClick={clearCart} variant="outline" className="w-full">
          Clear Cart
        </Button>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  console.log("[ShoppingCart] Rendering products and cart")
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {products.length === 0 ? (
              <Alert className="col-span-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No products found matching your criteria.</AlertDescription>
              </Alert>
            ) : (
              products.map((product) => (
                <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant={product.stock <= 5 ? "destructive" : "secondary"}>
                        {product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <div className="relative aspect-square mb-4 bg-muted rounded-md overflow-hidden">
                      <img
                        src={product.image_url || "/placeholder.png"}
                        alt={product.name}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.png"
                        }}
                      />
                    </div>
                    <Badge className="self-start mb-2" variant="outline">
                      {product.category}
                    </Badge>
                    <p className="text-sm text-muted-foreground mb-4 flex-grow">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-semibold">${product.price.toFixed(2)}</span>
                      <Badge variant={product.stock === 0 ? "destructive" : "success"}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className="w-full"
                      variant={product.stock <= 0 ? "secondary" : "default"}
                    >
                      {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:sticky lg:top-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Shopping Cart ({cart.length})</h2>
            {cart.length > 0 &&
              (isMobile ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      View Summary
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Cart Summary</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <CartSummary />
                    </div>
                  </SheetContent>
                </Sheet>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      View Summary
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Cart Summary</DialogTitle>
                    </DialogHeader>
                    <div className="mt-6">
                      <CartSummary />
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
          </div>
          {cart.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <ShoppingCartIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Add some products to your cart to get started.</p>
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
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} per item</p>
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
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm font-medium mt-2">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg">Subtotal:</span>
                        <span className="text-lg">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg">Tax (10%):</span>
                        <span className="text-lg">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xl font-semibold">Total:</span>
                        <span className="text-xl font-semibold">${totalWithTax.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full">
                      {isPlacingOrder ? "Processing Order..." : "Place Order"}
                    </Button>
                    <Button onClick={clearCart} className="w-full mt-2" variant="outline">
                      Clear Cart
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