import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { generateOrderNumber } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: data.userId,
        total: data.total,
        deliveryOption: data.deliveryOption,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        orderStatus: data.orderStatus,
        location: data.location || "",
        orderItems: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
