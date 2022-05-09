import { v4 as uuid } from 'uuid';

interface UserInterface {
  id: string;
  name: string;
  setName(name: string): void;
}

class User implements UserInterface {
  id: string;
  name: string;

  constructor(name: string) {
    this.id = uuid();
    this.name = name;
  }

  setName(name: string): void {
    this.name = name;
  }
}

export default User;