"use client"

import { useState, useTransition, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, LockKeyhole, Home, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Loader, ButtonLoader } from "@/components/ui/loader"
import { SuccessModal } from "@/components/ui/success-modal"


export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "password">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    const res = await fetch("/api/auth/forgot-password/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
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
    const res = await fetch("/api/auth/forgot-password/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code }),
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

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
              try {
          setIsProcessing(true)
          await requestOtp()
          toast({ title: "OTP sent", description: `We sent a code to ${email}` })
          setStep("otp")
          setResendDisabled(true)
          setResendTimer(60) // 1 minute cooldown
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsProcessing(false)
        }
    })
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    startTransition(async () => {
      try {
        setIsProcessing(true)
        await verifyOtp()
        setSuccessOpen(true)
        toast({ title: "Password reset successful", description: "You can now sign in with your new password." })
        setTimeout(() => router.push("/auth/sign-in"), 2000)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsProcessing(false)
      }
    })
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

  return (
    <Card className="w-full max-w-5xl overflow-hidden shadow-xl border-0 mx-4 sm:mx-6 lg:mx-8">
      <Loader 
        show={isPending} 
        message={step === "email" ? "Sending OTP..." : step === "otp" ? "Verifying OTP..." : "Resetting password..."}
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
            <h1 className="text-2xl font-bold">
              {step === "email" ? "Forgot Password" : step === "otp" ? "Verify OTP" : "Reset Password"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "email" 
                ? "Enter your email to receive a reset code" 
                : step === "otp" 
                ? `We sent a 6-digit code to ${email}` 
                : "Enter your new password"
              }
            </p>
          </div>
          
          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Your e-mail" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-9" 
                  required 
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex items-center justify-between text-sm">
                <Link href="/auth/sign-in" className="text-amber-700 hover:underline">Back to Sign In</Link>
              </div>
              <Button type="submit" className="w-full" disabled={isPending || isProcessing}>
                <ButtonLoader 
                  show={isPending || isProcessing} 
                  loadingText="Sending OTP..."
                >
                  Send Reset Code
                </ButtonLoader>
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={(e) => { e.preventDefault(); setStep("password") }} className="space-y-4">
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter 6-digit code" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  className="pl-9" 
                  required 
                  maxLength={6} 
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex items-center justify-between text-sm">
                <Link href="/auth/sign-in" className="text-amber-700 hover:underline">Back to Sign In</Link>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendDisabled || isProcessing}
                  className={`text-amber-700 hover:underline ${(resendDisabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? 'Sending...' : resendDisabled ? `Resend in ${formatTime(resendTimer)}` : 'Resend OTP'}
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={!code || code.length !== 6 || isProcessing}>
                {isProcessing ? 'Processing...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="New password" 
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
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="pl-9 pr-10" 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex items-center justify-between text-sm">
                <Link href="/auth/sign-in" className="text-amber-700 hover:underline">Back to Sign In</Link>
                <button
                  type="button"
                  onClick={() => setStep("otp")}
                  className="text-amber-700 hover:underline"
                >
                  Back to OTP
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={isPending || isProcessing || !password || !confirmPassword}>
                <ButtonLoader 
                  show={isPending || isProcessing} 
                  loadingText="Resetting password..."
                >
                  Reset Password
                </ButtonLoader>
              </Button>
            </form>
          )}
        </CardContent>

        {/* Right: Hero */}
        <div className="relative hidden md:block">
          <Image src="https://images.pexels.com/photos/326119/pexels-photo-326119.jpeg" alt="Hero" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Password Reset Successful!"
        description="Your password has been reset successfully. You will be redirected to the sign-in page shortly."
        onConfirm={() => router.push('/auth/sign-in')}
        confirmText="Go to Sign In"
        showIcon={true}
      />


    </Card>
  )
}
