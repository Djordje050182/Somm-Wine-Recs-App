import { localAuthService } from './localAuthService';
import { AuthService } from './types';

export type { AuthService, AuthResult, SignUpInput } from './types';

// The one line to change when real auth arrives:
// e.g. export const auth: AuthService = supabaseAuthService;
export const auth: AuthService = localAuthService;
