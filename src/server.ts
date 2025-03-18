import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { createTools, handleToolCall } from "./tools/index.js";

/**
 * Create and configure the MCP server
 */
export function createServer() {
	// Create MCP server
	const server = new Server(
		{
			name: "Google Calendar Service",
			version: "0.0.1",
		},
		{
			capabilities: {
				tools: {},
				resources: { subscribe: true },
			},
		},
	);

	// Set up tool listing handler
	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return { tools: createTools() };
	});

	// Set up tool call handler
	server.setRequestHandler(CallToolRequestSchema, async (req) => {
		const { name, arguments: args } = req.params;
		return handleToolCall(name, args);
	});

	return server;
}
