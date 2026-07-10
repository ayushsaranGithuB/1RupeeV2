import { donationRepository } from '../repositories/donation';

export class DonationService {
    async listUserDonations(userId: string, limit = 50, offset = 0) {
        return donationRepository.findManyByUser(userId, limit, offset);
    }
}

export const donationService = new DonationService();
