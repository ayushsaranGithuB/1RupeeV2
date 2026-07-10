import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response';

describe('Response utilities', () => {
    describe('successResponse', () => {
        it('should create a success response', () => {
            const data = { id: '123', name: 'Test' };
            const response = successResponse(data);

            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.data).toEqual(data);
            }
        });
    });

    describe('errorResponse', () => {
        it('should create an error response', () => {
            const response = errorResponse(ErrorCodes.NOT_FOUND, 'Resource not found');

            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error.code).toBe(ErrorCodes.NOT_FOUND);
                expect(response.error.message).toBe('Resource not found');
            }
        });
    });

    describe('ErrorCodes', () => {
        it('should have all required error codes', () => {
            expect(ErrorCodes.UNAUTHORIZED).toBeDefined();
            expect(ErrorCodes.FORBIDDEN).toBeDefined();
            expect(ErrorCodes.NOT_FOUND).toBeDefined();
            expect(ErrorCodes.VALIDATION_ERROR).toBeDefined();
            expect(ErrorCodes.INTERNAL_ERROR).toBeDefined();
            expect(ErrorCodes.INSUFFICIENT_BALANCE).toBeDefined();
        });
    });
});
