# Auth Service — Event Contracts

## Overview

The auth service produces events on every significant authentication action.
These events are consumed by downstream services to react to auth lifecycle changes.

---

## Events Produced

### `auth.user_registered`

Fired after a new user successfully registers.

**Payload:**
```json
{
  "eventType": "auth.user_registered",
  "payload": {
    "userId": "uuid-v4",
    "email": "user@example.com",
    "timestamp": "ISO-8601"
  },
  "metadata": {
    "version": "1.0",
    "source": "auth-service"
  }
}
```

**Consumers:**
- `user-service` — creates a user profile on receipt

---

### `auth.user_logged_in`

Fired after a user successfully logs in.

**Payload:**
```json
{
  "eventType": "auth.user_logged_in",
  "payload": {
    "userId": "uuid-v4",
    "email": "user@example.com",
    "timestamp": "ISO-8601"
  },
  "metadata": {
    "version": "1.0",
    "source": "auth-service"
  }
}
```

**Consumers:**
- `analytics-service` — tracks login activity

---

## Publisher

Currently using `InMemoryEventPublisher` which logs events to stdout.
Will be replaced with `KafkaEventPublisher` in the messaging phase.
The `IEventPublisher` interface ensures zero use case changes on swap.