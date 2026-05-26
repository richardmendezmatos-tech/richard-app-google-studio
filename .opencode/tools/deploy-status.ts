import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Check latest Vercel production deployment status",
  args: {},
  async execute() {
    const result = await Bun.$`npx vercel list --prod 2>&1`.text()
    return result.trim()
  },
})
