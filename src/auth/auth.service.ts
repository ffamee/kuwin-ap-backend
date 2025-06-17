import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthResponse } from '../shared/types/auth-response.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<AuthResponse | null> {
    const user = await this.usersService.findUserLogin(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // const { password, ...result } = user;
      return { username: user.username, id: user.id };
    }
    return null;
  }

  login(user: AuthResponse) {
    const payload = { username: user.username, id: user.id };
    console.log('login with', payload.username);
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET')!,
        expiresIn: '15m',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
        expiresIn: '7d',
      }),
    };
  }

  async verifyRefreshToken(
    refreshToken: string,
    payload: AuthResponse,
  ): Promise<AuthResponse> {
    try {
      const user = await this.usersService.findUserLogin(payload.username);
      // you can validate the refresh token here if needed (use compare)
      if (!user) {
        // delete the refresh token from the database if you store it, force logout
        throw new UnauthorizedException();
      }
      return user;
    } catch (err) {
      throw new UnauthorizedException(`Refresh token invalid ${err}`);
    }
  }
}
