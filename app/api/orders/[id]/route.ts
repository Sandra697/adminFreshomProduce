import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { sendOrderStatusEmail } from "@/lib/emailservice"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const data = await request.json()
    
    // Fetch the current order status before update
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })
    
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    
    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: data.orderStatus,
        paymentStatus: data.paymentStatus,
        location: data.location,
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
    
    // Check if status has changed and send email notification
    if (currentOrder.orderStatus !== updatedOrder.orderStatus || 
        currentOrder.paymentStatus !== updatedOrder.paymentStatus) {
      try {
        // Send notification email to the user
        await sendOrderStatusEmail(
          updatedOrder.user.email,
          updatedOrder.orderNumber,
          updatedOrder.orderStatus,
          updatedOrder
        )
        
        console.log(`Order status email sent for order #${updatedOrder.orderNumber}`)
      } catch (emailError) {
        // Log email error but don't fail the API response
        console.error("Error sending status update email:", emailError)
      }
    }
    
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}