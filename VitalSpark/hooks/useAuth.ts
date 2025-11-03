import { supabase, getRedirectUri } from '../utils/supabase';

// ===========================
// Type Definitions
// ===========================

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignUpCredentials {
    email: string;
    password: string;
    fullName?: string;
}

export interface ResetPasswordRequest {
    email: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

export interface ApiError {
    message: string;
    code?: string;
    statusCode?: number;
}

// ===========================
// Authentication Handler
// ===========================

class Auth {
    private handleError(error: any): ApiError {
        if (error?.message) {
            return {
                message: error.message,
                code: error.code || error.status_code,
                statusCode: error.status || 500,
            };
        }
        return {
            message: 'An unexpected error occurred. Please try again.',
            statusCode: 500,
        };
    }

    // ===========================
    // Authentication Methods
    // ===========================

    async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const { email, password } = credentials;

            if (!email.trim() || !password.trim()) {
                return {
                    success: false,
                    message: 'Email and password are required.',
                    error: 'MISSING_CREDENTIALS',
                };
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                const apiError = this.handleError(error);
                return {
                    success: false,
                    message: this.getFriendlyErrorMessage(apiError.message),
                    error: apiError.code || 'SIGN_IN_ERROR',
                };
            }

            if (!data.user || !data.session) {
                return {
                    success: false,
                    message: 'Authentication failed. Please try again.',
                    error: 'NO_SESSION',
                };
            }

            return {
                success: true,
                message: 'Successfully signed in.',
                data: {
                    user: data.user,
                    session: data.session,
                },
            };
        } catch (error: any) {
            const apiError = this.handleError(error);
            return {
                success: false,
                message: apiError.message,
                error: apiError.code || 'UNEXPECTED_ERROR',
            };
        }
    }

    async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
        try {
            const { email, password, fullName } = credentials;

            if (!email.trim() || !password.trim()) {
                return {
                    success: false,
                    message: 'Email and password are required.',
                    error: 'MISSING_CREDENTIALS',
                };
            }

            // Get redirect URI for email confirmation deep linking
            const redirectTo = getRedirectUri();

            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    emailRedirectTo: redirectTo,
                    data: {
                        full_name: fullName || '',
                    },
                },
            });

            if (error) {
                const apiError = this.handleError(error);
                return {
                    success: false,
                    message: this.getFriendlyErrorMessage(apiError.message),
                    error: apiError.code || 'SIGN_UP_ERROR',
                };
            }

            return {
                success: true,
                message: 'Account created successfully. Please check your email to verify.',
                data: {
                    user: data.user,
                    session: data.session,
                },
            };
        } catch (error: any) {
            const apiError = this.handleError(error);
            return {
                success: false,
                message: apiError.message,
                error: apiError.code || 'UNEXPECTED_ERROR',
            };
        }
    }

    async resetPassword(request: ResetPasswordRequest): Promise<AuthResponse> {
        try {
            const { email } = request;

            if (!email.trim()) {
                return {
                    success: false,
                    message: 'Email is required.',
                    error: 'MISSING_EMAIL',
                };
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: 'vitalspark://reset-password',
            });

            if (error) {
                const apiError = this.handleError(error);
                return {
                    success: false,
                    message: this.getFriendlyErrorMessage(apiError.message),
                    error: apiError.code || 'RESET_PASSWORD_ERROR',
                };
            }

            return {
                success: true,
                message: 'Password reset link sent to your email.',
            };
        } catch (error: any) {
            const apiError = this.handleError(error);
            return {
                success: false,
                message: apiError.message,
                error: apiError.code || 'UNEXPECTED_ERROR',
            };
        }
    }

    async signOut(): Promise<AuthResponse> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                const apiError = this.handleError(error);
                return {
                    success: false,
                    message: apiError.message,
                    error: apiError.code || 'SIGN_OUT_ERROR',
                };
            }

            return {
                success: true,
                message: 'Successfully signed out.',
            };
        } catch (error: any) {
            const apiError = this.handleError(error);
            return {
                success: false,
                message: apiError.message,
                error: apiError.code || 'UNEXPECTED_ERROR',
            };
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) {
                const apiError = this.handleError(error);
                return {
                    success: false,
                    message: apiError.message,
                    error: apiError.code || 'GET_USER_ERROR',
                    data: null,
                };
            }

            return {
                success: true,
                message: 'User retrieved successfully.',
                data: user,
            };
        } catch (error: any) {
            const apiError = this.handleError(error);
            return {
                success: false,
                message: apiError.message,
                error: apiError.code || 'UNEXPECTED_ERROR',
                data: null,
            };
        }
    }

    async getCurrentSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                const apiError = this.handleError(error);
                return {
                    success: false,
                    message: apiError.message,
                    error: apiError.code || 'GET_SESSION_ERROR',
                    data: null,
                };
            }

            return {
                success: true,
                message: 'Session retrieved successfully.',
                data: session,
            };
        } catch (error: any) {
            const apiError = this.handleError(error);
            return {
                success: false,
                message: apiError.message,
                error: apiError.code || 'UNEXPECTED_ERROR',
                data: null,
            };
        }
    }

    // ===========================
    // Helper Methods
    // ===========================

    private getFriendlyErrorMessage(errorMessage: string): string {
        const errorMap: Record<string, string> = {
            'Invalid login credentials': 'Invalid email or password. Please try again.',
            'Email not confirmed': 'Please verify your email before signing in.',
            'User already registered': 'An account with this email already exists.',
            'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
            'Unable to validate email address: invalid format': 'Please enter a valid email address.',
            'Signup requires a valid password': 'Please enter a valid password.',
        };

        for (const [key, value] of Object.entries(errorMap)) {
            if (errorMessage.includes(key)) {
                return value;
            }
        }

        return errorMessage;
    }

    validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password: string): { isValid: boolean; message?: string } {
        if (password.length < 6) {
            return {
                isValid: false,
                message: 'Password must be at least 6 characters long.',
            };
        }
        return { isValid: true };
    }
}

// Export singleton instance
export const auth = new Auth();

