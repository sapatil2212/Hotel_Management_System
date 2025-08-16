"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, LockKeyhole, Home, Eye, EyeOff, HelpCircle } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader, ButtonLoader } from "@/components/ui/loader"
import { ContactModal } from "@/components/ui/contact-modal"

async function login(email: string, password: string) {
  const res = await signIn("credentials", { redirect: false, email, password })
  return res
}

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        setIsProcessing(true)
        const res = await login(email, password)
        if (res?.error) {
          setError("Invalid credentials")
          toast({ title: "Login failed", description: "Please check your email and password", variant: "destructive" as any })
          return
        }
        toast({ title: "Welcome back", description: "Login successful" })
        router.push("/auth/post-login")
      } finally {
        setIsProcessing(false)
      }
    })
  }

  return (
    <Card className="w-full max-w-5xl overflow-hidden shadow-xl border-0 mx-4 sm:mx-6 lg:mx-8">
      <Loader 
        show={isPending} 
        message="Signing you in..."
        variant="primary"
        size="lg"
      />
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left: Form */}
        <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back,</h1>
            <p className="text-sm text-muted-foreground">Sign In to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Your e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="pl-9 pr-10" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={isPending || isProcessing}>
              <ButtonLoader 
                show={isPending || isProcessing} 
                loadingText="Signing in..."
              >
                Sign In
              </ButtonLoader>
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link href="/auth/sign-up" className="text-amber-700 hover:underline">Don't have an account? Sign up</Link>
              <Link href="/auth/forgot-password" className="text-muted-foreground hover:underline">Forgot Password?</Link>
            </div>
          </form>


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
        <button 
          onClick={() => setContactModalOpen(true)}
          className="hover:text-foreground cursor-pointer flex items-center gap-1"
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </button>
      </div>

      {/* Contact Modal */}
      <ContactModal 
        open={contactModalOpen} 
        onOpenChange={setContactModalOpen} 
      />
    </Card>
  )
}


