import { baseURL } from "@/baseUrl";
import { z } from "zod";
import { ContentWidget, ToolRegistration } from "../types";
import { getAppsSdkCompatibleHtml, widgetMeta } from "../utils";

export const registerRandomNumberTool: ToolRegistration = async (server) => {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/random-number");

  const widget: ContentWidget = {
    id: "random_number",
    title: "Random Number",
    templateUri: "ui://widget/random-number-template.html",
    invoking: "Generating random number...",
    invoked: "Random number generated",
    html: html,
    description: "Generates a random number",
    widgetDomain: "https://random.org",
  };

  server.registerResource(
    "random-number-widget",
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
    async (uri: URL) => ({
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
    }),
  );

  server.registerTool(
    widget.id,
    {
      title: widget.title,
      description: "Generate a random number between min and max values",
      inputSchema: {
        min: z.number().describe("The minimum value (inclusive)"),
        max: z.number().describe("The maximum value (inclusive)"),
      },
      _meta: widgetMeta(widget),
    },
    async ({ min, max }: { min: number; max: number }) => {
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

      return {
        content: [
          {
            type: "text",
            text: `Random number: ${randomNumber}`,
          },
        ],
        structuredContent: {
          min,
          max,
          result: randomNumber,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(widget),
      };
    },
  );
};
