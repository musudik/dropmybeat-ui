import React from 'react'

const CookiePolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie-Richtlinie / Cookie Policy</h1>
        
        {/* German Version */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cookie-Richtlinie (Deutsch)</h2>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-xl font-semibold mb-3">1. Was sind Cookies?</h3>
              <p>
                Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen. 
                Sie helfen dabei, die Website funktionsfähig zu machen und Ihre Benutzererfahrung zu verbessern.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">2. Welche Cookies verwenden wir?</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-lg">Technisch erforderliche Cookies</h4>
                  <p className="text-sm text-gray-600 mb-2">Diese Cookies sind für das Funktionieren der Website unbedingt erforderlich.</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Cookie Name</th>
                          <th className="text-left p-2">Zweck</th>
                          <th className="text-left p-2">Laufzeit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-mono">authToken</td>
                          <td className="p-2">Benutzeranmeldung</td>
                          <td className="p-2">24 Stunden</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">sessionId</td>
                          <td className="p-2">Sitzungsverwaltung</td>
                          <td className="p-2">Session</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">csrfToken</td>
                          <td className="p-2">Sicherheitsschutz</td>
                          <td className="p-2">Session</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">gdpr_consents</td>
                          <td className="p-2">Cookie-Einstellungen</td>
                          <td className="p-2">13 Monate</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-lg">Analytische Cookies (optional)</h4>
                  <p className="text-sm text-gray-600 mb-2">Helfen uns, die Website-Nutzung zu verstehen und zu verbessern.</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Cookie Name</th>
                          <th className="text-left p-2">Zweck</th>
                          <th className="text-left p-2">Laufzeit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-mono">_ga</td>
                          <td className="p-2">Google Analytics - Benutzer unterscheiden</td>
                          <td className="p-2">2 Jahre</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">_gid</td>
                          <td className="p-2">Google Analytics - Benutzer unterscheiden</td>
                          <td className="p-2">24 Stunden</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">_gat</td>
                          <td className="p-2">Google Analytics - Anfragerate begrenzen</td>
                          <td className="p-2">1 Minute</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">usage_stats</td>
                          <td className="p-2">Interne Nutzungsstatistiken</td>
                          <td className="p-2">30 Tage</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-lg">Präferenz Cookies (optional)</h4>
                  <p className="text-sm text-gray-600 mb-2">Speichern Ihre Einstellungen und Präferenzen.</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Cookie Name</th>
                          <th className="text-left p-2">Zweck</th>
                          <th className="text-left p-2">Laufzeit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-mono">theme</td>
                          <td className="p-2">Design-Präferenz (Hell/Dunkel)</td>
                          <td className="p-2">1 Jahr</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">language</td>
                          <td className="p-2">Spracheinstellung</td>
                          <td className="p-2">1 Jahr</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">user_preferences</td>
                          <td className="p-2">Allgemeine Benutzereinstellungen</td>
                          <td className="p-2">6 Monate</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-lg">Marketing Cookies (optional)</h4>
                  <p className="text-sm text-gray-600 mb-2">Ermöglichen personalisierte Werbung und Inhalte.</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Cookie Name</th>
                          <th className="text-left p-2">Zweck</th>
                          <th className="text-left p-2">Laufzeit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-mono">marketing_id</td>
                          <td className="p-2">Personalisierte Werbung</td>
                          <td className="p-2">30 Tage</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">ad_preferences</td>
                          <td className="p-2">Werbepräferenzen</td>
                          <td className="p-2">90 Tage</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">3. Wie können Sie Cookies verwalten?</h3>
              <div className="space-y-3">
                <p>Sie haben verschiedene Möglichkeiten, Cookies zu verwalten:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Cookie-Banner:</strong> Wählen Sie beim ersten Besuch Ihre Präferenzen</li>
                  <li><strong>Datenschutz-Einstellungen:</strong> Ändern Sie jederzeit Ihre Einstellungen in Ihrem Profil</li>
                  <li><strong>Browser-Einstellungen:</strong> Konfigurieren Sie Cookies in Ihrem Browser</li>
                  <li><strong>Löschung:</strong> Löschen Sie Cookies manuell in Ihrem Browser</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">4. Drittanbieter-Cookies</h3>
              <p>
                Wir verwenden Dienste von Drittanbietern, die eigene Cookies setzen können:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Google Analytics:</strong> Für Website-Analysen (nur mit Ihrer Einwilligung)</li>
                <li><strong>YouTube:</strong> Für die Einbettung von Musikvideos</li>
                <li><strong>Cloudflare:</strong> Für Content Delivery und Sicherheit</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">5. Aktualisierungen</h3>
              <p>
                Diese Cookie-Richtlinie kann aktualisiert werden. Wesentliche Änderungen werden Ihnen mitgeteilt 
                und erfordern möglicherweise eine neue Einwilligung.
              </p>
            </section>
          </div>
        </div>

        {/* English Version */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cookie Policy (English)</h2>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-xl font-semibold mb-3">1. What are Cookies?</h3>
              <p>
                Cookies are small text files stored on your device when you visit our website. 
                They help make the website functional and improve your user experience.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">2. Which Cookies do we use?</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-lg">Strictly Necessary Cookies</h4>
                  <p className="text-sm text-gray-600 mb-2">These cookies are essential for the website to function.</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Cookie Name</th>
                          <th className="text-left p-2">Purpose</th>
                          <th className="text-left p-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-mono">authToken</td>
                          <td className="p-2">User authentication</td>
                          <td className="p-2">24 hours</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">sessionId</td>
                          <td className="p-2">Session management</td>
                          <td className="p-2">Session</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">csrfToken</td>
                          <td className="p-2">Security protection</td>
                          <td className="p-2">Session</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">gdpr_consents</td>
                          <td className="p-2">Cookie preferences</td>
                          <td className="p-2">13 months</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-lg">Analytics Cookies (optional)</h4>
                  <p className="text-sm text-gray-600 mb-2">Help us understand website usage and improve it.</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Cookie Name</th>
                          <th className="text-left p-2">Purpose</th>
                          <th className="text-left p-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-mono">_ga</td>
                          <td className="p-2">Google Analytics - distinguish users</td>
                          <td className="p-2">2 years</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">_gid</td>
                          <td className="p-2">Google Analytics - distinguish users</td>
                          <td className="p-2">24 hours</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">_gat</td>
                          <td className="p-2">Google Analytics - throttle request rate</td>
                          <td className="p-2">1 minute</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">usage_stats</td>
                          <td className="p-2">Internal usage statistics</td>
                          <td className="p-2">30 days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-lg">Preference Cookies (optional)</h4>
                  <p className="text-sm text-gray-600 mb-2">Store your settings and preferences.</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Cookie Name</th>
                          <th className="text-left p-2">Purpose</th>
                          <th className="text-left p-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-mono">theme</td>
                          <td className="p-2">Design preference (Light/Dark)</td>
                          <td className="p-2">1 year</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">language</td>
                          <td className="p-2">Language setting</td>
                          <td className="p-2">1 year</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">user_preferences</td>
                          <td className="p-2">General user preferences</td>
                          <td className="p-2">6 months</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-lg">Marketing Cookies (optional)</h4>
                  <p className="text-sm text-gray-600 mb-2">Enable personalized advertising and content.</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Cookie Name</th>
                          <th className="text-left p-2">Purpose</th>
                          <th className="text-left p-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 font-mono">marketing_id</td>
                          <td className="p-2">Personalized advertising</td>
                          <td className="p-2">30 days</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-mono">ad_preferences</td>
                          <td className="p-2">Advertising preferences</td>
                          <td className="p-2">90 days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">3. How can you manage Cookies?</h3>
              <div className="space-y-3">
                <p>You have several options to manage cookies:</p>
                <ul className="list-disc pl-6">
                  <li><strong>Cookie Banner:</strong> Choose your preferences on first visit</li>
                  <li><strong>Privacy Settings:</strong> Change your settings anytime in your profile</li>
                  <li><strong>Browser Settings:</strong> Configure cookies in your browser</li>
                  <li><strong>Deletion:</strong> Delete cookies manually in your browser</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">4. Third-Party Cookies</h3>
              <p>
                We use third-party services that may set their own cookies:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Google Analytics:</strong> For website analytics (only with your consent)</li>
                <li><strong>YouTube:</strong> For embedding music videos</li>
                <li><strong>Cloudflare:</strong> For content delivery and security</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">5. Updates</h3>
              <p>
                This cookie policy may be updated. Significant changes will be communicated to you 
                and may require new consent.
              </p>
            </section>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Letzte Aktualisierung / Last updated: {new Date().toLocaleDateString('de-DE')}</p>
        </div>
      </div>
    </div>
  )
}

export default CookiePolicyPage