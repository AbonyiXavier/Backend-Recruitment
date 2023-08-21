import { Role } from '@prisma/client';

export type CustomerConfig = {
  id: string;
  email: string;
  password: string;
  role?: Role;
  code?: number;
  emailConfirm: boolean;
};
