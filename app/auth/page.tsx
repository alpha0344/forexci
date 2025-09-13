'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
    const router = useRouter()
    const { login, isAuthenticated, isLoading: authLoading } = useAuth()
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isResetMode, setIsResetMode] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)
    const [resetMessage, setResetMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Rediriger si déjà connecté
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/')
        }
    }, [isAuthenticated, authLoading, router])

    // Gérer la demande de mot de passe oublié
    const handleForgotPassword = async () => {
        if (!formData.email) {
            setErrors({ email: 'Veuillez saisir votre email' })
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setErrors({ email: 'Format d\'email invalide' })
            return
        }

        setResetLoading(true)
        setErrors({})

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
            })

            const data = await response.json()

            if (response.ok) {
                setResetMessage(data.message || 'Un email de réinitialisation a été envoyé.')
                setIsResetMode(true)
            } else {
                setErrors({ general: data.error || 'Erreur lors de la demande' })
            }
        } catch (error) {
            setErrors({ general: 'Erreur de connexion' })
        } finally {
            setResetLoading(false)
        }
    }

    // Validation côté client
    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.email) {
            newErrors.email = 'L\'email est requis'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide'
        }

        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setErrors({})

        try {
            await login(formData)
            // La redirection sera gérée par useEffect
        } catch (error: any) {
            setErrors({
                general: error.message || 'Une erreur est survenue lors de la connexion'
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Afficher un loader pendant la vérification d'auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-600 mt-2">Vérification...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-red-orange mb-2">Forexci</h1>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {isResetMode ? 'Email envoyé' : 'Connexion à votre compte'}
                    </h2>
                    {!isResetMode && (
                        <p className="text-gray-600 mt-2">
                            Accédez à votre tableau de bord
                        </p>
                    )}
                </div>

                {/* Form Card */}
                <div className="bg-white shadow-xl rounded-lg p-8">
                    {!isResetMode ? (
                        // Mode connexion normale
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresse email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="votre.email@exemple.com"
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                                            errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    disabled={resetLoading || isLoading}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    {resetLoading ? 'Envoi...' : 'Mot de passe oublié ?'}
                                </button>
                            </div>

                            {/* General Error */}
                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700 text-sm">{errors.general}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Connexion...
                                    </>
                                ) : (
                                    'Se connecter'
                                )}
                            </button>
                        </form>
                    ) : (
                        // Mode réinitialisation réussie
                        <div className="text-center space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-700">{resetMessage}</p>
                            </div>
                            <p className="text-gray-600">
                                Vérifiez votre boîte email et suivez les instructions pour réinitialiser votre mot de passe.
                            </p>
                            <button
                                onClick={() => {
                                    setIsResetMode(false)
                                    setResetMessage('')
                                    setFormData({ email: '', password: '' })
                                    setErrors({})
                                }}
                                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                ← Retour à la connexion
                            </button>
                        </div>
                    )}

                    {/* Account info */}
                    {!isResetMode && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Besoin d'un compte ? Contactez votre administrateur.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}