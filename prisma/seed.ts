import { PrismaClient } from '@prisma/client';

import { customers } from './seeds/customers';

const prisma = new PrismaClient();

async function main() {
  try {
    for (const customer of customers) {
      await prisma.customer.upsert({
        where: { id: customer.id },
        update: {},
        create: customer,
      });
    }
    console.log(`Created ${customers.length} customers`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Prisma disconnected');
  }
}

main();
