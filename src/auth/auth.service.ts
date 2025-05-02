import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthResponse } from '../shared/types/auth-response.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
