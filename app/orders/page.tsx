"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Truck, Check } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { formatDateTime } from "@/lib/utils"

type Order = {
  id: number
  orderNumber: string
  total: number
  deliveryOption: string
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  location: string
  createdAt: string
  user: {
    id: number
    name: string
    email: string
    phone: string
    address: string
  }
  orderItems: Array<{
    id: number
    quantity: number
    price: number
    product: {
      id: number
      name: string
    }
  }>
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [updatingOrder, setUpdatingOrder] = useState(false)
  const [shippingOrder, setShippingOrder] = useState(false)
  const [orderStatus, setOrderStatus] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setOrderStatus(order.orderStatus.toLowerCase())
  }

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return

    setUpdatingOrder(true)

    try {
      // Always set to "PROCESSING" when clicking Update
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderStatus: "PROCESSING",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      toast({
        title: "Success",
        description: "Order status updated to Processing",
      })

      // Refresh orders list
      fetchOrders()
      setSelectedOrder(null)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrder(false)
    }
  }

  const handleShipOrder = async () => {
    if (!selectedOrder) return

    setShippingOrder(true)

    try {
      // Set to "SHIPPED" when clicking Ship Order
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderStatus: "SHIPPED",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      toast({
        title: "Success",
        description: "Order has been shipped",
      })

      // Refresh orders list
      fetchOrders()
      setSelectedOrder(null)
    } catch (error) {
      console.error("Error shipping order:", error)
      toast({
        title: "Error",
        description: "Failed to ship order",
        variant: "destructive",
      })
    } finally {
      setShippingOrder(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    // Filter by search query
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    return matchesSearch && order.orderStatus.toLowerCase() === activeTab
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 text-gray-700 text-[0.75rem] bg-white">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Orders</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders..."
              className="w-[200px] sm:w-[300px] pl-8 placeholder:text-[0.75rem]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>Export</Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="text-gray-700 bg-white">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card className="text-gray-700 bg-white">
            <CardHeader>
              <CardTitle className="text-[0.9rem]">
                {activeTab === "all"
                  ? "All Orders"
                  : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders`}
              </CardTitle>
              <CardDescription>View and manage customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[200px]">Loading orders...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 ">
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          {searchQuery ? "No orders found matching your search." : "No orders found."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium text-[0.75rem]">{order.orderNumber}</TableCell>
                          <TableCell className="font-medium text-[0.75rem]">{order.user.name}</TableCell>
                          <TableCell className="font-medium text-[0.75rem]">KES {order.total.toFixed(2)}</TableCell>
                          <TableCell className="font-medium text-[0.75rem]">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.paymentStatus === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-[0.75rem]">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.orderStatus === "DELIVERED"
                                  ? "bg-green-100 text-green-800"
                                  : order.orderStatus === "PROCESSING"
                                    ? "bg-blue-100 text-blue-800"
                                    : order.orderStatus === "SHIPPED"
                                      ? "bg-purple-100 text-purple-800"
                                      : order.orderStatus === "PENDING"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-[0.75rem]">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-right text-[0.75rem]">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="bg-gray-500" variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[700px] text-gray-700 font-medium bg-white">
                                <DialogHeader>
                                  <DialogTitle className="text-[0.8rem] text-[#2C3930]">
                                    Order No: {order.orderNumber}
                                  </DialogTitle>
                                  <DialogDescription className="text-[0.8rem] text-[#854836]">
                                    Order details and management
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="text-[0.75rem]  font-medium mb-2">Customer Information</h3>
                                      <div className="text-[0.75rem] ">
                                        <p>
                                          <strong>Name:</strong> {order.user.name}
                                        </p>
                                        <p>
                                          <strong>Email:</strong> {order.user.email}
                                        </p>
                                        <p>
                                          <strong>Phone:</strong> {order.user.phone || "—"}
                                        </p>
                                        <p>
                                          <strong>Address:</strong> {order.user.address || "—"}
                                        </p>
                                        <p>
                                          <strong>Location:</strong> {order.location || "—"}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <h3 className="text-[0.75rem]  font-medium mb-2">Order Information</h3>
                                      <div className="text-[0.75rem] ">
                                        <p>
                                          <strong>Order Date:</strong> {formatDateTime(order.createdAt)}
                                        </p>
                                        <p>
                                          <strong>Delivery Option:</strong> {order.deliveryOption}
                                        </p>
                                        <p>
                                          <strong>Payment Method:</strong> {order.paymentMethod}
                                        </p>
                                        <p>
                                          <strong>Payment Status:</strong> {order.paymentStatus}
                                        </p>
                                        <p>
                                          <strong>Order Status:</strong> {order.orderStatus}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="text-[0.75rem]  font-medium mb-2">Products</h3>
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-gray-100 ">
                                          <TableHead>Product</TableHead>
                                          <TableHead>Quantity</TableHead>
                                          <TableHead>Price</TableHead>
                                          <TableHead>Subtotal</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {order.orderItems.map((item) => (
                                          <TableRow key={item.id}>
                                            <TableCell className="font-medium text-[0.75rem]">
                                              {item.product.name}
                                            </TableCell>
                                            <TableCell className="font-medium text-[0.75rem]">
                                              {item.quantity}
                                            </TableCell>
                                            <TableCell className="font-medium text-[0.75rem]">
                                              KES {item.price.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="font-medium text-[0.75rem]">
                                              KES {(item.quantity * item.price).toFixed(2)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-right font-medium text-[0.75rem]">
                                            Total:
                                          </TableCell>
                                          <TableCell className="font-bold text-[0.75rem]">
                                            KES {order.total.toFixed(2)}
                                          </TableCell>
                                        </TableRow>
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                                <DialogFooter className="flex justify-between">
                                  <div className="space-x-2">
                                    <Select value={orderStatus} onValueChange={setOrderStatus}>
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Update Status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem className="text-gray-700" value="pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem className="text-gray-700" value="processing">
                                          Processing
                                        </SelectItem>
                                        <SelectItem className="text-gray-700" value="shipped">
                                          Shipped
                                        </SelectItem>
                                        <SelectItem className="text-gray-700" value="delivered">
                                          Delivered
                                        </SelectItem>
                                        <SelectItem className="text-gray-700" value="cancelled">
                                          Cancelled
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={handleShipOrder}
                                      disabled={
                                        shippingOrder ||
                                        order.orderStatus === "PENDING" || // Disable Ship Order when order is in PENDING
                                        order.orderStatus === "SHIPPED" ||
                                        order.orderStatus === "DELIVERED" ||
                                        order.orderStatus === "CANCELLED"
                                      }
                                    >
                                      <Truck className="mr-2 h-4 w-4" />
                                      {shippingOrder ? "Shipping..." : "Ship Order"}
                                    </Button>
                                    <Button
                                      onClick={handleUpdateOrderStatus}
                                      disabled={
                                        updatingOrder ||
                                        order.orderStatus === "PROCESSING" || // Disable Update when order is in PROCESSING
                                        order.orderStatus === "DELIVERED" ||
                                        order.orderStatus === "CANCELLED" ||
                                        order.orderStatus === "SHIPPED"
                                      }
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      {updatingOrder ? "Processing..." : "Processing"}
                                    </Button>
                                  </div>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
