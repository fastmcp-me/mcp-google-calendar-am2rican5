#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { GoogleCalendarService } from "./services/index.js";
async function main() {
	const calendarService = GoogleCalendarService.getInstance();
	await calendarService.authorize();

	const transport = new StdioServerTransport();
	const server = createServer();

	await server.connect(transport);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
