import 'dotenv/config';
import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

const router = Router();

// Debug environment variables
console.log('OAuth Config:', {
  clientID: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
  callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
  frontendURL: process.env.FRONTEND_URL
});

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing required Google OAuth credentials');
}

// Google OAuth configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', { 
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          picture: profile.photos?.[0]?.value
        });

        let user = await User.findOne({ email: profile.emails?.[0]?.value });
        console.log('Existing user:', user ? 'Found' : 'Not found');

        if (!user) {
          try {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails?.[0]?.value,
              googleId: profile.id,
              picture: profile.photos?.[0]?.value,
              isGoogleUser: true,
              kpiSettings: {
                dailyTarget: 10,
                level: 'Just Looking',
                dreamCompanies: []
              },
              stats: {
                totalApplications: 0,
                applicationsThisMonth: 0,
                applicationsThisWeek: 0,
                applicationsToday: 0,
                lastApplicationDate: null
              }
            });
            console.log('New user created:', user);
          } catch (createError) {
            console.error('Error creating user:', createError);
            return done(createError as Error);
          }
        } else {
          // Update existing user with Google data
          try {
            if (!user.isGoogleUser && !user.googleId) {
              // This is a regular user trying to sign in with Google
              console.error('Regular user attempting Google sign-in:', user.email);
              return done(new Error('This email is already registered. Please sign in with your password.'));
            }

            user = await User.findOneAndUpdate(
              { email: profile.emails?.[0]?.value },
              {
                $set: {
                  name: profile.displayName,
                  googleId: profile.id,
                  picture: profile.photos?.[0]?.value,
                  isGoogleUser: true
                }
              },
              { new: true }
            );
            console.log('Updated existing user with Google data:', user);
          } catch (updateError) {
            console.error('Error updating user:', updateError);
            return done(updateError as Error);
          }
        }

        return done(undefined, user || false);
      } catch (error) {
        console.error('Google Strategy Error:', error);
        return done(error as Error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Initialize Google OAuth login
router.get(
  '/google',
  (req, res, next) => {
    console.log('Starting Google OAuth flow');
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback
router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('Received callback from Google');
    next();
  },
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    failWithError: true
  }),
  (req, res) => {
    try {
      console.log('User authenticated:', req.user);
      
      if (!req.user) {
        console.error('No user object after authentication');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not set');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_config`);
      }

      const token = jwt.sign(
        { id: (req.user as any)._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('Token generated:', token.substring(0, 20) + '...');
      console.log('Redirecting to:', `${process.env.FRONTEND_URL}/login?token=${token}`);

      // Set token in cookie as well for extra security
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Add token to both query params and hash to ensure it's accessible
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/login`);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.hash = `token=${token}`;

      console.log('Final redirect URL:', redirectUrl.toString());
      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

export default router;
