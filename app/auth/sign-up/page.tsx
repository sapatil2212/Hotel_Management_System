"use client"

import { useState, useTransition, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, LockKeyhole, User, Home, Phone, KeySquare, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader, ButtonLoader } from "@/components/ui/loader"
import { SuccessModal } from "@/components/ui/success-modal"


export default function SignUpPage() {
  const [step, setStep] = useState<"details" | "verify">("details")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<"OWNER" | "ADMIN" | "RECEPTION" | "">("")
  const [psk, setPsk] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [resendDisabled, setResendDisabled] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [successOpen, setSuccessOpen] = useState(false)


  // Timer for resend functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setResendDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const requestOtp = async () => {
    const res = await fetch("/api/auth/register/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, role, psk }),
    })
    if (!res.ok) {
      const data = await res.json()
      if (res.status === 422 && data?.issues) {
        const first = data.issues[0]
        throw new Error(first?.message || "Invalid input")
      }
      throw new Error(data?.error || "Failed to request OTP")
    }
  }
  
  const verifyOtp = async () => {
    const res = await fetch("/api/auth/register/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, role, password, code }),
    })
    if (!res.ok) {
      const data = await res.json()
      if (res.status === 422 && data?.issues) {
        const first = data.issues[0]
        throw new Error(first?.message || "Invalid input")
      }
      throw new Error(data?.error || "Failed to verify OTP")
    }
  }

  const handleResendOtp = async () => {
    setError(null)
    startTransition(async () => {
              try {
          setIsProcessing(true)
          await requestOtp()
          toast({ title: "OTP resent", description: `We sent a new code to ${email}` })
          setResendDisabled(true)
          setResendTimer(60) // 1 minute cooldown
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsProcessing(false)
        }
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (step === "details") {
      startTransition(async () => {
        try {
          if (!role) throw new Error("Please select a role")
          setIsProcessing(true)
          await requestOtp()
          toast({ title: "OTP sent", description: `We sent a code to ${email}` })
          setStep("verify")
          setResendDisabled(true)
          setResendTimer(60) // 1 minute cooldown
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsProcessing(false)
        }
      })
    } else {
      startTransition(async () => {
        try {
          setIsProcessing(true)
          await verifyOtp()
          setSuccessOpen(true)
          toast({ title: "Registration successful", description: "You can now sign in." })
          setTimeout(() => router.push("/auth/sign-in"), 2000)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsProcessing(false)
        }
      })
    }
  }

  return (
    <Card className="w-full max-w-5xl overflow-hidden shadow-xl border-0 mx-4 sm:mx-6 lg:mx-8">
      <Loader 
        show={isPending} 
        message={step === "details" ? "Sending OTP to your email..." : "Creating your account..."}
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
            <h1 className="text-2xl font-bold">{step === "details" ? "Create account," : "Verify email"}</h1>
            <p className="text-sm text-muted-foreground">
              {step === "details" ? "Join us to continue" : `We sent a 6-digit code to ${email}`}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === "details" ? (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" required />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="Your e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" required />
                </div>
                <div className="relative">
                  <KeySquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Permanent Security Key (PSK)" value={psk} onChange={(e) => setPsk(e.target.value)} className="pl-9" required />
                </div>
                <div>
                  <Select value={role} onValueChange={(v) => setRole(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role (Owner/Admin/Reception)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Hotel Owner</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="RECEPTION">Reception</SelectItem>
                    </SelectContent>
                  </Select>
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
              </>
            ) : (
              <>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} className="pl-9" required maxLength={6} />
                </div>
              </>
            )}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={isPending || isProcessing}>
              <ButtonLoader 
                show={isPending || isProcessing} 
                loadingText={step === "details" ? "Sending OTP..." : "Creating Account..."}
              >
                {step === "details" ? "Request OTP" : "Verify & Create"}
              </ButtonLoader>
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Link href="/auth/sign-in" className="text-amber-700 hover:underline">Already have an account? Sign in</Link>
              {step === "verify" && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendDisabled || isProcessing}
                  className={`text-amber-700 hover:underline ${(resendDisabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? 'Sending...' : resendDisabled ? `Resend in ${formatTime(resendTimer)}` : 'Resend OTP'}
                </button>
              )}
            </div>
          </form>
        </CardContent>

        {/* Right: Hero */}
        <div className="relative hidden md:block">
          <Image src="https://images.pexels.com/photos/372098/pexels-photo-372098.jpeg" alt="Hero" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Account Created Successfully!"
        description="Your account has been created successfully. You will be redirected to the sign-in page shortly."
        onConfirm={() => router.push('/auth/sign-in')}
        confirmText="Go to Sign In"
        showIcon={true}
      />


    </Card>
  )
}


