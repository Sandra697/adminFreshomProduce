import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const tallyEntries = await prisma.tallyEntry.findMany({
      include: {
        tallyItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(tallyEntries)
  } catch (error) {
    console.error("Error fetching tally entries:", error)
    return NextResponse.json({ error: "Failed to fetch tally entries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const tallyEntry = await prisma.tallyEntry.create({
      data: {
        date: new Date(data.date),
        tallyItems: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes || "",
          })),
        },
      },
      include: {
        tallyItems: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(tallyEntry)
  } catch (error) {
    console.error("Error creating tally entry:", error)
    return NextResponse.json({ error: "Failed to create tally entry" }, { status: 500 })
  }
}
