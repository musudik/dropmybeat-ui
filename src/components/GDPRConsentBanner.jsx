import React from 'react'
import { useGDPR } from '../contexts/GDPRContext'
import { Button } from './ui/Button'

const GDPRConsentBanner = () => {
  const {
    showConsentBanner,
    acceptAllCookies,
    acceptOnlyEssential,
    openConsentManager,
    setShowConsentBanner,
    language
  } = useGDPR()

  if (!showConsentBanner) return null

  const texts = {
    de: {
      title: 'Wir respektieren Ihre Privatsphäre',
      description: 'Wir verwenden Cookies und ähnliche Technologien, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. Einige Cookies sind für das Funktionieren der Website erforderlich, während andere uns helfen, die Website zu verbessern und Ihnen personalisierte Inhalte anzubieten.',
      legal: 'Durch die Nutzung dieser Website stimmen Sie unserer Datenschutzerklärung und den Cookie-Richtlinien zu. Sie können Ihre Einstellungen jederzeit ändern.',
      acceptAll: 'Alle akzeptieren',
      acceptEssential: 'Nur erforderliche',
      customize: 'Einstellungen anpassen',
      privacy: 'Datenschutz',
      learnMore: 'Mehr erfahren'
    },
    en: {
      title: 'We respect your privacy',
      description: 'We use cookies and similar technologies to provide you with the best possible experience on our website. Some cookies are necessary for the website to function, while others help us improve the website and offer you personalized content.',
      legal: 'By using this website, you agree to our Privacy Policy and Cookie Policy. You can change your settings at any time.',
      acceptAll: 'Accept All',
      acceptEssential: 'Essential Only',
      customize: 'Customize Settings',
      privacy: 'Privacy Policy',
      learnMore: 'Learn More'
    }
  }

  const t = texts[language] || texts.en

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.title}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  {t.description}
                </p>
                <p className="text-xs text-gray-600">
                  {t.legal} {' '}
                  <a 
                    href="/privacy-policy" 
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.privacy}
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
            <Button
              onClick={acceptOnlyEssential}
              variant="outline"
              size="sm"
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              {t.acceptEssential}
            </Button>
            <Button
              onClick={openConsentManager}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              {t.customize}
            </Button>
            <Button
              onClick={acceptAllCookies}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t.acceptAll}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Close button */}
      <button
        onClick={() => setShowConsentBanner(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  )
}

export default GDPRConsentBanner