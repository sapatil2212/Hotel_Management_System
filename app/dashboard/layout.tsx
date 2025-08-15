import Sidebar from "@/components/dashboard/sidebar"
import Topbar from "@/components/dashboard/topbar"
import { Container } from "@/components/ui/container"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/sign-in")
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Fixed sidebar */}
      <Sidebar />
      {/* Content shifted with left margin equal to sidebar width on lg+ */}
      <div className="lg:ml-64 flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6 sm:p-8">
          <Container fluid>
            {children}
          </Container>
        </main>
      </div>
    </div>
  )
}


