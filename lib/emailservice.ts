import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"
import { OrderStatusTemplate, type OrderStatus } from "@/emails/OrderStatusTemplate"
import { render } from "@react-email/render"
import jsPDF from "jspdf"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
} as SMTPTransport.Options)

interface TicketNotificationProps {
  to: string
  ticketId: string
  title: string
  status: string
  department: string
}

interface TicketReplyProps {
  to: string
  ticketId: string
  title: string
  replierName: string
  message: string
  department: string
}

export async function sendOrderStatusEmail(to: string, orderNumber: string, status: string, orderDetails: any) {
  // Generate PDF from order details
  const pdfBuffer = await generateOrderPDF(orderNumber, orderDetails)

  // Calculate total amount
  const totalAmount = orderDetails.total.toFixed(2)

  // Determine estimated delivery based on status
  let estimatedDelivery = "2-3 hrs"
  if (status === "PROCESSING") {
    estimatedDelivery = "2-3 hrs"
  } else if (status === "SHIPPED") {
    estimatedDelivery = "1-2 hrs"
  } else if (status === "DELIVERED") {
    estimatedDelivery = "Delivered"
  } else if (status === "CANCELLED") {
    estimatedDelivery = "Cancelled"
  }

  // Extract customer name from user object or email
  const customerName = orderDetails.user?.name || to.split("@")[0]

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `Order Status Update: ${orderNumber}`,
    html: await render(
      OrderStatusTemplate({
        customerName: customerName,
        orderNumber: orderNumber,
        orderDate: new Date(orderDetails.createdAt).toLocaleDateString(),
        totalAmount: `KES ${totalAmount}`,
        estimatedDelivery: estimatedDelivery,
        orderDetailsLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/orders/${orderNumber}`,
        status: status as OrderStatus,
      }),
    ),
    attachments: [
      {
        filename: `order-${orderNumber}.pdf`,
        content: pdfBuffer,
      },
    ],
  }

  try {
    console.log("Sending email for status:", status)
    await transporter.sendMail(mailOptions)
    console.log("Order status email sent successfully to", to)
    return true
  } catch (error) {
    console.error("Error sending order status email:", error)
    throw error
  }
}

// Function to generate PDF from order details
async function generateOrderPDF(orderNumber: string, orderDetails: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Order Receipt", 105, 20, { align: "center" })

    // Add company logo
    // You need to replace '/path/to/logo.jpg' with the actual path to your logo
    // The parameters are: image path, x position, y position, width, height
    try {
      // Load the logo image
      // Note: Make sure the logo file path is correct and accessible
      const logoPath ='https://res.cloudinary.com/dunssu2gi/image/upload/v1744141651/blog-images/alfxgrzskxcl8zidlsvj.png'
      doc.addImage(logoPath, 'PNG', 85, 30, 40, 20)
    } catch (error) {
      console.error("Error adding logo to PDF:", error)
      // Fallback to text if image loading fails
      doc.setFillColor(240, 240, 240)
      doc.rect(85, 30, 40, 20, "F")
      doc.setFontSize(10)
      doc.text("Freshom Produce Market", 105, 40, { align: "center" })
    }

    // Add order details
    doc.setFontSize(12)
    doc.text(`Order #: ${orderNumber}`, 20, 60)
    doc.text(`Date: ${new Date(orderDetails.createdAt).toLocaleDateString()}`, 20, 70)
    doc.text(`Status: ${orderDetails.orderStatus}`, 20, 80)
    doc.text(`Payment Status: ${orderDetails.paymentStatus}`, 20, 90)

    // Add items table
    let yPosition = 110
    doc.setFontSize(14)
    doc.text("Items Purchased", 20, yPosition)

    yPosition += 10
    doc.setFontSize(10)
    doc.text("Item", 20, yPosition)
    doc.text("Qty", 120, yPosition)
    doc.text("Price", 150, yPosition)
    doc.text("Total", 180, yPosition)

    yPosition += 5
    doc.line(20, yPosition, 190, yPosition)

    yPosition += 10

    // Add items
    if (orderDetails.orderItems && orderDetails.orderItems.length > 0) {
      orderDetails.orderItems.forEach((item: any) => {
        const productName = item.product?.name || "Product"
        doc.text(productName, 20, yPosition)
        doc.text(item.quantity.toString(), 120, yPosition)
        doc.text(`KES ${item.price.toFixed(2)}`, 150, yPosition)
        doc.text(`KES ${(item.price * item.quantity).toFixed(2)}`, 180, yPosition)
        yPosition += 10
      })
    }

    // Add total
    yPosition += 10
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 10
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 150, yPosition)
    doc.text(`KES ${orderDetails.total.toFixed(2)}`, 180, yPosition)

    // Add footer
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.text("Thank you for shopping with Freshom Produce Market!", 105, 270, { align: "center" })
    doc.text("Fresh From Nature Made For Home", 105, 275, { align: "center" })

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
    resolve(pdfBuffer)
  })
}