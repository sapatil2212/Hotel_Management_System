"use client"

import { Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { source: "Website", value: 48 },
  { source: "Mobile App", value: 26 },
  { source: "Travel Agency", value: 18 },
  { source: "Walk-in", value: 8 },
]

const COLORS = [
  "hsl(32, 95%, 44%)",
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(346, 87%, 43%)",
]

const config = {
  Website: { label: "Website", color: COLORS[0] },
  "Mobile App": { label: "Mobile App", color: COLORS[1] },
  "Travel Agency": { label: "Travel Agency", color: COLORS[2] },
  "Walk-in": { label: "Walk-in", color: COLORS[3] },
}

export default function SourcePieChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-[16/9]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="source" />} />
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent />} />
            <Pie data={data} dataKey="value" nameKey="source" outerRadius={110} innerRadius={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}


