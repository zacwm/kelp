import { v4 as uuid } from 'uuid';

interface RoomInterface {
  id: string;
  name: string;
  setName(name: string): void;
  setPassword(password: string): void;
  hasPassword(): boolean;
  getPassword(): string;
  getAuthToken(): string;
}

class Room implements RoomInterface {
  id: string;
  name: string;
  private password: string;
  private authToken: string;

  constructor(name: string, password?: string) {
    this.id = uuid();
    this.name = name;
    this.password = password || '';
    this.authToken = uuid(); // TODO: Replace with a heavier token...
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

  getPassword(): string {
    return this.password;
  }

  getAuthToken(): string {
    return this.authToken;
  }
}

export default Room;