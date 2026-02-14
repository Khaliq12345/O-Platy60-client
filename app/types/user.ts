export type UserRole = "admin" | "manager" | "cook";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}