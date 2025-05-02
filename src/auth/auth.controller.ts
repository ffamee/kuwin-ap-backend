import { Controller, Post, Req, UseGuards, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, LocalAuthGuard } from './guards';
import { Request, Response } from 'express';
import { AuthResponse } from 'src/shared/types/auth-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as AuthResponse; // Type assertion to AuthResponse
    const { accessToken } = this.authService.login(user);

    // Set the accessToken in the response cookie
    // use in localhost 3000 and 3001
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'none', // Set to 'none' if using cross-origin requests
      secure: true, // Set to true in production
      // secure: process.env.NODE_ENV === 'production', // Set to true in production
      maxAge: 60 * 60 * 1000, // 1 hour
      // domain: process.env.FRONTEND_URL, // Set the domain to your frontend URL
    });

    return {
      message: 'Login successful',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // Clear the accessToken cookie
    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 0, // Set maxAge to 0 to delete the cookie immediately
    });

    return {
      message: 'Logout successful',
    };
  }
}
