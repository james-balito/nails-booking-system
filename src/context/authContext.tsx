import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: any | null; 
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // 👇 Querying the raw table and joining the roles table
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          roles ( name )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
      }

      // Flatten the object so React can use profile.role_name
      return {
        ...data,
        role_name: data.roles?.name || "user"
      };
    } catch (err) {
      console.error("Unexpected error:", err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
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
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (!isMounted) return;
        setLoading(true);
        
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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
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