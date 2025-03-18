import { authenticate } from "@google-cloud/local-auth";
import type { Credentials, OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import * as fs from "node:fs";
import * as path from "node:path";
import { OAuth2Client as OAuth2 } from "google-auth-library";
import type {
	CalendarEvent,
	GoogleCalendarEvent,
	GoogleCalendarEventList,
	GoogleCalendarList,
} from "../types/index.js";

interface GoogleCredentials {
	installed?: {
		client_id: string;
		client_secret: string;
		redirect_uris: string[];
	};
	web?: {
		client_id: string;
		client_secret: string;
		redirect_uris: string[];
	};
}

/**
 * Service for interacting with Google Calendar API
 */
export class GoogleCalendarService {
	private static instance: GoogleCalendarService;
	private authClient: OAuth2Client | null = null;
	private credentials: Credentials | null = null;
	private readonly TOKEN_PATH = path.join(process.cwd(), "token.json");

	// Scopes for Google Calendar API
	private readonly SCOPES = [
		"https://www.googleapis.com/auth/calendar.readonly",
		"https://www.googleapis.com/auth/calendar.events",
	];

	private constructor() {}

	/**
	 * Get the singleton instance of GoogleCalendarService
	 */
	public static getInstance(): GoogleCalendarService {
		if (!GoogleCalendarService.instance) {
			GoogleCalendarService.instance = new GoogleCalendarService();
		}
		return GoogleCalendarService.instance;
	}

	/**
	 * Load credentials from environment variable
	 */
	private loadCredentials(): GoogleCredentials {
		const credentialsPath =
			process.env.CREDENTIALS_PATH ?? "./credentials.json";

		if (!credentialsPath) {
			throw new Error("CREDENTIALS_PATH environment variable is not set");
		}

		if (!fs.existsSync(credentialsPath)) {
			throw new Error(`Credentials file not found at ${credentialsPath}`);
		}

		const content = fs.readFileSync(credentialsPath, "utf8");
		return JSON.parse(content) as GoogleCredentials;
	}

	/**
	 * Load saved token from disk
	 */
	private loadSavedToken(): Credentials | null {
		try {
			if (fs.existsSync(this.TOKEN_PATH)) {
				const token = fs.readFileSync(this.TOKEN_PATH, "utf8");
				return JSON.parse(token);
			}
		} catch (error) {
			console.error("Error loading saved token:", error);
		}
		return null;
	}

	/**
	 * Save token to disk
	 */
	private saveToken(token: Credentials): void {
		try {
			fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(token));
		} catch (error) {
			console.error("Error saving token:", error);
		}
	}

	/**
	 * Authorize with Google Calendar API
	 */
	public async authorize(): Promise<OAuth2Client> {
		// If we already have an authorized client, return it
		if (this.authClient && this.credentials) {
			this.authClient.setCredentials(this.credentials);
			return this.authClient;
		}

		try {
			// Load credentials from environment variable
			const credentialsPath =
				process.env.CREDENTIALS_PATH ?? "./credentials.json";

			if (!fs.existsSync(credentialsPath)) {
				throw new Error(`Credentials file not found at: ${credentialsPath}`);
			}

			// Load credentials from file
			const credentials: GoogleCredentials = JSON.parse(
				fs.readFileSync(credentialsPath, "utf-8"),
			);

			// Extract client ID and secret
			const clientId =
				credentials.web?.client_id || credentials.installed?.client_id;
			const clientSecret =
				credentials.web?.client_secret || credentials.installed?.client_secret;
			const redirectUri = (credentials.web?.redirect_uris ||
				credentials.installed?.redirect_uris ||
				[])[0];

			if (!clientId || !clientSecret) {
				throw new Error("Invalid credentials file format");
			}

			// Create OAuth2 client
			const authClient = new OAuth2(clientId, clientSecret, redirectUri);
			this.authClient = authClient;

			// Try to load saved token
			const savedToken = this.loadSavedToken();
			if (savedToken) {
				console.log("Using saved token");
				this.credentials = savedToken;
				this.authClient.setCredentials(savedToken);
				return this.authClient;
			}

			// If no saved token, start new authentication flow
			console.log("No saved token found. Starting new authentication flow...");
			this.authClient = (await authenticate({
				scopes: this.SCOPES,
				keyfilePath: credentialsPath,
			})) as OAuth2Client;

			// Store credentials in memory and save to disk
			this.credentials = this.authClient.credentials;
			this.saveToken(this.credentials);

			return this.authClient;
		} catch (error) {
			console.error("Error authorizing with Google:", error);
			throw error;
		}
	}

	/**
	 * Get list of available calendars
	 */
	public async getCalendars(pageToken?: string): Promise<GoogleCalendarList> {
		const auth = await this.authorize();
		const calendar = google.calendar({ version: "v3", auth });

		const res = await calendar.calendarList.list({
			pageToken,
		});
		return res.data;
	}

	/**
	 * Get calendar events between two dates
	 */
	public async getEvents(
		calendarId: string,
		startDate: string,
		endDate: string,
		pageToken?: string,
	): Promise<GoogleCalendarEventList> {
		const auth = await this.authorize();
		const calendar = google.calendar({ version: "v3", auth });

		const res = await calendar.events.list({
			calendarId,
			timeMin: new Date(startDate).toISOString(),
			timeMax: new Date(endDate).toISOString(),
			singleEvents: true,
			orderBy: "startTime",
			pageToken,
		});

		return res.data;
	}

	/**
	 * Create a new calendar event
	 */
	public async createEvent(
		calendarId: string,
		event: CalendarEvent,
	): Promise<GoogleCalendarEvent> {
		const auth = await this.authorize();
		const calendar = google.calendar({ version: "v3", auth });

		const res = await calendar.events.insert({
			calendarId,
			requestBody: {
				summary: event.summary,
				description: event.description,
				start: { date: event.start },
				end: { date: event.end },
				anyoneCanAddSelf: event.anyoneCanAddSelf,
				colorId: event.colorId,
			},
		});
		return res.data;
	}

	/**
	 * Get a calendar event
	 */
	public async getEvent(
		calendarId: string,
		eventId: string,
	): Promise<GoogleCalendarEvent> {
		const auth = await this.authorize();
		const calendar = google.calendar({ version: "v3", auth });

		const res = await calendar.events.get({
			calendarId,
			eventId,
		});

		return res.data;
	}

	/**
	 * Edit a calendar event
	 */
	public async updateEvent(
		calendarId: string,
		eventId: string,
		event: CalendarEvent,
	): Promise<GoogleCalendarEvent> {
		const auth = await this.authorize();
		const calendar = google.calendar({ version: "v3", auth });

		const res = await calendar.events.update({
			calendarId,
			eventId,
			requestBody: {
				summary: event.summary,
				description: event.description,
				start: { date: event.start },
				end: { date: event.end },
				anyoneCanAddSelf: event.anyoneCanAddSelf,
				colorId: event.colorId,
			},
		});
		return res.data;
	}

	/**
	 * Delete a calendar event
	 */
	public async deleteEvent(calendarId: string, eventId: string): Promise<void> {
		const auth = await this.authorize();
		const calendar = google.calendar({ version: "v3", auth });

		await calendar.events.delete({
			calendarId,
			eventId,
		});
	}
}
