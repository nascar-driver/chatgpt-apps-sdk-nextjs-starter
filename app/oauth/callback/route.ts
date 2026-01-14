import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If there's an error from Supabase, redirect back to ChatGPT with error
  if (error) {
    const redirectUri = process.env.CHATGPT_OAUTH_REDIRECT_URI ||
      "https://chatgpt.com/connector_platform_oauth_redirect";
    const errorUrl = new URL(redirectUri);
    errorUrl.searchParams.set("error", error);
    if (errorDescription) {
      errorUrl.searchParams.set("error_description", errorDescription);
    }
    if (state) {
      errorUrl.searchParams.set("state", state);
    }
    return NextResponse.redirect(errorUrl.toString());
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  // Redirect to ChatGPT with the authorization code
  const redirectUri = process.env.CHATGPT_OAUTH_REDIRECT_URI ||
    "https://chatgpt.com/connector_platform_oauth_redirect";

  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", code);
  if (state) {
    callbackUrl.searchParams.set("state", state);
  }

  return NextResponse.redirect(callbackUrl.toString());
}
