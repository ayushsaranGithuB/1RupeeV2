import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    integer,
    jsonb,
    date,
    pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN']);
export const walletTransactionTypeEnum = pgEnum('wallet_transaction_type', [
    'TOPUP',
    'DONATION',
    'REFUND',
    'ADJUSTMENT',
]);
export const campaignStatusEnum = pgEnum('campaign_status', [
    'DRAFT',
    'ACTIVE',
    'PAUSED',
    'COMPLETED',
    'ARCHIVED',
]);
export const campaignCategoryEnum = pgEnum('campaign_category', [
    'EDUCATION',
    'HEALTHCARE',
    'ANIMAL_WELFARE',
    'ENVIRONMENT',
    'HUNGER',
    'WATER_SANITATION',
]);
export const ngoStatusEnum = pgEnum('ngo_status', [
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'SUSPENDED',
]);
export const pledgeStatusEnum = pgEnum('pledge_status', [
    'ACTIVE',
    'PAUSED',
    'CANCELLED',
]);
export const payoutStatusEnum = pgEnum('payout_status', [
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
]);

// Tables
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('USER'),
    status: varchar('status', { length: 50 }).notNull().default('active'), // active | suspended
    // Better Auth managed fields. camelCase JS keys intentionally match Better
    // Auth's default field names so the Drizzle adapter maps them without extra
    // `fields` config; DB columns stay snake_case for consistency.
    emailVerified: boolean('email_verified').notNull().default(false),
    phoneNumber: varchar('phone_number', { length: 20 }).unique(),
    phoneNumberVerified: boolean('phone_number_verified').notNull().default(false),
    banned: boolean('banned').notNull().default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
});

// --- Better Auth core tables ---------------------------------------------
// Managed by Better Auth (better-auth/adapters/drizzle). JS property keys use
// camelCase to match Better Auth's expected field names; DB columns are
// snake_case. `sessions.impersonatedBy` powers the admin "log in as user"
// (impersonation) feature and is surfaced in the impersonation banner.
export const sessions = pgTable('sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    impersonatedBy: uuid('impersonated_by').references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const wallets = pgTable('wallets', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
        .notNull()
        .unique()
        .references(() => users.id),
    cached_balance: integer('cached_balance').notNull().default(0),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const wallet_transactions = pgTable('wallet_transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    wallet_id: uuid('wallet_id')
        .notNull()
        .references(() => wallets.id),
    type: walletTransactionTypeEnum('type').notNull(),
    amount: integer('amount').notNull(),
    reference_id: uuid('reference_id'),
    description: text('description'),
    created_at: timestamp('created_at').notNull().defaultNow(),
});

export const ngos = pgTable('ngos', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    logo_url: text('logo_url'),
    description: text('description'),
    website: text('website'),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    verification_status: ngoStatusEnum('verification_status')
        .notNull()
        .default('PENDING'),
    payout_account: jsonb('payout_account'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
});

