import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUsers() {
    const users = await this.databaseService.user.findMany({
      select: {
        id: true,
        firstName: true,
        email: true,
      },
    });

    return users;
  }

  async getUser({ userId }: { userId: string }) {
    const user = await this.databaseService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        email: true,
      },
    });

    return user;
  }
}
