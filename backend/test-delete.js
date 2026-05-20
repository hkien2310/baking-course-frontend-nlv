const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const programId = "e09de7d5-c5b3-40d9-a0b5-da8288d3433f";
    
    // Test if we can find the program first
    const program = await prisma.program.findUnique({
      where: { id: programId }
    });
    
    console.log("Program found:", !!program);
    
    // Check related constraints
    if (program) {
        const enrollments = await prisma.enrollment.count({ where: { programId } });
        const orders = await prisma.order.count({ where: { orderItems: { some: { programId } } } });
        console.log("Enrollments:", enrollments);
        console.log("Orders:", orders);
        
        try {
            await prisma.program.delete({ where: { id: programId } });
            console.log("Delete successful");
        } catch(e) {
            console.error("Delete failed with code:", e.code);
            console.error(e.message);
        }
    }
    
  } catch (error) {
    console.error("Query error:", error);
  } finally {
    await prisma.$disconnect();
  }
}
run();
