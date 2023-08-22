# Backend-Recruitment

[![npm version](https://badge.fury.io/js/nestjs.svg)](https://badge.fury.io/js/nestjs)
[![npm version](https://badge.fury.io/js/graphql.svg)](https://badge.fury.io/js/graphql)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#features-implemented)
- [Working Routes](#working-routes)
- [Improvements](#improvements)
- [License](#license)


# Introduction

This is a RESTful API for customer recruitment

### Project Structure

```bash
├── src
├── .env.sample
├── .eslintrc
├── .gitignore
├── .prettierrc
├── Makefile
├── nest-cli.json
├── package.json
├── README.md
└── tsconfig.build.json
└── tsconfig.json
```

### Project Database Architecture

Customer Model
- id
- email
- password
- refreshToken
- role [ADMIN, USER]
- code
- emailConfirm
- createdAt
- updatedAt
- deletedAt


### Features Implemented

- Sign up with [accessToken and RefreshToken]
- Sign in
- Ability to verify customer's account after signup with activation code;
- Resend activation code through email
- Create tokens ( A refresh token when access token get expired) 
- Logout
- Role [ADMIN, USER]
- Get customer
- Fetch customers with pagination
- Change of password
- Update customer
- Soft delete customer
- Search functionality for customer by Role, id and email



# Getting Started

### Dependencies

This project uses [Nest.js](https://docs.nestjs.com/) It has the following dependencies:

- [GraphQl](https://graphql.org/)
- [Postgres Database](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)
- ESLint & Prettier

#### _Prerequisites_

- Ensure you have **NodeJS** installed by entering `node -v` on your terminal
  If you don't have **NodeJS** installed, go to the [NodeJS Website](http://nodejs.org), and follow the download instructions

### Installation & Usage

- After cloning the repository, create a `.env` file from `.env.sample` and set your local `.env.` variable(s).

```sh
cp .env.sample .env
```

- Install the dependencies

```sh
npm run install
```

- You can run the server using

```sh
npm run start:dev
```

### Using the Makefile to Testing
How to run all tests locally

1. `make install` - Installs dependencies.
2. `make dev` - Run the server
3. `make build` 
4. `make migrate` - Generate migration.
5. `make lint` - Lint code.
6. `make studio` - Opens up a prisma virtual interface for your database
6. `make seed` - run seed
# Working Routes

## _API Endpoints_

- Public API documentation of this project is available on [postman docs](https://documenter.getpostman.com/view/7775892/2s9Y5TzQrS)

     
# License :boom:

This project is under the MIT LICENSE