import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Check for circular dependencies using madge",
  args: {
    fix: tool.schema.boolean().optional().describe("Attempt to auto-fix circular deps"),
  },
  async execute(args) {
    const result = await Bun.$`npm run circular 2>&1`.text()
    if (args.fix) {
      return `${result.trim()}\n\nNote: --fix not implemented. Review the output and resolve manually.`
    }
    return result.trim()
  },
})
