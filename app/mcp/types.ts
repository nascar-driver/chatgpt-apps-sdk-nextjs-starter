import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

export type WidgetMeta = {
  "openai/outputTemplate": string;
  "openai/toolInvocation/invoking": string;
  "openai/toolInvocation/invoked": string;
  "openai/widgetAccessible": boolean;
  "openai/resultCanProduceWidget": boolean;
};

export type ToolRegistration = (server: McpServer) => Promise<void>;
