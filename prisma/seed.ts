import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedInventory() {
  await prisma.$transaction([
    prisma.fruit.upsert({
      where: {
        id: 1
      },
      update: {
        stock: 30
      },
      create: {
        name: 'Apple',
        price: 1.00,
        stock: 30
      }
    }),
    prisma.fruit.upsert({
      where: {
        id: 2
      },
      update: {
        stock: 25
      },
      create: {
        name: 'Orange',
        price: 1.50,
        stock: 25
      }
    }),
    prisma.fruit.upsert({
      where: {
        id: 3
      },
      update: {
        stock: 40
      },
      create: {
        name: 'Banana',
        price: 2.00,
        stock: 40
      }
    }),
  ])
  .then((data) => {
    for (let item of data) {
      console.log(`${item.name} seeded into DB.`);
    }
  });
}

seedInventory()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
