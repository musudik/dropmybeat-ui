import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

const AgeVerification = ({ onVerified, onRejected }) => {
  const [birthDate, setBirthDate] = useState('')
  const [error, setError] = useState('')

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const handleVerification = () => {
    if (!birthDate) {
      setError('Bitte geben Sie Ihr Geburtsdatum ein')
      return
    }

    const age = calculateAge(birthDate)
    
    if (age < 13) {
      // Under 13 - cannot use service under GDPR
      onRejected('too_young')
    } else if (age < 16) {
      // 13-15 - needs parental consent under German GDPR implementation
      onVerified({ age, needsParentalConsent: true, birthDate })
    } else {
      // 16+ - can give own consent
      onVerified({ age, needsParentalConsent: false, birthDate })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-6-2a9 9 0 1118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Altersverifikation erforderlich
          </h2>
          <p className="text-gray-600 text-sm">
            Aufgrund der DSGVO müssen wir Ihr Alter verifizieren, um Ihnen die entsprechenden 
            Datenschutzoptionen anzubieten.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geburtsdatum
            </label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value)
                setError('')
              }}
              max={new Date().toISOString().split('T')[0]}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Warum fragen wir nach Ihrem Alter?</strong><br/>
              • Unter 13 Jahren: Keine Nutzung möglich<br/>
              • 13-15 Jahre: Elterliche Zustimmung erforderlich<br/>
              • Ab 16 Jahren: Eigenständige Zustimmung möglich<br/>
              <br/>
              Ihr Geburtsdatum wird nur für die Altersverifikation verwendet und sicher gespeichert.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => onRejected('cancelled')}
            variant="outline"
            className="flex-1"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleVerification}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Verifizieren
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Diese Altersverifikation entspricht den Anforderungen der DSGVO (Art. 8).
          </p>
        </div>
      </div>
    </div>
  )
}

export default AgeVerification