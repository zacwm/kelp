import { v4 as uuid } from 'uuid';

interface RoomInterface {
  getId(): string;
  getName(): string;
  setName(name: string): void;
  setPassword(password: string): void;
  hasPassword(): boolean;
  validatePassword(password: string): boolean;
}

class Room implements RoomInterface {
  private id: string;
  private name: string;
  private password: string;

  constructor(name: string, password?: string) {
    this.id = uuid();
    this.name = name;
    this.password = password || '';
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  setPassword(password: string): void {
    this.password = password;
  }

  hasPassword(): boolean {
    return this.password !== '';
  }

  validatePassword(password: string): boolean {
    return this.password === password;
  }
}

export default Room;