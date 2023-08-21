import { Role } from '@prisma/client';

export type Customer = {
  id: string;
  email: string;
  password: string;
  role?: Role;
};
