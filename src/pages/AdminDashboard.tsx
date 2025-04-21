import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { orderService } from '@/services/orderService'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
 
  Package, 
  DollarSign, 
  Calendar, 
  User, 
  RefreshCw, 
  ShoppingBag,
  BarChart3, 
  ChevronLeft,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import ChatButton from "../components/ChatButton"

interface Order {
  id: number
  user_id: string
  items: Array<{
    product_id: number
    quantity: number
  }>
  total: number
  created_at: string
  status?: string
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const { toast } = useToast()
  const navigate = useNavigate()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actionLoadingStates, setActionLoadingStates] = useState<{ [key: number]: boolean }>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    // Apply filters and sorting
    let result = [...orders]
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(order => 
        order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) || 
        order.user_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter)
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sortBy === 'highest') {
      result.sort((a, b) => b.total - a.total)
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.total - b.total)
    }
    
    setFilteredOrders(result)
  }, [orders, searchQuery, statusFilter, sortBy])

  const fetchOrders = async () => {
    setIsLoading(true)
    const result = await orderService.fetchAllOrders()

    if (result.success) {
      // Add default status if not present
      const ordersWithStatus = (result.orders || []).map(order => ({
        ...order,
        status: order.status || 'pending'
      }))
      setOrders(ordersWithStatus)
      setFilteredOrders(ordersWithStatus)
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      })
    }

    setIsLoading(false)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchOrders()
      toast({
        title: 'Refreshed',
        description: 'Order data has been refreshed',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Processing</Badge>
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">Shipped</Badge>
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Delivered</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate pagination values
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const indexOfLastOrder = currentPage * itemsPerPage
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, sortBy])

  // Function to copy user ID
  const copyToClipboard = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId)
      setCopiedId(userId)
      toast({
        title: "Copied!",
        description: "User ID copied to clipboard",
        duration: 2000,
      })
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  // Prepare data for chart
  const prepareChartData = () => {
    const ordersByDate = orders.reduce((acc: { [key: string]: number }, order) => {
      const date = new Date(order.created_at).toLocaleDateString()
      acc[date] = (acc[date] || 0) + order.total
      return acc
    }, {})

    return Object.entries(ordersByDate).map(([date, total]) => ({
      date,
      total
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const openUpdateDialog = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status || 'pending')
    setIsDialogOpen(true)
  }

  const handleUpdateClick = async () => {
    if (!selectedOrder) return

    try {
      setActionLoadingStates(prev => ({ ...prev, [selectedOrder.id]: true }))
      const result = await orderService.updateOrderStatus(selectedOrder.id, newStatus)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update order status')
      }

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: newStatus }
            : order
        )
      )

      toast({
        title: "Status Updated",
        description: `Order #${selectedOrder.id} status has been updated to ${newStatus}`,
      })
    } catch (error: any) {
      toast({
        title: "Error Updating Status",
        description: error.message || "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoadingStates(prev => {
        const newState = { ...prev }
        if (selectedOrder) delete newState[selectedOrder.id]
        return newState
      })
      setIsDialogOpen(false)
      setSelectedOrder(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your store orders</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="gap-2" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            View Store
          </Button>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                View and manage all customer orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by order ID or user ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Amount</SelectItem>
                      <SelectItem value="lowest">Lowest Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No orders found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || statusFilter !== 'all' 
                      ? "No orders match your current filters" 
                      : "You haven't received any orders yet"}
                  </p>
                  {(searchQuery || statusFilter !== 'all') && (
                    <Button variant="outline" onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                    }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Order ID</TableHead>
                        <TableHead className="w-[200px]">Customer</TableHead>
                        <TableHead className="w-[200px]">Date</TableHead>
                        <TableHead className="w-[100px] text-center">Items</TableHead>
                        <TableHead className="w-[120px] text-right">Total</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{order.user_id.substring(0, 8)}...</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(order.user_id)}
                              >
                                {copiedId === order.user_id ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(order.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{order.items.length} items</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              {order.total.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status || 'pending')}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openUpdateDialog(order)}
                              disabled={actionLoadingStates[order.id]}
                            >
                              Update Order
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                View sales and order analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <h3 className="text-2xl font-bold">{orders.length}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <h3 className="text-2xl font-bold">
                          ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                        </h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                        <h3 className="text-2xl font-bold">
                          ${orders.length > 0 
                            ? (orders.reduce((sum, order) => sum + order.total, 0) / orders.length).toFixed(2) 
                            : '0.00'}
                        </h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Daily revenue from orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                          labelFormatter={(label: string) => `Date: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ fill: '#2563eb' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Current Status:</span>
                {getStatusBadge(selectedOrder?.status || 'pending')}
              </div>
              <div>
                <label className="text-sm font-medium">New Status:</label>
                <Select
                  value={newStatus}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={actionLoadingStates[selectedOrder?.id || 0]}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateClick}
              disabled={actionLoadingStates[selectedOrder?.id || 0]}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ChatButton />
    </div>
  )
}