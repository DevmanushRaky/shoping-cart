"use client"

import { useState } from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckoutForm } from "@/components/checkout-form"
import { useAuth } from "@/lib/auth-context"
import type { CartItem } from "@/lib/types"

interface CartSectionProps {
  cartItems: CartItem[]
  updateQuantity: (productId: number, quantity: number) => void
  removeFromCart: (productId: number) => void
  total: number
  onPlaceOrder: () => void
}

export function CartSection({ cartItems, updateQuantity, removeFromCart, total, onPlaceOrder }: CartSectionProps) {
  const { user } = useAuth()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const startCheckout = () => {
    setIsCheckingOut(true)
  }

  const cancelCheckout = () => {
    setIsCheckingOut(false)
  }

  const completeCheckout = () => {
    onPlaceOrder()
    setIsCheckingOut(false)
  }

  if (isCheckingOut) {
    return <CheckoutForm cartItems={cartItems} total={total} onComplete={completeCheckout} onCancel={cancelCheckout} />
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle>Shopping Cart</CardTitle>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">Your cart is empty</p>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between pb-4 border-b">
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex justify-between w-full text-lg font-bold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button className="w-full" size="lg" disabled={cartItems.length === 0} onClick={startCheckout}>
          Checkout
        </Button>
      </CardFooter>
    </Card>
  )
}
