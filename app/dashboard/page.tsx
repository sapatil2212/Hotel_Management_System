import StatsCards from "@/components/dashboard/stats-cards"
import RevenueAreaChart from "@/components/dashboard/charts/revenue-area-chart"
import OccupancyBarChart from "@/components/dashboard/charts/occupancy-bar-chart"
import SourcePieChart from "@/components/dashboard/charts/source-pie-chart"
import BookingsTable from "@/components/dashboard/bookings-table"

export default function DashboardPage() {
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


