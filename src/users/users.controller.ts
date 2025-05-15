import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  // Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { Request } from 'express';
import { JwtPayload } from 'src/shared/types/auth-response.dto';
import {
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Get all users',
  })
  @ApiOkResponse({
    description: 'return list of all users',
  })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({
    summary: "Get user's profile *required authentication*",
  })
  @ApiOkResponse({
    description: 'return user profile',
    type: User,
    example: {
      id: 'e8c1adbd-240d-11f0-bdaf-ca1a739b326a',
      username: 'test',
      password: '$2b$10$Q8m2uHlI2s61rqr1OfpT6.xR9ud.KJMruyo2sRvGPX4wGVYJUlsGK',
      privilege: 2,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  Profile(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.usersService.getUserProfile(user);
  }

  @ApiOperation({
    summary: '*Unused* Login with username and password',
  })
  @ApiBody({
    description: 'User login credentials',
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'username',
        },
        password: {
          type: 'string',
          example: 'password',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid username or password',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @ApiOkResponse({
    description: 'Login successful',
  })
  @Post('login')
  login(
    @Body() { username, password }: { username: string; password: string },
  ) {
    return this.usersService.check(username, password);
  }

  // @Get('hash')
  // genHash() {
  //   return this.usersService.genHash();
  // }

  @ApiOperation({
    summary: 'Get user by username',
  })
  @ApiParam({
    name: 'username',
    description: 'Username of the user',
    type: 'string',
    example: 'test',
  })
  @ApiOkResponse({
    description: 'User details',
    type: User,
    example: {
      id: 'e8c1adbd-240d-11f0-bdaf-ca1a739b326a',
      username: 'test',
      password: '$2b$10$Q8m2uHlI2s61rqr1OfpT6.xR9ud.KJMruyo2sRvGPX4wGVYJUlsGK',
      privilege: 2,
    },
  })
  @ApiNotFoundResponse({
    description: 'Not found user that name "username"',
  })
  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
