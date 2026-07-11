import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/server/repositories/user';
import { successResponse, errorResponse, ErrorCodes } from '@/server/utils/response';
import { RegisterSchema } from '@/server/schemas/register';

export const runtime = 'nodejs';

// POST /api/register - Pre-create an account (name + email + phone) ahead of
// sending the magic-link email. The client follows up with
// signIn.magicLink({ email, name }); since the user already exists by then,
// Better Auth's verify step just marks the email verified and signs them in,
// leaving the name/phone captured here untouched.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = RegisterSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.issues[0]?.message || 'Invalid request body'),
                { status: 400 }
            );
        }

        const { name, email, phone } = parsed.data;

        const existingByEmail = await userRepository.findByEmail(email);
        if (existingByEmail) {
            return NextResponse.json(
                errorResponse(ErrorCodes.ALREADY_EXISTS, 'An account with this email already exists. Sign in instead.'),
                { status: 409 }
            );
        }

        const existingByPhone = await userRepository.findByPhone(phone);
        if (existingByPhone) {
            return NextResponse.json(
                errorResponse(ErrorCodes.ALREADY_EXISTS, 'An account with this phone number already exists. Sign in instead.'),
                { status: 409 }
            );
        }

        const user = await userRepository.createWithPhone({ name, email, phone });

        return NextResponse.json(successResponse(user), { status: 201 });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to register'),
            { status: 500 }
        );
    }
}
