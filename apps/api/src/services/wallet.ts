import { userRepository, walletRepository } from '../repositories/user';
import { walletTransactionTypeEnum } from '@db/schema';
import { WalletTopup } from '../schemas/wallet';

export class WalletService {
    async getWallet(userId: string) {
        return walletRepository.findByUserId(userId);
    }

    async topup(userId: string, data: WalletTopup) {
        return this.creditWallet(userId, data, 'Wallet topup');
    }

    async topupFromWebhook(userId: string, data: WalletTopup, paymentReference: string) {
        return this.creditWallet(userId, data, `Wallet topup via webhook (${paymentReference})`);
    }

    private async creditWallet(userId: string, data: WalletTopup, description: string) {
        const wallet = await walletRepository.findByUserId(userId);
        if (!wallet) {
            throw new Error('WALLET_NOT_FOUND');
        }

        await walletRepository.addTransaction(
            wallet.id,
            'TOPUP',
            data.amount,
            description,
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
