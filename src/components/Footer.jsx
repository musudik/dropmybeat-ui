import React from 'react'
import { Link } from 'react-router-dom'
import { useGDPR } from '../contexts/GDPRContext'

const Footer = () => {
  const { openConsentManager, language } = useGDPR()

  const texts = {
    de: {
      copyright: '© 2024 DropMyBeats GmbH. Alle Rechte vorbehalten.',
      privacy: 'Datenschutz',
      cookies: 'Cookie-Richtlinie',
      cookieSettings: 'Cookie-Einstellungen',
      dataRights: 'Datenrechte',
      imprint: 'Impressum',
      contact: 'Kontakt',
      legal: 'Rechtliches'
    },
    en: {
      copyright: '© 2024 DropMyBeats GmbH. All rights reserved.',
      privacy: 'Privacy Policy',
      cookies: 'Cookie Policy',
      cookieSettings: 'Cookie Settings',
      dataRights: 'Data Rights',
      imprint: 'Imprint',
      contact: 'Contact',
      legal: 'Legal'
    }
  }

  const t = texts[language] || texts.en

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <img 
              src="/DropMyBeats.gif" 
              alt="DropMyBeats Logo" 
              className="h-8 w-auto mb-4"
            />
            <p className="text-sm text-gray-400 mb-4">
              Die ultimative Plattform für interaktive DJ-Events und Musikwünsche.
            </p>
            <p className="text-xs text-gray-500">
              {t.copyright}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.legal}
            </h3>
            <div className="space-y-2">
              <Link 
                to="/privacy-policy" 
                className="text-sm text-gray-400 hover:text-white transition-colors block"
              >
                {t.privacy}
              </Link>
              <Link 
                to="/cookie-policy" 
                className="text-sm text-gray-400 hover:text-white transition-colors block"
              >
                {t.cookies}
              </Link>
              <button
                onClick={openConsentManager}
                className="text-sm text-gray-400 hover:text-white transition-colors text-left"
              >
                {t.cookieSettings}
              </button>
              <Link 
                to="/data-rights" 
                className="text-sm text-gray-400 hover:text-white transition-colors block"
              >
                {t.dataRights}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t.contact}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                DropMyBeats GmbH<br/>
                Musterstraße 123<br/>
                10115 Berlin, Deutschland
              </p>
              <p className="text-sm text-gray-400">
                <a 
                  href="mailto:info@dropmybeats.com" 
                  className="hover:text-white transition-colors"
                >
                  info@dropmybeats.com
                </a>
              </p>
              <p className="text-sm text-gray-400">
                <a 
                  href="tel:+493012345678" 
                  className="hover:text-white transition-colors"
                >
                  +49 30 12345678
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-xs text-gray-500">
              Built with ❤️ in Berlin • Made GDPR compliant for EU users
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a 
                href="mailto:datenschutz@dropmybeats.com" 
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                🔒 Datenschutzbeauftragter
              </a>
              <a 
                href="mailto:privacy@dropmybeats.com" 
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                🔒 Data Protection Officer
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer