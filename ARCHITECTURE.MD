# Project Architecture

## Problem Solved

Previously, all tools and widgets were defined in a single `route.ts` file, which would become unmaintainable with many tools (100+ lines per tool).

## Solution

Modular architecture where each tool is in its own file.

## Structure

```
app/mcp/
├── route.ts              # 12 lines - just orchestrates
├── types.ts              # Shared types
├── utils.ts              # Helper functions  
├── README.md             # Full documentation
└── tools/                # One file per tool
    ├── index.ts          # Exports all tools
    ├── show-content.ts   # Homepage widget
    └── random-number.ts     # Random number widget
```

## Adding a New Tool

### 1. Create widget page (optional)
```
app/my-widget/page.tsx
```

### 2. Create tool file
```
app/mcp/tools/my-tool.ts
```

### 3. Register in one line
```typescript
// app/mcp/tools/index.ts
export const allTools: ToolRegistration[] = [
  registerShowContentTool,
  registerRandomNumberTool  ,
  registerMyTool,  // ← Add here
];
```

## Benefits

- **Scalable**: Add unlimited tools without route.ts bloat
- **Clean**: Main route stays at 12 lines
- **Type-safe**: Shared types ensure consistency
- **Maintainable**: Each tool isolated in its own file

## See Also

- `app/mcp/README.md` - Complete implementation guide with examples
- `app/mcp/tools/random-number.ts` - Example tool implementation
