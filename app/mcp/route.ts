import { createMcpHandler } from "mcp-handler";
import { allTools } from "./tools";

const handler = createMcpHandler(async (server) => {
  for (const registerTool of allTools) {
    await registerTool(server);
  }
});

export const GET = handler;
export const POST = handler;
