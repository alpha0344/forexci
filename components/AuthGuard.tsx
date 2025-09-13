'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import Navbar from './navbar'

interface AuthGuardProps {
    children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const isAuthPage = pathname === '/auth'

    useEffect(() => {
        // Ne pas rediriger si on est déjà sur la page de connexion
        if (isAuthPage) {
            return
        }

        // Si pas de chargement et pas authentifié, rediriger vers /auth
        if (!isLoading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [isAuthenticated, isLoading, router, pathname, isAuthPage])

    // Afficher un loader pendant la vérification
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-600 mt-2">Chargement...</p>
                </div>
            </div>
        )
    }

    // Si pas authentifié et pas sur la page de connexion, ne rien afficher
    // (la redirection va s'effectuer)
    if (!isAuthenticated && !isAuthPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-600 mt-2">Redirection...</p>
                </div>
            </div>
        )
    }

    // Si authentifié, afficher navbar + contenu
    // Si sur la page de connexion, juste le contenu sans navbar
    return (
        <>
            {!isAuthPage && <Navbar />}
            {children}
        </>
    )
}