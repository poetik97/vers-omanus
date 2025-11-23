import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { users } from "@prisma/client";
import { COOKIE_NAME } from "@shared/const";
import { getUserFromToken } from "../auth";
import { createClient } from '@supabase/supabase-js';
import { prisma } from "../db";

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

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

        if (supabaseUser && !error) {
          // Find or create user in local database
          user = await prisma.users.findUnique({
            where: { email: supabaseUser.email! }
          });

          if (!user) {
            // Create user from Supabase data
            user = await prisma.users.create({
              data: {
                id: supabaseUser.id,
                email: supabaseUser.email!,
                name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
                role: 'user',
                loginMethod: 'google',
                lastSignedIn: new Date(),
              }
            });
          } else {
            // Update last signed in
            await prisma.users.update({
              where: { id: user.id },
              data: { lastSignedIn: new Date() }
            });
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
    const demoEmail = 'demo@organiza-te360.local';

    try {
      // Try to find existing demo user
      user = await prisma.users.findFirst({
        where: {
          OR: [
            { email: demoEmail },
            { id: 'demo-user-dev' }
          ]
        }
      });

      // If not found, create it
      if (!user) {
        user = await prisma.users.create({
          data: {
            email: demoEmail,
            name: 'Demo User (Dev)',
            role: 'user',
            loginMethod: 'email',
          }
        });
      }
    } catch (error) {
      console.error('[Auth] Error creating demo user:', error);
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
