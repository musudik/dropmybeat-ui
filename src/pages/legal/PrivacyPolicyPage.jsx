import React from 'react'

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung / Privacy Policy</h1>
        
        {/* German Version */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Datenschutzerklärung (Deutsch)</h2>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-xl font-semibold mb-3">1. Verantwortlicher</h3>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br/>
                DropMyBeats GmbH<br/>
                Musterstraße 123<br/>
                10115 Berlin, Deutschland<br/>
                E-Mail: datenschutz@dropmybeats.com<br/>
                Telefon: +49 30 12345678
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">2. Rechtsgrundlage der Verarbeitung</h3>
              <p>
                Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage von:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
                <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
                <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">3. Kategorien verarbeiteter Daten</h3>
              <ul className="list-disc pl-6">
                <li>Bestandsdaten (Name, Adresse)</li>
                <li>Kontaktdaten (E-Mail, Telefon)</li>
                <li>Inhaltsdaten (Musikwünsche, Feedback)</li>
                <li>Nutzungsdaten (besuchte Seiten, Verweildauer)</li>
                <li>Meta-/Kommunikationsdaten (IP-Adresse, Browser-Informationen)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">4. Zwecke der Datenverarbeitung</h3>
              <ul className="list-disc pl-6">
                <li>Bereitstellung und Verbesserung unserer Dienste</li>
                <li>Benutzerregistrierung und -authentifizierung</li>
                <li>Verarbeitung von Musikwünschen und Event-Teilnahmen</li>
                <li>Kommunikation mit Nutzern</li>
                <li>Analyse und Statistiken (anonymisiert)</li>
                <li>Schutz vor Missbrauch und Betrug</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">5. Cookies und Tracking</h3>
              <p>
                Wir verwenden verschiedene Arten von Cookies:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Technisch erforderliche Cookies:</strong> Für die Funktion der Website notwendig</li>
                <li><strong>Analytische Cookies:</strong> Zur Verbesserung unserer Website (nur mit Einwilligung)</li>
                <li><strong>Marketing Cookies:</strong> Für personalisierte Werbung (nur mit Einwilligung)</li>
              </ul>
              <p className="mt-3">
                Sie können Ihre Cookie-Einstellungen jederzeit über unser Cookie-Banner oder in den Datenschutz-Einstellungen anpassen.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">6. Ihre Rechte</h3>
              <p>Sie haben folgende Rechte bezüglich Ihrer Daten:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
                <li>Recht zum Widerruf der Einwilligung</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">7. Speicherdauer</h3>
              <p>
                Wir speichern Ihre Daten nur so lange, wie es für die Erfüllung der Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. 
                Benutzerkonten werden nach 3 Jahren Inaktivität gelöscht, es sei denn, Sie widersprechen der Löschung.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">8. Datenübermittlung an Dritte</h3>
              <p>
                Eine Übermittlung an Dritte erfolgt nur:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Mit Ihrer ausdrücklichen Einwilligung</li>
                <li>Zur Vertragserfüllung erforderlich</li>
                <li>Aufgrund gesetzlicher Verpflichtungen</li>
              </ul>
              <p className="mt-3">
                Wir nutzen folgende externe Dienste:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>YouTube API (Google) - für Musikvideos</li>
                <li>Cloudflare - für CDN und Sicherheit</li>
                <li>Vercel/Replit - für Hosting</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">9. Kontakt</h3>
              <p>
                Bei Fragen zum Datenschutz wenden Sie sich an:<br/>
                E-Mail: datenschutz@dropmybeats.com<br/>
                Telefon: +49 30 12345678
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">10. Beschwerderecht</h3>
              <p>
                Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde über unsere Verarbeitung personenbezogener Daten zu beschweren.
                Zuständig ist die Datenschutzbehörde des Landes, in dem Sie Ihren Wohnsitz haben.
              </p>
            </section>
          </div>
        </div>

        {/* English Version */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Privacy Policy (English)</h2>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-xl font-semibold mb-3">1. Data Controller</h3>
              <p>
                Responsible for data processing on this website:<br/>
                DropMyBeats GmbH<br/>
                Musterstraße 123<br/>
                10115 Berlin, Germany<br/>
                Email: privacy@dropmybeats.com<br/>
                Phone: +49 30 12345678
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">2. Legal Basis for Processing</h3>
              <p>
                We process your personal data based on:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Art. 6 Para. 1 lit. a GDPR (consent)</li>
                <li>Art. 6 Para. 1 lit. b GDPR (contract performance)</li>
                <li>Art. 6 Para. 1 lit. f GDPR (legitimate interests)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">3. Categories of Processed Data</h3>
              <ul className="list-disc pl-6">
                <li>Master data (name, address)</li>
                <li>Contact data (email, phone)</li>
                <li>Content data (music requests, feedback)</li>
                <li>Usage data (pages visited, duration)</li>
                <li>Meta/communication data (IP address, browser information)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">4. Purposes of Data Processing</h3>
              <ul className="list-disc pl-6">
                <li>Provision and improvement of our services</li>
                <li>User registration and authentication</li>
                <li>Processing music requests and event participation</li>
                <li>Communication with users</li>
                <li>Analysis and statistics (anonymized)</li>
                <li>Protection against abuse and fraud</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">5. Cookies and Tracking</h3>
              <p>
                We use different types of cookies:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>Technically necessary cookies:</strong> Required for website functionality</li>
                <li><strong>Analytical cookies:</strong> For website improvement (only with consent)</li>
                <li><strong>Marketing cookies:</strong> For personalized advertising (only with consent)</li>
              </ul>
              <p className="mt-3">
                You can adjust your cookie settings at any time via our cookie banner or privacy settings.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">6. Your Rights</h3>
              <p>You have the following rights regarding your data:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Right of access (Art. 15 GDPR)</li>
                <li>Right to rectification (Art. 16 GDPR)</li>
                <li>Right to erasure (Art. 17 GDPR)</li>
                <li>Right to restriction of processing (Art. 18 GDPR)</li>
                <li>Right to data portability (Art. 20 GDPR)</li>
                <li>Right to object (Art. 21 GDPR)</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">7. Storage Duration</h3>
              <p>
                We store your data only as long as necessary for the fulfillment of purposes or as required by legal retention periods.
                User accounts are deleted after 3 years of inactivity unless you object to deletion.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">8. Data Transfer to Third Parties</h3>
              <p>
                Transfer to third parties occurs only:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>With your explicit consent</li>
                <li>As necessary for contract performance</li>
                <li>Due to legal obligations</li>
              </ul>
              <p className="mt-3">
                We use the following external services:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>YouTube API (Google) - for music videos</li>
                <li>Cloudflare - for CDN and security</li>
                <li>Vercel/Replit - for hosting</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">9. Contact</h3>
              <p>
                For privacy questions, contact us at:<br/>
                Email: privacy@dropmybeats.com<br/>
                Phone: +49 30 12345678
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">10. Right to Complaint</h3>
              <p>
                You have the right to file a complaint with a data protection supervisory authority regarding our processing of personal data.
                The competent authority is the data protection authority of the state where you reside.
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

export default PrivacyPolicyPage