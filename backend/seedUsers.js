const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test accounts...');
  
  // 1. Setup Admin Account
  const adminEmail = 'admin@baking.com';
  const adminPass = 'Admin123!';
  
  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash(adminPass, salt);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminHash,
      role: 'ADMIN',
      fullName: 'Baking Admin Boss'
    },
    create: {
      email: adminEmail,
      password: adminHash,
      role: 'ADMIN',
      fullName: 'Baking Admin Boss'
    }
  });

  console.log(`✅ Admin Account created/updated:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPass}`);
  console.log(`   Role: ${admin.role}`);
  console.log('-----------------------------------');

  // 2. Setup Normal User Account
  const userEmail = 'user@baking.com';
  const userPass = 'User123!';
  const userHash = await bcrypt.hash(userPass, salt);

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      password: userHash,
      role: 'USER',
      fullName: 'Customer User',
      points: 1000
    },
    create: {
      email: userEmail,
      password: userHash,
      role: 'USER',
      fullName: 'Customer User',
      points: 1000
    }
  });

  console.log(`✅ Customer Account created/updated:`);
  console.log(`   Email: ${userEmail}`);
  console.log(`   Password: ${userPass}`);
  console.log(`   Role: ${user.role}`);
  console.log('-----------------------------------');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
