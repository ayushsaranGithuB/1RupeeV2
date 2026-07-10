import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, magicLink, phoneNumber } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import {
    adminAc,
    defaultStatements,
    userAc,
} from 'better-auth/plugins/admin/access';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getDb, getDatabaseUrl } from '@db';
import * as schema from '@db/schema';
import { users, sessions, accounts, verifications, audit_logs } from '@db/schema';
import { sendEmail, sendSms } from './senders';

// Dedicated schema-aware Drizzle instance for Better Auth. The shared getDb()
// is created without a schema, so its relational query API (db.query) is empty;
// the Better Auth Drizzle adapter needs the schema to resolve models/relations.
// getDatabaseUrl() also reads .env.local as a fallback (e.g. under `bun test`).
const authDb = drizzle(postgres(getDatabaseUrl(), { max: 5 }), { schema });

// Our user roles are the uppercase enum values USER/ADMIN. The admin plugin's
// permission checks look up roles by exact key in the access-control map (the
// built-in defaults are keyed lowercase), so we register roles under our enum
// keys using the plugin's default permission statements.
const ac = createAccessControl(defaultStatements);
const roles = {
    ADMIN: ac.newRole(adminAc.statements),
    USER: ac.newRole(userAc.statements),
};

const isProd = process.env.NODE_ENV === 'production';

// Dev-only fixed phone OTP so the flow can be tested without an SMS provider.
// Swap `verifyOTP`/`sendOTP` for a real provider (MSG91/Twilio) in production.
const DEV_PHONE_OTP = process.env.DEV_PHONE_OTP || '0000';

const WEB_URL = process.env.WEB_URL || 'http://localhost:8080';

const trustedOrigins = [
    WEB_URL,
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
];

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || 'dev-insecure-secret-change-me',
    baseURL: process.env.BETTER_AUTH_URL || 'http://127.0.0.1:3001',
    basePath: '/auth',
    trustedOrigins,
    database: drizzleAdapter(authDb, {
        provider: 'pg',
        // Map Better Auth's singular core model names to our (plural) tables.
        schema: {
            user: users,
            session: sessions,
            account: accounts,
            verification: verifications,
        },
    }),
    // Let Postgres generate the UUIDs (gen_random_uuid / defaultRandom) so the
    // ids continue to match every existing foreign key into `users`.
    advanced: {
        database: { generateId: false },
    },
    // Passwordless only.
    emailAndPassword: { enabled: false },
    user: {
        // Model→table is set via the adapter `schema` mapping above. Here we
        // only remap the logical fields whose columns are snake_case.
        // (emailVerified/phoneNumber/banned/... already match via camelCase JS keys.)
        fields: {
            image: 'avatar_url',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, token }) => {
                // Point the link at a WEB verify page that completes sign-in via
                // the auth client (JSON, no redirect) so the session cookie is
                // set first-party to the web origin the browser actually uses.
                const link = `${WEB_URL}/auth/verify?token=${token}`;
                await sendEmail({
                    to: email,
                    subject: 'Your 1Rupee sign-in link',
                    text: `Tap to sign in to 1Rupee:\n${link}\n\nThis link expires shortly. If you didn't request it, you can ignore this email.`,
                });
            },
        }),
        phoneNumber({
            otpLength: 4,
            sendOTP: async ({ phoneNumber: phone, code }) => {
                // In dev we always accept DEV_PHONE_OTP, so surface that value.
                await sendSms({
                    to: phone,
                    text: `Your 1Rupee verification code is ${isProd ? code : DEV_PHONE_OTP}`,
                });
            },
            // Dev shortcut: any phone verifies with the fixed OTP. In production
            // this is undefined, so Better Auth's real OTP verification is used.
            verifyOTP: isProd
                ? undefined
                : async ({ code }) => code === DEV_PHONE_OTP,
            signUpOnVerification: {
                getTempEmail: (phone) => `${phone}@phone.1rupee.local`,
                getTempName: (phone) => phone,
            },
        }),
        admin({
            // Our role enum is USER/ADMIN (uppercase); tell the plugin which
            // role(s) count as admin, what to assign new users, and the
            // access-control map so permission checks resolve our roles.
            ac,
            roles,
            adminRoles: ['ADMIN'],
            defaultRole: 'USER',
            // Impersonation sessions auto-expire after 30 minutes.
            impersonationSessionDuration: 60 * 30,
        }),
    ],
    databaseHooks: {
        session: {
            create: {
                // Audit every impersonation ("log in as user") start. The admin
                // plugin sets `impersonatedBy` on the new session when an admin
                // impersonates a user.
                after: async (session) => {
                    const impersonatedBy = (session as { impersonatedBy?: string | null })
                        .impersonatedBy;
                    if (!impersonatedBy) {
                        return;
                    }
                    try {
                        const db = getDb();
                        await db.insert(audit_logs).values({
                            admin_id: impersonatedBy,
                            user_id: session.userId,
                            action: 'IMPERSONATE_START',
                            reason: 'Admin impersonation session started',
                        });
                    } catch (error) {
                        console.error('Failed to write impersonation audit log:', error);
                    }
                },
            },
        },
    },
});

export type Auth = typeof auth;
