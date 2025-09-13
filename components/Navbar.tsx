'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
  }

  return (
    <nav className="bg-brand-anthracite shadow-brand-red border-b-4 border-brand-red">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-brand-white hover:text-brand-orange transition-colors">
            Forexci
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-brand-gray hover:text-brand-orange transition-colors font-medium">
              Accueil
            </Link>
            <Link href="/clients" className="text-brand-gray hover:text-brand-orange transition-colors font-medium">
              Clients
            </Link>
            <Link href="/materiel" className="text-brand-gray hover:text-brand-orange transition-colors font-medium">
              Matériel
            </Link>
            <Link href="/dashboard" className="text-brand-gray hover:text-brand-orange transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/calendrier" className="text-brand-gray hover:text-brand-orange transition-colors font-medium">
              Calendrier
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-brand-gray hover:text-brand-orange transition-colors font-medium bg-brand-anthracite-dark hover:bg-brand-anthracite-light px-3 py-2 rounded-lg border border-brand-gray-dark"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">
                    {user.fullName || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-brand-white rounded-lg shadow-brand-red border border-brand-red py-2 z-50">
                    <div className="px-4 py-2 border-b border-brand-gray-dark">
                      <p className="text-sm font-medium text-brand-anthracite">
                        {user.fullName || 'Nom Complet'}
                      </p>
                      <p className="text-xs text-text-secondary">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-brand-anthracite hover:bg-brand-gray flex items-center space-x-2 hover:text-brand-red transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  )
}