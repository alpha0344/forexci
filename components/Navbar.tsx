"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { LogOut, User, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    console.log("Closing mobile menu");
    setShowMobileMenu(false);
  };

  // Fermer les menus quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
        setShowMobileMenu(false);
      }
    };

    if (showUserMenu || showMobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showUserMenu, showMobileMenu]);

  return (
    <nav className="bg-brand-anthracite shadow-brand-red border-b-4 border-brand-red sticky top-0 z-50 relative">
      <div className="container mx-auto px-4" ref={navRef}>
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-brand-white hover:text-brand-orange transition-colors"
          >
            Forexci
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-brand-gray hover:text-brand-orange transition-colors font-medium"
            >
              Accueil
            </Link>
            <Link
              href="/clients"
              className="text-brand-gray hover:text-brand-orange transition-colors font-medium"
            >
              Clients
            </Link>
            <Link
              href="/calendrier"
              className="text-brand-gray hover:text-brand-orange transition-colors font-medium"
            >
              Calendrier
            </Link>
            <Link
              href="/materiel"
              className="text-brand-gray hover:text-brand-orange transition-colors font-medium"
            >
              Matériel
            </Link>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-brand-gray hover:text-brand-orange transition-colors font-medium bg-brand-anthracite-dark hover:bg-brand-anthracite-light px-3 py-2 rounded-lg border border-brand-gray-dark"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">
                    {user.fullName || user.email.split("@")[0]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-brand-white rounded-lg shadow-brand-red border border-brand-red py-2 z-[60]">
                    <div className="px-4 py-2 border-b border-brand-gray-dark">
                      <p className="text-sm font-medium text-brand-anthracite">
                        {user.fullName || "Nom Complet"}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {user.email}
                      </p>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-brand-gray hover:text-brand-orange transition-colors p-2"
                >
                  <User className="w-5 h-5" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-white rounded-lg shadow-brand-red border border-brand-red py-2 z-[60]">
                    <div className="px-4 py-2 border-b border-brand-gray-dark">
                      <p className="text-sm font-medium text-brand-anthracite truncate">
                        {user.fullName || user.email.split("@")[0]}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {user.email}
                      </p>
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
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-brand-gray hover:text-brand-orange transition-colors p-2"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-brand-gray-dark py-4">
            <div className="space-y-2">
              <Link
                href="/"
                className="block text-brand-gray hover:text-brand-orange transition-colors font-medium py-2 px-4 rounded-lg hover:bg-brand-anthracite-light"
                onClick={closeMobileMenu}
              >
                Accueil
              </Link>
              <Link
                href="/clients"
                className="block text-brand-gray hover:text-brand-orange transition-colors font-medium py-2 px-4 rounded-lg hover:bg-brand-anthracite-light"
                onClick={closeMobileMenu}
              >
                Clients
              </Link>
              <Link
                href="/calendrier"
                className="block text-brand-gray hover:text-brand-orange transition-colors font-medium py-2 px-4 rounded-lg hover:bg-brand-anthracite-light"
                onClick={closeMobileMenu}
              >
                Calendrier
              </Link>
              <Link
                href="/materiel"
                className="block text-brand-gray hover:text-brand-orange transition-colors font-medium py-2 px-4 rounded-lg hover:bg-brand-anthracite-light"
                onClick={closeMobileMenu}
              >
                Matériel
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
