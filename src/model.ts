import type { calendar_v3 } from "googleapis";

// Google Calendar API Types
export type GoogleCalendarList = calendar_v3.Schema$CalendarList;
export type GoogleCalendar = calendar_v3.Schema$CalendarListEntry;
export type GoogleCalendarEventList = calendar_v3.Schema$Events;
export type GoogleCalendarEvent = calendar_v3.Schema$Event;

// Application Domain Types
export interface CalendarEvent {
	summary: string;
	description: string;
	start: string; // Format: YYYY-MM-DD
	end: string; // Format: YYYY-MM-DD
	anyoneCanAddSelf?: boolean;
	colorId?: string;
}

// Tool Response Types
export interface ToolResponse<T> {
	content: Array<{
		type: string;
		text: string;
	}>;
	data?: T;
}

export interface CalendarListResponse
	extends ToolResponse<GoogleCalendarList> {}
export interface CalendarEventsResponse
	extends ToolResponse<GoogleCalendarEventList> {}
export interface CalendarEventResponse
	extends ToolResponse<GoogleCalendarEvent> {}
