import { Hono } from 'hono';
import { userRepository } from '../repositories/user';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';
import { RegisterSchema } from '../schemas/register';

const register = new Hono();

// POST /register - Pre-create an account (name + email + phone) ahead of
// sending the magic-link email. The client follows up with
// signIn.magicLink({ email, name }); since the user already exists by then,
// Better Auth's verify step just marks the email verified and signs them in,
// leaving the name/phone captured here untouched.
register.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const parsed = RegisterSchema.safeParse(body);

        if (!parsed.success) {
            return c.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.issues[0]?.message || 'Invalid request body'),
                400
            );
        }

        const { name, email, phone } = parsed.data;

        const existingByEmail = await userRepository.findByEmail(email);
        if (existingByEmail) {
            return c.json(
                errorResponse(ErrorCodes.ALREADY_EXISTS, 'An account with this email already exists. Sign in instead.'),
                409
            );
        }

        const existingByPhone = await userRepository.findByPhone(phone);
        if (existingByPhone) {
            return c.json(
                errorResponse(ErrorCodes.ALREADY_EXISTS, 'An account with this phone number already exists. Sign in instead.'),
                409
            );
        }

        const user = await userRepository.createWithPhone({ name, email, phone });

        return c.json(successResponse(user), 201);
    } catch (error) {
        console.error('Error registering user:', error);
        return c.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to register'),
            500
        );
    }
});

export default register;
