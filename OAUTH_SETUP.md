# OAuth 2.1 Setup Guide with Supabase

This guide walks you through setting up OAuth 2.1 authentication for your ChatGPT App using Supabase as the authorization server.

## Prerequisites

- A Supabase project (create one at [supabase.com](https://supabase.com))
- Your app deployed to a public URL (e.g., Vercel)

## 1. Configure Supabase OAuth Server

### Enable OAuth 2.1 Server

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** > **OAuth Server**
4. Enable the OAuth 2.1 server

### Configure Redirect URIs

Add the following redirect URIs to your Supabase OAuth settings:

```
https://chatgpt.com/connector_platform_oauth_redirect
https://platform.openai.com/apps-manage/oauth
```

The first is for production ChatGPT, the second is for app review.

### Enable Dynamic Client Registration (Optional)

If you want ChatGPT to automatically register as an OAuth client:

1. Go to **Authentication** > **OAuth Server**
2. Enable **Dynamic Client Registration**

## 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Your deployed app URL (e.g., `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `CHATGPT_OAUTH_REDIRECT_URI` | ChatGPT's OAuth redirect URI |

Find your Supabase credentials at: **Project Settings** > **API**

## 3. Deploy Your App

Deploy your app to a public URL. If using Vercel:

```bash
vercel --prod
```

Make sure to add the environment variables in your Vercel project settings.

## 4. Register Your App with ChatGPT

1. Go to [ChatGPT App Platform](https://platform.openai.com/apps)
2. Create a new app or edit an existing one
3. Enable OAuth authentication
4. Configure the OAuth settings:

| Setting | Value |
|---------|-------|
| Authorization URL | `https://your-project-ref.supabase.co/auth/v1/authorize` |
| Token URL | `https://your-project-ref.supabase.co/auth/v1/token` |
| Scopes | `openid email profile` |

## OAuth Flow Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ChatGPT   │     │  Your App   │     │  Supabase   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1. Discover metadata                  │
       │──────────────────>│                   │
       │                   │                   │
       │ 2. Get OAuth config                   │
       │───────────────────────────────────────>
       │                   │                   │
       │ 3. Redirect user to login             │
       │───────────────────────────────────────>
       │                   │                   │
       │                   │  4. User logs in  │
       │                   │<──────────────────│
       │                   │                   │
       │ 5. Callback with code                 │
       │<──────────────────│                   │
       │                   │                   │
       │ 6. Exchange code for token            │
       │───────────────────────────────────────>
       │                   │                   │
       │ 7. Access token received              │
       │<──────────────────────────────────────│
       │                   │                   │
       │ 8. API calls with Bearer token        │
       │──────────────────>│                   │
       │                   │                   │
```

### Configure Consent Page URL

In Supabase OAuth Server settings, set the **Consent URL** to:

```
https://your-app-url.com/oauth/consent
```

This is where users will be redirected to approve/deny access.

## Endpoints

Your app exposes the following OAuth-related endpoints:

| Endpoint | Purpose |
|----------|---------|
| `/.well-known/oauth-protected-resource` | Protected resource metadata |
| `/oauth/authorize` | Authorization page (legacy) |
| `/oauth/consent` | Supabase consent page handler |
| `/oauth/callback` | OAuth callback handler |
| `/mcp` | MCP server (protected) |

## Token Verification

The app automatically verifies Supabase JWT tokens on every request to `/mcp`. Tokens are validated against:

- Supabase JWKS endpoint
- Token issuer
- Token expiration
- OAuth client_id presence

## Accessing User Info in Tools

To access the authenticated user in your tools, use the request auth context:

```typescript
import { getAuthenticatedUser } from "@/lib/auth";

// In your tool handler
async ({ input }, { request }) => {
  const user = getAuthenticatedUser(request);
  
  if (user) {
    // User is authenticated
    console.log(user.email);
    console.log(user.userId);
  }
  
  // ... tool logic
}
```

## Troubleshooting

### "Token verification failed"

- Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check that the token hasn't expired
- Verify the Supabase JWKS endpoint is accessible

### "Missing authorization code"

- Ensure redirect URIs are whitelisted in Supabase
- Check that the OAuth flow completed successfully

### ChatGPT shows authentication error

- Verify your app's OAuth endpoints are publicly accessible
- Check that `/.well-known/oauth-protected-resource` returns valid JSON
- Ensure Supabase OAuth server is enabled

## Security Notes

- Always validate tokens server-side
- Use HTTPS in production
- Keep your Supabase keys secure
- Review OAuth scopes for least privilege
