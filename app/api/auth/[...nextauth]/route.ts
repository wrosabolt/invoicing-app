import NextAuth from "next-auth";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const pool = new Pool({ connectionString: process.env.PG_URL });

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const result = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [credentials.email]
        );
        
        const user = result.rows[0];
        if (!user) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) return null;
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          companyName: user.company_name,
          hourlyRate: user.hourly_rate,
          gstRate: user.gst_rate
        } as any;
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.companyName = u.companyName;
        token.hourlyRate = u.hourlyRate;
        token.gstRate = u.gstRate;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as any;
      if (session.user) {
        session.user.id = t.id;
        session.user.name = t.name;
        session.user.email = t.email;
        (session.user as any).companyName = t.companyName;
        (session.user as any).hourlyRate = t.hourlyRate;
        (session.user as any).gstRate = t.gstRate;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
