# MCP Tools - Modular Architecture

This directory contains the modular MCP (Model Context Protocol) tools implementation for the ChatGPT Apps SDK.

## Architecture Overview

The architecture follows a modular pattern where each tool is defined in its own file, making the codebase scalable and maintainable.

### Directory Structure

```
app/mcp/
├── route.ts              # 11 lines - orchestrates tool registration
├── types.ts              # Shared TypeScript types
├── utils.ts              # Helper functions
├── README.md             # This file
└── tools/                # One file per tool
    ├── index.ts          # Exports all tools
    ├── show-content.ts   # Homepage widget tool
    └── calculator.ts     # Calculator widget tool
```

## Core Files

### `route.ts`

The main route handler stays minimal at just 11 lines:

```typescript
import { createMcpHandler } from "mcp-handler";
import { allTools } from "./tools";

const handler = createMcpHandler(async (server) => {
  for (const registerTool of allTools) {
    await registerTool(server);
  }
});

export const GET = handler;
export const POST = handler;
```

### `types.ts`

Defines shared types used across all tools:

- `ContentWidget`: Widget configuration
- `WidgetMeta`: OpenAI widget metadata
- `ToolRegistration`: Function signature for tool registration

### `utils.ts`

Contains helper functions:

- `getAppsSdkCompatibleHtml()`: Fetches HTML for widgets
- `widgetMeta()`: Generates widget metadata

### `tools/index.ts`

Central registry that exports all tool registration functions:

```typescript
export const allTools: ToolRegistration[] = [
  registerShowContentTool,
  registerCalculatorTool,
  // Add new tools here
];
```

## Adding a New Tool

Follow these steps to add a new tool to the system:

### 1. Create Widget Page (Optional)

If your tool needs a UI widget, create a page component:

```bash
mkdir app/my-widget
```

Create `app/my-widget/page.tsx`:

```typescript
"use client";

import { useWidgetProps, useMaxHeight, useDisplayMode } from "../hooks";

export default function MyWidgetPage() {
  const toolOutput = useWidgetProps<{ data?: any }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();

  return (
    <div style={{ maxHeight }}>
      {/* Your widget UI */}
    </div>
  );
}
```

### 2. Create Tool File

Create `app/mcp/tools/my-tool.ts`:

```typescript
import { baseURL } from "@/baseUrl";
import { z } from "zod";
import { ContentWidget, ToolRegistration } from "../types";
import { getAppsSdkCompatibleHtml, widgetMeta } from "../utils";

export const registerMyTool: ToolRegistration = async (server) => {
  // Fetch HTML if you have a widget page
  const html = await getAppsSdkCompatibleHtml(baseURL, "/my-widget");

  const widget: ContentWidget = {
    id: "my_tool",
    title: "My Tool",
    templateUri: "ui://widget/my-tool-template.html",
    invoking: "Processing...",
    invoked: "Processing complete",
    html: html,
    description: "Description of what my tool does",
    widgetDomain: "https://example.com",
  };

  // Register the widget resource
  server.registerResource(
    "my-tool-widget",
    widget.templateUri,
    {
      title: widget.title,
      description: widget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": widget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${widget.html}</html>`,
          _meta: {
            "openai/widgetDescription": widget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": widget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register the tool
  server.registerTool(
    widget.id,
    {
      title: widget.title,
      description: "Detailed description for ChatGPT",
      inputSchema: {
        param1: z.string().describe("Description of param1"),
        param2: z.number().describe("Description of param2"),
      },
      _meta: widgetMeta(widget),
    },
    async ({ param1, param2 }) => {
      // Your tool logic here
      const result = doSomething(param1, param2);

      return {
        content: [
          {
            type: "text",
            text: `Result: ${result}`,
          },
        ],
        structuredContent: {
          param1,
          param2,
          result,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(widget),
      };
    }
  );
};
```

### 3. Register Your Tool

Add your tool to `app/mcp/tools/index.ts`:

```typescript
import { ToolRegistration } from "../types";
import { registerShowContentTool } from "./show-content";
import { registerCalculatorTool } from "./calculator";
import { registerMyTool } from "./my-tool";  // Import your tool

export const allTools: ToolRegistration[] = [
  registerShowContentTool,
  registerCalculatorTool,
  registerMyTool,  // Add here
];
```

That's it! Your tool is now registered and will be available in ChatGPT.

## Tool Without Widget

If your tool doesn't need a widget UI, you can skip the resource registration:

```typescript
export const registerSimpleTool: ToolRegistration = async (server) => {
  server.registerTool(
    "simple_tool",
    {
      title: "Simple Tool",
      description: "A tool without a widget",
      inputSchema: {
        input: z.string().describe("Input parameter"),
      },
    },
    async ({ input }) => {
      return {
        content: [
          {
            type: "text",
            text: `Processed: ${input}`,
          },
        ],
      };
    }
  );
};
```

## Benefits of This Architecture

1. **Scalable**: Add unlimited tools without bloating `route.ts`
2. **Maintainable**: Each tool is isolated in its own file
3. **Type-safe**: Shared types ensure consistency
4. **Clean**: Main route stays at ~11 lines
5. **Discoverable**: All tools listed in one place (`tools/index.ts`)

## Example Tools

### Show Content Tool

Located in `tools/show-content.ts`, this tool:
- Fetches the homepage HTML
- Displays it as a widget
- Accepts a user's name as input

### Calculator Tool

Located in `tools/calculator.ts`, this tool:
- Performs basic math operations
- Displays results in a custom widget
- Demonstrates structured data passing

## Best Practices

1. **One tool per file**: Keep tool files focused and independent
2. **Use shared types**: Import from `types.ts` for consistency
3. **Use helper functions**: Import from `utils.ts` to avoid duplication
4. **Descriptive names**: Use clear, descriptive names for tools and files
5. **Document inputs**: Use Zod's `.describe()` for all input parameters
6. **Structured content**: Return structured data for better widget integration

## Testing Your Tools

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the MCP endpoint at `/mcp`

3. Test your widget pages directly:
   - Homepage: `http://localhost:3000`
   - Calculator: `http://localhost:3000/calculator`
   - Your widget: `http://localhost:3000/my-widget`

## Troubleshooting

### Tool not appearing in ChatGPT

- Verify your tool is exported in `tools/index.ts`
- Check the browser console for errors
- Ensure the MCP endpoint is accessible at `/mcp`

### Widget not rendering

- Verify the widget page exists and is accessible
- Check that `getAppsSdkCompatibleHtml()` is fetching the correct path
- Ensure the HTML is valid

### Type errors

- Make sure you're importing types from `../types`
- Check that your input schema matches the handler parameters
- Verify widget metadata structure

## Further Reading

- [ChatGPT Apps SDK Documentation](https://developers.openai.com/apps-sdk)
- [MCP Handler Documentation](https://www.npmjs.com/package/mcp-handler)
- [Zod Documentation](https://zod.dev)
