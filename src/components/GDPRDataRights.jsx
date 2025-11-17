import React, { useState } from 'react'
import { useGDPR } from '../contexts/GDPRContext'
import { Button } from './ui/Button'

const GDPRDataRights = () => {
  const {
    requestDataExport,
    requestDataDeletion,
    revokeAllConsents,
    openConsentManager,
    language,
    consentTimestamp
  } = useGDPR()

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const texts = {
    de: {
      title: 'Ihre Datenrechte nach DSGVO',
      subtitle: 'Als EU-Bürger haben Sie spezifische Rechte bezüglich Ihrer persönlichen Daten.',
      exportTitle: 'Datenportabilität (Art. 20 DSGVO)',
      exportDesc: 'Laden Sie alle Ihre gespeicherten persönlichen Daten herunter.',
      exportButton: 'Daten exportieren',
      deleteTitle: 'Recht auf Löschung (Art. 17 DSGVO)',
      deleteDesc: 'Löschen Sie Ihr Konto und alle damit verbundenen Daten dauerhaft.',
      deleteButton: 'Account löschen',
      consentTitle: 'Einwilligungen verwalten (Art. 7 DSGVO)',
      consentDesc: 'Verwalten Sie Ihre Cookie-Einstellungen und Datenverarbeitungseinwilligungen.',
      consentButton: 'Einstellungen öffnen',
      revokeButton: 'Alle Einwilligungen widerrufen',
      lastConsent: 'Letzte Einwilligung',
      deleteConfirmTitle: 'Account löschen bestätigen',
      deleteConfirmText: 'Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden dauerhaft gelöscht.',
      deleteConfirmButton: 'Ja, Account löschen',
      cancelButton: 'Abbrechen',
      processingText: 'Verarbeitung läuft...',
      dataProtectionContact: 'Bei Fragen wenden Sie sich an unseren Datenschutzbeauftragten: ',
      email: 'datenschutz@dropmybeats.com'
    },
    en: {
      title: 'Your GDPR Data Rights',
      subtitle: 'As an EU citizen, you have specific rights regarding your personal data.',
      exportTitle: 'Data Portability (Art. 20 GDPR)',
      exportDesc: 'Download all your stored personal data.',
      exportButton: 'Export Data',
      deleteTitle: 'Right to Erasure (Art. 17 GDPR)',
      deleteDesc: 'Permanently delete your account and all associated data.',
      deleteButton: 'Delete Account',
      consentTitle: 'Manage Consents (Art. 7 GDPR)',
      consentDesc: 'Manage your cookie settings and data processing consents.',
      consentButton: 'Open Settings',
      revokeButton: 'Revoke All Consents',
      lastConsent: 'Last Consent',
      deleteConfirmTitle: 'Confirm Account Deletion',
      deleteConfirmText: 'Are you sure? This action cannot be undone. All your data will be permanently deleted.',
      deleteConfirmButton: 'Yes, Delete Account',
      cancelButton: 'Cancel',
      processingText: 'Processing...',
      dataProtectionContact: 'For questions, contact our Data Protection Officer: ',
      email: 'privacy@dropmybeats.com'
    }
  }

  const t = texts[language] || texts.en

  const handleDataExport = async () => {
    setIsProcessing(true)
    try {
      await requestDataExport()
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAccountDeletion = async () => {
    setIsProcessing(true)
    try {
      await requestDataDeletion()
    } finally {
      setIsProcessing(false)
      setShowDeleteConfirmation(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t.title}</h1>
          <p className="text-gray-700">{t.subtitle}</p>
        </div>

        {/* Data Export */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.exportTitle}</h3>
              <p className="text-gray-600 mb-4">{t.exportDesc}</p>
              <Button
                onClick={handleDataExport}
                disabled={isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? t.processingText : t.exportButton}
              </Button>
            </div>
          </div>
        </div>

        {/* Consent Management */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.consentTitle}</h3>
              <p className="text-gray-600 mb-2">{t.consentDesc}</p>
              {consentTimestamp && (
                <p className="text-sm text-gray-500 mb-4">
                  {t.lastConsent}: {consentTimestamp.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US')}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={openConsentManager}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  {t.consentButton}
                </Button>
                <Button
                  onClick={revokeAllConsents}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  {t.revokeButton}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Deletion */}
        <div className="border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.deleteTitle}</h3>
              <p className="text-gray-600 mb-4">{t.deleteDesc}</p>
              <Button
                onClick={() => setShowDeleteConfirmation(true)}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {t.deleteButton}
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-sm text-gray-600">
            {t.dataProtectionContact}
            <a 
              href={`mailto:${t.email}`} 
              className="text-blue-600 hover:underline"
            >
              {t.email}
            </a>
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t.deleteConfirmTitle}
            </h3>
            <p className="text-gray-600 mb-6">
              {t.deleteConfirmText}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteConfirmation(false)}
                variant="outline"
                disabled={isProcessing}
              >
                {t.cancelButton}
              </Button>
              <Button
                onClick={handleAccountDeletion}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isProcessing}
              >
                {isProcessing ? t.processingText : t.deleteConfirmButton}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GDPRDataRights