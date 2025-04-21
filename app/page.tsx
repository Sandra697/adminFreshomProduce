"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { ProductsOverview } from "@/components/dashboard/products-overview"
import { MembersOverview } from "@/components/dashboard/members-overview"

type DashboardData = {
  totalProducts: number
  totalMembers: number
  totalSales: number
  pendingOrders: number
  processingOrders: number
  totalTallyEntries: number
  totalOrders: number
  percentChanges: {
    orders: number
    members: number
    sales: number
    processing: number
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProducts: 0,
    totalMembers: 0,
    totalSales: 0,
    pendingOrders: 0,
    processingOrders: 0,
    totalTallyEntries: 0,
    totalOrders: 0,
    percentChanges: {
      orders: 0,
      members: 0,
      sales: 0,
      processing: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard")
        const data = await response.json()

        setDashboardData({
          totalProducts: data.totalProducts || 0,
          totalMembers: data.totalMembers || 0,
          totalSales: data.totalSales || 0,
          pendingOrders: data.pendingOrders || 0,
          processingOrders: data.processingOrders || 0,
          totalTallyEntries: data.totalTallyEntries || 0,
          totalOrders: data.totalOrders || 0,
          percentChanges: data.percentChanges || {
            orders: 0,
            members: 0,
            sales: 0,
            processing: 0
          }
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-[0.9rem] font-bold tracking-tight">Dashboard</h2>
        
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M3 3h18v18H3z" />
                  <path d="M7 10h10" />
                  <path d="M7 14h10" />
                  <path d="M7 6h2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-xl ml-3 font-bold">{loading ? "..." : dashboardData.totalOrders}</div>
                <p className="text-xs ml-3 text-muted-foreground">
                  {loading ? "..." : 
                    `${dashboardData.percentChanges.orders > 0 ? '+' : ''}${dashboardData.percentChanges.orders}% from last month`
                  }
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-xl  ml-3 font-bold">{loading ? "..." : dashboardData.totalMembers}</div>
                <p className="text-xs ml-3 text-muted-foreground">
                  {loading ? "..." : 
                    `${dashboardData.percentChanges.members > 0 ? '+' : ''}${dashboardData.percentChanges.members}% from last month`
                  }
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-xl ml-3 font-bold">KES {loading ? "..." : dashboardData.totalSales.toFixed(2)}</div>
                <p className="text-xs  ml-3 text-muted-foreground">
                  {loading ? "..." : 
                    `${dashboardData.percentChanges.sales > 0 ? '+' : ''}${dashboardData.percentChanges.sales}% from last month`
                  }
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing Orders</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#301B3F"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path d="M7 10v12" />
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-xl ml-3 font-bold">{loading ? "..." : dashboardData.processingOrders}</div>
                <p className="text-xs ml-3 text-muted-foreground">
                  {loading ? "..." : 
                    `${dashboardData.percentChanges.processing > 0 ? '+' : ''}${dashboardData.percentChanges.processing}% from last week`
                  }
                </p>
              </CardContent>
            </Card>
            
          </div>


          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Daily Sales Overview</CardTitle>
                <CardDescription>Comparing tally entries, order items, and average sale value</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Your most recent customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <ProductsOverview />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
              <CardDescription>View and manage all customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Order management interface will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="members" className="space-y-4">
          <MembersOverview />
        </TabsContent>
      </Tabs>
    </div>
  )
}