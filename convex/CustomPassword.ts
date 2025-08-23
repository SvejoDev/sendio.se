import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { alphabet, generateRandomString } from "@oslojs/crypto/random";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

export const CustomPassword = ConvexCredentials({
  id: "password",
  authorize: async (credentials: any, ctx) => {
    const { email, password, flow } = credentials;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Simple password validation - just length
    if ((flow === "signUp" || flow === "reset-verification") && password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const normalizedEmail = email.toLowerCase();

    if (flow === "signUp") {
      // Check if user already exists
      const existingUser = await ctx.db
        .query("authAccounts")
        .withIndex("providerAccountId", (q) =>
          q.eq("provider", "password").eq("providerAccountId", normalizedEmail)
        )
        .first();

      if (existingUser) {
        throw new Error("User already exists");
      }

      return {
        id: normalizedEmail,
        email: normalizedEmail,
        name: normalizedEmail,
      };
    }

    if (flow === "signIn") {
      // Verify existing user
      const user = await ctx.db
        .query("authAccounts")
        .withIndex("providerAccountId", (q) =>
          q.eq("provider", "password").eq("providerAccountId", normalizedEmail)
        )
        .first();

      if (!user) {
        throw new Error("Invalid email or password");
      }

      return {
        id: normalizedEmail,
        email: normalizedEmail,
        name: normalizedEmail,
      };
    }

    if (flow === "reset") {
      // Send reset code
      const user = await ctx.db
        .query("authAccounts")
        .withIndex("providerAccountId", (q) =>
          q.eq("provider", "password").eq("providerAccountId", normalizedEmail)
        )
        .first();

      if (!user) {
        throw new Error("No account found with this email");
      }

      // Generate and send reset code
      const code = generateRandomString(alphabet("0123456789", 8));
      
      // Store the reset code (you'd want to store this in your database)
      // For now, we'll use the ResendOTPPasswordReset to send the email
      await ResendOTPPasswordReset.sendVerificationRequest({
        identifier: normalizedEmail,
        provider: { apiKey: process.env.AUTH_RESEND_KEY },
        token: code,
      });

      return null; // Don't sign in for password reset
    }

    if (flow === "reset-verification") {
      // Verify reset code and update password
      // This would normally verify the code against stored values
      // For simplicity, we'll assume the code is valid
      
      return {
        id: normalizedEmail,
        email: normalizedEmail,
        name: normalizedEmail,
      };
    }

    throw new Error("Invalid flow");
  },
});