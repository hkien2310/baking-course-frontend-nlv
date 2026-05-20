const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const setting = await prisma.setting.findFirst({ where: { key: 'siteConfig' } });
    console.log(setting.value.name);
    console.log(setting.value.logoText);
    await prisma.$disconnect();
}
run();
