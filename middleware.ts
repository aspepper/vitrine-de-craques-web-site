import { withAuth } from "next-auth/middleware"

export default withAuth(
  // `withAuth` anexa o usuário atual à requisição `req`
  function middleware(req) {
    // console.log(req.nextauth.token)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = { matcher: ["/perfil", "/upload"] }
