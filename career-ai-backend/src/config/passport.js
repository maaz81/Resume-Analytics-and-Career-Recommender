import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';


// ================= GOOGLE =================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;

                // 1️⃣ Check by oauth_id
                let user = await User.findByOAuth('google', profile.id);

                if (!user) {
                    // 2️⃣ Check by email
                    user = await User.findByEmail(email);

                    if (user) {
                        // Attach google to existing account
                        await User.attachOAuth(user.id, 'google', profile.id);
                    } else {
                        // Create new user
                        user = await User.create({
                            email,
                            fullName: profile.displayName,
                            oauthProvider: 'google',
                            oauthId: profile.id,
                        });
                    }
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }));
} else {
    console.warn('⚠️  Google OAuth not configured — GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing');
}


// ================= GITHUB =================
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;

                let user = await User.findByOAuth('github', profile.id);

                if (!user) {
                    user = await User.findByEmail(email);

                    if (user) {
                        await User.attachOAuth(user.id, 'github', profile.id);
                    } else {
                        user = await User.create({
                            email,
                            fullName: profile.displayName || profile.username,
                            oauthProvider: 'github',
                            oauthId: profile.id,
                        });
                    }
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }));
} else {
    console.warn('⚠️  GitHub OAuth not configured — GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET missing');
}

export default passport;