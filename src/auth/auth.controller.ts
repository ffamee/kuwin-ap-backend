import { Controller, Post, Req, UseGuards, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard, JwtRefreshGuard, LocalAuthGuard } from './guards';
import { Request, Response } from 'express';
import { AuthResponse } from 'src/shared/types/auth-response.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Login with username and password',
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
  @ApiOkResponse({
    description: 'Login successful',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as AuthResponse; // Type assertion to AuthResponse
    const { accessToken, refreshToken } = this.authService.login(user);

    // Set the accessToken in the response cookie
    // use in localhost 3000 and 3001
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'none', // Set to 'none' if using cross-origin requests
      secure: true, // Set to true in production
      // secure: process.env.NODE_ENV === 'production', // Set to true in production
      maxAge: 60 * 15 * 1000, // 15 minutes
      // domain: process.env.FRONTEND_URL, // Set the domain to your frontend URL
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none', // Set to 'none' if using cross-origin requests
      secure: true, // Set to true in production
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    return {
      message: 'Login successful',
    };
  }

  @ApiOperation({
    summary: 'Logout *required access token*',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    description: 'Logout successful',
  })
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
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 0, // Set maxAge to 0 to delete the cookie immediately
    });

    return {
      message: 'Logout successful',
    };
  }

  @ApiOperation({
    summary: 'refresh new access token *required refresh token*',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiOkResponse({
    description: 'Refresh token successful',
  })
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as AuthResponse; // Type assertion to AuthResponse
    const { accessToken, refreshToken } = this.authService.login(user);

    // Set the accessToken in the response cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'none', // Set to 'none' if using cross-origin requests
      secure: true, // Set to true in production
      maxAge: 60 * 15 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none', // Set to 'none' if using cross-origin requests
      secure: true, // Set to true in production
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    return {
      message: 'Refresh token successful',
    };
  }
}
