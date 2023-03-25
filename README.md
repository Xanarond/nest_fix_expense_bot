
# Nest.js Telegram Budget bot

## Description
Bot for calculating expenses and calculating current exchange rates

An example of the functionality is shown in the diagram:

```mermaid
graph TD
A(Welcome to the expense calculation bot) --> B(Getting exchange rates)
A --> C(Adding expenses for the period)
C --> G(Show Expenses)
C --> H(Add Expenses)
A --> D(Introduction of budget data)
D--> J(Show Budget Info)
D --> I(Add Budget Data)
B --> E(Display a list of currencies)
B --> F(Calculate amounts for currency exchange rates)
```

## Installation

```bash
$ npm install / yarn install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```