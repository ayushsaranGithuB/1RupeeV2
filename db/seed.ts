import { getDb, closeDb } from './index';
import {
    users,
    wallets,
    wallet_transactions,
    ngos,
    campaigns,
    campaign_tiers,
    pledges,
    donations,
    payouts,
    audit_logs,
    transparency_reports,
} from './schema';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed script for development
 * 
 * Generates:
 * - 10 NGOs
 * - 20 Campaigns (2 per NGO)
 * - 4 tiers per campaign
 * - 100 users
 * - Random pledges
 * - Random donations
 * 
 * Usage: bun run db/seed.ts
 */

async function seed() {
    try {
        const db = getDb();
        console.log('🌱 Starting seed...');

        const [existingUsers, existingWallets, existingNgos, existingCampaigns, existingTiers, existingPledges, existingWalletTransactions, existingDonations, existingPayouts, existingAuditLogs, existingTransparencyReports] = await Promise.all([
            db.select({ id: users.id }).from(users),
            db.select({ id: wallets.id, user_id: wallets.user_id }).from(wallets),
            db.select({ id: ngos.id }).from(ngos),
            db.select({ id: campaigns.id }).from(campaigns),
            db.select({ id: campaign_tiers.id, campaign_id: campaign_tiers.campaign_id, daily_amount: campaign_tiers.daily_amount }).from(campaign_tiers),
            db.select({ id: pledges.id, user_id: pledges.user_id, campaign_tier_id: pledges.campaign_tier_id }).from(pledges),
            db.select({ id: wallet_transactions.id, wallet_id: wallet_transactions.wallet_id }).from(wallet_transactions),
            db.select({ id: donations.id }).from(donations),
            db.select({ id: payouts.id }).from(payouts),
            db.select({ id: audit_logs.id }).from(audit_logs),
            db.select({ id: transparency_reports.id }).from(transparency_reports),
        ]);

        const userIds: string[] = existingUsers.map((user) => user.id);
        const walletIds: string[] = existingWallets.map((wallet) => wallet.id);
        const ngoIds: string[] = existingNgos.map((ngo) => ngo.id);
        const campaignIds: string[] = existingCampaigns.map((campaign) => campaign.id);
        const tierIds: string[] = existingTiers.map((tier) => tier.id);
        const pledgeIds: string[] = existingPledges.map((pledge) => pledge.id);
        const walletTransactionIds: string[] = existingWalletTransactions.map((transaction) => transaction.id);
        const donationIds: string[] = existingDonations.map((donation) => donation.id);
        const payoutIds: string[] = existingPayouts.map((payout) => payout.id);
        const auditLogIds: string[] = existingAuditLogs.map((auditLog) => auditLog.id);
        const transparencyReportIds: string[] = existingTransparencyReports.map((report) => report.id);

        // Create users
        if (existingUsers.length === 0) {
            console.log('Creating 100 users...');
            for (let i = 0; i < 100; i++) {
                const id = uuidv4();
                userIds.push(id);
                await db.insert(users).values({
                    id,
                    email: `user${i + 1}@1rupee.test`,
                    name: `Test User ${i + 1}`,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
                    role: 'USER',
                    status: 'active',
                });
            }
        } else {
            console.log(`Skipping users seed, found ${existingUsers.length} existing rows.`);
        }

        // Create wallets for each user
        if (existingWallets.length === 0) {
            console.log('Creating wallets...');
            for (const userId of userIds) {
                const balance = Math.floor(Math.random() * 50000) + 1000; // 1000-51000 paise
                const [wallet] = await db.insert(wallets).values({
                    user_id: userId,
                    cached_balance: balance,
                }).returning({ id: wallets.id });

                if (wallet?.id) {
                    walletIds.push(wallet.id);
                }
            }
        } else {
            console.log(`Skipping wallets seed, found ${existingWallets.length} existing rows.`);
        }

        // Create NGOs
        if (existingNgos.length === 0) {
            console.log('Creating 10 NGOs...');
            const ngoNames = [
                'Care India',
                'Teach for India',
                'World Vision',
                'Smile Foundation',
                'CRY',
                'IMDR',
                'IGSSS',
                'Save the Children',
                'Akshaya Patra',
                'Naandi Foundation',
            ];

            for (let i = 0; i < 10; i++) {
                const id = uuidv4();
                ngoIds.push(id);
                await db.insert(ngos).values({
                    id,
                    name: ngoNames[i],
                    slug: ngoNames[i].toLowerCase().replace(/\s+/g, '-'),
                    logo_url: `https://placehold.co/200?text=${ngoNames[i]}`,
                    description: `${ngoNames[i]} is working towards creating positive change in society.`,
                    website: `https://${ngoNames[i].toLowerCase().replace(/\s+/g, '')}.org`,
                    email: `hello@${ngoNames[i].toLowerCase().replace(/\s+/g, '')}.org`,
                    phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                    verification_status: 'VERIFIED',
                });
            }
        } else {
            console.log(`Skipping NGOs seed, found ${existingNgos.length} existing rows.`);
        }

        // Create campaigns
        if (existingCampaigns.length === 0) {
            console.log('Creating 20 campaigns...');
            const campaignTitles = [
                'Education for Rural Children',
                'Health Camps in Remote Areas',
                'Clean Water Initiative',
                'Women Empowerment Program',
                'Disaster Relief Fund',
            ];

            for (let i = 0; i < 20; i++) {
                const id = uuidv4();
                campaignIds.push(id);
                const ngoIndex = Math.floor(i / 2); // 2 campaigns per NGO
                await db.insert(campaigns).values({
                    id,
                    ngo_id: ngoIds[ngoIndex],
                    title: `${campaignTitles[i % 5]} ${i + 1}`,
                    slug: `campaign-${i + 1}`.toLowerCase(),
                    short_description: 'Making a difference one donation at a time',
                    description: 'This campaign aims to create lasting positive impact in the community.',
                    hero_image: `https://placehold.co/800x400?text=Campaign+${i + 1}`,
                    mobile_hero_image: `https://placehold.co/720x960?text=Campaign+${i + 1}+Mobile`,
                    tablet_hero_image: `https://placehold.co/1500x900?text=Campaign+${i + 1}+Tablet`,
                    desktop_hero_image: `https://placehold.co/1800x600?text=Campaign+${i + 1}+Desktop`,
                    goal_amount: Math.floor(Math.random() * 1000000) + 100000,
                    status: 'ACTIVE',
                });
            }
        } else {
            console.log(`Skipping campaigns seed, found ${existingCampaigns.length} existing rows.`);
        }

        // Create campaign tiers
        if (existingTiers.length === 0) {
            console.log('Creating campaign tiers...');
            const tierConfigs = [
                { title: 'Daily Supporter', daily: 100, monthly: 3000, impact: 'Help sustain the cause.' },
                { title: 'Impact Supporter', daily: 500, monthly: 15000, impact: 'Provide resources for one child.' },
                { title: 'Champion', daily: 1000, monthly: 30000, impact: 'Fund a classroom or program.' },
                { title: 'Major Donor', daily: 5000, monthly: 150000, impact: 'Transform a community.' },
            ];

            for (const campaignId of campaignIds) {
                for (let i = 0; i < tierConfigs.length; i++) {
                    const tier = tierConfigs[i];
                    await db.insert(campaign_tiers).values({
                        campaign_id: campaignId,
                        title: tier.title,
                        impact_description: tier.impact,
                        daily_amount: tier.daily,
                        monthly_equivalent: tier.monthly,
                        display_order: i + 1,
                        active: true,
                    });
                }
            }
        } else {
            console.log(`Skipping campaign tiers seed, found ${existingTiers.length} existing rows.`);
        }

        if (existingWalletTransactions.length === 0 && walletIds.length > 0) {
            console.log('Creating wallet transactions...');
            for (let i = 0; i < walletIds.length; i++) {
                const amount = 1000 + (i * 250);
                const type = i % 2 === 0 ? 'TOPUP' : 'ADJUSTMENT';
                const [transaction] = await db.insert(wallet_transactions).values({
                    wallet_id: walletIds[i],
                    type,
                    amount,
                    description: type === 'TOPUP' ? 'Seed wallet top-up' : 'Seed balance adjustment',
                }).returning({ id: wallet_transactions.id });

                if (transaction?.id) {
                    walletTransactionIds.push(transaction.id);
                }
            }
        } else {
            console.log(`Skipping wallet transactions seed, found ${existingWalletTransactions.length} existing rows.`);
        }

        if (existingPledges.length === 0 && userIds.length > 0 && tierIds.length > 0) {
            console.log('Creating pledges...');
            const pledgeCount = Math.min(20, userIds.length, tierIds.length);
            for (let i = 0; i < pledgeCount; i++) {
                const [pledge] = await db.insert(pledges).values({
                    user_id: userIds[i],
                    campaign_tier_id: tierIds[i],
                    status: 'ACTIVE',
                }).returning({ id: pledges.id });

                if (pledge?.id) {
                    pledgeIds.push(pledge.id);
                }
            }
        } else {
            console.log(`Skipping pledges seed, found ${existingPledges.length} existing rows.`);
        }

        if (existingDonations.length === 0 && pledgeIds.length > 0 && campaignIds.length > 0 && walletTransactionIds.length > 0) {
            console.log('Creating donations...');
            const donationCount = Math.min(20, pledgeIds.length, walletTransactionIds.length);
            for (let i = 0; i < donationCount; i++) {
                const [donation] = await db.insert(donations).values({
                    pledge_id: pledgeIds[i],
                    campaign_id: campaignIds[i % campaignIds.length],
                    wallet_transaction_id: walletTransactionIds[i],
                    amount: 1000 + (i * 250),
                }).returning({ id: donations.id });

                if (donation?.id) {
                    donationIds.push(donation.id);
                }
            }
        } else {
            console.log(`Skipping donations seed, found ${existingDonations.length} existing rows.`);
        }

        if (existingPayouts.length === 0 && ngoIds.length > 0) {
            console.log('Creating payouts...');
            for (let i = 0; i < ngoIds.length; i++) {
                const month = String((i % 12) + 1).padStart(2, '0');
                const [payout] = await db.insert(payouts).values({
                    ngo_id: ngoIds[i],
                    period_start: `2026-${month}-01`,
                    period_end: `2026-${month}-28`,
                    total_amount: 25000 + (i * 5000),
                    receipt_url: `https://example.com/receipts/payout-${i + 1}.pdf`,
                    status: i % 2 === 0 ? 'PENDING' : 'PROCESSING',
                }).returning({ id: payouts.id });

                if (payout?.id) {
                    payoutIds.push(payout.id);
                }
            }
        } else {
            console.log(`Skipping payouts seed, found ${existingPayouts.length} existing rows.`);
        }

        if (existingAuditLogs.length === 0 && userIds.length > 1) {
            console.log('Creating audit logs...');
            const adminId = userIds[0];
            for (let i = 1; i < Math.min(11, userIds.length); i++) {
                const [auditLog] = await db.insert(audit_logs).values({
                    admin_id: adminId,
                    user_id: userIds[i],
                    action: i % 2 === 0 ? 'USER_STATUS_UPDATE' : 'WALLET_ADJUSTMENT',
                    amount: i % 2 === 0 ? null : 1000 + (i * 100),
                    reason: i % 2 === 0 ? 'Seeded admin review action' : 'Seeded wallet adjustment',
                }).returning({ id: audit_logs.id });

                if (auditLog?.id) {
                    auditLogIds.push(auditLog.id);
                }
            }
        } else {
            console.log(`Skipping audit logs seed, found ${existingAuditLogs.length} existing rows.`);
        }

        if (existingTransparencyReports.length === 0) {
            console.log('Creating transparency reports...');
            const reports = [
                {
                    title: 'FY 2025 Transparency Report',
                    file_url: 'https://example.com/reports/fy-2025-transparency.pdf',
                    report_type: 'ANNUAL',
                },
                {
                    title: 'Q1 2026 Financial Snapshot',
                    file_url: 'https://example.com/reports/q1-2026-snapshot.pdf',
                    report_type: 'QUARTERLY',
                },
                {
                    title: 'Platform Audit Summary',
                    file_url: 'https://example.com/reports/platform-audit-summary.pdf',
                    report_type: 'AUDIT',
                },
            ];

            for (const report of reports) {
                const [transparencyReport] = await db.insert(transparency_reports).values(report).returning({ id: transparency_reports.id });

                if (transparencyReport?.id) {
                    transparencyReportIds.push(transparencyReport.id);
                }
            }
        } else {
            console.log(`Skipping transparency reports seed, found ${existingTransparencyReports.length} existing rows.`);
        }

        console.log('✅ Seed completed successfully!');
        console.log(`Created:`);
        console.log(`- users: ${userIds.length}`);
        console.log(`- wallets: ${walletIds.length}`);
        console.log(`- NGOs: ${ngoIds.length}`);
        console.log(`- campaigns: ${campaignIds.length}`);
        console.log(`- campaign tiers: ${tierIds.length}`);
        console.log(`- wallet transactions: ${walletTransactionIds.length}`);
        console.log(`- pledges: ${pledgeIds.length}`);
        console.log(`- donations: ${donationIds.length}`);
        console.log(`- payouts: ${payoutIds.length}`);
        console.log(`- audit logs: ${auditLogIds.length}`);
        console.log(`- transparency reports: ${transparencyReportIds.length}`);

        await closeDb();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        await closeDb();
        process.exit(1);
    }
}

seed();
