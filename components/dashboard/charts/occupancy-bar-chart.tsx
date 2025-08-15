"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { period: "Jan", occupancy: 78 },
  { period: "Feb", occupancy: 82 },
  { period: "Mar", occupancy: 85 },
  { period: "Apr", occupancy: 79 },
  { period: "May", occupancy: 88 },
  { period: "Jun", occupancy: 92 },
]

const config = {
  occupancy: {
    label: "Occupancy %",
    theme: { light: "hsl(217, 91%, 60%)", dark: "hsl(217, 91%, 70%)" },
  },
}

export default function OccupancyBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-[16/8]">
          <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="occupancy" fill="var(--color-occupancy)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}


