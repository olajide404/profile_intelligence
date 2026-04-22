require('dotenv').config();
const { connectDB } = require('./src/db');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();
    console.log('✅ PostgreSQL connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
}

start();