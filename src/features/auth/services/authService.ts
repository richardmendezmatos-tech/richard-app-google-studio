import { UserRole, AppUser } from '@/entities/user';
import { SupabaseUserRepository } from '@/entities/user/api/repositories/SupabaseUserRepository';

let _supabaseClient: any = null;
async function getSupabase() {
  if (!_supabaseClient) {
    const { createClient } = await import('@/shared/api/supabase/client');
    _supabaseClient = createClient();
  }
  return _supabaseClient;
}

const getUserRepo = () => new SupabaseUserRepository();

// --- Types & Constants ---
const AUDIT_LOGS_COLLECTION = 'audit_logs';
const RATE_LIMITS_COLLECTION = 'login_attempts';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
}

// --- Helper Functions ---

const getClientIP = async (): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await res.json();
    return data.ip;
  } catch {
    return '127_0_0_1';
  }
};

export const isAdminEmail = (email: string | null): boolean => {
  if (!email) return false;
  const adminEmails = ['richardmendezmatos@gmail.com'];
  const lowerEmail = email.toLowerCase();
  return (
    adminEmails.includes(lowerEmail) ||
    lowerEmail.endsWith('@richard-automotive.com')
  );
};

export const normalizeUser = (user: User, roleOverride?: UserRole) => {
  const role: UserRole = roleOverride || (isAdminEmail(user.email) ? 'admin' : 'user');
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: role,
  } as AppUser;
};

const mapSupabaseUser = (sbUser: any): User => {
  return {
    uid: sbUser.id,
    email: sbUser.email || null,
    displayName: sbUser.user_metadata?.full_name || sbUser.user_metadata?.displayName || null,
    photoURL: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.photoURL || null,
    phoneNumber: sbUser.phone || null,
  };
};

const createUserProfile = async (user: User, role: UserRole = 'user') => {
  const userRepo = getUserRepo();
  const existing = await userRepo.getUserProfile(user.uid);
  const currentDealerId =
    typeof window !== 'undefined'
      ? localStorage.getItem('current_dealer_id') || 'richard-automotive'
      : 'richard-automotive';
  const currentDealerName =
    typeof window !== 'undefined'
      ? localStorage.getItem('current_dealer_name') || 'Richard Automotive'
      : 'Richard Automotive';

  if (!existing) {
    await userRepo.saveUserProfile(user.uid, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role,
      dealerId: currentDealerId,
      dealerName: currentDealerName,
      createdAt: new Date(),
    });
  }
};

export const getUserRole = async (uid: string): Promise<UserRole> => {
  return await getUserRepo().getUserRole(uid);
};

// --- Audit & Security ---

export const logAuthActivity = async (
  email: string,
  success: boolean,
  method: string,
  details?: string,
) => {
  let ip = 'unknown';
  try {
    ip = await getClientIP();
  } catch {
    /* ignore */
  }

  const device = typeof navigator !== 'undefined' ? navigator.userAgent : 'server';

  try {
    await getUserRepo().logActivity({
      email,
      ip,
      device,
      method,
      success,
      details: details || '',
      location: typeof window !== 'undefined' ? window.location.pathname : '/',
    });
  } catch (e) {
    console.warn('Audit logging failed (non-critical):', e);
  }

  // Firebase Analytics removed for $0 cost migration
  if (success) {
    console.log(`[Auth] Activity logged: ${method} for ${email}`);
  }
};

// --- User Management Functions ---

export async function signUpWithEmail(email: string, password: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    const errorMsg = error ? error.message : 'Unknown error';
    await logAuthActivity(email, false, 'signup_email', errorMsg);
    throw error || new Error('Signup failed');
  }

  const role: UserRole = isAdminEmail(email) ? 'admin' : 'user';
  const user = mapSupabaseUser(data.user);
  await createUserProfile(user, role);
  await logAuthActivity(email, true, 'signup_email');

  const requiresEmailConfirmation = !data.session;

  return {
    user: normalizeUser(user, role),
    requiresEmailConfirmation,
  };
}

