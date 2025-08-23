"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string) => {
  // Start with basic validation - just length for now
  return password.length >= 8;
};

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<
    "signIn" | "signUp" | "forgot-password" | "reset-password"
  >("signIn");
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    code?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto h-screen justify-center items-center">
      <p>Log in to see the numbers</p>
      <form
        className="flex flex-col gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setValidationErrors({});
          setIsSubmitting(true);

          const formData = new FormData(e.target as HTMLFormElement);
          const email = formData.get("email") as string;
          const password = formData.get("password") as string;
          const code = formData.get("code") as string;

          const errors: { email?: string; password?: string; code?: string } =
            {};

          if (!validateEmail(email)) {
            errors.email = "Please enter a valid email address";
          }

          if (
            (flow === "signUp" || flow === "reset-password") &&
            !validatePassword(password)
          ) {
            errors.password = "Password must be at least 8 characters long";
          }

          if (flow === "reset-password" && !code) {
            errors.code = "Please enter the verification code";
          }

          if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setIsSubmitting(false);
            return;
          }

          // Map our internal flow to the Password provider's expected flows
          let providerFlow: string = flow;
          if (flow === "forgot-password") {
            providerFlow = "reset";
          } else if (flow === "reset-password") {
            providerFlow = "reset-verification";
          }

          formData.set("flow", providerFlow);
          if (flow === "reset-password") {
            // The Password provider expects `newPassword` for the reset verification flow
            formData.set("newPassword", password);
          }

          try {
            await signIn("password", formData);

            if (flow === "forgot-password") {
              setResetSuccess("Password reset code sent to your email!");
              setFlow("reset-password");
            } else if (flow === "reset-password") {
              setResetSuccess("Password reset successfully!");
              setFlow("signIn");
            } else {
              // Only redirect on successful sign-in or sign-up
              router.push("/");
            }
          } catch (error: any) {
            console.error("Auth error:", error);
            setError(error.message || "Authentication failed");
            setResetSuccess(null);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div className="flex flex-col gap-1">
          <input
            className={`bg-background text-foreground rounded-md p-2 border-2 ${
              validationErrors.email
                ? "border-red-500"
                : "border-slate-200 dark:border-slate-800"
            }`}
            type="email"
            name="email"
            placeholder="Email"
            required
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm">{validationErrors.email}</p>
          )}
        </div>
        {flow === "reset-password" && (
          <div className="flex flex-col gap-1">
            <input
              className={`bg-background text-foreground rounded-md p-2 border-2 ${
                validationErrors.code
                  ? "border-red-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
              type="text"
              name="code"
              placeholder="Verification code from email"
              required
            />
            {validationErrors.code && (
              <p className="text-red-500 text-sm">{validationErrors.code}</p>
            )}
          </div>
        )}
        {flow !== "forgot-password" && (
          <div className="flex flex-col gap-1">
            <input
              className={`bg-background text-foreground rounded-md p-2 border-2 ${
                validationErrors.password
                  ? "border-red-500"
                  : "border-slate-200 dark:border-slate-800"
              }`}
              type="password"
              name="password"
              placeholder={
                flow === "signUp" || flow === "reset-password"
                  ? "Password (min 8 characters)"
                  : "Password"
              }
              required
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm">
                {validationErrors.password}
              </p>
            )}
          </div>
        )}
        <button
          className="bg-foreground text-background rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Loading..."
            : flow === "signIn"
              ? "Sign in"
              : flow === "signUp"
                ? "Sign up"
                : flow === "forgot-password"
                  ? "Send reset code"
                  : "Reset password"}
        </button>

        {flow === "signIn" && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <span>Don't have an account?</span>
              <span
                className="text-foreground underline hover:no-underline cursor-pointer"
                onClick={() => {
                  setFlow("signUp");
                  setError(null);
                  setResetSuccess(null);
                }}
              >
                Sign up instead
              </span>
            </div>
            <span
              className="text-foreground underline hover:no-underline cursor-pointer text-sm"
              onClick={() => {
                setFlow("forgot-password");
                setError(null);
                setResetSuccess(null);
              }}
            >
              Forgot your password?
            </span>
          </div>
        )}

        {flow === "signUp" && (
          <div className="flex flex-row gap-2">
            <span>Already have an account?</span>
            <span
              className="text-foreground underline hover:no-underline cursor-pointer"
              onClick={() => {
                setFlow("signIn");
                setError(null);
                setResetSuccess(null);
              }}
            >
              Sign in instead
            </span>
          </div>
        )}

        {(flow === "forgot-password" || flow === "reset-password") && (
          <div className="flex flex-row gap-2">
            <span>Remember your password?</span>
            <span
              className="text-foreground underline hover:no-underline cursor-pointer"
              onClick={() => {
                setFlow("signIn");
                setError(null);
                setResetSuccess(null);
              }}
            >
              Back to sign in
            </span>
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-foreground font-mono text-xs">
              Error signing in: {error}
            </p>
          </div>
        )}
        {resetSuccess && (
          <div className="bg-green-500/20 border-2 border-green-500/50 rounded-md p-2">
            <p className="text-foreground font-mono text-xs">{resetSuccess}</p>
          </div>
        )}
      </form>
    </div>
  );
}
