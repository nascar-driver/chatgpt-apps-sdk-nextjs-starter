import { createMcpHandler } from "mcp-handler";
import { allTools } from "./tools";
import { verifySupabaseToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const mcpHandler = createMcpHandler(async (server) => {
  for (const registerTool of allTools) {
    await registerTool(server);
  }
});

async function handler(request: Request) {
  // Verify token if present (optional auth)
  const authInfo = await verifySupabaseToken(request);

  if (authInfo) {
    // Attach auth info to request for tools to access
    (request as Request & { auth?: typeof authInfo }).auth = authInfo;
  }

  return mcpHandler(request);
}

export const GET = handler;
export const POST = handler;
