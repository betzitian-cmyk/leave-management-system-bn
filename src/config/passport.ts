// src/config/passport.ts

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { getRepository } from 'typeorm';
import { User, UserStatus, AuthProvider } from '../models/User';
import { Role } from '../models/Role';

export function configurePassport() {
  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const userRepository = getRepository(User);
          const user = await userRepository.findOne({
            where: { email },
            relations: ['role'],
          });

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          if (user.status !== UserStatus.ACTIVE) {
            return done(null, false, { message: 'Account is not active' });
          }

          if (!user.password) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userRepository = getRepository(User);
          const roleRepository = getRepository(Role);

          // Check if user already exists with this Google ID
          let user = await userRepository.findOne({
            where: { googleId: profile.id },
            relations: ['role'],
          });

          if (user) {
            // Update last login
            user.lastLogin = new Date();
            await userRepository.save(user);
            return done(null, user);
          }

          // Check if user exists with the same email
          user = await userRepository.findOne({
            where: { email: profile.emails?.[0]?.value },
            relations: ['role'],
          });

          if (user) {
            // Link existing user to Google account
            user.googleId = profile.id;
            user.authProvider = AuthProvider.GOOGLE;
            user.profilePicture = profile.photos?.[0]?.value;
            user.lastLogin = new Date();
            await userRepository.save(user);
            return done(null, user);
          }

          // Create new user
          const defaultRole = await roleRepository.findOne({ where: { name: 'EMPLOYEE' } });
          if (!defaultRole) {
            return done(new Error('Default role not found'));
          }

          user = userRepository.create({
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            googleId: profile.id,
            authProvider: AuthProvider.GOOGLE,
            profilePicture: profile.photos?.[0]?.value,
            status: UserStatus.ACTIVE,
            emailVerified: profile.emails?.[0]?.verified || false,
            role: defaultRole,
            roleId: defaultRole.id,
            lastLogin: new Date(),
          });

          const savedUser = await userRepository.save(user);
          return done(null, savedUser);
        } catch (error) {
          return done(error);
        }
      },
    ),
  );

  // Serialize user for the session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({
        where: { id },
        relations: ['role'],
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

export default configurePassport;
