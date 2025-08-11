import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CalendarCheck2, Percent, Clock } from "lucide-react"

type Stat = {
  title: string
  value: string
  delta: string
  up?: boolean
  icon: React.ReactNode
}

const stats: Stat[] = [
  { title: "Revenue (30d)", value: "$128,450", delta: "+12.3%", up: true, icon: <DollarSign className="h-4 w-4" /> },
  { title: "Bookings", value: "1,284", delta: "+5.8%", up: true, icon: <CalendarCheck2 className="h-4 w-4" /> },
  { title: "Occupancy", value: "87%", delta: "+2.1%", up: true, icon: <Percent className="h-4 w-4" /> },
  { title: "Avg. Stay", value: "2.6 nights", delta: "-0.3%", up: false, icon: <Clock className="h-4 w-4" /> },
]

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((s) => (
        <Card key={s.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              {s.icon}
              {s.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className={s.up ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                <div className="flex items-center gap-1 text-sm">
                  {s.up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {s.delta}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


