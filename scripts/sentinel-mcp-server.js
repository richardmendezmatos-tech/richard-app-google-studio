#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { BigQuery } from '@google-cloud/bigquery';
import { initialInventoryData } from '../src/entities/inventory/model/initialInventory.ts';

/**
 * Sentinel Business Intelligence MCP Server
 * Conecta el Agente con la infraestructura real de Richard Automotive.
 */

const server = new Server(
  {
    name: "sentinel-bi-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// --- BigQuery Setup ---
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'richard-automotive';
const bigquery = new BigQuery({ projectId: PROJECT_ID });

// --- Helper: format bytes ---
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

// --- Tools Definition ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "check_query_cost",
        description: "Realiza un dry-run de una query de BigQuery para estimar bytes procesados y costo en USD.",
        inputSchema: {
          type: "object",
          properties: {
            sql: { type: "string", description: "La consulta SQL a validar" },
          },
          required: ["sql"],
        },
      },
      {
        name: "get_inventory_summary",
        description: "Obtiene un resumen estadístico del inventario actual (conteo por marca, precio promedio, etc.)",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_vehicle_by_vin",
        description: "Busca los detalles técnicos de una unidad específica en el inventario por su VIN.",
        inputSchema: {
          type: "object",
          properties: {
            vin: { type: "string", description: "El VIN del vehículo" },
          },
          required: ["vin"],
        },
      }
    ],
  };
});

// --- Tools Implementation ---
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "check_query_cost": {
        const sql = args.sql;
        const [job] = await bigquery.createQueryJob({
          query: sql,
          dryRun: true,
          location: 'US',
        });

        const bytesProcessed = parseInt(job.metadata.statistics.totalBytesProcessed, 10);
        const cost = (bytesProcessed / 1_099_511_627_776 * 5.0).toFixed(6);

        return {
          content: [{
            type: "text",
            text: `📊 BigQuery Analysis:\n- Bytes: ${formatBytes(bytesProcessed)}\n- Costo Est: $${cost} USD\n- Status: ${bytesProcessed > 500 * 1024 * 1024 ? '🚨 OVER LIMIT' : '✅ SAFE'}`
          }],
        };
      }

      case "get_inventory_summary": {
        const total = initialInventoryData.length;
        const byMake = initialInventoryData.reduce((acc, car) => {
          acc[car.make] = (acc[car.make] || 0) + 1;
          return acc;
        }, {});
        
        const avgPrice = initialInventoryData.reduce((sum, car) => sum + car.price, 0) / total;

        return {
          content: [{
            type: "text",
            text: `📈 Inventory Insights:\n- Unidades Totales: ${total}\n- Por Marca: ${JSON.stringify(byMake)}\n- Precio Promedio: $${avgPrice.toLocaleString()}\n- Unidades Destacadas: ${initialInventoryData.filter(c => c.featured).length}`
          }],
        };
      }

      case "search_vehicle_by_vin": {
        const vin = args.vin;
        const vehicle = initialInventoryData.find(c => c.vin === vin);
        
        if (!vehicle) {
          return {
            content: [{ type: "text", text: `❌ No se encontró vehículo con VIN: ${vin}` }],
            isError: true,
          };
        }

        return {
          content: [{
            type: "text",
            text: `🚗 Vehículo Encontrado:\n${JSON.stringify(vehicle, null, 2)}`
          }],
        };
      }

      default:
        throw new Error(`Herramienta no encontrada: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error en Sentinel MCP: ${error.message}` }],
      isError: true,
    };
  }
});

// --- Transport Setup ---
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Sentinel BI MCP Server running on stdio");
}

runServer().catch(console.error);
