# Typescript Bot Handler

## Features

- All types of interactions supported
- Proper logging system and save logs into a file (logs.log)
- Fully typed
- Optional MongoDB support

You'll never have to touch the interactionCreate event, ever again.
Supported interactions:

- Slash commands
- All types of select menus
- Modals
- Context menus
- Buttons

## Setup

1. `git clone https://github.com/mallusrgreatv2/ts-bot-handler.git`
2. `npm install` or `yarn install`
3. Copy content of [`.env.example`](https://github.com/mallusrgreatv2/ts-bot-handler/blob/master/.env.example) to a new file called .env
4. Change the values in .env
5. `npm start` or `yarn start`

## Rules

- For any interaction or event, name them `(name).(command|event|modal|menu|select|button).ts`
- For disabled commands, name them `(name).disabled.ts`
