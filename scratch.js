const prog = {"id":"dbda1e99-e9fc-458f-a908-a86da9870d14","slug":"add-111-2163","title":"Addđ111","category":"Món Âu","programType":"VIDEO_COURSE","description":null,"price":12312313,"salePrice":null,"reviews":0,"students":0,"thumbnail":null,"authorName":"","authorImage":"","learningGoals":[],"classIncludes":[],"curriculum":[],"premiumContent":null,"isFeatured":false,"createdAt":"2026-04-28T08:23:17.290Z","updatedAt":"2026-04-28T08:23:17.290Z","chiefId":null,"chief":null,"classSessions":[],"hasPurchased":false,"orderStatus":null};

const priceToDollars = (priceInCents) => {
  if (priceInCents == null) return '';
  return priceInCents.toString();
};

try {
  const formData = {
    programType: prog.programType || 'VIDEO_COURSE',
    title: prog.title || '',
    slug: prog.slug || '',
    category: prog.category || '',
    description: prog.description || '',
    price: prog.price != null ? priceToDollars(prog.price) : '',
    salePrice: prog.salePrice != null ? priceToDollars(prog.salePrice) : '',
    thumbnail: prog.thumbnail || '',
    isFeatured: prog.isFeatured || false,
    chiefId: prog.chiefId || '',
    authorName: prog.authorName || '',
    authorImage: prog.authorImage || '',
    learningGoals: Array.isArray(prog.learningGoals) ? prog.learningGoals.map(g => typeof g === 'string' ? { skill: g, percent: 50 } : g) : [],
    classIncludes: Array.isArray(prog.classIncludes) ? prog.classIncludes : [],
    curriculum: Array.isArray(prog.curriculum) ? prog.curriculum : [],
    classSessions: Array.isArray(prog.classSessions) ? prog.classSessions.map(cs => ({
      ...cs,
      startDate: cs.startDate ? new Date(cs.startDate).toISOString().slice(0, 16) : '',
      endDate: cs.endDate ? new Date(cs.endDate).toISOString().slice(0, 16) : '',
      enrollmentDeadline: cs.enrollmentDeadline ? new Date(cs.enrollmentDeadline).toISOString().slice(0, 16) : ''
    })) : [],
    students: prog.students || 0,
    reviews: prog.reviews || 0,
    premiumContent: prog.premiumContent || { videos: [], resources: [], guides: '' }
  };
  console.log("Success:", formData);
} catch (e) {
  console.error("Error:", e);
}
