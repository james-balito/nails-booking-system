import { createContext, useContext, useEffect, useState} from 'react';
import { supabase } from '../config/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: any | null; 
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch the user's profile and role
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`*, roles ( name )`)
                .eq('id', userId)
                .single();
            
            if (error) {
                console.error("Error fetching profile:", error.message);
                return null;
            }
            return data;
        } catch (err) {
            console.error("Unexpected error:", err);
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true; // Prevents state updates if component unmounts

        const initializeAuth = async () => {
            setLoading(true);
            
            // 1. Get the current session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!isMounted) return;

            if (session?.user) {
                setUser(session.user);
                // 2. Wait for the profile to load BEFORE setting loading to false
                const userProfile = await fetchProfile(session.user.id);
                if (isMounted) setProfile(userProfile);
            } else {
                setUser(null);
                setProfile(null);
            }
            
            // 3. Only stop loading once everything is done
            if (isMounted) setLoading(false);
        };

        initializeAuth();

        // Listen for auth changes (Login, Logout, Token Refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: string, session: Session | null) => {
                if (!isMounted) return;

                if (session?.user) {
                    setUser(session.user);
                    const userProfile = await fetchProfile(session.user.id);
                    if (isMounted) setProfile(userProfile);
                } else {
                    setUser(null);
                    setProfile(null);
                }
                
                if (isMounted) setLoading(false);
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}