import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.usecase';
import { UpdateUserProfileUseCase } from '../../application/use-cases/update-user-profile.usecase';
import { UpdateUserProfileDto } from '../dtos/update-user-profile.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { UserProfile } from '../../domain/entities/user-profile.entity';

@Controller('users')
export class UserController {
    constructor(
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    ) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getUser(@Param('id') id: string): Promise<UserProfile> {
        return this.getUserProfileUseCase.execute({ userId: id });
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updateUser(
        @Param('id') id: string,
        @Body() dto: UpdateUserProfileDto,
        @Req() req: Request,
    ): Promise<UserProfile> {
        const requester = (req as any).user as { userId: string };

        if (requester.userId !== id) {
            throw new ForbiddenException('Cannot update another user\'s profile');
        }

        return this.updateUserProfileUseCase.execute({
            userId: id,
            name: dto.name,
            phone: dto.phone,
            avatarUrl: dto.avatarUrl,
        });
    }
}