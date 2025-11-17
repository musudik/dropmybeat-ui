import React, { createContext, useContext, useState, useEffect } from 'react'
import { gdprAPI } from '../lib/api'

const GDPRContext = createContext({})

export const useGDPR = () => {
  const context = useContext(GDPRContext)
  if (!context) {
    throw new Error('useGDPR must be used within a GDPRProvider')
  }
  return context
}

// GDPR consent types as per German DSGVO requirements
export const CONSENT_TYPES = {
  ESSENTIAL: 'essential',           // Technically necessary cookies (no consent required)
  ANALYTICS: 'analytics',           // Google Analytics, usage tracking
  MARKETING: 'marketing',           // Marketing cookies, social media
  PREFERENCES: 'preferences',       // User preference cookies
  FUNCTIONAL: 'functional'          // Enhanced functionality cookies
}

export const CONSENT_PURPOSES = {
  [CONSENT_TYPES.ESSENTIAL]: {
    name: 'Technisch erforderlich',
    nameEn: 'Essential',
    description: 'Diese Cookies sind für das Funktionieren der Website erforderlich und können nicht deaktiviert werden.',
    descriptionEn: 'These cookies are necessary for the website to function and cannot be disabled.',
    required: true,
    cookies: ['authToken', 'sessionId', 'csrfToken']
  },
  [CONSENT_TYPES.ANALYTICS]: {
    name: 'Analytische Cookies',
    nameEn: 'Analytics',
    description: 'Diese Cookies helfen uns zu verstehen, wie Sie unsere Website nutzen.',
    descriptionEn: 'These cookies help us understand how you use our website.',
    required: false,
    cookies: ['_ga', '_gid', '_gat', 'usage_stats']
  },
  [CONSENT_TYPES.MARKETING]: {
    name: 'Marketing Cookies',
    nameEn: 'Marketing',
    description: 'Diese Cookies werden verwendet, um Ihnen relevante Werbung anzuzeigen.',
    descriptionEn: 'These cookies are used to show you relevant advertisements.',
    required: false,
    cookies: ['marketing_id', 'ad_preferences']
  },
  [CONSENT_TYPES.PREFERENCES]: {
    name: 'Präferenz Cookies',
    nameEn: 'Preferences',
    description: 'Diese Cookies speichern Ihre Einstellungen und Präferenzen.',
    descriptionEn: 'These cookies store your settings and preferences.',
    required: false,
    cookies: ['theme', 'language', 'user_preferences']
  },
  [CONSENT_TYPES.FUNCTIONAL]: {
    name: 'Funktionale Cookies',
    nameEn: 'Functional',
    description: 'Diese Cookies ermöglichen erweiterte Funktionalitäten.',
    descriptionEn: 'These cookies enable enhanced functionalities.',
    required: false,
    cookies: ['chat_widget', 'video_player_settings']
  }
}

