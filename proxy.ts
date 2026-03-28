import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/", "/create-invoice", "/settings", "/api/invoices", "/api/invoices/:path*", "/api/clients", "/api/clients/:path*", "/api/settings"],
};