export async function resendVerificationEmail(email: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    await logAuthActivity(email, false, 'resend_verification', error.message);
    throw error;
  }

  await logAuthActivity(email, true, 'resend_verification');
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    const errorMsg = error ? error.message : 'Unknown error';
    await logAuthActivity(email, false, 'login_email', errorMsg);
    throw error || new Error('Login failed');
  }

  const user = mapSupabaseUser(data.user);
  await logAuthActivity(email, true, 'login_email');
  return normalizeUser(user);
}

export async function signInWithGoogle(useRedirect: boolean = false) {
  const supabase = await getSupabase();

  // Supabase handles the OAuth flow via redirects mostly
  // It provides signInWithOAuth
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://www.richard-automotive-command-center.vercel.app';
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');

  const redirectUrl = isLocal ? 'http://localhost:3000/auth/callback' : `${origin}/auth/callback`;

  console.log('🚀 [AuthService] Initiating Google Sign-In with redirect:', redirectUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        prompt: 'select_account',
        access_type: 'offline',
      },
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error.message);
    throw error;
  }

  // Note: OAuth redirects immediately, so the code below won't execute if successful
  // We'll have to handle profile creation in a callback route or via a trigger
  return data;
}

export async function signInWithGoogleCredential(credentialString: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: credentialString,
  });

  if (error || !data.user) {
    await logAuthActivity('unknown', false, 'login_google_onetap', error?.message);
    throw error || new Error('Login failed');
  }

  const user = mapSupabaseUser(data.user);
  await createUserProfile(user, 'user');
  await logAuthActivity(user.email || 'unknown', true, 'login_google_onetap');
  return normalizeUser(user);
}

export async function signInWithFacebook(useRedirect: boolean = false) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo:
        typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });

  if (error) {
    console.error('Error signing in with Facebook:', error.message);
    throw error;
  }

  return data;
}

export async function signOutUser() {
  const supabase = await getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const email = session?.user?.email;

  try {
    await supabase.auth.signOut();
    if (email) await logAuthActivity(email, true, 'signout');
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error signing out:', errorMsg);
    throw error;
  }
}

