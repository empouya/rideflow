import { AuthUserRegisteredEvent } from '../contracts/auth.user-registered.event';
import { AuthUserLoggedInEvent } from '../contracts/auth.user-logged-in.event';

export type DomainEvent = AuthUserRegisteredEvent | AuthUserLoggedInEvent;

export interface IEventPublisher {
    publish(event: DomainEvent): Promise<void>;
}

export const EVENT_PUBLISHER = Symbol('IEventPublisher');