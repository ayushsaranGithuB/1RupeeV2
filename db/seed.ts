import { getDb } from '../index';
import {
    users,
    wallets,
    ngos,
    campaigns,
    campaign_tiers,
    pledges,
    donations,
} from '../schema';
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

        // Create users
        console.log('Creating 100 users...');
        const userIds: string[] = [];
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

        // Create wallets for each user
        console.log('Creating wallets...');
        for (const userId of userIds) {
            const balance = Math.floor(Math.random() * 50000) + 1000; // 1000-51000 paise
            await db.insert(wallets).values({
                user_id: userId,
                cached_balance: balance,
            });
        }

        // Create NGOs
        console.log('Creating 10 NGOs...');
        const ngoIds: string[] = [];
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
                logo_url: `https://via.placeholder.com/200?text=${ngoNames[i]}`,
                description: `${ngoNames[i]} is working towards creating positive change in society.`,
                website: `https://${ngoNames[i].toLowerCase().replace(/\s+/g, '')}.org`,
                email: `hello@${ngoNames[i].toLowerCase().replace(/\s+/g, '')}.org`,
                phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                verification_status: 'VERIFIED',
            });
        }

        // Create campaigns
        console.log('Creating 20 campaigns...');
        const campaignIds: string[] = [];
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
                hero_image: `https://via.placeholder.com/800x400?text=Campaign+${i + 1}`,
                goal_amount: Math.floor(Math.random() * 1000000) + 100000,
                status: 'ACTIVE',
            });
        }

        // Create campaign tiers
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

        console.log('✅ Seed completed successfully!');
        console.log(`Created:`);
        console.log(`- 100 users`);
        console.log(`- 10 NGOs`);
        console.log(`- 20 campaigns`);
        console.log(`- 80 campaign tiers (4 per campaign)`);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seed();
