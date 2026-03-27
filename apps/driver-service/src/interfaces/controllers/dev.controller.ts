import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UserProfileCreatedConsumer } from '../../events/consumers/user-profile-created.consumer';
import { UserProfileCreatedEvent } from '../../events/contracts/user.profile-created.event';

@Controller('dev')
export class DevController {
    constructor(
        private readonly consumer: UserProfileCreatedConsumer,
    ) { }

    @Post('simulate/user.profile_created')
    @HttpCode(HttpStatus.OK)
    async simulateUserProfileCreated(
        @Body() event: UserProfileCreatedEvent,
    ): Promise<{ message: string }> {
        await this.consumer.handle(event);
        return { message: 'Event simulated successfully' };
    }
}
