export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      hasDB: !!process.env.DATABASE_URL,
      host: process.env.NEXTAUTH_URL || null
    }),
    { headers: { 'content-type': 'application/json' } }
  )
}
