import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { $Enums } from "@prisma/client"

// Define interfaces for the raw query results
interface DailySalesData {
  day: Date
  totalsales: string | number
  ordercount: string | number
}

interface DailyTallyData {
  day: Date
  tallyitemcount: string | number
  totalquantity: string | number
}

interface DailyOrderItemsData {
  day: Date
  orderitemcount: string | number
  totalquantity: string | number
}

interface MonthlyData {
  month: Date
  eggs: string | number
  chickens: string | number
  manure: string | number
}

// Interface for the combined daily data
interface CombinedDailyData {
  day: string
  date: string
  sales: number
  orderCount: number
  tallyItems: number
  orderItems: number
  average: number
}

function serializeBigInt(data: { 
  totalProducts: number; 
  totalMembers: number; 
  totalSales: number; 
  pendingOrders: number; 
  processingOrders: number; 
  totalTallyEntries: number; 
  totalOrders: number;
  percentChanges: {
    orders: number;
    members: number;
    sales: number;
    processing: number;
  };
  recentSales: ({ user: { name: string; id: number; email: string } } & { 
    id: number; 
    orderStatus: $Enums.OrderStatus; 
    location: string | null; 
    createdAt: Date; 
    updatedAt: Date; 
    orderNumber: string; 
    userId: number; 
    total: number; 
    deliveryOption: string; 
    paymentMethod: string; 
    paymentStatus: $Enums.PaymentStatus 
  })[]; 
  monthlyData: MonthlyData[]; 
  dailyData: CombinedDailyData[] 
}) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => 
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

