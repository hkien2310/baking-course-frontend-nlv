const axios = require('axios');
async function run() {
  try {
    const res1 = await axios.get('http://localhost:5001/api/programs?isFeatured=true');
    console.log("isFeatured=true length:", res1.data.data ? res1.data.data.length : res1.data.length);
    const res2 = await axios.get('http://localhost:5001/api/programs?isFeatured=false');
    console.log("isFeatured=false length:", res2.data.data ? res2.data.data.length : res2.data.length);
  } catch (err) { console.error(err); }
}
run();
