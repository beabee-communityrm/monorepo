export interface CreateUserArgs {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  membership: "none" | "permanent" | "monthly" | "expired";
  role: "none" | "admin" | "superadmin";
}
