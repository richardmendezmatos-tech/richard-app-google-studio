import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Execute SQL query against Supabase — uses direct pooler connection (IPv4) with Management API fallback",
  args: {
    query: tool.schema.string().describe("SQL query to execute"),
    api: tool.schema.boolean().optional().describe("Force Management API instead of direct pooler"),
  },
  async execute(args) {
    // Direct pooler connection (via psql)
    if (!args.api && process.env.SUPABASE_DB_PASSWORD) {
      try {
        const result = await Bun.$`PGPASSWORD=${process.env.SUPABASE_DB_PASSWORD} psql \
          -h aws-0-us-west-2.pooler.supabase.com \
          -p 6543 \
          -U postgres.dizzjfijsmxdlnfqydfk \
          -d postgres \
          -c ${args.query} \
          -t -A 2>&1`.text()
        return result.trim()
      } catch (err: any) {
        return `Pooler error: ${err.stderr || err.message}`
      }
    }

    // Fallback: Management API
    const pat = process.env.SUPABASE_PAT
    if (!pat) {
      return "Error: No SUPABASE_DB_PASSWORD (pooler) or SUPABASE_PAT (API) available"
    }
    const res = await fetch(
      "https://api.supabase.com/v1/projects/dizzjfijsmxdlnfqydfk/sql",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: args.query }),
      },
    )
    if (!res.ok) {
      return `Supabase API error (${res.status}): ${await res.text()}`
    }
    const data = await res.json()
    return JSON.stringify(data, null, 2)
  },
})
