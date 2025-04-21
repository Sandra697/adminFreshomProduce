import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const supportTickets = await prisma.supportTicket.findMany({
      include: {
        user: true,
        responses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(supportTickets)
  } catch (error) {
    console.error("Error fetching support tickets:", error)
    return NextResponse.json({ error: "Failed to fetch support tickets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const supportTicket = await prisma.supportTicket.create({
      data: {
        userId: data.userId,
        message: data.message,
        status: "NEW",

      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(supportTicket)
  } catch (error) {
    console.error("Error creating support ticket:", error)
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 })
  }
}
