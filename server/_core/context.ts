import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { users } from "@prisma/client";
import { COOKIE_NAME } from "@shared/const";
import { getUserFromToken } from "../auth";
import { createClient } from '@supabase/supabase-js';
import { prisma } from "../db";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log(`[Auth] Supabase config: URL=${!!supabaseUrl}, Key=${!!supabaseKey}`);

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: users | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: users | null = null;

  // Try to get user from JWT token (email/password login)
  const jwtToken = opts.req.cookies?.[COOKIE_NAME];
  if (jwtToken) {
    user = await getUserFromToken(jwtToken);
  }

  // If no JWT token, try to get user from Supabase session (Google OAuth)
  if (!user && supabaseUrl && supabaseKey) {
    try {
      // Get Supabase access token from Authorization header
      const authHeader = opts.req.headers.authorization;
      const supabaseToken = authHeader?.replace('Bearer ', '');

      if (supabaseToken) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(supabaseToken);

        if (supabaseUser && !error && supabaseUser.email) {
          // Find or create user in local database with timeout protection
          try {
            user = await Promise.race([
              prisma.users.findUnique({
                where: { email: supabaseUser.email }
              }),
              new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Query timeout')), 3000)
              )
            ]);

            // Create user if not found (async, don't block request)
            if (!user) {
              prisma.users.create({
                data: {
                  id: supabaseUser.id,
                  email: supabaseUser.email,
                  name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
                  role: 'user',
                  loginMethod: 'google',
                  lastSignedIn: new Date(),
                }
              }).catch(err => console.error('[Auth] Error creating user:', err));
            } else {
              // Update last signed in (async, don't block request)
              prisma.users.update({
                where: { id: user.id },
                data: { lastSignedIn: new Date() }
              }).catch(err => console.error('[Auth] Error updating user:', err));
            }
          } catch (dbError) {
            console.error('[Auth] Database query timeout or error:', dbError);
          }
        }
      }
    } catch (error) {
      console.error('[Auth] Error getting Supabase user:', error);
    }
  }

  // DEVELOPMENT ONLY: Create demo user if no auth found
  // This ONLY runs in development mode (NODE_ENV !== 'production')
  if (!user && process.env.NODE_ENV === 'development') {
    const demoEmail = 'demo@organiza-te360.com';

    try {
      // Try to find existing demo user with timeout
      user = await Promise.race([
        prisma.users.findFirst({
          where: {
            OR: [
              { email: demoEmail },
              { email: 'demo@organiza-te360.local' }
            ]
          }
        }),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), 2000)
        )
      ]);

      // If not found, create it (async, don't block)
      if (!user) {
        prisma.users.create({
          data: {
            email: demoEmail,
            name: 'Demo User',
            role: 'user',
            loginMethod: 'email',
          }
        }).then(createdUser => {
          console.log('[Auth] Demo user created:', createdUser.email);
        }).catch(err => {
          console.error('[Auth] Error creating demo user:', err.message);
        });

        // Return a temporary user object for this request
        user = {
          id: 'demo-temp-' + Date.now(),
          email: demoEmail,
          name: 'Demo User',
          role: 'user',
          loginMethod: 'email',
          password: null,
          createdAt: new Date(),
          lastSignedIn: new Date(),
        } as users;
      }
    } catch (error) {
      console.error('[Auth] Error with demo user:', error);
      // Return a temporary user even if DB fails
      user = {
        id: 'demo-temp-' + Date.now(),
        email: demoEmail,
        name: 'Demo User',
        role: 'user',
        loginMethod: 'email',
        password: null,
        createdAt: new Date(),
        lastSignedIn: new Date(),
      } as users;
    }
  }


  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
