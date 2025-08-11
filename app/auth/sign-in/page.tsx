"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, LockKeyhole, Facebook, Github, Home } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader } from "@/components/ui/loader"

async function login(email: string, password: string) {
  const res = await signIn("credentials", { redirect: false, email, password })
  return res
}

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      // show overlay loader while authenticating
      
      const res = await login(email, password)
      if (res?.error) {
        setError("Invalid credentials")
        toast({ title: "Login failed", description: "Please check your email and password", variant: "destructive" as any })
        return
      }
      toast({ title: "Welcome back", description: "Login successful" })
      router.push("/auth/post-login")
    })
  }

  return (
    <Card className="w-full max-w-5xl overflow-hidden shadow-xl border-0">
      <Loader show={isPending} message="Signing you in..." />
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left: Form */}
        <CardContent className="p-8 md:p-10">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back,</h1>
            <p className="text-lg text-muted-foreground">Sign In to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Your e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex items-center justify-between text-sm">
              <Link href="/auth/sign-up" className="text-amber-700 hover:underline">Register</Link>
              <Link href="#" className="text-muted-foreground hover:underline">Forgot Password?</Link>
            </div>
            <Button type="submit" className="w-24" disabled={isPending}>{isPending ? "..." : "Sign In"}</Button>
          </form>

          <div className="mt-8">
            <div className="text-sm text-muted-foreground mb-2">Login with</div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2"><Facebook className="h-4 w-4" />facebook</Button>
              <Button variant="outline" size="sm" className="gap-2"><Github className="h-4 w-4" />google</Button>
            </div>
          </div>
        </CardContent>

        {/* Right: Hero */}
        <div className="relative hidden md:block">
          <Image src="https://images.pexels.com/photos/326119/pexels-photo-326119.jpeg" alt="Hero" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="hidden md:flex items-center gap-2 px-6 py-3 border-t text-muted-foreground text-sm">
        <Separator orientation="vertical" className="h-5" />
        Help
      </div>
    </Card>
  )
}


