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
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// The admin that can sign in (magic link) and use the admin console. Override
// with ADMIN_EMAIL. This user is created idempotently regardless of whether the
// bulk user seed ran.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ayushsaran@gmail.com';

/**
 * Seed script for development
 *
 * Generates:
 * - 6 NGOs (one per cause area)
 * - 8 Campaigns spread across cause areas
 * - 3 support tiers per campaign
 * - 100 users
 * - Random pledges
 * - Random donations
 *
 * All monetary values are stored in paise (₹1 = 100 paise).
 *
 * Usage: bun run db/seed.ts
 */

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

type SeedTier = {
    title: string;
    impact_description: string;
    features: string[];
    featured: boolean;
    daily_amount: number; // paise per day
};

type SeedCampaign = {
    title: string;
    category:
        | 'EDUCATION'
        | 'HEALTHCARE'
        | 'ANIMAL_WELFARE'
        | 'ENVIRONMENT'
        | 'HUNGER'
        | 'WATER_SANITATION';
    description: string;
    impact_highlights: string[];
    goal_amount: number; // paise
    raised_amount: number; // paise
    supporter_count: number;
    accent: string; // hex for placeholder graphics
    tiers: SeedTier[];
};

type SeedNgo = {
    name: string;
    description: string;
    website: string;
    email: string;
    phone: string;
    campaigns: SeedCampaign[];
};

const heroImages = (accent: string, label: string) => ({
    desktop_hero_image: `https://placehold.co/1200x900/${accent}/ffffff?text=${encodeURIComponent(label)}`,
    mobile_hero_image: `https://placehold.co/720x960/${accent}/ffffff?text=${encodeURIComponent(label)}`,
});

