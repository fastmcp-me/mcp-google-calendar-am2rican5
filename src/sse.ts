import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import "dotenv/config";
import type { Request, Response } from "express";
import express from "express";
import { createServer } from "./server.js";
import { GoogleCalendarService } from "./services/index.js";

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

// Start the server after authentication
async function startServer() {
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
		});
	} catch (error) {
		console.error("Authentication failed:", error);
		process.exit(1);
	}
}

// Start the server with authentication
startServer();
