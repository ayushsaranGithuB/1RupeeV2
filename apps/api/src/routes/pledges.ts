import { Hono } from 'hono';
import { pledgeService } from '../services/pledge';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import { CreatePledgeSchema, UpdatePledgeStatusSchema } from '../schemas/pledge';
import { AuthContext } from '../types';

const pledges = new Hono<{ Variables: { auth: AuthContext } }>();

// GET /pledges - List user's pledges
pledges.get('/', async (c) => {
    try {
        const auth = c.get('auth');
        const status = c.req.query('status');

        const result = await pledgeService.listUserPledges(auth.user.id, status);

        return c.json(successResponse(result));
    } catch (error) {
        console.error('Error listing pledges:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to list pledges'),
            500
        );
    }
});

// POST /pledges - Create a pledge
pledges.post('/', async (c) => {
    try {
        const auth = c.get('auth');
        const body = await c.req.json();
        const parsed = CreatePledgeSchema.safeParse(body);

        if (!parsed.success) {
            return c.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid request body'),
                400
            );
        }

        const pledge = await pledgeService.createPledge(auth.user.id, parsed.data);

        return c.json(successResponse(pledge), 201);
    } catch (error: any) {
        if (error.message === 'PLEDGE_ALREADY_EXISTS') {
            return c.json(
                errorResponse(ErrorCodes.INVALID_STATUS, 'You already pledged to this tier'),
                409
            );
        }

        console.error('Error creating pledge:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to create pledge'),
            500
        );
    }
});

// PATCH /pledges/:id - Update pledge status
pledges.patch('/:id', async (c) => {
    try {
        const auth = c.get('auth');
        const id = c.req.param('id');
        const body = await c.req.json();
        const parsed = UpdatePledgeStatusSchema.safeParse(body);

        if (!parsed.success) {
            return c.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, 'Invalid request body'),
                400
            );
        }

        const pledge = await pledgeService.updatePledge(id, auth.user.id, parsed.data);

        if (!pledge) {
            return c.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Pledge not found'),
                404
            );
        }

        return c.json(successResponse(pledge));
    } catch (error: any) {
        if (error.message === 'PLEDGE_NOT_FOUND') {
            return c.json(
                errorResponse(ErrorCodes.NOT_FOUND, 'Pledge not found'),
                404
            );
        }

        console.error('Error updating pledge:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to update pledge'),
            500
        );
    }
});

export default pledges;
