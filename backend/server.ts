import dotenv from 'dotenv';
dotenv.config();

import app from './src/app';
import ensureDefaultAdmin from './src/utils/seedAdmin';

const initialPort = parseInt(process.env.PORT || '5000', 10);

function startServer(port: number) {
  const server = app.listen(port, () => {
    console.log(`🚀 Pet Shop API running on http://localhost:${port}`);
    console.log(`   Health check: http://localhost:${port}/api/health`);
    console.log(`   Default admin: ${process.env.DEFAULT_ADMIN_EMAIL || "admin@techmaster.com"}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Failed to start server:", err);
      process.exit(1);
    }
  });
}

ensureDefaultAdmin()
  .then(() => {
    startServer(initialPort);
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });

