import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { prisma } from '../lib/prisma';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import donorRoutes from './routes/donorRoutes';
import donationRoutes from './routes/donationRoutes';
import bloodStockRoutes from './routes/bloodStockRoutes';
import bloodIssueRoutes from './routes/bloodIssueRoutes';
import eventRoutes from './routes/eventRoutes';
import certificateRoutes from './routes/certificateRoutes';
import accountClaimRoutes from './routes/accountClaimRoutes';
import galleryRoutes from './routes/galleryRoutes';
import aboutRoutes from './routes/aboutRoutes';
import otpRoutes from './routes/otpRoutes';
import notificationRoutes from './routes/notificationRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import bloodRequestRoutes from './routes/bloodRequestRoutes';
import geocodingRoutes from './routes/geocodingRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3001;

//
// ✅ 1. CORS (FOR BEARER TOKEN)
//
app.use(cors({
  origin: '*', // allow all
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

//
// ✅ 2. Middleware
//
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (profile pictures)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

//
// ✅ 3. Health Check
//
app.get('/health', (_, res) => {
  res.json({ status: 'ok', message: 'Server is running 🚀' });
});

//
// ✅ 4. Routes
//
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/blood-stock', bloodStockRoutes);
app.use('/api/blood-issues', bloodIssueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/account-claim', accountClaimRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/geocoding', geocodingRoutes);

// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

//
// ✅ 5. 404 Handler
//
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

//
// ✅ 6. Error Handler
//
app.use(errorHandler);

//
// ✅ 7. Graceful Shutdown
//
const shutdown = async () => {
  console.log('🔻 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

//
// ✅ 8. Start Server
//
(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running: http://localhost:${PORT}`);
      console.log(`🌐 API Base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Server failed:', err);
    process.exit(1);
  }
})();