import { getDb } from '@db';
import { users, wallets, wallet_transactions } from '@db/schema';
import { eq, and, isNull, desc, like, ilike } from 'drizzle-orm';
import { ApiUser, ApiWallet } from '../types';

export class UserRepository {
    async findById(id: string): Promise<ApiUser | null> {
        const db = getDb();
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return (result[0] as any) || null;
    }

    async findByEmail(email: string): Promise<ApiUser | null> {
        const db = getDb();
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return (result[0] as any) || null;
    }

    async search(
        email?: string,
        name?: string,
        status?: string,
        limit: number = 20,
        offset: number = 0
    ): Promise<{ users: ApiUser[]; total: number }> {
        const db = getDb();
        const conditions: any[] = [];

        if (email) {
            conditions.push(ilike(users.email, `%${email}%`));
        }
        if (name) {
            conditions.push(ilike(users.name, `%${name}%`));
        }
        if (status) {
            conditions.push(eq(users.status, status as any));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get paginated results
        const results = await db
            .select()
            .from(users)
            .where(whereClause)
            .limit(limit)
            .offset(offset);

        // Get total count - fetch all matching records to count
        const allResults = await db
            .select()
            .from(users)
            .where(whereClause);

        const total = allResults.length;

        return {
            users: (results as any[]) || [],
            total,
        };
    }
}

export class WalletRepository {
    async findByUserId(userId: string): Promise<ApiWallet | null> {
        const db = getDb();
        const result = await db.select().from(wallets).where(eq(wallets.user_id, userId)).limit(1);
        return (result[0] as any) || null;
    }

    async addTransaction(
        walletId: string,
        type: 'TOPUP' | 'DONATION' | 'REFUND' | 'ADJUSTMENT',
        amount: number,
        description: string,
        referenceId?: string | null
    ): Promise<void> {
        const db = getDb();

        // Add transaction (immutable ledger)
        await db.insert(wallet_transactions).values({
            id: crypto.randomUUID(),
            wallet_id: walletId,
            type: type as any,
            amount,
            reference_id: referenceId || null,
            description,
        });

        // Update cached balance
        const wallet = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
        if (wallet[0]) {
            const currentBalance = (wallet[0] as any).cached_balance;
            await db.update(wallets)
                .set({
                    cached_balance: currentBalance + amount,
                    updated_at: new Date(),
                })
                .where(eq(wallets.id, walletId));
        }
    }

    async getBalance(walletId: string): Promise<number | null> {
        const db = getDb();
        const result = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
        return (result[0] as any)?.cached_balance || null;
    }

    async getTransactions(walletId: string, limit = 50, offset = 0) {
        const db = getDb();
        return db.select()
            .from(wallet_transactions)
            .where(eq(wallet_transactions.wallet_id, walletId))
            .orderBy(desc(wallet_transactions.created_at))
            .limit(limit)
            .offset(offset);
    }
}
export const userRepository = new UserRepository();
export const walletRepository = new WalletRepository();