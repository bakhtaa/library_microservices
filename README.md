# Library Microservices System

## Project Overview

This project is a Library Management System developed using a microservices architecture with Node.js. The application demonstrates communication between distributed services using REST, GraphQL, gRPC, Kafka, SQLite and RxDB.

The system follows a modular architecture where each service has a clear responsibility and its own database.

---

## Architecture

```text
CLIENT
   ↓
REST / GraphQL
   ↓
API GATEWAY
   ↓
gRPC
   ┌─────────────┬─────────────┬─────────────┐
   ↓             ↓             ↓
USER SERVICE  BOOK SERVICE  BORROW SERVICE
   ↓             ↓             ↓
SQLite       SQLite         RxDB

               ↓
             Kafka
               ↓
NOTIFICATION SERVICE
```

---

## Technologies Used

| Component | Technology |
|------------|------------|
| API Gateway | Node.js + Express |
| REST API | Express |
| GraphQL | Apollo Server |
| Internal Communication | gRPC |
| Event Broker | Kafka (KRaft) |
| SQL Database | SQLite |
| NoSQL Database | RxDB |
| Protocol | Protobuf |

---

## Microservices Responsibilities

### User Service

Responsible for:

- User creation
- User retrieval
- User profile management
- User database handling

Database:
SQLite

Port:
50051

---

### Book Service

Responsible for:

- Book catalog management
- Availability status
- Search functionality

Database:
SQLite

Port:
50052

---

### Borrow Service

Responsible for:

- Borrow a book
- Return a book
- Business rules
- Availability verification

Database:
RxDB

Port:
50053

Business Rules:

- A user can borrow books only if available
- Book status updates after borrowing

---

### Notification Service

Responsible for:

- Kafka event consumption
- Notifications and logs

Examples:

- Book borrowed notification
- Book returned notification
- User creation notification

---

## Kafka Topics

| Topic | Producer | Consumer | Description |
|---------|----------|----------|-------------|
| USER_CREATED | User Service | Notification Service | Triggered when a new user is created |
| BOOK_BORROWED | Borrow Service | Notification Service | Triggered when a book is borrowed |
| BOOK_RETURNED | Borrow Service | Notification Service | Triggered when a book is returned |

---

## Project Structure

```text
library-microservices/
│
├── api-gateway/
│   ├── server.js
│   ├── schema.gql
│   ├── resolvers/
│   └── grpc-clients/
│
├── user-service/
│   ├── server.js
│   ├── proto/user.proto
│   └── db.sqlite
│
├── book-service/
│   ├── server.js
│   ├── proto/book.proto
│   └── db.sqlite
│
├── borrow-service/
│   ├── server.js
│   ├── proto/borrow.proto
│   └── db.rxdb/
│
├── notification-service/consumer.js
│
├── kafka/
│   ├── producer.js
│   └── consumer.js
│
└── shared/
```

---

## API Gateway Features

The API Gateway serves as the main entry point.

Supports:

### REST Endpoints

Examples:

GET /users

POST /users

GET /books

POST /books

---

### GraphQL

Example Query:

```graphql
query {
 users {
   name
   email
 }
}
```

Example Mutation:

```graphql
mutation {
 createUser(
   name:"Ali"
   email:"ali@test.com"
 ) {
   id
   name
 }
}
```

---

## Installation

Clone repository:

```bash
git clone <repository-url>
```

Go into project:

```bash
cd library-microservices
```

Install dependencies for each service:

```bash
npm install
```

---

## Running Services

API Gateway:

```bash
cd api-gateway
node server.js
```

User Service:

```bash
cd user-service
node server.js
```

Book Service:

```bash
cd book-service
node server.js
```

Borrow Service:

```bash
cd borrow-service
node server.js
```

---

## Current Project Status

At the current stage of implementation, the following microservices are fully implemented and operational:

- User Service
- Book Service
- Borrow Service

The Notification Service and complete Kafka event flow were planned as part of the architecture but are not fully implemented. Only the core microservices and their communication flow were tested.

Implemented features currently include:

- User management
- Book catalog management
- Borrow and return workflow
- REST endpoints
- Partial GraphQL integration
- gRPC communication 
- Independent databases



---

## Authors
Nairouz Bakhta Ben Hadj Slama
Library Microservices Project
Node.js Microservices Architecture

