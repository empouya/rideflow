# User Service — Event Contracts

## Events Consumed

### `auth.user_registered`

Fired by auth-service when a new user registers.
User-service listens and creates a profile automatically.

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

---

## Events Produced

### `user.profile_created`

Fired after a user profile is successfully created.

**Consumers:**
- `driver-service` — creates driver record if role is DRIVER
- `analytics-service` — tracks new user signups

### `user.profile_updated`

Fired after a user profile is updated.

**Consumers:**
- `analytics-service` — tracks profile changes