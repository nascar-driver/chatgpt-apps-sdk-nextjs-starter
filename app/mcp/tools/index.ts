import { ToolRegistration } from "../types";
import { registerShowContentTool } from "./show-content";
import { registerRandomNumberTool } from "./random-number";

export const allTools: ToolRegistration[] = [
  registerShowContentTool,
  registerRandomNumberTool,
];
