# WeatherWear

## Development

There are some pre-requisites for development. You will need:

* An OpenAI API Key with access to GPT4 and Dall-E 3
* A Google Maps Places API key
* Node.js >= v18
* A Neon (Postgres) database
* [Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json&tabs=visual-studio-code%2Cblob-storage#install-azurite)

Then:

```bash
# Install dependencies
npm install

# Initialise your `.env.local` file
npm run env:init

# Edit your `.env` file and populate vars as appropriate
# VS Code used as an example - use whatever editor you want
code .env

# Run database migrations
npm run db:migrate:run

# Start the Azurite Blob Service

# Start the dev server
npm run dev
```
