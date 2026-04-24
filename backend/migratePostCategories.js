const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const removeVietnameseTones = (str) => {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); 
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); 
  str = str.replace(/ + /g, " ");
  str = str.trim();
  return str;
};

const generateSlug = (name) => {
  if (!name) return `category-${Date.now()}`;
  const cleanName = removeVietnameseTones(name);
  return cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);
};

async function main() {
  console.log('Starting migration of post categories...');
  
  // 1. Get unique categories from posts
  const posts = await prisma.post.findMany({
    where: { category: { not: null, not: '' } },
    distinct: ['category'],
    select: { category: true }
  });
  
  const uniqueCategories = posts.map(p => p.category).filter(Boolean);
  console.log(`Found ${uniqueCategories.length} unique post categories:`, uniqueCategories);
  
  // 2. Insert into Category table with type='POST'
  let createdCount = 0;
  for (const catName of uniqueCategories) {
    const existing = await prisma.category.findUnique({
      where: { name_type: { name: catName, type: 'POST' } }
    });
    
    if (!existing) {
      await prisma.category.create({
        data: {
          name: catName,
          slug: generateSlug(catName),
          type: 'POST',
          sortOrder: 0,
          isActive: true
        }
      });
      createdCount++;
      console.log(`Created POST category: ${catName}`);
    }
  }
  
  console.log(`Migration complete. Created ${createdCount} new categories.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
