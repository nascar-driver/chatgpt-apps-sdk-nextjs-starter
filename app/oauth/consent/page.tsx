"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration missing");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

interface AuthorizationDetails {
  client?: {
    name?: string;
    client_id?: string;
  };
  scopes?: string[];
  redirect_uri?: string;
}

function ConsentContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authDetails, setAuthDetails] = useState<AuthorizationDetails | null>(
    null,
  );

  const authorizationId = searchParams.get("authorization_id");

  useEffect(() => {
    const initAuth = async () => {
      if (!authorizationId) {
        setIsFetching(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();

        // Check if user is logged in
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          // No session - redirect to Google login
          // After login, user will be redirected back to this page
          const currentUrl = window.location.href;

          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: currentUrl,
            },
          });
          return;
        }

        // User is logged in - fetch authorization details
        const { data, error } =
          await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

        if (error) {
          throw error;
        }

        // Show consent screen - don't auto-redirect even if consent was given before
        setAuthDetails({
          client: data?.client,
          scopes: data?.scopes || ["openid", "email", "profile"],
        });
      } catch (err) {
        console.error("Failed to initialize auth:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load authorization",
        );
      } finally {
        setIsFetching(false);
      }
    };

    initAuth();
  }, [authorizationId]);

  const handleConsent = async (action: "approve" | "deny") => {
    if (!authorizationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();

      let result;
      if (action === "approve") {
        result =
          await supabase.auth.oauth.approveAuthorization(authorizationId);
      } else {
        result = await supabase.auth.oauth.denyAuthorization(authorizationId);
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data?.redirect_uri) {
        window.location.href = result.data.redirect_uri;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Consent submission failed",
      );
      setIsLoading(false);
    }
  };

  if (!authorizationId) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-black tracking-tight text-red-600">
            Invalid Request
          </h1>
          <p className="font-mono text-sm/6 text-center sm:text-left tracking-[-.01em] max-w-xl">
            Missing authorization_id parameter.
          </p>
        </main>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center">
          <p className="font-mono text-sm">Loading...</p>
        </main>
      </div>
    );
  }

  if (error && !authDetails) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-black tracking-tight text-red-600">
            Error
          </h1>
          <p className="font-mono text-sm/6 text-center sm:text-left tracking-[-.01em] max-w-xl">
            {error}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-md">
        <h1 className="text-4xl font-black tracking-tight">Authorize Access</h1>

        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 w-full">
          <p className="font-mono text-sm/6 tracking-[-.01em] mb-4">
            <strong>{authDetails?.client?.name || "An application"}</strong> is
            requesting access to your account.
          </p>

          <div className="space-y-3 text-sm">
            {authDetails?.scopes && authDetails.scopes.length > 0 && (
              <div>
                <span className="font-semibold">
                  This will allow access to:
                </span>
                <ul className="mt-2 space-y-1">
                  {authDetails.scopes.map((scope) => (
                    <li key={scope} className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="font-mono text-xs">{scope}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-4 w-full">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4 w-full">
          <button
            onClick={() => handleConsent("deny")}
            disabled={isLoading}
            className="flex-1 rounded-full border border-solid border-slate-300 dark:border-slate-600 transition-colors flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer disabled:opacity-50"
          >
            Deny
          </button>
          <button
            onClick={() => handleConsent("approve")}
            disabled={isLoading}
            className="flex-1 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Authorize"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
          <main className="flex flex-col gap-[32px] row-start-2 items-center">
            <p className="font-mono text-sm">Loading...</p>
          </main>
        </div>
      }
    >
      <ConsentContent />
    </Suspense>
  );
}
