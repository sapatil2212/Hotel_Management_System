"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const data = [
  { day: "Mon", revenue: 3800, bookings: 42 },
  { day: "Tue", revenue: 4200, bookings: 48 },
  { day: "Wed", revenue: 4600, bookings: 51 },
  { day: "Thu", revenue: 5200, bookings: 55 },
  { day: "Fri", revenue: 6100, bookings: 62 },
  { day: "Sat", revenue: 7400, bookings: 70 },
  { day: "Sun", revenue: 6900, bookings: 66 },
]

const config = {
  revenue: {
    label: "Revenue",
    theme: { light: "hsl(32, 95%, 44%)", dark: "hsl(32, 95%, 60%)" },
  },
  bookings: {
    label: "Bookings",
    theme: { light: "hsl(217, 91%, 60%)", dark: "hsl(217, 91%, 70%)" },
  },
}

export default function RevenueAreaChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue & Bookings (7d)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-[16/8]">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
            <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="bookings" stroke="var(--color-bookings)" fill="var(--color-bookings)" fillOpacity={0.15} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}


