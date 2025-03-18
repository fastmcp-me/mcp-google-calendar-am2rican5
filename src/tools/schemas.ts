import { z } from "zod";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { CalendarEvent } from "../model.js";

// Extract the input schema type from ToolSchema
const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

// Calendar event schema
export const CalendarEventSchema: z.ZodType<CalendarEvent> = z.object({
	summary: z.string().describe("The summary of the event"),
	description: z.string().describe("The description of the event"),
	start: z.string().describe("The start date of the event. Format: YYYY-MM-DD"),
	end: z.string().describe("The end date of the event. Format: YYYY-MM-DD"),
	anyoneCanAddSelf: z
		.boolean()
		.optional()
		.describe("Whether anyone can add themselves to the event"),
	colorId: z.string().optional().describe("The color of the event"),
});

// Tool schemas

export const ListCalendarsSchema = z.object({
	pageToken: z.string().optional().describe("The next page token"),
});

export const ListCalendarEventsSchema = z.object({
	calendarId: z.string().describe("The calendar ID"),
	startsAt: z
		.string()
		.describe("The start date of the events. Format: YYYY-MM-DD"),
	endsAt: z.string().describe("The end date of the events. Format: YYYY-MM-DD"),
	pageToken: z.string().optional().describe("The next page token"),
});

export const CreateCalendarEventSchema = z.object({
	calendarId: z.string().describe("The calendar ID"),
	event: CalendarEventSchema,
});

export const GetCalendarEventSchema = z.object({
	calendarId: z.string().describe("The calendar ID"),
	eventId: z.string().describe("The event ID"),
});

export const EditCalendarEventSchema = z.object({
	calendarId: z.string().describe("The calendar ID"),
	eventId: z.string().describe("The event ID"),
	event: CalendarEventSchema,
});

export const DeleteCalendarEventSchema = z.object({
	calendarId: z.string().describe("The calendar ID"),
	eventId: z.string().describe("The event ID"),
});

// Enum for tool names
export enum ToolName {
	ListCalendars = "list_calendars",
	ListCalendarEvents = "list_calendar_events",
	CreateCalendarEvent = "create_calendar_event",
	GetCalendarEvent = "get_calendar_event",
	EditCalendarEvent = "edit_calendar_event",
	DeleteCalendarEvent = "delete_calendar_event",
}

// Function to convert Zod schema to JSON schema for tool input
export function createToolInputSchema(schema: z.ZodType<unknown>): ToolInput {
	return zodToJsonSchema(schema) as ToolInput;
}

// Function to create tool definitions
export function createTools(): Tool[] {
	return [
		{
			name: ToolName.ListCalendars,
			description: "List all calendars",
			inputSchema: createToolInputSchema(ListCalendarsSchema),
		},
		{
			name: ToolName.ListCalendarEvents,
			description: "Get events from a calendar",
			inputSchema: createToolInputSchema(ListCalendarEventsSchema),
		},
		{
			name: ToolName.CreateCalendarEvent,
			description: "Create a calendar event",
			inputSchema: createToolInputSchema(CreateCalendarEventSchema),
		},
		{
			name: ToolName.GetCalendarEvent,
			description: "Get a calendar event",
			inputSchema: createToolInputSchema(GetCalendarEventSchema),
		},
		{
			name: ToolName.EditCalendarEvent,
			description: "Edit a calendar event",
			inputSchema: createToolInputSchema(EditCalendarEventSchema),
		},
		{
			name: ToolName.DeleteCalendarEvent,
			description: "Delete a calendar event",
			inputSchema: createToolInputSchema(DeleteCalendarEventSchema),
		},
	];
}
