import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ 
    reset: ResendOTPPasswordReset,
    profile(params) {
      return {
        email: params.email as string,
        name: params.email as string,
      };
    },
  })],
  session: {
    totalDurationMs: 1000 * 60 * 60 * 24 * 30, // 30 days
  },
});