import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type {
	GoogleCalendar,
	GoogleCalendarList,
	ToolResponse,
} from "./types/index.js";
import "dotenv/config";

console.log("Starting MCP Calendar Test Client");

// Get port from environment variable or use default
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3420;

// Create MCP client with SSE transport
const transport = new SSEClientTransport(
	new URL(`http://localhost:${PORT}/sse`),
);

const client = new Client(
	{
		name: "test-client",
		version: "1.0.0",
	},
	{
		capabilities: {},
	},
);

// Connect to the server
console.log("Connecting to server...");
await client.connect(transport);
console.log("Connected successfully");

// List available tools
const tools = await client.listTools();
console.log("Tools:", tools);

// Test echo tool
const echoResult = (await client.callTool({
	name: "echo",
	arguments: {
		message: "Hello, world!",
	},
})) as ToolResponse<unknown>;

console.log("Echo result:", echoResult);

// List calendars
const listCalendarsResult = (await client.callTool({
	name: "list_calendars",
	arguments: {},
})) as ToolResponse<unknown>;

if (!listCalendarsResult.content || !listCalendarsResult.content[0]?.text) {
	throw new Error("Invalid response format from list_calendars");
}

const calendarsResponse = JSON.parse(
	listCalendarsResult.content[0].text,
) as GoogleCalendarList;
const calendars = calendarsResponse.items || [];
console.log("Calendars:", calendars);

// Find primary calendar
const targetCalendar = calendars.find(
	(c: GoogleCalendar) => c.primary === true,
);
if (!targetCalendar) {
	throw new Error("No primary calendar found");
}

// Format dates in YYYY-MM-DD format
const today = new Date();
const futureDate = new Date(today);
futureDate.setDate(today.getDate() + 30);

const formatDate = (date: Date): string => {
	return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
};

// List events
const result = (await client.callTool({
	name: "list_calendar_events",
	arguments: {
		calendarId: targetCalendar.id,
		startsAt: formatDate(today),
		endsAt: formatDate(futureDate),
	},
})) as ToolResponse<unknown>;

console.log("Calendar events:", result);
