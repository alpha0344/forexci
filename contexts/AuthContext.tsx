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
    }, [])

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                setUser(null)
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
            })
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
        } finally {
            setUser(null)
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