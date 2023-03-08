export interface User {
  id: string;
  name: string;
  joinUnixTime: number;
  setName(name: string): void;
  permission: string; // can be 'viewer', 'controller', or 'host'
  setPermission(permission: string): void;
}