export const campaigns = pgTable('campaigns', {
    id: uuid('id').primaryKey().defaultRandom(),
    ngo_id: uuid('ngo_id')
        .notNull()
        .references(() => ngos.id),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    category: campaignCategoryEnum('category'),
    description: text('description'),
    mobile_hero_image: text('mobile_hero_image'),
    desktop_hero_image: text('desktop_hero_image'),
    impact_highlights: jsonb('impact_highlights').$type<string[]>(),
    goal_amount: integer('goal_amount'),
    raised_amount: integer('raised_amount').notNull().default(0),
    supporter_count: integer('supporter_count').notNull().default(0),
    status: campaignStatusEnum('status').notNull().default('DRAFT'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
});

export const campaign_tiers = pgTable('campaign_tiers', {
    id: uuid('id').primaryKey().defaultRandom(),
    campaign_id: uuid('campaign_id')
        .notNull()
        .references(() => campaigns.id),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    impact_description: text('impact_description'),
    features: jsonb('features').$type<string[]>(),
    featured: boolean('featured').notNull().default(false),
    daily_amount: integer('daily_amount').notNull(),
    monthly_equivalent: integer('monthly_equivalent').notNull(),
    display_order: integer('display_order').notNull(),
    active: boolean('active').notNull().default(true),
});

export const pledges = pgTable('pledges', {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
        .notNull()
        .references(() => users.id),
    campaign_tier_id: uuid('campaign_tier_id')
        .notNull()
        .references(() => campaign_tiers.id),
    status: pledgeStatusEnum('status').notNull().default('ACTIVE'),
    started_at: timestamp('started_at').notNull().defaultNow(),
    paused_at: timestamp('paused_at'),
    cancelled_at: timestamp('cancelled_at'),
});

export const donations = pgTable('donations', {
    id: uuid('id').primaryKey().defaultRandom(),
    pledge_id: uuid('pledge_id')
        .notNull()
        .references(() => pledges.id),
    campaign_id: uuid('campaign_id')
        .notNull()
        .references(() => campaigns.id),
    wallet_transaction_id: uuid('wallet_transaction_id')
        .notNull()
        .references(() => wallet_transactions.id),
    amount: integer('amount').notNull(),
    donated_at: timestamp('donated_at').notNull().defaultNow(),
});

export const payouts = pgTable('payouts', {
    id: uuid('id').primaryKey().defaultRandom(),
    ngo_id: uuid('ngo_id')
        .notNull()
        .references(() => ngos.id),
    period_start: date('period_start').notNull(),
    period_end: date('period_end').notNull(),
    total_amount: integer('total_amount').notNull(),
    receipt_url: text('receipt_url'),
    status: payoutStatusEnum('status').notNull().default('PENDING'),
    completed_at: timestamp('completed_at'),
});

export const job_runs = pgTable('job_runs', {
    id: uuid('id').primaryKey().defaultRandom(),
    job_type: varchar('job_type', { length: 100 }).notNull(),
    status: varchar('status', { length: 50 }).notNull().default('RUNNING'),
    requested_by: varchar('requested_by', { length: 255 }),
    input: jsonb('input'),
    summary: jsonb('summary'),
    error_message: text('error_message'),
    started_at: timestamp('started_at').notNull().defaultNow(),
    finished_at: timestamp('finished_at'),
});

export const transparency_reports = pgTable('transparency_reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull(),
    file_url: text('file_url').notNull(),
    report_type: varchar('report_type', { length: 100 }),
    created_at: timestamp('created_at').notNull().defaultNow(),
});

export const audit_logs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    admin_id: uuid('admin_id')
        .notNull()
        .references(() => users.id),
    user_id: uuid('user_id')
        .notNull()
        .references(() => users.id),
    action: varchar('action', { length: 100 }).notNull(),
    amount: integer('amount'),
    reason: text('reason'),
    created_at: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
    wallet: one(wallets, {
        fields: [users.id],
        references: [wallets.user_id],
    }),
    pledges: many(pledges),
    audit_logs: many(audit_logs),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
    user: one(users, {
        fields: [wallets.user_id],
        references: [users.id],
    }),
    transactions: many(wallet_transactions),
}));

export const wallet_transactionsRelations = relations(
    wallet_transactions,
    ({ one }) => ({
        wallet: one(wallets, {
            fields: [wallet_transactions.wallet_id],
            references: [wallets.id],
        }),
    })
);

export const ngosRelations = relations(ngos, ({ many }) => ({
    campaigns: many(campaigns),
    payouts: many(payouts),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
    ngo: one(ngos, {
        fields: [campaigns.ngo_id],
        references: [ngos.id],
    }),
    tiers: many(campaign_tiers),
    donations: many(donations),
}));

export const campaign_tiersRelations = relations(
    campaign_tiers,
    ({ one, many }) => ({
        campaign: one(campaigns, {
            fields: [campaign_tiers.campaign_id],
            references: [campaigns.id],
        }),
        pledges: many(pledges),
    })
);

export const pledgesRelations = relations(pledges, ({ one, many }) => ({
    user: one(users, {
        fields: [pledges.user_id],
        references: [users.id],
    }),
    tier: one(campaign_tiers, {
        fields: [pledges.campaign_tier_id],
        references: [campaign_tiers.id],
    }),
    donations: many(donations),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
    pledge: one(pledges, {
        fields: [donations.pledge_id],
        references: [pledges.id],
    }),
    campaign: one(campaigns, {
        fields: [donations.campaign_id],
        references: [campaigns.id],
    }),
    transaction: one(wallet_transactions, {
        fields: [donations.wallet_transaction_id],
        references: [wallet_transactions.id],
    }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
    ngo: one(ngos, {
        fields: [payouts.ngo_id],
        references: [ngos.id],
    }),
}));

export const audit_logsRelations = relations(audit_logs, ({ one }) => ({
    admin: one(users, {
        fields: [audit_logs.admin_id],
        references: [users.id],
    }),
    user: one(users, {
        fields: [audit_logs.user_id],
        references: [users.id],
    }),
}));
