import { Hono } from 'hono';
import { donationService } from '../services/donation';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import { AuthContext } from '../types';

const donationsRouter = new Hono<{ Variables: { auth: AuthContext } }>();

// GET /donations - List the current user's donation history
donationsRouter.get('/', async (c) => {
    try {
        const auth = c.get('auth');
        const query = c.req.query();
        const limit = Math.min(parseInt(query.limit || '50'), 100);
        const offset = parseInt(query.offset || '0');

        const donationsList = await donationService.listUserDonations(auth.user.id, limit, offset);

        return c.json(successResponse(donationsList));
    } catch (error) {
        console.error('Error listing donations:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to list donations'),
            500
        );
    }
});

export default donationsRouter;
