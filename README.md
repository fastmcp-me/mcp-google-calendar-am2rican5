# Google Calendar MCP Server

A calendar service built with TypeScript and the Model Context Protocol (MCP) SDK that integrates with Google Calendar.

## Features

- Google Calendar integration with persistent token storage
- Fetch calendar events between specified dates
- Uses Server-Sent Events (SSE) transport for real-time communication
- Automatic authentication when the server launches
- Token persistence without recurring login prompts

## Prerequisites

1. Node.js and Bun installed
2. Google Cloud Platform account
3. Google Calendar API enabled
4. OAuth 2.0 credentials

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/am2rican5/mcp-google-calendar.git
   cd mcp-google-calendar
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up Google Calendar API:
   1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project or select an existing one (e.g., "personal-stuff")
   3. Enable the Google Calendar API:
      - Left sidebar > "APIs & Services" > Library
      - Search for "Google Calendar API"
      - Click "Enable"
   4. Configure OAuth consent screen:
      - Left sidebar > "APIs & Services" > "OAuth consent screen"
      - Choose between Internal or External
      - Fill in required information:
        - App name: mcp-calendar
        - User support email: (your email)
        - Developer contact information: (your email)
      - Add scopes:
        - Click "Add or Remove Scopes"
        - Search for "calendar.events"
        - Select the googleapis.com URL
        - Check the box next to it
      - Add test users:
        - Add your email to the Test Users list
      - Complete the setup
   5. Create OAuth credentials:
      - Left sidebar > "Credentials"
      - Click "Create Credentials" > "OAuth Client ID"
      - Choose "Desktop app" as application type
      - Give it a name (e.g., "MCP Calendar Desktop Client")
      - Click "Create"
      - Click "Download JSON" on the popup
      - Save the file as `credentials.json` in your project directory
   6. Set up environment variables:
      ```bash
      export CREDENTIALS_PATH=/path/to/your/credentials.json
      ```

## Running the Application

1. Create a `.env` file in the root directory with the following content:
   ```
   # Server configuration
   PORT=3420

   # Google Calendar API configuration
   # Path to the credentials file (optional, defaults to ./credentials.json)
   CREDENTIALS_PATH=./credentials.json
   ```

2. Start the server:
   ```bash
   bun start
   ```

3. Authentication Process:
   - When you start the server for the first time, a browser window will open
   - Sign in with your Google account and grant the requested permissions
   - After successful authentication, the server will start and the authentication token will be saved for future use
   - On subsequent runs, the server will automatically use the saved token without launching the browser
   - If authentication fails, the server will exit with an error message

## Running the Test Client

```bash
export CREDENTIALS_PATH=/path/to/your/credentials.json
bun run test-client
```

The first time you run the client, it will:
1. Open a browser window for Google authentication
2. Ask you to sign in with your Google account
3. Request permission to access your calendar
4. After authorization, save the token locally for future use

## Available Tools

- `list_calendars`: List all calendars
- `list_calendar_events`: Get events from a calendar between specified dates
- `create_calendar_event`: Create a calendar event
- `get_calendar_event`: Get a calendar event
- `edit_calendar_event`: Edit a calendar event
- `delete_calendar_event`: Delete a calendar event


## Authentication Flow

The application uses a persistent token storage system:
1. On first run, it checks for existing token in `token.json`
2. If token exists, it's loaded and used directly without launching the browser
3. If no token exists, initiates the OAuth 2.0 authorization flow
4. Opens a browser window for Google sign-in
5. After authorization, saves the token to `token.json` for future use
6. On subsequent runs, uses the saved token automatically without prompting for login
7. Token remains valid until it expires according to Google's OAuth policies

## Development

This project uses [Bun](https://bun.sh) as the JavaScript runtime.

To build the project:
```bash
bun run build
```

## Security Considerations

⚠️ **Important Security Warning** ⚠️

- The `credentials.json` and `token.json` files contain sensitive information.
- These files are listed in `.gitignore` to prevent accidental exposure.
- Never commit these files to version control or share them publicly.
- The token grants access to your Google Calendar data.
- If you suspect your credentials have been compromised, immediately revoke them in the Google Cloud Console.
- Each user should create their own OAuth credentials for personal use.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request