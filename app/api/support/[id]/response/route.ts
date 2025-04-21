import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supportTicketId = Number.parseInt(params.id)
    const data = await request.json()
    
    // Create the response
    const response = await prisma.supportResponse.create({
      data: {
        supportTicketId,
        message: data.message,
        respondedBy: data.respondedBy,
      },
    })
    
    // Update ticket status based on the action
    if (data.closeTicket) {
      await prisma.supportTicket.update({
        where: { id: supportTicketId },
        data: { status: "CLOSED" },
      })
    } else {
      // If not closing the ticket, update to PROCESSING
      await prisma.supportTicket.update({
        where: { id: supportTicketId },
        data: { status: "PROCESSING" },
      })
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error creating support response:", error)
    return NextResponse.json({ error: "Failed to create support response" }, { status: 500 })
  }
}