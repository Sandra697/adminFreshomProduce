"use client"

import { useEffect, useState } from "react"
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from "recharts"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

type DailyData = {
  day: string
  date: string
  sales: number
  orderCount: number
  tallyItems: number
  orderItems: number
  average: number
}

export function Overview() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const itemsPerPage = 7 // Show 7 days per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard")
        const dashboardData = await response.json()

        if (dashboardData.dailyData && dashboardData.dailyData.length > 0) {
          // Sort data by day (ascending)
          const sortedData = [...dashboardData.dailyData].sort((a, b) => 
            new Date(a.day).getTime() - new Date(b.day).getTime()
          );
          
          // Get the first order date
          const firstOrderDate = new Date(sortedData[0].day);
          
          // Calculate running cumulative totals
          let runningTallyTotal = 0;
          let runningOrdersTotal = 0;
          
          // Process and transform the data
          const processedData = sortedData.map((item, index) => {
            // Calculate days since first order
            const currentDate = new Date(item.day);
            const daysSinceFirstOrder = Math.max(1, Math.floor(
              (currentDate.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1); // +1 to include the first day
            
            // Ensure we have numeric values for calculations
            const tallyItems = Number(item.tallyItems) || 0;
            const orderItems = Number(item.orderItems) || 0;
            
            // Update running totals
            runningTallyTotal += tallyItems;
            runningOrdersTotal += orderItems;
            
            // Calculate daily average of tally items
            const dailyTallyAverage = sortedData
              .slice(0, index + 1)
              .reduce((sum, dataPoint) => sum + dataPoint.tallyItems, 0) / daysSinceFirstOrder;
              
            return {
              ...item,
              // Convert all values to numbers to ensure proper rendering
              tallyItems: tallyItems,
              orderItems: orderItems,
              // Calculate cumulative totals for this date point
              cumulativeTallyItems: runningTallyTotal,
              cumulativeOrderItems: runningOrdersTotal,
              // Calculate remaining tally items (cumulative)
              remainingTallyItems: Math.max(0, runningTallyTotal - runningOrdersTotal),
              // Calculate revised average
              revisedAverage: dailyTallyAverage
            };
          });
          
          console.log("Processed data:", processedData);
          setData(processedData);
          setTotalPages(Math.ceil(processedData.length / itemsPerPage));
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Get the current page of data
  const currentData = data.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  ).reverse() // Reverse to show oldest to newest

  if (loading) {
    return <div className="flex items-center justify-center h-[350px]">Loading chart data...</div>
  }

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[350px]">No data available</div>
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={currentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            yAxisId="left"
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}`} 
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value.toFixed(1)}`} 
          />
          <Tooltip 
            formatter={(value, name) => {
              switch(name) {
                case 'revisedAverage':
                  return [`${Number(value).toFixed(1)}`, 'Average Daily Tally'];
                case 'orderItems':
                  return [value, 'Daily Order Items'];
                case 'tallyItems':
                  return [value, 'Daily Tally Items'];
                case 'remainingTallyItems':
                  return [value, 'Total Remaining Stock'];
                case 'cumulativeTallyItems':
                  return [value, 'Total Tally Items'];
                case 'cumulativeOrderItems':
                  return [value, 'Total Order Items'];
                default:
                  return [value, name];
              }
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="tallyItems" 
            name="Added stock Items" 
            stroke="#CD1818" 
            strokeWidth={1}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
          <Line 
            yAxisId="left"
            type="monotone"
            dataKey="orderItems" 
            name="Daily Order Items" 
            stroke="#301B3F" 
            strokeWidth={1}
            dot={{ r: 2 }}
            
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="remainingTallyItems"
            name="Total Remaining Stock"
            stroke="#FF9500"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revisedAverage"
            name="Average Daily Tally"
            stroke="#005B41"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {currentPage * itemsPerPage + 1} - {Math.min((currentPage + 1) * itemsPerPage, data.length)} of {data.length} days
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevPage} 
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}