import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    userData?: any
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: any }>;
  resendOtp: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Security: Do not log sensitive user information
      console.log("Auth state changed:", event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    // const redirectUrl = `${window.location.origin}/feed`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // emailRedirectTo: redirectUrl,
        data: userData,
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/feed`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    return { error };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    return { error };
  };

  const resendOtp = async (email: string) => {
    const { error } = await supabase.auth.resend({
      email,
      type: "signup",
    });

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    verifyOtp,
    resendOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// // NEW CODE

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
// } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { User, Session } from "@supabase/supabase-js";

// interface AuthContextType {
//   user: User | null;
//   session: Session | null;
//   loading: boolean;
//   signUp: (
//     email: string,
//     password: string,
//     userData?: Record<string, any>
//   ) => Promise<{ error: any }>;
//   signIn: (email: string, password: string) => Promise<{ error: any }>;
//   signOut: () => Promise<void>;
//   resetPassword: (email: string) => Promise<{ error: any }>;
//   verifyOtp: (email: string, token: string) => Promise<{ error: any }>;
//   resendOtp: (email: string) => Promise<{ error: any }>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
//   return ctx;
// };

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [session, setSession] = useState<Session | null>(null);
//   const [loading, setLoading] = useState(true);

//   // LOAD INITIAL SESSION

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setUser(session?.user ?? null);
//       setLoading(false);
//     });

//     // REAL-TIME AUTH LISTENER

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setSession(session);
//         setUser(session?.user ?? null);
//       }
//     );

//     return () => listener.subscription.unsubscribe();
//   }, []);

/** ---------------------------
 *  AUTH ACTIONS
 * --------------------------- */

// const signUp = useCallback(
//   async (
//     email: string,
//     password: string,
//     userData: Record<string, any> = {}
//   ) => {
//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: { data: userData },
//     });

//     return { error };
//   },
//   []
// );

//   const signUp = useCallback(async (email, password, userData = {}) => {
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       data: {
//         ...userData,
//         user_type: userData.user_type, // student | professional | company
//       },
//     },
//   });

//   if (!error && data.user) {
//     await supabase.rpc("create_user_profile", {
//       uid: data.user.id,
//       type: userData.user_type,
//     });
//   }

//   return { error };
// }, []);

//   const signIn = useCallback(async (email: string, password: string) => {
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     return { error };
//   }, []);

//   const signOut = useCallback(async () => {
//     await supabase.auth.signOut();
//   }, []);

//   const resetPassword = useCallback(async (email: string) => {
//     const redirectUrl = `${window.location.origin}/reset-password`;
//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: redirectUrl,
//     });
//     return { error };
//   }, []);

//   const verifyOtp = useCallback(async (email: string, token: string) => {
//     const { error } = await supabase.auth.verifyOtp({
//       email,
//       token,
//       type: "email",
//     });
//     return { error };
//   }, []);

//   const resendOtp = useCallback(async (email: string) => {
//     const { error } = await supabase.auth.resend({
//       email,
//       type: "signup",
//     });
//     return { error };
//   }, []);

//   // CONTEXT VALUE
//   const value: AuthContextType = {
//     user,
//     session,
//     loading,
//     signUp,
//     signIn,
//     signOut,
//     resetPassword,
//     verifyOtp,
//     resendOtp,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };
