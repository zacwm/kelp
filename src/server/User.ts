import { User as UserInterface } from '../types';
class User implements UserInterface {
  id: string;
  name: string;
  joinUnixTime: number;
  permission: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.joinUnixTime = Math.floor(Date.now() / 1000);
    this.permission = 'viewer';
  }

  setName(name: string): void {
    this.name = name;
  }

  setPermission(permission: string): void {
    this.permission = permission;
  }
}

export default User;