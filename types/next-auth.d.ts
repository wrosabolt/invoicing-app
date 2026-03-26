import "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    companyName?: string;
    hourlyRate?: number;
    gstRate?: number;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    companyName?: string;
    hourlyRate?: number;
    gstRate?: number;
  }
}
