import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

// Custom storage adapter that works across all platforms
const createCustomStorage = () => {
    // For web, use localStorage if available (client-side)
    if (Platform.OS === 'web') {
        return {
            getItem: async (key: string) => {
                if (typeof window !== 'undefined' && window.localStorage) {
                    return window.localStorage.getItem(key);
                }
                return null;
            },
            setItem: async (key: string, value: string) => {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.setItem(key, value);
                }
            },
            removeItem: async (key: string) => {
                if (typeof window !== 'undefined' && window.localStorage) {
                    window.localStorage.removeItem(key);
                }
            },
        };
    }

    // For native platforms, use AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env.local file.'
    );
}

// Create redirect URI for deep linking
export const getRedirectUri = (): string => {
    if (Platform.OS === 'web') {
        // For web, use the current origin
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/auth/callback`;
        }
        return 'http://localhost:8081/auth/callback';
    }

    // For native platforms, use the app scheme
    try {
        const url = Linking.createURL('auth/callback');
        return url;
    } catch (error) {
        // Fallback
        return 'vitalspark://auth/callback';
    }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: createCustomStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
    },
});