export async function sendMagicLink(email: string) {
  const supabase = await getSupabase();
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/admin-login-callback`
            : undefined,
      },
    });

    if (error) throw error;

    if (typeof window !== 'undefined') window.localStorage.setItem('emailForSignIn', email);
    await logAuthActivity(email, true, 'magic_link_sent');
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logAuthActivity(email, false, 'magic_link_failed', errorMsg);
    throw error;
  }
}

export const validateGhostKey = async (key: string) => {
  const GHOST_KEY_HASH = 'richard_secure_2026_cc';
  if (key === GHOST_KEY_HASH) {
    const adminEmail = 'richardmendezmatos@gmail.com';
    await logAuthActivity(adminEmail, true, 'ghost_mode_bypass', 'CEO Master Key Used');
    return {
      uid: 'ghost_ceo_master',
      email: adminEmail,
      role: 'admin',
      displayName: 'Richard (CEO Ghost)',
      isGhost: true,
    };
  }
  throw new Error('Llave maestra inválida.');
};

export const updateUserProfile = async (
  user: User,
  data: { displayName?: string; photoURL?: string },
) => {
  const supabase = await getSupabase();
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: data.displayName,
        avatar_url: data.photoURL,
      },
    });

    if (error) throw error;

    await getUserRepo().saveUserProfile(user.uid, data);
    await logAuthActivity(user.email || 'unknown', true, 'profile_update');
  } catch (error: unknown) {
    const errorMessage = (error as { message?: string }).message;
    console.error('Error updating profile:', error);
    await logAuthActivity(user.email || 'unknown', false, 'profile_update_failed', errorMessage);
    throw error;
  }
};

export const updateUserPassword = async (user: User, newPassword: string) => {
  const supabase = await getSupabase();
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    await logAuthActivity(user.email || 'unknown', true, 'password_change');
  } catch (error: unknown) {
    const errorMessage = (error as { message?: string }).message;
    console.error('Error updating password:', error);
    await logAuthActivity(user.email || 'unknown', false, 'password_change_failed', errorMessage);
    throw error;
  }
};

export const loginAdmin = async (email: string, password: string, twoFactorCode?: string) => {
  console.log('2FA Challenge (Simulation):', twoFactorCode);
  let ip = 'unknown';
  try {
    ip = await getClientIP();
  } catch {
    // Ignore IP fetch failure
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    logAuthActivity(email, false, 'admin_login_failed', error ? error.message : 'Unknown').catch(
      () => {},
    );
    throw error || new Error('Login failed');
  }

  try {
    const sanitizedEmail = (email || 'anon').replace(/[@.]/g, '_');
    const sanitizedIP = (ip || '0_0_0_0').replace(/[.:]/g, '_');
    const attemptId = `${sanitizedEmail}_${sanitizedIP}`;

    const userRepo = getUserRepo();
    const profile = await userRepo.getUserProfile(data.user.id);

    if (profile?.isBlocked) {
      throw new Error('Su cuenta ha sido bloqueada temporalmente por seguridad.');
    }

    await userRepo.deleteRateLimit(attemptId);
  } catch (e) {
    if (e instanceof Error && e.message.includes('bloqueada')) throw e;
    console.warn('Non-Critical Auth Logic skipped due to DB error:', e);
  }

  const mappedUser = mapSupabaseUser(data.user);
  const user = normalizeUser(mappedUser);

  logAuthActivity(email, true, 'admin_login_success').catch(() => {});

  return user;
};

export const sendPasswordResetEmail = async (email: string) => {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      typeof window !== 'undefined'
        ? `${window.location.origin}/admin-login?reset=true`
        : undefined,
  });

  if (error) {
    await logAuthActivity(email, false, 'password_reset_failed', error.message);
    throw error;
  }

  await logAuthActivity(email, true, 'password_reset_sent');
};

export const subscribeToAuthChanges = async (callback: (user: User | null) => void) => {
  const supabase = await getSupabase();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event: any, session: any) => {
    callback(session?.user ? mapSupabaseUser(session.user) : null);
  });

  return () => {
    subscription.unsubscribe();
  };
};

// --- Passkey / Biometric Authentication ---

export const registerPasskey = async (user: User) => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    throw new Error('Passkeys not supported in this browser.');
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new TextEncoder().encode(user.uid);

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Richard Automotive', id: window.location.hostname },
        user: {
          id: userId,
          name: user.email || 'user',
          displayName: user.displayName || user.email || 'User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential;

    if (credential) {
      await getUserRepo().saveUserProfile(user.uid, {
        passkeyEnabled: true,
        passkeyId: credential.id,
      });
      await logAuthActivity(user.email || 'unknown', true, 'passkey_registered');
      return credential;
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      const errorMessage = err.message;
      console.error('Passkey Error:', err);
      throw new Error('Error registrando Passkey: ' + errorMessage, { cause: err });
    }
    throw new Error('Error registrando Passkey desconocido', { cause: err });
  }
};

export const loginWithPasskey = async () => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    throw new Error('Passkeys not supported in this browser.');
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: 'preferred',
      },
    })) as PublicKeyCredential;

    if (credential) {
      const userRepo = getUserRepo();
      const userData = await userRepo.getUserByPasskeyId(credential.id);

      if (!userData || !userData.email) {
        throw new Error('Dispositivo no reconocido. Por favor, vincula tu dispositivo primero.');
      }

      await logAuthActivity(
        userData.email,
        true,
        'passkey_verification_success',
        `Device ID: ${credential.id}`,
      );

      return {
        credential,
        email: userData.email,
        uid: userData.uid,
      };
    }
  } catch (err: unknown) {
    const errorName = err instanceof Error ? err.name : 'UnknownError';
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (errorName === 'NotAllowedError') {
      throw new Error('Operación biométrica cancelada por el usuario.', { cause: err });
    }

    console.error('Passkey Login Error:', err);
    await logAuthActivity('unknown', false, 'passkey_login_failed', errorMessage);
    throw new Error('Error iniciando sesión con Passkey: ' + errorMessage, { cause: err });
  }
};
