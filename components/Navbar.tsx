import Link from 'next/link'

export default function Navbar() {
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

          <div className="flex space-x-4">
            <Link href="/login" className="text-brand-red-orange hover:text-brand-red font-semibold transition-colors">
              Connexion
            </Link>
            <Link href="/signup" className="btn-primary">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}