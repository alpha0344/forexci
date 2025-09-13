'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
    onSwitchToSignup: () => void
    onLogin: (data: { email: string; password: string }) => Promise<void>
    isLoading?: boolean
}

export default function LoginModal({
    isOpen,
    onClose,
    onSwitchToSignup,
    onLogin,
    isLoading = false
}: LoginModalProps) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isResetMode, setIsResetMode] = useState(false)
    const [resetLoading, setResetLoading] = useState(false)
    const [resetMessage, setResetMessage] = useState('')

    // Reset form when modal opens/closes
    const handleClose = () => {
        setFormData({ email: '', password: '' })
        setErrors({})
        setShowPassword(false)
        setIsResetMode(false)
        setResetLoading(false)
        setResetMessage('')
        onClose()
    }

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

        try {
            await onLogin(formData)
            handleClose()
        } catch (error: any) {
            setErrors({
                general: error.message || 'Une erreur est survenue lors de la connexion'
            })
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                {!isResetMode ? (
                    // Mode connexion normale
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'
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
                                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'
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
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-700 text-sm">{errors.general}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Connexion...
                                </>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>
                ) : (
                    // Mode réinitialisation réussie
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-700 text-sm">{resetMessage}</p>
                        </div>
                        <p className="text-sm text-gray-600">
                            Vérifiez votre boîte email et suivez les instructions pour réinitialiser votre mot de passe.
                        </p>
                        <button
                            onClick={() => {
                                setIsResetMode(false)
                                setResetMessage('')
                                setFormData({ email: '', password: '' })
                            }}
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            ← Retour à la connexion
                        </button>
                    </div>
                )}

                {/* Switch to Signup - Only show in login mode */}
                {!isResetMode && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Pas encore de compte ?{' '}
                            <button
                                onClick={onSwitchToSignup}
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                disabled={isLoading}
                            >
                                Créer un compte
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}