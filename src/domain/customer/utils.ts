import { Role } from '@prisma/client';

export const mapSearchTermToRole = (searchTerm: string): Role | undefined => {
  if (searchTerm === 'ADMIN') {
    return Role.ADMIN;
  } else if (searchTerm === 'USER') {
    return Role.USER;
  }
  return undefined;
};
