// This would be in a file like: /pages/api/users.ts (Next.js Pages Router)
// or /app/api/users/route.ts (Next.js App Router)

import { PrismaClient, User as PrismaUser, UserRole } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the response structure
interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface UsersResponse {
  users: PrismaUser[];
  pagination: PaginationData;
}

// For Pages Router
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UsersResponse | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '10', 10);
  // You could also add search parameters
  // const search = req.query.search as string || '';

  const prisma = new PrismaClient();
  
  try {
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        name: 'asc'
      },
      // If you want to add search functionality:
      // where: {
      //   OR: [
      //     { name: { contains: search, mode: 'insensitive' } },
      //     { email: { contains: search, mode: 'insensitive' } }
      //   ]
      // }
    });
    
    // Get total count for pagination
    const totalUsers = await prisma.user.count();
    
    return res.status(200).json({
      users,
      pagination: {
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: 'Error fetching users' });
  } finally {
    await prisma.$disconnect();
  }
}

// For App Router (Next.js 13+)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  
  const prisma = new PrismaClient();
  
  try {
    const skip = (page - 1) * limit;
    
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });
    
    const totalUsers = await prisma.user.count();
    
    return new Response(JSON.stringify({
      users,
      pagination: {
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
        page,
        limit
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(JSON.stringify({ message: 'Error fetching users' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  } finally {
    await prisma.$disconnect();
  }
}