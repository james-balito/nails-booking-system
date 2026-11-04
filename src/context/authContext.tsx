import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

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
  const [loading, setLoading] = useState(true); // Starts true on initial mount

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select(`*, roles ( name )`)
        .eq("id", userId)
        .single();

      if (error) return null;

      return {
        ...data,
        role_name: data.roles?.name || "user",
      };
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Initial Check on Page Load / Refresh
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (isMounted) setProfile(userProfile);
        }
      } catch (error) {
        console.error(error);
      } finally {
        // Once loaded, we NEVER set loading back to true for route changes
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (!isMounted) return;

        // 👇 DO NOT setLoading(true) here!
        // This prevents the flicker when navigating between pages.

        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (isMounted) setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      },
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
