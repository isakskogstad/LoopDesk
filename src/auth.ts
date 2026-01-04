import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  checkLoginAttempt,
  recordFailedAttempt,
  recordSuccessfulLogin,
} from "@/lib/auth/rate-limit";

// Whitelist of allowed email addresses
const ALLOWED_EMAILS = [
  "andreas@loop.se",
  "johann@loop.se",
  "jenny@loop.se",
  "camilla@loop.se",
  "diana@loop.se",
  "sandra@loop.se",
  "christian@loop.se",
  "isak.skogstad@me.com",
];

// Map email to avatar image
const EMAIL_TO_AVATAR: Record<string, string> = {
  "andreas@loop.se": "/avatars/andreas-jennische.png",
  "johann@loop.se": "/avatars/johann-bernovall.png",
  "jenny@loop.se": "/avatars/jenny-kjellen.png",
  "camilla@loop.se": "/avatars/camilla-bergman.png",
  "diana@loop.se": "/avatars/diana-demin.png",
  "sandra@loop.se": "/avatars/sandra-norberg.png",
  "christian@loop.se": "/avatars/christian-von-essen.png",
  "isak.skogstad@me.com": "/avatars/isak-skogstad.png",
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("CredentialsSignin")) {
        console.warn("[auth][warn] CredentialsSignin");
        return;
      }
      console.error("[auth][error]", error);
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log(`[auth][timing] signIn event - user: ${user?.email}, provider: ${account?.provider}`);
    },
    async session({ session }) {
      console.log(`[auth][timing] session event - user: ${session?.user?.email}`);
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Lösenord", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase();
        const password = credentials.password as string;

        // Check rate limiting and account lockout
        const loginCheck = await checkLoginAttempt(email);
        if (!loginCheck.allowed) {
          console.warn(`[auth] Login blocked for ${email}: ${loginCheck.error}`);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          // Record failed attempt even for non-existent users (timing attack prevention)
          await recordFailedAttempt(email);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          await recordFailedAttempt(email);
          return null;
        }

        // Successful login - reset counters
        await recordSuccessfulLogin(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const start = Date.now();
      console.log(`[auth][timing] signIn callback START - provider: ${account?.provider}`);

      // Allow credentials login (admin) without email check
      if (account?.provider === "credentials") {
        console.log(`[auth][timing] signIn callback END (credentials) - ${Date.now() - start}ms`);
        return true;
      }

      // For OAuth providers, check whitelist
      if (user.email && ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
        // Set custom avatar based on email (no DB call needed)
        const customAvatar = EMAIL_TO_AVATAR[user.email.toLowerCase()];
        if (customAvatar) {
          user.image = customAvatar;
        }
        console.log(`[auth][timing] signIn callback END (oauth allowed) - ${Date.now() - start}ms`);
        return true;
      }

      // Reject if email not in whitelist
      console.log(`[auth][timing] signIn callback END (rejected) - ${Date.now() - start}ms`);
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "user";
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});
