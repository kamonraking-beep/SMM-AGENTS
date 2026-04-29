export type AppUser = {
  id: string;
  email?: string;
  role?: "admin" | "editor" | "publisher";
};
