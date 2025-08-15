import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions, roleToDashboardPath } from "@/lib/auth-options"

export default async function PostLogin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role as string | undefined
  const target = roleToDashboardPath(role)
  redirect(target)
}


