import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supportTicketId = Number.parseInt(params.id)
    
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: supportTicketId },
      include: {
        user: true,
        responses: true,
      },
    })
    
    if (!ticket) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 })
    }
    
    // Update ticket status to OPEN when viewed if it's currently NEW
    if (ticket.status === "NEW") {
      await prisma.supportTicket.update({
        where: { id: supportTicketId },
        data: { status: "OPEN" },
      })
    }
    
    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error fetching support ticket:", error)
    return NextResponse.json({ error: "Failed to fetch support ticket" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supportTicketId = Number.parseInt(params.id)
    const data = await request.json()
    
    const ticket = await prisma.supportTicket.update({
      where: { id: supportTicketId },
      data: {
        status: data.status,
      },
      include: {
        user: true,
        responses: true,
      },
    })
    
    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error updating support ticket:", error)
    return NextResponse.json({ error: "Failed to update support ticket" }, { status: 500 })
  }
}