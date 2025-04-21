// File: /app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id, 10);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check if the user exists before attempting deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has associated records
    const userOrders = await prisma.order.findMany({
      where: { userId: userId },
    });

    const userSupportTickets = await prisma.supportTicket.findMany({
      where: { userId: userId },
    });

    // If user has associated records, we should handle this case
    if (userOrders.length > 0 || userSupportTickets.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete user with associated records',
          details: {
            hasOrders: userOrders.length > 0,
            hasSupportTickets: userSupportTickets.length > 0
          }
        },
        { status: 409 }
      );
    }

    // Delete the user if no associated records exist
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}