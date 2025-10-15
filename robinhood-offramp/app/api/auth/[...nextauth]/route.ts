import NextAuth, { type NextAuthOptions } from "next-auth";

// Minimal NextAuth configuration (temporary)
// No providers needed for Robinhood flow as authentication happens in Robinhood app
// This will be completely removed in Sub-Plan 6 when dashboard is rebuilt
export const authOptions: NextAuthOptions = {
  providers: [], // No providers needed for Robinhood flow
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
