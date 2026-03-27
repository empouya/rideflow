# Driver Service - Event Contracts

## Events Consumed

### `user.profile_created`

Fired by user-service when a new user profile is created.
driver-service listens and provisions a pending driver record only when `role` is `DRIVER`.

**Payload:**
```json
{
  "eventType": "user.profile_created",
  "payload": {
    "userId": "uuid-v4",
    "name": "drivername",
    "role": "DRIVER",
    "timestamp": "ISO-8601"
  },
  "metadata": {
    "version": "1.0",
    "source": "user-service"
  }
}
