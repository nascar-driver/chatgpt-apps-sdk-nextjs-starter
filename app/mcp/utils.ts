import { ContentWidget, WidgetMeta } from "./types";

export const getAppsSdkCompatibleHtml = async (
  baseUrl: string,
  path: string
) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

export function widgetMeta(widget: ContentWidget): WidgetMeta {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}
