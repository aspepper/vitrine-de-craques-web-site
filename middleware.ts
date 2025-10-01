import { withAuth } from "next-auth/middleware"

const ADMIN_ROLES = new Set(["SUPER", "ADMINISTRADOR", "MODERADOR"])

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token || token.status === "BLOCKED") {
          return false
        }

        const pathname = req.nextUrl.pathname

        if (pathname.toLowerCase().startsWith("/administrator")) {
          const role = token.role
          return typeof role === "string" && ADMIN_ROLES.has(role)
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: ["/perfil", "/upload/:path*", "/administrator/:path*"],
}
