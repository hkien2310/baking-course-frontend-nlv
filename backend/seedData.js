const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing data (Except Users/Admin)...');
  await prisma.enrollment.deleteMany({});
  await prisma.studentWork.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.classSession.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.chief.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.contact.deleteMany({});
  console.log('Cleanup completed!');

  console.log('Seeding Chiefs...');
  const chief1 = await prisma.chief.create({
    data: {
      name: 'Gordon Ramsey',
      role: 'Master Baker',
      image: '/baking/images/team/01.jpg',
      bio: 'Michelin-starred master with 20 years of experience.',
      biography: `
        <p>Gordon is a world-renowned master baker known for his precision and uncompromising standards. With over two decades in the industry, he has opened some of the finest patisseries in London and Paris.</p>
        <p>His teaching style is rigorous yet rewarding, focusing on the foundational techniques that make a good baker great. "Baking is a science," he often says, "but the final product is pure art."</p>
        <ul>
            <li>Executive Pastry Chef at The Ritz</li>
            <li>Author of "Modern Classics in Baking"</li>
            <li>Judge on World Pastry Cup</li>
        </ul>
      `,
      highlights: 'Master Chocolatier, Bread Artisan',
      skills: 'Sourdough, Lamination, French Pastry',
      socialFb: 'https://facebook.com',
      socialTw: 'https://twitter.com',
      socialIn: 'https://linkedin.com'
    }
  });

  const chief2 = await prisma.chief.create({
    data: {
      name: 'Paul Hollywood',
      role: 'Artisan Bread Master',
      image: '/baking/images/team/02.jpg',
      bio: 'The authority on traditional and modern bread making.',
      biography: `
        <p>Paul's passion for bread began in his father's bakery as a teenager. Since then, he has traveled the world discovering ancient grains and fermentation methods.</p>
        <p>From baguettes to brioche, his expertise covers the entire spectrum of doughs. He encourages students to feel the dough, understanding its hydration and elasticity purely by touch.</p>
        <blockquote>"A good bread doesn't just taste good; it tells a story of fermentation, patience, and love."</blockquote>
      `,
      highlights: 'Bread Expert, TV Personality',
      skills: 'Yeast Doughs, Traditional Methods',
      socialFb: 'https://facebook.com',
      socialTw: 'https://twitter.com'
    }
  });

  const chief3 = await prisma.chief.create({
    data: {
      name: 'Dominique Ansel',
      role: 'Innovator Chef',
      image: '/baking/images/team/03.jpg',
      bio: 'Creator of world-famous hybrid pastries.',
      biography: `
        <p>Dominique is the creative genius behind some of the most viral and beloved pastries of the 21st century. His philosophy is rooted in constant innovation.</p>
        <div class="row pt-3 mb-2">
            <div class="col-md-6">
                <p>His classes focus on pushing boundaries, mixing distinct cultural flavors, and perfecting the aesthetic appeal of desserts. Students will learn the science behind baking stable, layered creations.</p>
            </div>
            <div class="col-md-6">
                <img src="/baking/images/gallery/04.jpg" alt="French Pastry" class="rounded img-fluid">
            </div>
        </div>
        <ul>
            <li>James Beard Award Winner</li>
            <li>Named Best Pastry Chef in the World (2017)</li>
        </ul>
      `,
      highlights: 'Inventor, Premium Desserts',
      skills: 'Viennoiserie, Conceptual Baking'
    }
  });

  console.log('Seeding Programs...');
  const prog1 = await prisma.program.create({
    data: {
      slug: 'mastering-french-pastry',
      title: 'Mastering French Pastry',
      category: 'Bánh Ngọt',
      description: `
        <p><strong>Mastering French Pastry</strong> is a comprehensive 8-week intensive designed to elevate your baking skills to professional standards.</p>
        <p>In this course, we will dive deep into the laminating methods for perfect croissants, the emulsion techniques for ganaches, and the precision required for delicate macarons. You will be guided step-by-step through the most notoriously difficult desserts.</p>
        <h4>Why enroll in this program?</h4>
        <p>Whether you're an ambitious home baker or an aspiring professional, our hands-on approach guarantees you will master the temperamental nature of French desserts under the personal guidance of elite chefs.</p>
        <blockquote>"The foundation of all great desserts lies in French technique."</blockquote>
      `,
      price: 45000,
      reviews: 124,
      students: 856,
      thumbnail: '/baking/images/service/01.jpg',
      chiefId: chief1.id,
      isFeatured: true,
      learningGoals: ["Understand intricate lamination", "Master macarons perfectly", "Temper chocolate", "Bake the perfect choux pastry"],
      classIncludes: ["Professional uniform provided", "Premium French ingredients", "Digital recipe book", "Global Completion certificate"],
      curriculum: [
        { title: "Week 1: Introduction to Doughs", time: "4 hours", content: "Pate brisee, pate sucree, and blind baking techniques." },
        { title: "Week 2: The Art of Choux", time: "5 hours", content: "Eclairs, cream puffs, and structurally sound croquembouche." },
        { title: "Week 3: Lamination Mastery", time: "8 hours", content: "Croissants, pain au chocolat, and puff pastry from scratch." },
        { title: "Week 4: Macarons & Meringues", time: "6 hours", content: "Italian vs French meringue, and flawless macaron shells." }
      ],
      classSessions: {
        create: [
          { startDate: new Date('2026-05-01'), endDate: new Date('2026-06-25'), enrollmentDeadline: new Date('2026-04-25'), dayOfWeek: 'Sat-Sun', timeRange: '10:00 AM - 02:00 PM' }
        ]
      }
    }
  });

  const prog2 = await prisma.program.create({
    data: {
      slug: 'artisan-sourdough-breads',
      title: 'Artisan Sourdough Breads',
      category: 'Bánh Mì',
      description: `
        <p>Unlock the secrets of wild yeast and natural fermentation in this immersive 4-week Artisan Sourdough course.</p>
        <p>We'll cover everything from capturing wild yeast to maintaining a robust starter, achieving the perfect open crumb, and scoring beautiful patterns onto your crusts.</p>
        <ul>
            <li>Understand hydration percentages.</li>
            <li>Master the stretch and fold techniques.</li>
            <li>Achieve the iconic bakery-style "ear".</li>
        </ul>
        <p>Perfect for intermediate bakers looking to transition from commercial yeast to true artisanal methods.</p>
      `,
      price: 29900,
      reviews: 89,
      students: 412,
      thumbnail: '/baking/images/service/02.jpg',
      chiefId: chief2.id,
      isFeatured: true,
      learningGoals: ["Create and maintain wild yeast starter", "Understand baker's percentages", "Score like a professional", "Manage fermentation temperatures"],
      classIncludes: ["Sourdough Starter Jar", "Banneton basket", "Scoring lame", "Detailed temperature chart"],
      curriculum: [
        { title: "Week 1: The Starter Lifecycle", time: "3 hours", content: "Creating, feeding, and storing your wild yeast." },
        { title: "Week 2: Mixing and Autolyse", time: "4 hours", content: "Gluten development without kneading." },
        { title: "Week 3: Shaping and Proofing", time: "5 hours", content: "Tension pulls, banneton usage, and retard proofing." },
        { title: "Week 4: Scoring and Baking", time: "4 hours", content: "Dutch ovens, steam injection, and perfect patterns." }
      ],
      classSessions: {
        create: [
          { startDate: new Date('2026-05-10'), endDate: new Date('2026-06-07'), enrollmentDeadline: new Date('2026-05-05'), dayOfWeek: 'Fridays', timeRange: '06:00 PM - 09:00 PM' }
        ]
      }
    }
  });

  const prog3 = await prisma.program.create({
    data: {
      slug: 'modern-cake-decorating',
      title: 'Modern Cake Decorating',
      category: 'Bánh Ngọt',
      description: `
        <p>Take your cakes from ordinary to extraordinary. This course focuses entirely on aesthetics, structure, and contemporary decorating trends.</p>
        <div class="row pt-2 mb-3">
            <div class="col-md-5">
                <img src="/baking/images/gallery/08.jpg" alt="Cake Decorating" class="rounded img-fluid">
            </div>
            <div class="col-md-7">
                <p>We explore Swiss Meringue buttercream, sharp edges, fondant wrapping, tier stacking, and realistic sugar flower craftsmanship.</p>
                <p>Designed for those who want to start their own bespoke cake business or simply impress friends and family at the next major event.</p>
            </div>
        </div>
      `,
      price: 35000,
      reviews: 215,
      students: 980,
      thumbnail: '/baking/images/service/03.jpg',
      chiefId: chief3.id,
      isFeatured: true,
      learningGoals: ["Achieve perfectly sharp buttercream edges", "Stack multi-tier cakes securely", "Craft realistic sugar flowers", "Paint and texture with edible colors"],
      classIncludes: ["Turntable", "Offset spatulas", "Edible colors set", "Dummy cakes for practice"],
      curriculum: [
        { title: "Module 1: The Perfect Canvas", time: "4 hours", content: "Crumb coating, chilling, and sharp edges." },
        { title: "Module 2: Textures & Buttercream", time: "5 hours", content: "Watercolor effects, stenciling, and fault lines." },
        { title: "Module 3: Fondant & Sculpting", time: "6 hours", content: "Seamless wrapping and basic fondant figures." },
        { title: "Module 4: Sugar Flowers", time: "6 hours", content: "Roses, peonies, and dusting techniques." }
      ],
      classSessions: {
        create: [
          { startDate: new Date('2026-06-01'), endDate: new Date('2026-06-28'), enrollmentDeadline: new Date('2026-05-20'), dayOfWeek: 'Tues-Thurs', timeRange: '05:00 PM - 08:00 PM' }
        ]
      }
    }
  });

  console.log('Seeding Posts...');
  
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  
  await prisma.post.createMany({
    data: [
      {
        slug: 'the-secret-to-a-perfect-sourdough-starter',
        title: 'The Secret to a Perfect Sourdough Starter',
        category: 'Công thức',
        type: 'BLOG',
        thumbnail: '/baking/images/gallery/02.jpg',
        authorId: admin ? admin.id : null,
        authorName: 'Admin',
        desc: 'Creating an active sourdough starter is the foundation of artisan bread baking.',
        content: `
          <h3>The Core Foundation of Artisan Bread</h3>
          <p>Creating a vibrant, active sourdough starter is the core foundation of artisan bread baking. It is a living, breathing entity that requires consistency and patience.</p>
          <img src="/baking/images/gallery/13.jpg" alt="Sourdough Starter" class="img-fluid rounded mb-4 mt-2">
          <h4>Your Step-by-Step Guide:</h4>
          <ol>
              <li><strong>Day 1:</strong> Mix 50g of whole rye flour with 50g of lukewarm water. Rest for 24 hours in a warm spot.</li>
              <li><strong>Day 2:</strong> Add 50g of all-purpose flour and 50g of water. Whisk vigorously to introduce oxygen.</li>
              <li><strong>Day 3:</strong> You should start seeing bubbles! Discard half, and feed it again with a 1:1:1 ratio (Starter:Flour:Water).</li>
          </ol>
          <blockquote>A starter is like a pet; feed it well, keep it warm, and it will reward you with glorious, naturally leavened loaves.</blockquote>
          <p>Remember that ambient temperature heavily affects the fermentation speed. In warmer climates or during summer, you may need to feed your starter twice a day to prevent it from turning overly acidic.</p>
        `,
        dateIso: new Date('2024-10-03'),
        dateString: '03 Oct, 2024'
      },
      {
        slug: '5-baking-mistakes-you-are-making',
        title: '5 Baking Mistakes You Are Probably Making',
        category: 'Mẹo vặt',
        type: 'BLOG',
        thumbnail: '/baking/images/gallery/03.jpg',
        authorId: admin ? admin.id : null,
        authorName: 'Admin',
        desc: 'Avoid these common pitfalls to instantly elevate your baking game.',
        content: `
          <h3>Why Do My Cakes Sink?</h3>
          <p>Baking is chemistry. Unlike cooking, where you can easily adapt and throw things in a pan to taste, baking requires precision and patience.</p>
          <p>Here are the 5 most common mistakes we see students make in our introductory classes:</p>
          <ul>
              <li><strong>1. Ignoring Oven Thermometers:</strong> Your oven dial lies to you. Always use an internal ambient thermometer to ensure your oven is truly at 350°F before loading your cakes.</li>
              <li><strong>2. Cold Ingredients:</strong> If a recipe calls for room temperature eggs and butter, it's not a suggestion. Cold ingredients won't emulsify, leading to dense, claggy crumb structures.</li>
              <li><strong>3. Opening the Oven Door:</strong> Opening the door to check on your sponge cake lets out critical steam and heat, causing the center to suddenly collapse.</li>
              <li><strong>4. Overmixing the Batter:</strong> Once flour is added to wet ingredients, gluten starts to form. Overmixing results in tough bread instead of tender cake.</li>
              <li><strong>5. Measuring by Volume instead of Weight:</strong> A cup of flour can weigh anywhere from 100g to 150g depending on how you scoop. Buy a digital scale!</li>
          </ul>
          <blockquote>"Precision is the quickest path to perfection."</blockquote>
        `,
        dateIso: new Date('2024-10-15'),
        dateString: '15 Oct, 2024'
      },
      {
        slug: 'history-of-the-croissant',
        title: 'The Fascinating History of the Croissant',
        category: 'Kiến thức',
        type: 'BLOG',
        thumbnail: '/baking/images/gallery/04.jpg',
        authorId: admin ? admin.id : null,
        authorName: 'Admin',
        desc: 'Discover how this iconic pastry traveled from Vienna to the heart of Paris.',
        content: `
          <h3>From Kipferl to Croissant</h3>
          <p>The story of the croissant is often shrouded in myth, but its actual history is a journey of culinary evolution. It didn't start in France, but in Austria with the <em>kipferl</em>.</p>
          <img src="/baking/images/gallery/14.jpg" alt="Croissant History" class="img-fluid rounded mb-4 mt-2">
          <p>In 1839, an Austrian artillery officer, August Zang, opened a Viennese bakery in Paris. The Parisians fell in love with his crescent-shaped pastries. Over time, French bakers replaced the heavy dough with a puff pastry technique (laminating with butter), creating the light, flaky masterpiece we know today.</p>
          <p>At YUM Saigon, we honor this heritage by using traditional slow-fermentation and premium butter, ensuring every bite takes you back to that historical transition.</p>
        `,
        dateIso: new Date('2024-11-01'),
        dateString: '01 Nov, 2024'
      },
      {
        slug: 'ultimate-guide-to-vegan-baking',
        title: 'The Ultimate Guide to Vegan Baking Substitutions',
        category: 'Kiến thức',
        type: 'BLOG',
        thumbnail: '/baking/images/gallery/05.jpg',
        authorId: admin ? admin.id : null,
        authorName: 'Admin',
        desc: 'Can you really bake without eggs and butter? Absolutely!',
        content: `
          <h3>Plant-Based Baking Mastery</h3>
          <p>The rise of veganism has challenged bakers to rethink classic chemistry. How do we achieve lift without eggs? How do we get rich flavor without butter?</p>
          <h4>Essential Substitutions:</h4>
          <ul>
              <li><strong>Flax Eggs:</strong> 1 tbsp ground flaxseed + 3 tbsp water. Perfect for binding muffins and brownies.</li>
              <li><strong>Aquafaba:</strong> The liquid from a can of chickpeas. It whips exactly like egg whites for perfect meringues.</li>
              <li><strong>Coconut Oil:</strong> A fantastic substitute for butter in pie crusts due to its high saturated fat content.</li>
          </ul>
          <p>Explore our upcoming Vegan Pastry course to see these ingredients in action!</p>
        `,
        dateIso: new Date('2024-11-20'),
        dateString: '20 Nov, 2024'
      },
      {
        slug: 'essential-equipments-for-home-baker',
        title: 'Essential Equipments Every Home Baker Needs',
        category: 'Nhà bếp',
        type: 'BLOG',
        thumbnail: '/baking/images/gallery/06.jpg',
        authorId: admin ? admin.id : null,
        authorName: 'Admin',
        desc: 'Start your baking journey right with these non-negotiable kitchen tools.',
        content: `
          <h3>Your Baking Starter Kit</h3>
          <p>Don't get overwhelmed by fancy gadgets. To produce bakery-quality results at home, you only need a few core items:</p>
          <ol>
              <li><strong>Digital Scale:</strong> In baking, 5g can change the entire result. Measuring by weight is non-negotiable.</li>
              <li><strong>Oven Thermometer:</strong> Most home ovens are off by 10-20 degrees. Knowing the true temperature is key.</li>
              <li><strong>Bench Scraper:</strong> For handling wet doughs and cleaning your workstation efficiently.</li>
              <li><strong>Cooling Racks:</strong> Proper airflow prevents the bottom of your loaves from getting soggy.</li>
          </ol>
          <p>Invest in quality over quantity, and your pastries will thank you.</p>
        `,
        dateIso: new Date('2024-12-05'),
        dateString: '05 Dec, 2024'
      }
    ]
  });

  console.log('Seeding Testimonials...');
  await prisma.testimonial.createMany({
    data: [
      {
        name: 'Anna Maria',
        role: 'Home Baker',
        excerpt: 'Gordon is an incredible teacher!',
        text: 'I never thought I could make a croissant at home until I took the Mastering French Pastry course. Gordon is an incredible teacher!',
        createdAt: new Date()
      },
      {
        name: 'James Wilson',
        role: 'Culinary Student',
        excerpt: 'Life changing course.',
        text: "The sourdough course changed my life. I finally understand the 'why' behind fermentation, not just the 'how'.",
        createdAt: new Date()
      },
      {
        name: 'Linh Nguyen',
        role: 'Pastry Enthusiast',
        excerpt: 'Start my own business.',
        text: 'Modern Cake Decorating helped me start my own small business from home. The support from the instructors is unmatched.',
        createdAt: new Date()
      }
    ]
  });

  console.log('🎉 All Data Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
