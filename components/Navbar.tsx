import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ForexCI
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
              Accueil
            </Link>
            <Link href="/trading" className="text-gray-700 hover:text-blue-600 transition">
              Trading
            </Link>
            <Link href="/analysis" className="text-gray-700 hover:text-blue-600 transition">
              Analyse
            </Link>
            <Link href="/portfolio" className="text-gray-700 hover:text-blue-600 transition">
              Portefeuille
            </Link>
          </div>
          
          <div className="flex space-x-4">
            <button className="text-blue-600 hover:text-blue-800 font-semibold">
              Connexion
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              S'inscrire
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}