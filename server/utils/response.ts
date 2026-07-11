import { ApiResponse } from '../types';

export function successResponse<T>(data: T): ApiResponse<T> {
    return {
        success: true,
        data,
    };
}

export function errorResponse(code: string, message: string): ApiResponse {
    return {
        success: false,
        error: {
            code,
            message,
        },
    };
}

export const ErrorCodes = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    INVALID_STATUS: 'INVALID_STATUS',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
} as const;
