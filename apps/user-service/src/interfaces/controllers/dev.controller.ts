import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthUserRegisteredConsumer } from '../../events/consumers/auth-user-registered.consumer';
import { AuthUserRegisteredEvent } from '../../events/contracts/auth.user-registered.event';

@Controller('dev')
export class DevController {
    constructor(
        private readonly consumer: AuthUserRegisteredConsumer,
    ) { }

    @Post('simulate/auth.user_registered')
    @HttpCode(HttpStatus.OK)
    async simulateAuthUserRegistered(
        @Body() event: AuthUserRegisteredEvent,
    ): Promise<{ message: string }> {
        await this.consumer.handle(event);
        return { message: 'Event simulated successfully' };
    }
}