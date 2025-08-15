"use client"

import { useState, useEffect } from "react"
import { Loader } from "lucide-react"
import StatsCards from "@/components/dashboard/stats-cards"
import RevenueAreaChart from "@/components/dashboard/charts/revenue-area-chart"
import OccupancyBarChart from "@/components/dashboard/charts/occupancy-bar-chart"
import SourcePieChart from "@/components/dashboard/charts/source-pie-chart"
import BookingsTable from "@/components/dashboard/bookings-table"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading time for dashboard components
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <StatsCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <RevenueAreaChart />
          <OccupancyBarChart />
        </div>
        <div className="xl:col-span-1">
          <SourcePieChart />
        </div>
      </div>

      <BookingsTable />
    </div>
  )
}