export async function GET(request: NextRequest) {
  try {
    // Get total products
    const totalProducts = await prisma.product.count()

    // Get total orders (new)
    const totalOrders = await prisma.order.count()

    // Get total members
    const totalMembers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    })

    // Get total sales
    const totalSales = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        paymentStatus: "PAID",
      },
    })

    // Get pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        orderStatus: "PENDING",
      },
    })

    // Get processing orders count
    const processingOrders = await prisma.order.count({
      where: {
        orderStatus: "PROCESSING",
      },
    })

    // Get total tally entries
    const totalTallyEntries = await prisma.tallyEntry.count()

    // Calculate percentage changes from last month
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const previousMonth = new Date()
    previousMonth.setMonth(previousMonth.getMonth() - 2)

    // Get orders from last month
    const lastMonthOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: lastMonth,
        },
      },
    })

    const previousMonthOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: previousMonth,
          lt: lastMonth,
        },
      },
    })

    // Get members joined last month
    const lastMonthMembers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: {
          gte: lastMonth,
        },
      },
    })

    const previousMonthMembers = await prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: {
          gte: previousMonth,
          lt: lastMonth,
        },
      },
    })

    // Get sales from last month
    const lastMonthSales = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: lastMonth,
        },
      },
    })

    const previousMonthSales = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        paymentStatus: "PAID",
        createdAt: {
          gte: previousMonth,
          lt: lastMonth,
        },
      },
    })

    // Get processing orders last week vs previous week
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const previousWeek = new Date()
    previousWeek.setDate(previousWeek.getDate() - 14)

    const lastWeekProcessing = await prisma.order.count({
      where: {
        orderStatus: "PROCESSING",
        createdAt: {
          gte: lastWeek,
        },
      },
    })

    const previousWeekProcessing = await prisma.order.count({
      where: {
        orderStatus: "PROCESSING",
        createdAt: {
          gte: previousWeek,
          lt: lastWeek,
        },
      },
    })

    // Calculate percentage changes
    const ordersChange = previousMonthOrders > 0 
      ? Math.round(((lastMonthOrders - previousMonthOrders) / previousMonthOrders) * 100) 
      : 0

    const membersChange = previousMonthMembers > 0 
      ? Math.round(((lastMonthMembers - previousMonthMembers) / previousMonthMembers) * 100) 
      : 0

    const salesChange = previousMonthSales._sum.total && previousMonthSales._sum.total > 0 
      ? Math.round(((Number(lastMonthSales._sum.total || 0) - Number(previousMonthSales._sum.total || 0)) / Number(previousMonthSales._sum.total)) * 100) 
      : 0

    const processingChange = previousWeekProcessing > 0 
      ? Math.round(((lastWeekProcessing - previousWeekProcessing) / previousWeekProcessing) * 100) 
      : 0

    // Get recent sales
    const recentSales = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    })

    // Get daily data for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get daily sales data with proper typing
    const dailySalesData = await prisma.$queryRaw<DailySalesData[]>`
      SELECT 
        DATE_TRUNC('day', o."createdAt") as day,
        SUM(o.total) as totalSales,
        COUNT(o.id) as orderCount
      FROM "Order" o
      WHERE o."createdAt" >= ${thirtyDaysAgo}
      AND o."paymentStatus" = 'PAID'
      GROUP BY DATE_TRUNC('day', o."createdAt")
      ORDER BY day DESC
    `

    // Get daily tally entries with proper typing
    const dailyTallyData = await prisma.$queryRaw<DailyTallyData[]>`
      SELECT 
        DATE_TRUNC('day', te."createdAt") as day,
        COUNT(ti.id) as tallyItemCount,
        SUM(ti.quantity) as totalQuantity
      FROM "TallyEntry" te
      JOIN "TallyItem" ti ON ti."tallyEntryId" = te.id
      WHERE te."createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', te."createdAt")
      ORDER BY day DESC
    `

    // Get daily order items for processing orders with proper typing
    const dailyOrderItemsData = await prisma.$queryRaw<DailyOrderItemsData[]>`
      SELECT 
        DATE_TRUNC('day', o."createdAt") as day,
        COUNT(oi.id) as orderItemCount,
        SUM(oi.quantity) as totalQuantity
      FROM "Order" o
      JOIN "OrderItem" oi ON oi."orderId" = o.id
      WHERE o."createdAt" >= ${thirtyDaysAgo}
      AND o."orderStatus" = 'PROCESSING'
      GROUP BY DATE_TRUNC('day', o."createdAt")
      ORDER BY day DESC
    `

    // Combine the data for the chart
    const combinedDailyData: CombinedDailyData[] = []
    const allDays = new Set<string>()

    // Collect all unique days
    dailySalesData.forEach((item) => {
      if (item.day instanceof Date) {
        allDays.add(item.day.toISOString().split("T")[0])
      }
    })

    dailyTallyData.forEach((item) => {
      if (item.day instanceof Date) {
        allDays.add(item.day.toISOString().split("T")[0])
      }
    })

    dailyOrderItemsData.forEach((item) => {
      if (item.day instanceof Date) {
        allDays.add(item.day.toISOString().split("T")[0])
      }
    })

    // Sort days in ascending order
    const sortedDays = Array.from(allDays).sort()

    // Create combined data with all metrics
    sortedDays.forEach((day) => {
      const salesData = dailySalesData.find(
        (item) => item.day instanceof Date && item.day.toISOString().split("T")[0] === day,
      )

      const tallyData = dailyTallyData.find(
        (item) => item.day instanceof Date && item.day.toISOString().split("T")[0] === day,
      )

      const orderItemData = dailyOrderItemsData.find(
        (item) => item.day instanceof Date && item.day.toISOString().split("T")[0] === day,
      )

      combinedDailyData.push({
        day: day,
        date: new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sales: salesData ? Number(salesData.totalsales) || 0 : 0,
        orderCount: salesData ? Number(salesData.ordercount) || 0 : 0,
        tallyItems: tallyData ? Number(tallyData.totalquantity) || 0 : 0,
        orderItems: orderItemData ? Number(orderItemData.totalquantity) || 0 : 0,
        // Calculate average (sales / items if items exist)
        average:
          orderItemData && Number(orderItemData.totalquantity) > 0
            ? salesData
              ? Number(salesData.totalsales) / Number(orderItemData.totalquantity)
              : 0
            : 0,
      })
    })

    // Get monthly data for chart with proper typing
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyData = await prisma.$queryRaw<MonthlyData[]>`
      SELECT 
        DATE_TRUNC('month', o."createdAt") as month,
        SUM(CASE WHEN p.category = 'eggs' THEN oi.quantity ELSE 0 END) as eggs,
        SUM(CASE WHEN p.category = 'meat' THEN oi.quantity ELSE 0 END) as chickens,
        SUM(CASE WHEN p.category = 'prepared' THEN oi.quantity ELSE 0 END) as manure
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      JOIN "Order" o ON oi."orderId" = o.id
      WHERE o."createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', o."createdAt")
      ORDER BY month ASC
    `

    return NextResponse.json(serializeBigInt({
      totalProducts,
      totalMembers,
      totalSales: totalSales._sum.total || 0,
      pendingOrders,
      processingOrders,
      totalTallyEntries,
      totalOrders,
      percentChanges: {
        orders: ordersChange,
        members: membersChange,
        sales: salesChange,
        processing: processingChange
      },
      recentSales,
      monthlyData,
      dailyData: combinedDailyData,
    }))

  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}