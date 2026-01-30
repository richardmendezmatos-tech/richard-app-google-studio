import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * MCP GitHub Connection Verifier
 * 
 * Usage:
 * 1. Set GITHUB_PERSONAL_ACCESS_TOKEN in your environment.
 * 2. Run: npx ts-node mcp-verify-github.ts
 */

async function verifyGithubMCP() {
    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

    if (!token) {
        console.error("❌ Error: GITHUB_PERSONAL_ACCESS_TOKEN not found in environment.");
        process.exit(1);
    }

    console.log("🚀 Initializing MCP GitHub Server connection...");

    const transport = new StdioClientTransport({
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
            ...process.env,
            GITHUB_PERSONAL_ACCESS_TOKEN: token
        }
    });

    const client = new Client(
        { name: "richard-auto-verifier", version: "1.0.0" },
        { capabilities: {} }
    );

    try {
        await client.connect(transport);
        console.log("✅ Connected to MCP Server.");

        // List available tools to confirm server is responding
        const tools = await client.listTools();
        console.log(`🛠️ Detected ${tools.tools.length} GitHub tools.`);

        // Demonstrate a simple repository search as verification
        console.log("🔍 Checking repository visibility...");
        const result = await client.callTool({
            name: "search_repositories",
            arguments: {
                query: "richard-app-google-studio"
            }
        });

        console.log("📦 Repository Search Result:", JSON.stringify(result, null, 2));

        console.log("\n✨ MCP Integration Verified Successfully!");
    } catch (error) {
        console.error("❌ Connection failed:", error);
    } finally {
        await client.close();
    }
}

verifyGithubMCP();
