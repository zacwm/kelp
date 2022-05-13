interface UserInterface {
  id: string;
  name: string;
  setName(name: string): void;
  updateName(name: string): void;
}

class User implements UserInterface {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  setName(name: string): void {
    this.name = name;
  }

  updateName(name: string): void {
    this.name = name;
  }
}

export default User;