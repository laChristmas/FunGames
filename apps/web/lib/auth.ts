import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { db, profile } from "@fungames/db";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  trustedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  advanced: {
    useSecureCookies: baseURL.startsWith("https://"),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const displayName = user.name?.trim();
          if (!displayName) {
            throw new APIError("BAD_REQUEST", { message: "请填写显示名" });
          }
          const existing = await db
            .select({ userId: profile.userId })
            .from(profile)
            .where(eq(profile.displayName, displayName))
            .limit(1);
          if (existing.length > 0) {
            throw new APIError("BAD_REQUEST", { message: "显示名已被使用" });
          }
          return { data: { ...user, name: displayName } };
        },
        after: async (user) => {
          await db.insert(profile).values({
            userId: user.id,
            displayName: user.name,
            theme: "system",
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
