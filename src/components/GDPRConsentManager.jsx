import React, { useState } from 'react'
import { useGDPR } from '../contexts/GDPRContext'
import { Button } from './ui/Button'

const GDPRConsentManager = () => {
  const {
    showConsentManager,
    closeConsentManager,
    consents,
    giveConsent,
    acceptAllCookies,
    acceptOnlyEssential,
    CONSENT_PURPOSES,
    language,
    setLanguage
  } = useGDPR()

  const [localConsents, setLocalConsents] = useState(consents)

  if (!showConsentManager) return null

  const texts = {
    de: {
      title: 'Cookie-Einstellungen verwalten',
      description: 'Hier können Sie Ihre Cookie-Einstellungen anpassen. Wir respektieren Ihre Entscheidungen bezüglich Ihrer Privatsphäre.',
      essential: 'Erforderlich',
      optional: 'Optional',
      acceptAll: 'Alle akzeptieren',
      acceptSelected: 'Auswahl speichern',
      acceptEssential: 'Nur erforderliche',
      close: 'Schließen',
      toggleOn: 'An',
      toggleOff: 'Aus',
      purposes: 'Zweck',
      cookies: 'Verwendete Cookies',
      language: 'Sprache',
      lastUpdated: 'Zuletzt aktualisiert'
    },
    en: {
      title: 'Manage Cookie Settings',
      description: 'Here you can customize your cookie settings. We respect your privacy decisions.',
      essential: 'Required',
      optional: 'Optional',
      acceptAll: 'Accept All',
      acceptSelected: 'Save Selection',
      acceptEssential: 'Essential Only',
      close: 'Close',
      toggleOn: 'On',
      toggleOff: 'Off',
      purposes: 'Purpose',
      cookies: 'Cookies Used',
      language: 'Language',
      lastUpdated: 'Last Updated'
    }
  }

  const t = texts[language] || texts.en

  const handleToggleConsent = (consentType) => {
    if (consentType === 'essential') return // Essential cannot be disabled
    
    setLocalConsents(prev => ({
      ...prev,
      [consentType]: !prev[consentType]
    }))
  }

  const saveSelectedConsents = () => {
    Object.entries(localConsents).forEach(([type, granted]) => {
      giveConsent(type, granted)
    })
    closeConsentManager()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <button
            onClick={closeConsentManager}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label={t.close}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">{t.description}</p>

          {/* Language Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.language}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Cookie Categories */}
          <div className="space-y-6">
            {Object.entries(CONSENT_PURPOSES).map(([type, purpose]) => (
              <div key={type} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {language === 'de' ? purpose.name : purpose.nameEn}
                    </h3>
                    {purpose.required && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {t.essential}
                      </span>
                    )}
                    {!purpose.required && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {t.optional}
                      </span>
                    )}
                  </div>
                  
                  {/* Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {localConsents[type] ? t.toggleOn : t.toggleOff}
                    </span>
                    <button
                      onClick={() => handleToggleConsent(type)}
                      disabled={purpose.required}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        localConsents[type] 
                          ? 'bg-blue-600' 
                          : purpose.required 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localConsents[type] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-3">
                  {language === 'de' ? purpose.description : purpose.descriptionEn}
                </p>
                
                {/* Cookie Details */}
                <div className="bg-gray-50 rounded p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t.cookies}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {purpose.cookies.map(cookie => (
                      <span
                        key={cookie}
                        className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {cookie}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end p-6 border-t bg-gray-50">
          <Button
            onClick={acceptOnlyEssential}
            variant="outline"
            className="text-gray-700 border-gray-300 hover:bg-gray-100"
          >
            {t.acceptEssential}
          </Button>
          <Button
            onClick={saveSelectedConsents}
            variant="outline"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            {t.acceptSelected}
          </Button>
          <Button
            onClick={acceptAllCookies}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t.acceptAll}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GDPRConsentManager