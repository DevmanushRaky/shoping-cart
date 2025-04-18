import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { orderService } from '@/services/orderService'

interface Order {
  id: number
  user_id: string
  items: Array<{
    product_id: number
    quantity: number
  }>
  total: number
  created_at: string
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const result = await orderService.fetchAllOrders()

    if (result.success) {
      setOrders(result.orders || [])
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => navigate('/')}>Back to Shop</Button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">User ID:</span> {order.user_id}
                  </p>
                  <p>
                    <span className="font-semibold">Total:</span> $
                    {order.total.toFixed(2)}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{' '}
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  <div>
                    <span className="font-semibold">Items:</span>
                    <ul className="list-disc list-inside mt-2">
                      {order.items.map((item, index) => (
                        <li key={index}>
                          Product ID: {item.product_id} - Quantity: {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}