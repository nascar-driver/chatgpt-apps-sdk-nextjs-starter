import { jwtVerify, createRemoteJWKSet } from "jose";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwksCache) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
    }
    const jwksUrl = new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
    jwksCache = createRemoteJWKSet(jwksUrl);
  }
  return jwksCache;
}

export interface SupabaseTokenPayload {
  sub: string;
  email?: string;
  role?: string;
  user_id?: string;
  client_id?: string;
  aal?: string;
  session_id?: string;
  iss: string;
  iat: number;
  exp: number;
}

export async function verifySupabaseToken(
  request: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  const token = bearerToken || extractBearerToken(request);

  if (!token) {
    return undefined;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
    }

    const jwks = getJWKS();
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${supabaseUrl}/auth/v1`,
    });

    const tokenPayload = payload as unknown as SupabaseTokenPayload;

    // Verify this is an OAuth token (has client_id)
    if (!tokenPayload.client_id) {
      console.warn("Token is not an OAuth token (missing client_id)");
      return undefined;
    }

    // Return AuthInfo with token details
    return {
      token,
      clientId: tokenPayload.client_id,
      scopes: ["openid", "email", "profile"],
      expiresAt: tokenPayload.exp,
      extra: {
        sub: tokenPayload.sub,
        email: tokenPayload.email,
        userId: tokenPayload.user_id || tokenPayload.sub,
        role: tokenPayload.role,
        sessionId: tokenPayload.session_id,
      },
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return undefined;
  }
}

function extractBearerToken(request: Request): string | undefined {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return undefined;
  }
  return authHeader.slice(7);
}

export function getAuthenticatedUser(request: Request): AuthInfo["extra"] | undefined {
  const auth = (request as Request & { auth?: AuthInfo }).auth;
  return auth?.extra;
}
