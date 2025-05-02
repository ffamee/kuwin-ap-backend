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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  Profile(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.usersService.getUserProfile(user);
  }

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

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
