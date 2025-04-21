"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type RecentSale = {
  id: number
  total: number
  user: {
    id: number
    name: string
    email: string
  }
}

export function RecentSales() {
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const response = await fetch("/api/dashboard")
        const data = await response.json()

        if (data.recentSales && Array.isArray(data.recentSales)) {
          setRecentSales(data.recentSales)
        } else {
          console.error("Invalid recentSales data format:", data.recentSales)
        }
      } catch (error) {
        console.error("Error fetching recent sales:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentSales()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-[200px]">Loading recent sales...</div>
  }

  if (recentSales.length === 0) {
    return <div className="text-center py-4">No recent sales found.</div>
  }

  return (
    <div className="space-y-8">
      {recentSales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="https://res.cloudinary.com/dunssu2gi/image/upload/v1744530622/blog-images/bpqpxqml18kamrdmj2pp.png" alt={sale.user.name} />
            <AvatarFallback>{sale.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 font-medium space-y-1 text-gray-700">
            <p className="text-[0.8rem] font-medium leading-none">{sale.user.name}</p>
            <p className="text-[0.7rem] ">{sale.user.email}</p>
          </div>
          <div className="ml-auto font-medium">+KES {sale.total.toFixed(2)}</div>
        </div>
      ))}
    </div>
  )
}
