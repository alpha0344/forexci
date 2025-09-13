'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface User {
    id: string
    email: string
    fullName: string | null
    lastLoginAt: Date | null
    createdAt: Date
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (credentials: { email: string; password: string }) => Promise<void>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const isAuthenticated = !!user

    // Vérifier l'authentification au démarrage
    useEffect(() => {
        checkAuth()

        // Vérifier périodiquement l'état de l'authentification (toutes les 15 minutes)
        const interval = setInterval(() => {
            if (user) {
                checkAuth()
            }
        }, 15 * 60 * 1000) // 15 minutes

        return () => clearInterval(interval)
    }, [user])

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                // Éviter le cache pour toujours récupérer l'état actuel
                cache: 'no-store'
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                // Si le token est expiré ou invalide, nettoyer l'état
                setUser(null)
                // Optionnel : supprimer le cookie côté client si accessible
                if (typeof document !== 'undefined') {
                    document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'auth:', error)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (credentials: { email: string; password: string }) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            cache: 'no-store', // Éviter le cache
            body: JSON.stringify(credentials),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Erreur lors de la connexion')
        }

        setUser(data.user)
    }

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                cache: 'no-store'
            })
            console.log('Déconnexion réussie')
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
        } finally {
            setUser(null)
            // Nettoyer le cookie côté client si possible
            if (typeof document !== 'undefined') {
                document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            }
        }
    }

    const refreshUser = async () => {
        await checkAuth()
    }

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}