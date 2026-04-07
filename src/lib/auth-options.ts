import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!apiBaseUrl || !credentials?.email || !credentials.password) {
          return null
        }

        const response = await fetch(`${apiBaseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        })

        const payload = await response.json()
        if (!response.ok || !payload?.status || !payload?.data?.user) {
          throw new Error(payload?.message || "Unable to sign in")
        }

        const { user, accessToken, refreshToken } = payload.data
        return {
          id: user._id,
          name: [user.firstName, user.lastName].filter(Boolean).join(" "),
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          accessToken,
          refreshToken,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.picture = user.profileImage || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.accessToken = token.accessToken as string
        session.user.refreshToken = token.refreshToken as string
        session.user.image =
          typeof token.picture === "string" ? token.picture : null
      }
      return session
    },
  },
}
