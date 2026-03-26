import { User as NextAuthUser, JWT as NextAuthJWT } from "next-auth";

declare module "next-auth" {
  interface User {
    companyName?: string;
    hourlyRate?: number;
    gstRate?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    companyName?: string;
    hourlyRate?: number;
    gstRate?: number;
  }
}
