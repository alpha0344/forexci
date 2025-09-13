export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-gradient-subtle">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
            Bienvenue sur <span className="text-brand-red-orange">ForexCI</span>
          </h1>
          <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto font-medium">
            Votre plateforme de gestion d'entreprise moderne et intuitive. 
            Gérez vos clients, votre matériel et optimisez vos processus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              Commencer maintenant
            </button>
            <button className="btn-secondary">
              En savoir plus
            </button>
          </div>
        </div>
        
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="card card-accent animate-fade-in">
            <div className="text-brand-orange text-4xl mb-4">�</div>
            <h3 className="text-xl font-semibold mb-3 text-primary">Gestion Clients</h3>
            <p className="text-secondary">
              Gérez facilement votre fichier client avec recherche avancée, filtres et historique complet des interactions.
            </p>
          </div>
          
          <div className="card animate-fade-in">
            <div className="text-brand-red-orange text-4xl mb-4">�</div>
            <h3 className="text-xl font-semibold mb-3 text-primary">Matériel & Équipements</h3>
            <p className="text-secondary">
              Suivez et gérez tout votre matériel avec des rappels automatiques et un système de maintenance intégré.
            </p>
          </div>
          
          <div className="card animate-fade-in">
            <div className="text-brand-red text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-primary">Dashboard Intelligent</h3>
            <p className="text-secondary">
              Visualisez vos KPI en temps réel et optimisez vos performances avec des analyses détaillées.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-brand-yellow">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Prêt à transformer votre gestion ?
            </h2>
            <p className="text-secondary mb-6 max-w-xl mx-auto">
              Rejoignez des centaines d'entreprises qui font confiance à ForexCI pour optimiser leurs processus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Créer un compte gratuit
              </button>
              <button className="btn-secondary">
                Planifier une démo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}