# WeatherWear

## Development

There are some pre-requisites for development. You will need:

* An OpenAI API Key with access to GPT4 and Dall-E 3
* A Google Maps Places API key
* Node.js >= v18
* Docker Desktop

Then:

```bash
# Install dependencies
npm install

# Start Supabase services
npm run supabase start

# Initialise your `.env.local` file
npm run env:init

# Edit your `.env.local` file and populate vars as appropriate
# VS Code used as an example - use whatever editor you want
code .env.local

# Run database migrations
npm run db:migrate

# Start the dev server
npm run dev
```
