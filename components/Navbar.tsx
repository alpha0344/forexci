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
    <nav className="bg-white shadow-lg border-b-2 border-brand-yellow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-brand-red-orange hover:text-brand-red transition-colors">
            Forexci
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-brand-orange transition-colors font-medium">
              Accueil
            </Link>
            <Link href="/clients" className="text-gray-700 hover:text-brand-orange transition-colors font-medium">
              Clients
            </Link>
            <Link href="/materiel" className="text-gray-700 hover:text-brand-orange transition-colors font-medium">
              Matériel
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-brand-orange transition-colors font-medium">
              Dashboard
            </Link>
            <Link href="/calendrier" className="text-gray-700 hover:text-brand-orange transition-colors font-medium">
              Calendrier
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-brand-orange transition-colors font-medium bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">
                    {user.fullName || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.fullName || 'Nom Complet'}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
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