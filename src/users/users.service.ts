import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/shared/types/auth-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    // console.log('This action returns all users');
    return this.userRepository.find({
      select: ['id', 'username', 'privilege'],
    });
  }

  findUserLogin(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findOne(username: string): Promise<User | null> {
    console.log(`This action returns a ${username} user`);
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // const passwordText = Buffer.from(user.password, 'base64').toString('utf-8');
    // solution 1
    // bcrypt.hash(passwordText, 10, async (err, hash) => {
    //   if (err) {
    //     throw new Error('Error hashing password');
    //   }
    //   console.log('Password hash:', hash);
    //   console.log('compare: ', await bcrypt.compare(passwordText, hash));
    // });
    // solution 2
    // // const passwordHash = await bcrypt.hash(passwordText, 10);
    // console.log(passwordHash);
    // console.log(await bcrypt.compare(passwordText, passwordHash));
    return user;
  }

  // async genHash() {
  //   const users: User[] = await this.userRepository.find();
  //   for (const user of users) {
  //     const passwordText = Buffer.from(user.password, 'base64').toString(
  //       'utf-8',
  //     );
  //     const passwordHash = await bcrypt.hash(passwordText, 10);
  //     this.userRepository
  //       .update(user.id, {
  //         password: passwordHash,
  //       })
  //       .catch(() => {
  //         throw new Error('Error updating user password');
  //       });
  //     console.log(user.username, user.password);
  //   }
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }

  async check(username: string, password: string) {
    return this.userRepository
      .findOne({ where: { username } })
      .then(async (user) => {
        if (!user) {
          throw new NotFoundException('User not found');
        }
        return await bcrypt.compare(password, user.password);
      })
      .catch(() => {
        throw new InternalServerErrorException(`Login Error`);
      });
  }

  async getUserProfile(user: JwtPayload) {
    const userProfile = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!userProfile) {
      throw new NotFoundException('User not found from token');
    }
    return userProfile;
  }

  async addUser(user: CreateUserDto): Promise<User> {
    if (
      await this.userRepository.exists({ where: { username: user.username } })
    ) {
      throw new ConflictException('User already exists');
    }
    return await this.userRepository.save({
      ...user,
      password: await bcrypt.hash(user.password, 10),
    });
  }

  async remove(id: string) {
    if (!(await this.userRepository.exists({ where: { id } }))) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.delete(id).then(() => {
      return { message: 'User deleted successfully' };
    });
  }

  async editUser(id: string, user: UpdateUserDto): Promise<User> {
    if (!(await this.userRepository.exists({ where: { id } }))) {
      throw new NotFoundException('User not found');
    }
    if (
      await this.userRepository.exists({
        where: { username: user.username },
      })
    ) {
      throw new ConflictException('Username already exists');
    }
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    } else {
      const existingUser = await this.userRepository.findOne({ where: { id } });
      user.password = existingUser?.password; // Keep the existing password if not provided
    }
    return await this.userRepository.save({
      ...user,
      id,
    });
  }
}
