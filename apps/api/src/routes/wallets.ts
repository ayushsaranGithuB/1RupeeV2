import { Hono } from 'hono';
import { walletService } from '../services/wallet';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import { WalletTopupSchema } from '../schemas/wallet';
import { AuthContext } from '../types';

const wallets = new Hono<{ Variables: { auth: AuthContext } }>();

// GET /wallets - Get user's wallet
wallets.get('/', async (c) => {
    try {
        const auth = c.get('auth');
        const wallet = await walletService.getWallet(auth.user.id);

        if (!wallet) {
            return c.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Wallet not found'),
                404
            );
        }

        return c.json(successResponse(wallet));
    } catch (error) {
        console.error('Error fetching wallet:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch wallet'),
            500
        );
    }
});

// GET /wallets/transactions - Get wallet transactions
wallets.get('/transactions', async (c) => {
    try {
        const auth = c.get('auth');
        const query = c.req.query();
        const limit = Math.min(parseInt(query.limit || '50'), 100);
        const offset = parseInt(query.offset || '0');

        const transactions = await walletService.getTransactions(auth.user.id, limit, offset);

        return c.json(successResponse(transactions));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch transactions'),
            500
        );
    }
});

// POST /wallets/topup - Add funds to wallet
wallets.post('/topup', async (c) => {
    try {
        const auth = c.get('auth');
        const body = await c.req.json();
        const parsed = WalletTopupSchema.safeParse(body);

        if (!parsed.success) {
            return c.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid request body'),
                400
            );
        }

        const wallet = await walletService.topup(auth.user.id, parsed.data);

        return c.json(successResponse(wallet));
    } catch (error) {
        console.error('Error topping up wallet:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to topup wallet'),
            500
        );
    }
});

export default wallets;
