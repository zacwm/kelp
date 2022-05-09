interface UserInterface {
  id: string;
  name: string;
  setName(name: string): void;
}

class User implements UserInterface {
  id: string;
  name: string;

  constructor(id: string) {
    this.id = id;
    this.name = null;
  }

  setName(name: string): void {
    this.name = name;
  }
}

export default User;