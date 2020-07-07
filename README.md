# marketplace-api

This repository contains api to retrieve marketplace data for matic network marketplace

## setup

#### Installation

```sh
$ git clone https://github.com/maticnetwork/marketplace-api
$ cd marketplace-api
$ nvm use
$ npm install

# setup and start PostgreSQL
# follow prisma/README.md for database client setup
```

## Configure environment

You need to configure your environment variables now. Copy `.env.example` and rename as `.env`. Now provide values for the keys mentioned there.

#### Development

```sh
# apply migrations
$ npm run migrate-up

# start the development server with hot reload
$ npm run dev

# create migration for database schema changes
$ npm run migrate-save
```

#### database

Refer to [readme.md](./prisma/README.md)
