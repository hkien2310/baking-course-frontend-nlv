const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const setting = await prisma.setting.findFirst({ where: { key: 'siteConfig' } });
    if (setting && setting.value) {
      let strValue = JSON.stringify(setting.value);
      strValue = strValue.replace(/yumsaigon\.com/g, 'hoclambanhonline.com');
      // Also maybe replace YUM Saigon -> Học Làm Bánh Online? The user said yumsaigon.com -> hoclambanhonline.com.
      await prisma.setting.update({
        where: { id: setting.id },
        data: { value: JSON.parse(strValue) }
      });
      console.log('Domain replaced in database.');
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