export const GDPRProvider = ({ children }) => {
  const [consents, setConsents] = useState({})
  const [showConsentBanner, setShowConsentBanner] = useState(false)
  const [showConsentManager, setShowConsentManager] = useState(false)
  const [language, setLanguage] = useState('de') // Default to German
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false)
  const [consentTimestamp, setConsentTimestamp] = useState(null)

  // Check for existing consent on load
  useEffect(() => {
    const savedConsents = localStorage.getItem('gdpr_consents')
    const savedTimestamp = localStorage.getItem('gdpr_consent_timestamp')
    
    if (savedConsents && savedTimestamp) {
      const parsedConsents = JSON.parse(savedConsents)
      const timestamp = new Date(savedTimestamp)
      const now = new Date()
      const thirteenMonthsAgo = new Date(now.setMonth(now.getMonth() - 13))
      
      // Check if consent is still valid (13 months as per GDPR)
      if (timestamp > thirteenMonthsAgo) {
        setConsents(parsedConsents)
        setConsentTimestamp(timestamp)
        
        // Check if all required consents are given
        const hasEssentialConsent = parsedConsents[CONSENT_TYPES.ESSENTIAL]
        if (!hasEssentialConsent) {
          setShowConsentBanner(true)
        }
      } else {
        // Consent expired, show banner again
        setShowConsentBanner(true)
        localStorage.removeItem('gdpr_consents')
        localStorage.removeItem('gdpr_consent_timestamp')
      }
    } else {
      // No previous consent, show banner
      setShowConsentBanner(true)
    }

    // Check browser language
    const browserLang = navigator.language.substring(0, 2)
    if (['de', 'en'].includes(browserLang)) {
      setLanguage(browserLang)
    }
  }, [])

  const giveConsent = (consentType, granted = true) => {
    const newConsents = {
      ...consents,
      [consentType]: granted
    }
    
    setConsents(newConsents)
    
    // Essential cookies are always required
    if (consentType === CONSENT_TYPES.ESSENTIAL) {
      newConsents[CONSENT_TYPES.ESSENTIAL] = true
    }
    
    // Save to localStorage
    const timestamp = new Date()
    localStorage.setItem('gdpr_consents', JSON.stringify(newConsents))
    localStorage.setItem('gdpr_consent_timestamp', timestamp.toISOString())
    setConsentTimestamp(timestamp)
    
    // Log consent for audit trail
    console.log('GDPR Consent given:', {
      type: consentType,
      granted,
      timestamp: timestamp.toISOString(),
      userAgent: navigator.userAgent,
      ipHash: 'hashed_ip' // In real app, hash user IP for privacy
    })
  }

  const acceptAllCookies = () => {
    const allConsents = Object.keys(CONSENT_TYPES).reduce((acc, key) => {
      acc[CONSENT_TYPES[key]] = true
      return acc
    }, {})
    
    setConsents(allConsents)
    setDataProcessingConsent(true)
    
    const timestamp = new Date()
    localStorage.setItem('gdpr_consents', JSON.stringify(allConsents))
    localStorage.setItem('gdpr_consent_timestamp', timestamp.toISOString())
    localStorage.setItem('gdpr_data_processing_consent', 'true')
    setConsentTimestamp(timestamp)
    
    setShowConsentBanner(false)
    
    // Log consent
    console.log('GDPR All Consents Accepted:', {
      timestamp: timestamp.toISOString(),
      consents: allConsents
    })
  }

  const acceptOnlyEssential = () => {
    const essentialOnly = {
      [CONSENT_TYPES.ESSENTIAL]: true,
      [CONSENT_TYPES.ANALYTICS]: false,
      [CONSENT_TYPES.MARKETING]: false,
      [CONSENT_TYPES.PREFERENCES]: false,
      [CONSENT_TYPES.FUNCTIONAL]: false
    }
    
    setConsents(essentialOnly)
    
    const timestamp = new Date()
    localStorage.setItem('gdpr_consents', JSON.stringify(essentialOnly))
    localStorage.setItem('gdpr_consent_timestamp', timestamp.toISOString())
    setConsentTimestamp(timestamp)
    
    setShowConsentBanner(false)
    
    // Clear non-essential cookies
    clearNonEssentialCookies()
  }

  const revokeAllConsents = () => {
    const revokedConsents = Object.keys(CONSENT_TYPES).reduce((acc, key) => {
      acc[CONSENT_TYPES[key]] = key === 'essential' // Only essential remains true
      return acc
    }, {})
    
    setConsents(revokedConsents)
    setDataProcessingConsent(false)
    
    localStorage.setItem('gdpr_consents', JSON.stringify(revokedConsents))
    localStorage.removeItem('gdpr_data_processing_consent')
    
    // Clear all non-essential data
    clearNonEssentialCookies()
    clearNonEssentialLocalStorage()
  }

  const clearNonEssentialCookies = () => {
    // Clear analytics cookies
    document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = '_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = '_gat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Clear marketing cookies
    document.cookie = 'marketing_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    console.log('Non-essential cookies cleared')
  }

  const clearNonEssentialLocalStorage = () => {
    // Remove analytics data
    localStorage.removeItem('analytics_user_id')
    localStorage.removeItem('usage_stats')
    
    // Remove marketing data
    localStorage.removeItem('marketing_preferences')
    
    console.log('Non-essential localStorage cleared')
  }

  const hasConsent = (consentType) => {
    return consents[consentType] === true
  }

  const openConsentManager = () => {
    setShowConsentManager(true)
  }

  const closeConsentManager = () => {
    setShowConsentManager(false)
  }

  // Data subject rights functions
  const requestDataExport = async () => {
    try {
      const response = await gdprAPI.exportData()
      if (response.data) {
        // Create download link
        const dataStr = JSON.stringify(response.data, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
        
        const exportFileDefaultName = `my_data_${new Date().toISOString().split('T')[0]}.json`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
      }
    } catch (error) {
      console.error('Data export request failed:', error)
      throw error
    }
  }

  const requestDataDeletion = async () => {
    try {
      const response = await gdprAPI.deleteAccount()
      
      if (response.data.success) {
        // Clear all local data
        localStorage.clear()
        sessionStorage.clear()
        
        // Redirect to deletion confirmation page or home
        window.location.href = '/?account-deleted=true'
      }
    } catch (error) {
      console.error('Account deletion request failed:', error)
      throw error
    }
  }

  const value = {
    consents,
    showConsentBanner,
    showConsentManager,
    language,
    dataProcessingConsent,
    consentTimestamp,
    giveConsent,
    acceptAllCookies,
    acceptOnlyEssential,
    revokeAllConsents,
    hasConsent,
    openConsentManager,
    closeConsentManager,
    setShowConsentBanner,
    setLanguage,
    requestDataExport,
    requestDataDeletion,
    CONSENT_TYPES,
    CONSENT_PURPOSES
  }

  return (
    <GDPRContext.Provider value={value}>
      {children}
    </GDPRContext.Provider>
  )
}