export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Bienvenue sur <span className="text-blue-600">ForexCI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Votre plateforme de trading Forex moderne et intuitive. 
            Analysez les marchés, gérez vos positions et maximisez vos profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Commencer à trader
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
              En savoir plus
            </button>
          </div>
        </div>
        
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-blue-600 text-3xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-2">Analyse Technique</h3>
            <p className="text-gray-600">
              Outils d'analyse avancés avec graphiques en temps réel et indicateurs techniques.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-blue-600 text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Trading Automatisé</h3>
            <p className="text-gray-600">
              Robots de trading intelligents pour optimiser vos stratégies 24h/24.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-blue-600 text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Sécurité Maximale</h3>
            <p className="text-gray-600">
              Plateforme sécurisée avec chiffrement de bout en bout et protection des fonds.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}