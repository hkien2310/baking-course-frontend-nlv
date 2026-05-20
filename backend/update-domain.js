const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function revertSocials() {
  try {
    const setting = await prisma.setting.findFirst({ where: { key: 'siteConfig' } });
    
    if (setting && setting.value) {
      let value = setting.value;

      if (value.socials) {
        if (value.socials.instagram && value.socials.instagram.includes('hoclambanhkhongkho')) {
          value.socials.instagram = 'https://instagram.com/hoclambanhonline.com';
        }
        if (value.socials.tiktok && value.socials.tiktok.includes('hoclambanhkhongkho')) {
          value.socials.tiktok = 'https://www.tiktok.com/@hoclambanhonline.com';
        }
      }

      await prisma.setting.update({
        where: { id: setting.id },
        data: {
          value: value
        }
      });
      console.log('Socials reverted successfully');
    }
  } catch (error) {
    console.error('Error reverting:', error);
  } finally {
    await prisma.$disconnect();
  }
}

revertSocials();
