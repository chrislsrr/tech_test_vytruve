import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthTokens> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<AuthTokens> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.generateTokens(user);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findAll().then((users) =>
      users.find((u) => u.email === email),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async validateUserById(id: number): Promise<User | null> {
    try {
      return await this.usersService.findOne(id);
    } catch {
      return null;
    }
  }

  private generateTokens(user: User): AuthTokens {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
