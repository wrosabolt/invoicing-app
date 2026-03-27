import { Pool } from "pg";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const pool = new Pool({ connectionString: process.env.PG_URL });

export const authOptions: NextAuthOptions = {
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
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
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
      return {
        expires: session.expires,
        user: {
          id: t.id as string,
          name: t.name as string,
          email: t.email as string,
          image: null as string | null,
          companyName: t.companyName as string,
          hourlyRate: t.hourlyRate as number,
          gstRate: t.gstRate as number
        }
      } as any;
    }
  }
};

// User management functions
export async function createUser(name: string, email: string, password: string, companyData: any) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password, company_name, company_address, company_email, company_phone, abn, hourly_rate, gst_rate, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     RETURNING id, name, email, company_name, hourly_rate, gst_rate`,
    [name, email.toLowerCase(), hashedPassword, companyData.companyName, companyData.address, 
     companyData.email, companyData.phone, companyData.abn, companyData.hourlyRate, companyData.gstRate]
  );
  
  return result.rows[0];
}

export async function findUserByEmail(email: string) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0];
}
