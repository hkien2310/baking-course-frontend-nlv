const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const FRONTEND_PUBLIC_DIR = path.join(process.cwd(), '../frontend/public');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function processImage(url) {
  if (!url) return null;
  if (url.startsWith('/uploads/')) return url;
  if (url.startsWith('http')) return url;

  // We have a local URL like "images/img-01.jpg" or "/baking/images/img-01.jpg"
  let relativePath = url;
  if (relativePath.startsWith('/baking/')) {
    relativePath = relativePath.replace('/baking/', '');
  }

  const sourcePath = path.join(FRONTEND_PUBLIC_DIR, relativePath);
  
  if (!fs.existsSync(sourcePath)) {
    console.warn(`[WARN] Source file not found: ${sourcePath} (for URL: ${url})`);
    return url; // Keep original if we can't migrate
  }

  // Generate a unique filename for the uploads folder
  const ext = path.extname(sourcePath);
  const baseName = path.basename(sourcePath, ext);
  const newFileName = `migrated_${baseName}_${Date.now()}${ext}`;
  const destPath = path.join(UPLOADS_DIR, newFileName);

  // Copy the file
  fs.copyFileSync(sourcePath, destPath);
  console.log(`[SUCCESS] Copied ${relativePath} -> /uploads/${newFileName}`);

  return `/uploads/${newFileName}`;
}

async function main() {
  console.log('--- Starting Image Migration ---');

  // 1. Migrate Programs
  const programs = await prisma.program.findMany();
  let programsUpdated = 0;
  for (const p of programs) {
    const newThumbnail = await processImage(p.thumbnail);
    const newAuthorImage = await processImage(p.authorImage);
    
    if (newThumbnail !== p.thumbnail || newAuthorImage !== p.authorImage) {
      await prisma.program.update({
        where: { id: p.id },
        data: {
          thumbnail: newThumbnail,
          authorImage: newAuthorImage
        }
      });
      programsUpdated++;
    }
  }
  console.log(`Updated ${programsUpdated} programs.`);

  // 2. Migrate Posts
  const posts = await prisma.post.findMany();
  let postsUpdated = 0;
  for (const p of posts) {
    const newThumbnail = await processImage(p.thumbnail);
    if (newThumbnail !== p.thumbnail) {
      await prisma.post.update({
        where: { id: p.id },
        data: { thumbnail: newThumbnail }
      });
      postsUpdated++;
    }
  }
  console.log(`Updated ${postsUpdated} posts.`);

  // 3. Migrate Chiefs
  const chiefs = await prisma.chief.findMany();
  let chiefsUpdated = 0;
  for (const c of chiefs) {
    const newImage = await processImage(c.image);
    if (newImage !== c.image) {
      await prisma.chief.update({
        where: { id: c.id },
        data: { image: newImage }
      });
      chiefsUpdated++;
    }
  }
  console.log(`Updated ${chiefsUpdated} chiefs.`);

  console.log('--- Migration Complete ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
