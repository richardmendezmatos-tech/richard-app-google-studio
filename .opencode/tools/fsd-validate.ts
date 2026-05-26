import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Validate FSD layer boundaries by scanning imports",
  args: {
    directory: tool.schema.string().optional().describe("Directory to scan (default: src)"),
  },
  async execute(args, context) {
    const baseDir = path.join(context.directory, args.directory || "src")
    const violations: string[] = []

    function walkDir(dir: string, relativePath: string) {
      let entries
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true })
      } catch {
        return
      }
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name
        if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
          walkDir(fullPath, relPath)
        } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, "utf-8")
          const layer = detectLayer(relPath)
          if (!layer) continue
          const importMatches = content.matchAll(/from\s+['"]@\/([^'"]+)['"]/g)
          for (const match of importMatches) {
            const targetPath = match[1]
            const targetLayer = detectLayer(targetPath)
            if (targetLayer && !isValidImport(layer, targetLayer)) {
              violations.push(
                `${relPath} imports from ${targetLayer} (${match[0]}) — violation: ${layer} → ${targetLayer}`,
              )
            }
          }
        }
      }
    }

    walkDir(baseDir, "")
    return violations.length > 0
      ? `FSD violations found (${violations.length}):\n${violations.join("\n")}`
      : "No FSD layer violations detected."
  },
})

const FSD_LAYERS = ["app", "views", "widgets", "features", "entities", "shared"]

function detectLayer(filePath: string): string | null {
  const firstSegment = filePath.split("/")[0]
  return FSD_LAYERS.includes(firstSegment) ? firstSegment : null
}

function isValidImport(fromLayer: string, toLayer: string): boolean {
  const fromIndex = FSD_LAYERS.indexOf(fromLayer)
  const toIndex = FSD_LAYERS.indexOf(toLayer)
  return toIndex >= fromIndex
}
