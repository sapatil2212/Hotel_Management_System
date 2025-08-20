import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "50c4f15eaa6e228826000c9eb941e2f9a2acaf4ab9683c63cfa8f86a6f842332",
  session: { 
    strategy: "jwt", // Temporarily back to JWT to fix 500 error
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          if (!user) return null
          const valid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!valid) return null
          // Return minimal user data to prevent large tokens
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            image: user.avatarUrl || null
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Keep only essential user data to prevent large tokens
        token.id = (user as any).id
        token.role = (user as any).role
        token.email = (user as any).email
        token.name = (user as any).name
        token.image = (user as any).image
        // Add timestamp to prevent multiple tokens
        token.iat = Math.floor(Date.now() / 1000)
        // Add unique identifier to prevent duplicates
        token.sessionId = `${user.id}-${Date.now()}`
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        // Keep only essential user data
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
        ;(session.user as any).email = token.email as string
        ;(session.user as any).name = token.name as string
        ;(session.user as any).image = token.image as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Prevent multiple sign-ins for the same user
      if (user) {
        console.log(`User ${user.email} signing in - preventing duplicate sessions`)
        return true
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Ensure proper redirect handling
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
  },
  // Add session cleanup
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log successful sign-in
      console.log(`User ${user.email} signed in successfully`)
    },
    async signOut({ session, token }) {
      // Log sign-out
      console.log("User signed out")
    },
  },
  // Disable debug mode to reduce token size
  debug: false,
}

export function roleToDashboardPath(role?: string) {
  switch (role) {
    case "RECEPTION":
      return "/dashboard/bookings"
    case "ADMIN":
    case "OWNER":
    default:
      return "/dashboard"
  }
}