const NGO_SEED: SeedNgo[] = [
    {
        name: 'Vidya Jyoti Foundation',
        description:
            'Vidya Jyoti Foundation runs learning centres and after-school programmes for first-generation learners across rural Rajasthan and Uttar Pradesh, keeping children in school and out of child labour.',
        website: 'https://vidyajyoti.org',
        email: 'connect@vidyajyoti.org',
        phone: '+919812003401',
        campaigns: [
            {
                title: 'Classrooms for Every Child',
                category: 'EDUCATION',
                description:
                    'Thousands of children in remote villages still study under tin sheds or in the open. This campaign builds weatherproof classrooms, supplies textbooks and mid-day learning kits, and trains local teachers so that every child has a real place to learn.',
                impact_highlights: [
                    '12,400+ children back in classrooms',
                    '38 learning centres built or repaired',
                    '210 local teachers trained and paid',
                ],
                goal_amount: 500_000_000,
                raised_amount: 324_000_000,
                supporter_count: 8420,
                accent: '2563eb',
                tiers: [
                    {
                        title: 'Daily Learner',
                        impact_description: 'Keeps one child stocked with notebooks and pencils for a month.',
                        features: ['Digital impact receipt', 'Monthly progress email', 'Supports one child'],
                        featured: false,
                        daily_amount: 100,
                    },
                    {
                        title: 'Classroom Patron',
                        impact_description: 'Sponsors a full learning kit and mid-day support for a child, every month.',
                        features: [
                            'Everything in Daily Learner',
                            'Sponsor a child directly',
                            'Photos from the classroom',
                            'Name on the supporter wall',
                        ],
                        featured: true,
                        daily_amount: 500,
                    },
                    {
                        title: 'Education Champion',
                        impact_description: 'Helps run an entire learning centre for the community.',
                        features: [
                            'Fund a learning centre',
                            'Quarterly impact report',
                            'Invitation to an annual site visit',
                        ],
                        featured: false,
                        daily_amount: 1500,
                    },
                ],
            },
            {
                title: 'Girls Who Code: Rural Digital Literacy',
                category: 'EDUCATION',
                description:
                    'In villages where girls rarely touch a computer, this programme sets up solar-powered digital labs and runs coding and basic-computing classes for adolescent girls — opening doors to jobs their mothers never had.',
                impact_highlights: [
                    '3,100 girls enrolled in digital labs',
                    '14 solar-powered computer labs live',
                    '76% of graduates pursue further study or work',
                ],
                goal_amount: 300_000_000,
                raised_amount: 118_000_000,
                supporter_count: 3110,
                accent: '7c3aed',
                tiers: [
                    {
                        title: 'Daily Ally',
                        impact_description: 'Covers a girl\'s lab time and materials for a month.',
                        features: ['Digital impact receipt', 'Monthly progress email', 'Supports one student'],
                        featured: false,
                        daily_amount: 100,
                    },
                    {
                        title: 'Lab Sponsor',
                        impact_description: 'Sponsors a girl through a full term of coding classes.',
                        features: [
                            'Everything in Daily Ally',
                            'Sponsor a student directly',
                            'Project photos from the lab',
                            'Name on the supporter wall',
                        ],
                        featured: true,
                        daily_amount: 500,
                    },
                    {
                        title: 'Digital Champion',
                        impact_description: 'Keeps a solar-powered lab running for the whole cohort.',
                        features: [
                            'Fund a digital lab',
                            'Quarterly impact report',
                            'Invitation to a demo day',
                        ],
                        featured: false,
                        daily_amount: 1500,
                    },
                ],
            },
        ],
    },
    {
        name: 'Arogya Health Mission',
        description:
            'Arogya Health Mission brings primary healthcare to communities that live hours from the nearest clinic — through mobile medical vans, trained community health workers, and maternal & newborn care programmes.',
        website: 'https://arogyahealth.org',
        email: 'care@arogyahealth.org',
        phone: '+919845567120',
        campaigns: [
            {
                title: 'Mobile Health Clinics for Remote Villages',
                category: 'HEALTHCARE',
                description:
                    'A fully-equipped medical van reaches villages with no doctor, offering free check-ups, medicines, diagnostics and referrals. This campaign fuels the vans, stocks medicines and pays the doctors and nurses on board.',
                impact_highlights: [
                    '92,000+ consultations delivered',
                    '6 mobile clinics on the road',
                    '480 villages on a monthly visit schedule',
                ],
                goal_amount: 750_000_000,
                raised_amount: 589_000_000,
                supporter_count: 12040,
                accent: 'dc2626',
                tiers: [
                    {
                        title: 'Daily Healer',
                        impact_description: 'Funds free medicines for one patient visit each month.',
                        features: ['Digital impact receipt', 'Monthly progress email', 'Supports one patient'],
                        featured: false,
                        daily_amount: 100,
                    },
                    {
                        title: 'Clinic Sponsor',
                        impact_description: 'Covers a family\'s check-ups and medicines for a month.',
                        features: [
                            'Everything in Daily Healer',
                            'Sponsor a family',
                            'Field photos from the vans',
                            'Name on the supporter wall',
                        ],
                        featured: true,
                        daily_amount: 500,
                    },
                    {
                        title: 'Health Champion',
                        impact_description: 'Helps keep a mobile clinic on the road for a village circuit.',
                        features: [
                            'Fund a village circuit',
                            'Quarterly impact report',
                            'Invitation to ride along on a clinic day',
                        ],
                        featured: false,
                        daily_amount: 1500,
                    },
                ],
            },
            {
                title: 'Newborn Survival Kits',
                category: 'HEALTHCARE',
                description:
                    'Every kit contains a clean-birth pack, warm clothing, a thermometer and essential newborn supplies for mothers delivering in under-resourced clinics — cutting preventable infant deaths in their first fragile weeks.',
                impact_highlights: [
                    '5,600 survival kits distributed',
                    '31% drop in newborn infections at partner clinics',
                    '9 district hospitals supplied monthly',
                ],
                goal_amount: 200_000_000,
                raised_amount: 76_000_000,
                supporter_count: 2530,
                accent: 'e11d48',
                tiers: [
                    {
                        title: 'Daily Guardian',
                        impact_description: 'Adds essential supplies to a newborn kit each month.',
                        features: ['Digital impact receipt', 'Monthly progress email', 'Supports one newborn'],
                        featured: false,
                        daily_amount: 100,
                    },
                    {
                        title: 'Kit Sponsor',
                        impact_description: 'Funds a complete survival kit for a newborn every month.',
                        features: [
                            'Everything in Daily Guardian',
                            'Sponsor a full kit',
                            'Photos from partner clinics',
                            'Name on the supporter wall',
                        ],
                        featured: true,
                        daily_amount: 500,
                    },
                    {
                        title: 'Newborn Champion',
                        impact_description: 'Stocks an entire clinic ward with survival kits.',
                        features: [
                            'Supply a clinic ward',
                            'Quarterly impact report',
                            'Invitation to an annual site visit',
                        ],
                        featured: false,
                        daily_amount: 1500,
                    },
                ],
            },
        ],
    },
    {
        name: 'Paws & Whiskers Trust',
        description:
            'Paws & Whiskers Trust rescues, treats and rehomes street animals, and runs mass sterilisation and anti-rabies drives to build humane, healthy cities for both animals and people.',
        website: 'https://pawsandwhiskers.org',
        email: 'rescue@pawsandwhiskers.org',
        phone: '+919920114455',
        campaigns: [
            {
                title: 'Street Dog Rescue & Sterilisation Drive',
                category: 'ANIMAL_WELFARE',
                description:
                    'This campaign funds rescue ambulances, surgeries, vaccinations and recovery care for injured and stray dogs — and humane sterilisation to control the street-dog population without culling.',
                impact_highlights: [
                    '7,900 dogs sterilised and vaccinated',
                    '1,240 injured animals rescued and treated',
                    '4 recovery shelters operating',
                ],
                goal_amount: 180_000_000,
                raised_amount: 94_500_000,
                supporter_count: 4180,
                accent: 'd97706',
                tiers: [
                    {
                        title: 'Daily Friend',
                        impact_description: 'Feeds and vaccinates one rescued animal for a month.',
                        features: ['Digital impact receipt', 'Monthly progress email', 'Supports one animal'],
                        featured: false,
                        daily_amount: 100,
                    },
                    {
                        title: 'Rescue Sponsor',
                        impact_description: 'Covers a full rescue, treatment and sterilisation for one dog.',
                        features: [
                            'Everything in Daily Friend',
                            'Sponsor a rescue',
                            'Before-and-after recovery photos',
                            'Name on the supporter wall',
                        ],
                        featured: true,
                        daily_amount: 500,
                    },
                    {
                        title: 'Shelter Champion',
                        impact_description: 'Helps run a recovery shelter for animals healing from surgery.',
                        features: [
                            'Fund a recovery shelter',
                            'Quarterly impact report',
                            'Invitation to a shelter open day',
                        ],
                        featured: false,
                        daily_amount: 1500,
                    },
                ],
            },
        ],
    },
    {
        name: 'GreenRoots India',
        description:
            'GreenRoots India restores degraded land through native-species reforestation, watershed revival and community-led conservation — working hand in hand with farmers and forest villages.',
        website: 'https://greenroots.org.in',
        email: 'grow@greenroots.org.in',
        phone: '+919701223388',
        campaigns: [
            {
                title: 'One Million Trees for the Aravallis',
                category: 'ENVIRONMENT',
                description:
                    'The Aravalli range is turning to dust. This campaign plants and protects native trees, revives dried-up water bodies and pays local families to nurture saplings through their critical first three years.',
                impact_highlights: [
                    '640,000 native saplings planted',
                    '2,300 hectares of land under restoration',
                    '87% sapling survival rate after year one',
                ],
                goal_amount: 400_000_000,
                raised_amount: 223_000_000,
                supporter_count: 6890,
                accent: '16a34a',
                tiers: [
                    {
                        title: 'Daily Grower',
                        impact_description: 'Plants and protects several native saplings each month.',
                        features: ['Digital impact receipt', 'Monthly progress email', 'Plants native trees'],
                        featured: false,
                        daily_amount: 100,
                    },
                    {
                        title: 'Grove Sponsor',
                        impact_description: 'Funds a small grove and its care through the first year.',
                        features: [
                            'Everything in Daily Grower',
                            'Sponsor a named grove',
                            'Geo-tagged photos of your trees',
                            'Name on the supporter wall',
                        ],
                        featured: true,
                        daily_amount: 500,
                    },
                    {
                        title: 'Forest Champion',
                        impact_description: 'Restores a full hectare of degraded land.',
                        features: [
                            'Restore a hectare',
                            'Quarterly impact report',
                            'Invitation to a plantation drive',
                        ],
                        featured: false,
                        daily_amount: 1500,
                    },
                ],
            },
        ],
    },
    {
        name: 'Annapurna Food Relief',
        description:
            'Annapurna Food Relief runs community kitchens and school-meal programmes so that no child studies on an empty stomach and no family goes to bed hungry during hard months.',
        website: 'https://annapurnarelief.org',
        email: 'meals@annapurnarelief.org',
        phone: '+919632447788',
        campaigns: [
            {
                title: 'Hot Meals for School Children',
                category: 'HUNGER',
                description:
                    'A hot, nutritious mid-day meal is often the reason a child comes to school — and stays. This campaign funds fresh ingredients, clean kitchens and cooks so children learn on a full stomach.',
                impact_highlights: [
                    '4.2 million meals served',
                    '620 schools covered daily',
                    '18% rise in attendance at partner schools',
                ],
                goal_amount: 600_000_000,
                raised_amount: 411_000_000,
                supporter_count: 15320,
                accent: 'ea580c',
                tiers: [
                    {
                        title: 'Daily Plate',
                        impact_description: 'Serves a hot meal to a child every school day this month.',
                        features: ['Digital impact receipt', 'Monthly progress email', 'Feeds one child'],
                        featured: false,
                        daily_amount: 100,
                    },
                    {
                        title: 'Meal Sponsor',
                        impact_description: 'Feeds a small group of children a nutritious meal each day.',
                        features: [
                            'Everything in Daily Plate',
                            'Sponsor a table of children',
                            'Photos from the kitchen',
                            'Name on the supporter wall',
                        ],
                        featured: true,
                        daily_amount: 500,
                    },
                    {
                        title: 'Kitchen Champion',
                        impact_description: 'Helps run a community kitchen serving a whole school.',
                        features: [
                            'Fund a community kitchen',
                            'Quarterly impact report',
                            'Invitation to serve a meal in person',
                        ],
                        featured: false,
                        daily_amount: 1500,
                    },
                ],
            },
        ],
    },
    {
        name: 'Jal Seva Foundation',
        description:
            'Jal Seva Foundation delivers safe drinking water and sanitation to drought-prone and water-stressed villages through wells, rainwater harvesting and hygiene education.',
        website: 'https://jalseva.org',
        email: 'water@jalseva.org',
        phone: '+919554002211',
        campaigns: [
            {
                title: 'Clean Water Wells for Drought-Hit Villages',
                category: 'WATER_SANITATION',
                description:
                    'When the nearest safe water is a two-hour walk away, everything else stops. This campaign builds and repairs wells and handpumps, installs filtration, and trains village committees to maintain them for good.',
                impact_highlights: [
                    '186,000 people with year-round safe water',
                    '142 wells built or repaired',
                    '54% fewer waterborne illnesses reported',
                ],
                goal_amount: 350_000_000,
                raised_amount: 197_000_000,
                supporter_count: 5640,
                accent: '0891b2',
                tiers: [
                    {
                        title: 'Daily Drop',
                        impact_description: 'Provides safe water to one person for a month.',
                        features: ['Digital impact receipt', 'Monthly progress email', 'Supports one person'],
                        featured: false,
                        daily_amount: 100,
                    },
                    {
                        title: 'Well Sponsor',
                        impact_description: 'Brings clean water to a family, every single day.',
                        features: [
                            'Everything in Daily Drop',
                            'Sponsor a family',
                            'Photos of the water point',
                            'Name on the supporter wall',
                        ],
                        featured: true,
                        daily_amount: 500,
                    },
                    {
                        title: 'Water Champion',
                        impact_description: 'Helps build a well that serves an entire village.',
                        features: [
                            'Fund a village well',
                            'Quarterly impact report',
                            'Invitation to a well inauguration',
                        ],
                        featured: false,
                        daily_amount: 1500,
                    },
                ],
            },
        ],
    },
];

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

        // Ensure an ADMIN exists to sign in with (idempotent).
        const existingAdmin = await db
            .select({ id: users.id, role: users.role })
            .from(users)
            .where(eq(users.email, ADMIN_EMAIL))
            .limit(1);

        if (existingAdmin.length === 0) {
            console.log(`Creating admin user ${ADMIN_EMAIL}...`);
            const adminIdNew = uuidv4();
            await db.insert(users).values({
                id: adminIdNew,
                email: ADMIN_EMAIL,
                name: '1Rupee Admin',
                role: 'ADMIN',
                status: 'active',
                emailVerified: true,
            });
            await db.insert(wallets).values({
                user_id: adminIdNew,
                cached_balance: 0,
            });
        } else if (existingAdmin[0].role !== 'ADMIN') {
            console.log(`Promoting ${ADMIN_EMAIL} to ADMIN...`);
            await db
                .update(users)
                .set({ role: 'ADMIN' })
                .where(eq(users.email, ADMIN_EMAIL));
        } else {
            console.log(`Admin ${ADMIN_EMAIL} already present.`);
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

        // Create NGOs, their campaigns, and campaign tiers from structured seed data
        if (existingNgos.length === 0) {
            const campaignCount = NGO_SEED.reduce((sum, ngo) => sum + ngo.campaigns.length, 0);
            console.log(`Creating ${NGO_SEED.length} NGOs, ${campaignCount} campaigns, and their tiers...`);

            for (const ngo of NGO_SEED) {
                const ngoId = uuidv4();
                ngoIds.push(ngoId);
                await db.insert(ngos).values({
                    id: ngoId,
                    name: ngo.name,
                    slug: slugify(ngo.name),
                    logo_url: `https://placehold.co/200?text=${encodeURIComponent(ngo.name)}`,
                    description: ngo.description,
                    website: ngo.website,
                    email: ngo.email,
                    phone: ngo.phone,
                    verification_status: 'VERIFIED',
                });

                for (const campaign of ngo.campaigns) {
                    const campaignId = uuidv4();
                    campaignIds.push(campaignId);
                    await db.insert(campaigns).values({
                        id: campaignId,
                        ngo_id: ngoId,
                        title: campaign.title,
                        slug: slugify(campaign.title),
                        category: campaign.category,
                        description: campaign.description,
                        ...heroImages(campaign.accent, campaign.title),
                        impact_highlights: campaign.impact_highlights,
                        goal_amount: campaign.goal_amount,
                        raised_amount: campaign.raised_amount,
                        supporter_count: campaign.supporter_count,
                        status: 'ACTIVE',
                    });

                    for (let i = 0; i < campaign.tiers.length; i++) {
                        const tier = campaign.tiers[i];
                        const [insertedTier] = await db.insert(campaign_tiers).values({
                            campaign_id: campaignId,
                            title: tier.title,
                            impact_description: tier.impact_description,
                            features: tier.features,
                            featured: tier.featured,
                            daily_amount: tier.daily_amount,
                            monthly_equivalent: tier.daily_amount * 30,
                            display_order: i + 1,
                            active: true,
                        }).returning({ id: campaign_tiers.id });

                        if (insertedTier?.id) {
                            tierIds.push(insertedTier.id);
                        }
                    }
                }
            }
        } else {
            console.log(`Skipping NGO/campaign/tier seed, found ${existingNgos.length} existing NGOs.`);
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
