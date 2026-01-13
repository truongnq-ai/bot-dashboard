import { ChangePasswordRequest } from '../../types/user';
import { ResponseObject } from '../../types/common';

/**
 * Change password
 */
export async function changePassword(
    data: ChangePasswordRequest
): Promise<ResponseObject<void>> {
    const response = await fetch('/api/auth/users/password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.errorDetail || error.message || 'Change password failed';
        throw new Error(errorMessage);
    }

    return response.json();
}
