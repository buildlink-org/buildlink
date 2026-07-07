import React, { createContext, useContext, useEffect, useState } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase, AUTH_STORAGE_KEY } from "@/integrations/supabase/client"

// Reads whatever session Supabase already persisted to localStorage on a
// previous visit, so the app can render as this user immediately instead of
// showing a blank spinner while `getSession()`'s promise resolves.
function readPersistedSession(): Session | null {
	try {
		const raw = localStorage.getItem(AUTH_STORAGE_KEY)
		if (!raw) return null

		const parsed = JSON.parse(raw) as Session
		const isStillValid = parsed?.access_token && parsed?.expires_at && parsed.expires_at * 1000 > Date.now()
		return isStillValid ? parsed : null
	} catch {
		return null
	}
}

interface AuthContextType {
	user: User | null
	session: Session | null
	loading: boolean
	signUp: (email: string, password: string, userData?: any) => Promise<{data:any, error: any }>
	signIn: (email: string, password: string) => Promise<{ error: any }>
	signOut: () => Promise<void>
	resetPassword: (email: string) => Promise<{ error: any }>
	verifyOtp: (email: string, token: string) => Promise<{ error: any }>
	resendOtp: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	
	return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [initialSession] = useState(() => readPersistedSession())
	const [user, setUser] = useState<User | null>(initialSession?.user ?? null)
	const [session, setSession] = useState<Session | null>(initialSession)
	// If we already found a still-valid session in storage, skip the loading
	// state entirely instead of blocking the page behind the auth round-trip
	const [loading, setLoading] = useState(initialSession === null)

	useEffect(() => {
		// Set up auth state listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			// Security: Do not log sensitive user information 
			setSession(session)
			setUser(session?.user ?? null)
			setLoading(false)
		})

		// Check for existing session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setUser(session?.user ?? null)
			setLoading(false)
		})

		return () => subscription.unsubscribe()
	}, [])

	const signUp = async (email: string, password: string, userData?: any) => {
		// const redirectUrl = `${window.location.origin}/feed`;

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				// emailRedirectTo: redirectUrl,
				data: userData,
			},
		})

		return { error, data }
	}

	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		return { error }
	}

	const signOut = async () => {
		await supabase.auth.signOut()
	}

	const resetPassword = async (email: string) => {
		const redirectUrl = `${window.location.origin}/feed`

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: redirectUrl,
		})

		return { error }
	}

	const verifyOtp = async (email: string, token: string) => {
		const { error } = await supabase.auth.verifyOtp({
			email,
			token,
			type: "email",
		})

		return { error }
	}

	const resendOtp = async (email: string) => {
		const { error } = await supabase.auth.resend({
			email,
			type: "signup",
		})

		return { error }
	}

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
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
