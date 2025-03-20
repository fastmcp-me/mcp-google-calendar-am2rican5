#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { GoogleCalendarService } from "./services/index.js";
import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// Check if --sse flag is present
const useSSE = process.argv.includes("--sse");

async function startStdioServer() {
	const calendarService = GoogleCalendarService.getInstance();
	await calendarService.authorize();

	const transport = new StdioServerTransport();
	const server = createServer();

	await server.connect(transport);
}

async function startSSEServer() {
	// Initialize Express app and set up endpoints
	const app = express();
	const server = createServer();
	let sseTransport: SSEServerTransport | null = null;

	// Set up SSE endpoint
	app.get("/sse", async (req: Request, res: Response) => {
		sseTransport = new SSEServerTransport("/messages", res);
		await server.connect(sseTransport);
	});

	// Set up message endpoint
	app.post("/messages", async (req: Request, res: Response) => {
		if (!sseTransport) {
			res.status(400).json({ error: "SSE connection not established" });
			return;
		}

		await sseTransport.handlePostMessage(req, res);
	});

	try {
		// Get calendar service instance and authenticate
		const calendarService = GoogleCalendarService.getInstance();
		console.log("Authenticating with Google Calendar...");
		await calendarService.authorize();
		console.log("Authentication successful!");

		// Start the server after successful authentication
		const PORT = process.env.PORT
			? Number.parseInt(process.env.PORT, 10)
			: 3420;
		app.listen(PORT, () => {
			console.log(`Calendar Service running on port ${PORT}`);
			console.log(`SSE endpoint available at http://localhost:${PORT}/sse`);
		});
	} catch (error) {
		console.error("Authentication failed:", error);
		process.exit(1);
	}
}

// Run the appropriate server based on the flag
async function main() {
	if (useSSE) {
		await startSSEServer();
	} else {
		await startStdioServer();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
