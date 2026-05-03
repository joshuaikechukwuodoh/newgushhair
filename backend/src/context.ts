import { admins } from './db/schema'
import { eq } from 'drizzle-orm'
import { db } from './db'
import { verifyJWT } from './lib/auth'

export const createContext = async (opts: any) => {
  const authHeader = opts.req.headers.get('authorization')

  let admin = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const payload = await verifyJWT(token)

    if (payload && payload.id) {
      const result = await db
        .select()
        .from(admins)
        .where(eq(admins.id, payload.id))

      if (result.length > 0) {
        admin = result[0]
      }
    }
  }

  return {
    req: opts.req,
    admin,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>