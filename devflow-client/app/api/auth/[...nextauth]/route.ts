import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text", placeholder: "Optional" }
      },
      async authorize(credentials, req) {
        try {
          const res = await axios.post(`${API_URL}/api/login`, {
            email: credentials?.email,
            password: credentials?.password,
            name: credentials?.name
          });

          const user = res.data;

          if (user) {
            return user;
          } else {
            return null;
          }
        } catch (error: any) {
            console.error("Auth Error:", error.response?.data || error.message);
            return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
      async jwt({ token, user }) {
          if (user) {
              token.id = user.id;
          }
          return token;
      },
      async session({ session, token }) {
          if (session.user) {
              (session.user as any).id = token.id;
          }
          return session;
      }
  },
  
  // Important for using in app dir if using v4
  secret: process.env.NEXTAUTH_SECRET || "supersecret",
});

export { handler as GET, handler as POST };
