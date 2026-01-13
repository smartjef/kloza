# Kloza Backend Service

Kloza is a production-grade backend service for a collaboration platform that manages Ideas, Kollabs (collaborations), and Discussions.

## Features

- **Ideas Management**: Create, list with pagination/filtering, and view single ideas.
- **Collaborations (Kollabs)**: Create collaborations from approved ideas.
- **Discussions**: Add and manage discussions within collaborations.
- **Robust Validation**: Input validation using Zod.
- **Error Handling**: Centralized error handling with custom error classes.
- **Logging**: Structured logging with Winston.
- **Security**: Helmet and CORS integration.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Testing**: Jest with Supertest
- **Validation**: Zod
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:

   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/kloza
   LOG_LEVEL=info
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

### Ideas

- `POST /api/ideas`: Create a new idea.
- `GET /api/ideas`: List all ideas with pagination and filters (`status`, `sortBy`, `sortOrder`).
- `GET /api/ideas/:id`: Retrieve a single idea.

### Kollabs

- `POST /api/kollabs`: Create a Kollab from an approved idea.
- `GET /api/kollabs/:id`: Retrieve a Kollab with discussions and idea details.
- `POST /api/kollabs/:id/discussions`: Add a discussion to a Kollab.

## Testing

Run tests with:

```bash
npm test
```

> [!NOTE]
> Integration tests require a running MongoDB instance. The test environment uses `.env.test`.

## Architecture Decisions

- **Folder Structure**: Clean separation of concerns (models, routes, controllers, middleware, validators, utils).
- **Embedded Discussions**: Discussions are embedded within the Kollab model for efficient retrieval.
- **Transactions**: Multi-document operations (like creating a Kollab and checking Idea status) use Mongoose transactions to ensure data integrity.
- **Indexing**: Frequent queries (status, createdBy, ideaID) are indexed. Compound partial indexes prevent multiple active Kollabs for the same Idea.
