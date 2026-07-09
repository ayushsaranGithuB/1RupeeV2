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
    avatar_url: text('avatar_url'),
    role: userRoleEnum('role').notNull().default('USER'),
    status: varchar('status', { length: 50 }).notNull().default('active'), // active | suspended
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
    deleted_at: timestamp('deleted_at'),
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
    short_description: text('short_description'),
    description: text('description'),
    hero_image: text('hero_image'),
    goal_amount: integer('goal_amount'),
    raised_amount: integer('raised_amount').notNull().default(0),
    supporter_count: integer('supporter_count').notNull().default(0),
    status: campaignStatusEnum('status').notNull().default('DRAFT'),
    created_at: timestamp('created_at').notNull().defaultNow(),
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
