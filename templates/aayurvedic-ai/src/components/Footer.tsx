export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">AI</span>
              </div>
              <span className="text-lg font-bold text-white">AyurvedicAI</span>
            </div>
            <p className="text-sm leading-relaxed">
              Harnessing Sushruta Samhita wisdom with AI for diabetes reversal.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white hover:text-amber-300">Features</a></li>
              <li><a href="#" className="text-white hover:text-amber-300">Pricing</a></li>
              <li><a href="#" className="text-white hover:text-amber-300">How It Works</a></li>
              <li><a href="#" className="text-white hover:text-amber-300">Demo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white hover:text-amber-300">Documentation</a></li>
              <li><a href="#" className="text-white hover:text-amber-300">Research Studies</a></li>
              <li><a href="#" className="text-white hover:text-amber-300">Ayurvedic Texts</a></li>
              <li><a href="#" className="text-white hover:text-amber-300">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-amber-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-amber-300">Terms of Service</a></li>
              <li><a href="#" className="hover:text-amber-300">Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-300">&copy; {new Date().getFullYear()} AyurvedicAI. For informational purposes only.</p>
          <a href="#" className="hover:text-amber-300" target="_blank" rel="noopener noreferrer">
            <span className="inline-block mt-1">GitHub</span>
            <svg className="w-5 h-5 inline-block mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.81 2.94a1 1 0 0 0 .118 1.81 7 7 0 0 1-1.81 1.81A1 1 0 0 0 13 3v1h-1l-1 1h1v8a1 1 0 0 0 1.81 1.81c.38.75 1.1 1.95 1.41 3.02a1 1 0 0 0 1.41-.53l1.29-1.29c.28-.28.33-.7.15-1.02a1 1 0 0 0-1.17-1.17l-1.29-.87a1 1 0 0 0-1.14 1.14l.87 1.29c-.15.33-.38.6-.68.68a1 1 0 0 0-1.17-1.17l-1.29-1.29c-.28-.28.33-.7.15-1.02a1 1 0 0 0 1.17-1.17l-1.29-.87c-.15-.33-.38-.6-.68-.68a1 1 0 0 0-1.14-1.14l1.29-1.29c.28-.28.33-.7.15-1.02a1 1 0 0 0-1.17-1.17l-1.29-1.29c-.15-.33-.38-.6-.68-.68a1 1 0 0 0-1.14-1.14l1.29-1.29c.28-.28.33-.7.15-1.02a1 1 0 0 0-1.17-1.17l-1.29-1.29c-.15-.33-.38-.6-.68-.68a1 1 0 0 0-1.14-1.14l.87 1.29c-.15.33-.38.6-.68.68a1 1 0 0 0-1.17 1.17l1.29 1.29c.28.28.33.7.15 1.02a1 1 0 0 0 1.17 1.17L3 17V16c0-2 .81-3.58 2.94-4.22a1 1 0 0 0-1.81-1.81c.38-.75 1.1-1.95 1.41-3.02a1 1 0 0 0-1.41.53L1 6v1c0 2 .81 3.58 2.94 4.22a1 1 0 0 0-1.81-1.81c-.38-.75 1.1-1.95 1.41-3.02a1 1 0 0 0-1.41.53l1.29-1.29c.28-.28.33-.7.15-1.02a1 1 0 0 0-1.17-1.17l-1.29-.87a1 1 0 0 0-1.14 1.14l.87 1.29c-.15.33-.38.6-.68.68a1 1 0 0 0-1.17 1.17l1.29 1.29c.28.28.33.7.15 1.02a1 1 0 0 0 1.17 1.17l-1.29-1.29c-.15-.33-.38-.6-.68-.68a1 1 0 0 0-1.14-1.14L10 3v1c0 2 .81 3.58 2.94 4.22a1 1 0 0 0-1.81 1.81z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}