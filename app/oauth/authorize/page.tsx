"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@supabase/supabase-js";

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const responseType = searchParams.get("response_type");
  const scope = searchParams.get("scope");
  const state = searchParams.get("state");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  const handleAuthorize = async (action: "approve" | "deny") => {
    if (action === "deny") {
      const denyUrl = new URL(redirectUri || "");
      denyUrl.searchParams.set("error", "access_denied");
      denyUrl.searchParams.set("error_description", "User denied access");
      if (state) denyUrl.searchParams.set("state", state);
      window.location.href = denyUrl.toString();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration missing");
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const authUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
      authUrl.searchParams.set("client_id", clientId || "");
      authUrl.searchParams.set("redirect_uri", redirectUri || "");
      authUrl.searchParams.set("response_type", responseType || "code");
      authUrl.searchParams.set("scope", scope || "openid email profile");
      if (state) authUrl.searchParams.set("state", state);
      if (codeChallenge) authUrl.searchParams.set("code_challenge", codeChallenge);
      if (codeChallengeMethod) authUrl.searchParams.set("code_challenge_method", codeChallengeMethod);

      window.location.href = authUrl.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authorization failed");
      setIsLoading(false);
    }
  };

  if (!clientId || !redirectUri) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-4xl font-black tracking-tight text-red-600">
            Invalid Request
          </h1>
          <p className="font-mono text-sm/6 text-center sm:text-left tracking-[-.01em] max-w-xl">
            Missing required OAuth parameters (client_id or redirect_uri).
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-md">
        <h1 className="text-4xl font-black tracking-tight">
          Authorization Request
        </h1>

        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 w-full">
          <p className="font-mono text-sm/6 tracking-[-.01em] mb-4">
            An application is requesting access to your account:
          </p>

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold">Client ID:</span>
              <span className="ml-2 font-mono text-xs break-all">{clientId}</span>
            </div>

            {scope && (
              <div>
                <span className="font-semibold">Requested Scopes:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {scope.split(" ").map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
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
            onClick={() => handleAuthorize("deny")}
            disabled={isLoading}
            className="flex-1 rounded-full border border-solid border-slate-300 dark:border-slate-600 transition-colors flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer disabled:opacity-50"
          >
            Deny
          </button>
          <button
            onClick={() => handleAuthorize("approve")}
            disabled={isLoading}
            className="flex-1 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Authorizing..." : "Authorize"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function AuthorizePage() {
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
      <AuthorizeContent />
    </Suspense>
  );
}
