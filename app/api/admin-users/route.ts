import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const adminUsers = await prisma.adminUser.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(adminUsers)
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "Failed to fetch admin users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const adminUser = await prisma.adminUser.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        lastActive: new Date(),
      },
    })

    // Remove password from response
    const { password, ...adminUserWithoutPassword } = adminUser

    return NextResponse.json(adminUserWithoutPassword)
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}
