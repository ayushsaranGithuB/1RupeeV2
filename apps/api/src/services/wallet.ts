import { userRepository, walletRepository } from '../repositories/user';
import { walletTransactionTypeEnum } from '@db/schema';
import { WalletTopup } from '../schemas/wallet';

export class WalletService {
    async getWallet(userId: string) {
        return walletRepository.findByUserId(userId);
    }

    async topup(userId: string, data: WalletTopup) {
        const wallet = await walletRepository.findByUserId(userId);
        if (!wallet) {
            throw new Error('WALLET_NOT_FOUND');
        }

        // In production, this would be called only from Razorpay webhook
        // Client-side payments should never directly credit wallet
        await walletRepository.addTransaction(
            wallet.id,
            'TOPUP',
            data.amount,
            'Wallet topup',
            data.reference_id
        );

        return walletRepository.findByUserId(userId);
    }

    async getBalance(userId: string): Promise<number> {
        const wallet = await walletRepository.findByUserId(userId);
        if (!wallet) {
            throw new Error('WALLET_NOT_FOUND');
        }

        const balance = await walletRepository.getBalance(wallet.id);
        return balance || 0;
    }

    async getTransactions(userId: string, limit = 50, offset = 0) {
        const wallet = await walletRepository.findByUserId(userId);
        if (!wallet) {
            throw new Error('WALLET_NOT_FOUND');
        }

        return walletRepository.getTransactions(wallet.id, limit, offset);
    }
}

export const walletService = new WalletService();
