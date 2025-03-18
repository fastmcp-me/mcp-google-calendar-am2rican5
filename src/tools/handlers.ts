import { GoogleCalendarService } from "../services/index.js";
import {
	CreateCalendarEventSchema,
	DeleteCalendarEventSchema,
	EditCalendarEventSchema,
	GetCalendarEventSchema,
	ListCalendarEventsSchema,
	ToolName,
} from "./schemas.js";

// Get the calendar service instance
const calendarService = GoogleCalendarService.getInstance();

/**
 * Handler for listing calendars
 */
export async function handleListCalendars(args: unknown) {
	const calendars = await calendarService.getCalendars();
	return {
		content: [{ type: "text", text: JSON.stringify(calendars) }],
	};
}

/**
 * Handler for listing calendar events
 */
export async function handleListCalendarEvents(args: unknown) {
	const { calendarId, startsAt, endsAt, pageToken } =
		ListCalendarEventsSchema.parse(args);

	const events = await calendarService.getEvents(
		calendarId,
		startsAt,
		endsAt,
		pageToken,
	);

	return {
		content: [{ type: "text", text: JSON.stringify(events) }],
	};
}

/**
 * Handler for creating calendar events
 */
export async function handleCreateCalendarEvent(args: unknown) {
	const { calendarId, event } = CreateCalendarEventSchema.parse(args);
	const createdEvent = await calendarService.createEvent(calendarId, event);

	return {
		content: [{ type: "text", text: JSON.stringify(createdEvent) }],
	};
}

/**
 * Handler for getting calendar events
 */
export async function handleGetCalendarEvent(args: unknown) {
	const { calendarId, eventId } = GetCalendarEventSchema.parse(args);
	const event = await calendarService.getEvent(calendarId, eventId);

	return { content: [{ type: "text", text: JSON.stringify(event) }] };
}

/**
 * Handler for editing calendar events
 */
export async function handleEditCalendarEvent(args: unknown) {
	const { calendarId, eventId, event } = EditCalendarEventSchema.parse(args);
	const updatedEvent = await calendarService.updateEvent(
		calendarId,
		eventId,
		event,
	);

	return { content: [{ type: "text", text: JSON.stringify(updatedEvent) }] };
}

/**
 * Handler for deleting calendar events
 */
export async function handleDeleteCalendarEvent(args: unknown) {
	const { calendarId, eventId } = DeleteCalendarEventSchema.parse(args);
	await calendarService.deleteEvent(calendarId, eventId);

	return { content: [{ type: "text", text: "Event deleted" }] };
}

/**
 * Main tool handler function that routes to specific handlers
 */
export async function handleToolCall(name: string, args: unknown) {
	switch (name) {
		case ToolName.ListCalendars:
			return handleListCalendars(args);
		case ToolName.ListCalendarEvents:
			return handleListCalendarEvents(args);
		case ToolName.CreateCalendarEvent:
			return handleCreateCalendarEvent(args);
		case ToolName.EditCalendarEvent:
			return handleEditCalendarEvent(args);
		case ToolName.DeleteCalendarEvent:
			return handleDeleteCalendarEvent(args);
		default:
			throw new Error(`Unknown tool: ${name}`);
	}
}
