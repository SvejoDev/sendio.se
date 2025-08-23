"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const params = useSearchParams();
  const [flow, setFlow] = useState<
    "signIn" | "signUp" | "forgot-password" | "reset-password"
  >("signIn");
  useEffect(() => {
    const q = params?.get("flow");
    if (
      q === "signUp" ||
      q === "signIn" ||
      q === "forgot-password" ||
      q === "reset-password"
    ) {
      setFlow(q);
    }
  }, [params]);
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
      <p>Logga in för att fortsätta</p>
      <form
        className="flex flex-col gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setValidationErrors({});
          setIsSubmitting(true);

          const formData = new FormData(e.target as HTMLFormElement);
          const email = (formData.get("email") as string) ?? "";
          const password = (formData.get("password") as string) ?? "";
          const code = (formData.get("code") as string) ?? "";

          const errors: { email?: string; password?: string; code?: string } =
            {};

          if (!validateEmail(email)) {
            errors.email = "Ange en giltig e‑postadress";
          }

          if (
            (flow === "signUp" || flow === "reset-password") &&
            !validatePassword(password)
          ) {
            errors.password = "Lösenord måste vara minst 8 tecken";
          }

          if (flow === "reset-password" && !code) {
            errors.code = "Ange verifieringskoden";
          }

          if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setIsSubmitting(false);
            return;
          }

          // Map our internal flow to the Password provider's expected flows
          const providerFlow =
            flow === "forgot-password"
              ? "reset"
              : flow === "reset-password"
                ? "reset-verification"
                : flow;

          const params: Record<string, string> = { email, flow: providerFlow };
          if (flow !== "forgot-password") {
            params.password = password;
          }
          if (flow === "reset-password") {
            params.newPassword = password;
            if (code) params.code = code;
          }

          try {
            await signIn("password", params);

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
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Authentication failed";
            console.error("Auth error:", err);
            setError(message);
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
            ? "Laddar..."
            : flow === "signIn"
              ? "Logga in"
              : flow === "signUp"
                ? "Skapa konto"
                : flow === "forgot-password"
                  ? "Skicka återställningskod"
                  : "Återställ lösenord"}
        </button>

        {flow === "signIn" && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <span>Har du inget konto?</span>
              <span
                className="text-foreground underline hover:no-underline cursor-pointer"
                onClick={() => {
                  setFlow("signUp");
                  setError(null);
                  setResetSuccess(null);
                }}
              >
                Skapa konto istället
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
              Glömt ditt lösenord?
            </span>
          </div>
        )}

        {flow === "signUp" && (
          <div className="flex flex-row gap-2">
            <span>Har du redan ett konto?</span>
            <span
              className="text-foreground underline hover:no-underline cursor-pointer"
              onClick={() => {
                setFlow("signIn");
                setError(null);
                setResetSuccess(null);
              }}
            >
              Logga in istället
            </span>
          </div>
        )}

        {(flow === "forgot-password" || flow === "reset-password") && (
          <div className="flex flex-row gap-2">
            <span>Kom du på ditt lösenord?</span>
            <span
              className="text-foreground underline hover:no-underline cursor-pointer"
              onClick={() => {
                setFlow("signIn");
                setError(null);
                setResetSuccess(null);
              }}
            >
              Tillbaka till inloggning
            </span>
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-foreground font-mono text-xs">
              Fel vid inloggning: {error}
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
