import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        // Allow login and signup pages without authentication
        if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup") {
          return true;
        }
        // Require authentication for all other routes
        return token !== null;
      },
    },
  }
);

// Update to use matcher config
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|logo.svg).*)"],
};
