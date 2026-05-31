import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../../lib/prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth credentials not configured. Google Sign-In will not work.');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
      passReqToCallback: true, // Enable access to req object
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('[GOOGLE AUTH] Processing Google profile:', profile.id, profile.displayName);
        
        // Get mode from query parameter (signup or signin)
        const mode = (req.query as any)?.mode || 'signin';
        console.log('[GOOGLE AUTH] Mode:', mode);
        
        // Extract user information from Google profile
        const email = profile.emails?.[0]?.value;
        let name = profile.displayName;
        const googleId = profile.id;

        if (!email) {
          console.error('[GOOGLE AUTH] No email found in Google profile');
          return done(new Error('No email found in Google profile'), undefined);
        }

        console.log('[GOOGLE AUTH] Looking for existing user with email:', email);

        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email },
          include: {
            donor: {
              select: {
                id: true,
                verificationStatus: true,
              },
            },
          },
        });

        if (user) {
          console.log('[GOOGLE AUTH] User found:', user.id, '- Updating Google ID if needed');
          // User exists - update Google ID if not set
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId },
              include: {
                donor: {
                  select: {
                    id: true,
                    verificationStatus: true,
                  },
                },
              },
            });
            console.log('[GOOGLE AUTH] Google ID updated for existing user');
          }
          console.log('[GOOGLE AUTH] Returning existing user');
          // Attach mode to user object for callback handler
          (user as any).authMode = mode;
          (user as any).isExistingUser = true;
          return done(null, user);
        }

        console.log('[GOOGLE AUTH] User not found - Creating new user');
        
        // User doesn't exist - create new user
        try {
          const newUser = await prisma.user.create({
            data: {
              email,
              name,
              googleId,
              phone: '', // Will be updated from sessionStorage in callback
              role: 'DONOR', // Always DONOR for new Google OAuth users
              isVerified: false, // Will be true after completing donor profile
              emailVerified: true, // Google OAuth email is pre-verified
              password: '', // No password for OAuth users
            },
          });

          console.log('[GOOGLE AUTH] ✅ New user created successfully:', newUser.id);
          console.log('[GOOGLE AUTH] User details:', {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            googleId: newUser.googleId,
            role: newUser.role,
            isVerified: newUser.isVerified,
            emailVerified: newUser.emailVerified,
          });

          // Attach mode to user object for callback handler
          (newUser as any).authMode = mode;
          (newUser as any).isExistingUser = false;
          return done(null, newUser);
        } catch (createError) {
          console.error('[GOOGLE AUTH] ❌ Failed to create new user:', createError);
          console.error('[GOOGLE AUTH] Error details:', {
            email,
            name,
            googleId,
            errorMessage: createError instanceof Error ? createError.message : 'Unknown error',
          });
          return done(createError as Error, undefined);
        }
      } catch (error) {
        console.error('[GOOGLE AUTH] Error in Google OAuth strategy:', error);
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
