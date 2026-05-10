import { LegalPage } from './LegalPage'
import { useLegalLang } from './legal/useLegalLang'

function FraudReportingEN() {
  return (
    <>
      <p>
        If you suspect a listing is fraudulent or misleading, report it immediately. Do not share sensitive information
        (PINs, passwords, OTP codes).
      </p>
      <h2>How to report</h2>
      <ul>
        <li>Use WhatsApp support (recommended for fastest response).</li>
        <li>Share the listing link, screenshots, and a brief description of the issue.</li>
      </ul>
      <h2>What we do</h2>
      <ul>
        <li>Review listing evidence (photos, video, ID/ownership documents where available).</li>
        <li>Contact the host/partner for clarification.</li>
        <li>Pause or remove listings that fail verification.</li>
      </ul>
    </>
  )
}

function FraudReportingSW() {
  return (
    <>
      <p>
        Iwapo unashuku kuwa tangazo ni la udanganyifu au linalopotosha, liripoti mara moja. Usishiriki taarifa
        nyeti (PIN, nenosiri, au misimbo ya OTP).
      </p>
      <h2>Jinsi ya kuripoti</h2>
      <ul>
        <li>Tumia msaada wa WhatsApp (unapendekezwa kwa majibu ya haraka).</li>
        <li>Shiriki kiungo cha tangazo, picha za skrini, na maelezo mafupi ya tatizo.</li>
      </ul>
      <h2>Hatua tunazochukua</h2>
      <ul>
        <li>Kagua ushahidi wa tangazo (picha, video, kitambulisho au hati za umiliki zinapopatikana).</li>
        <li>Wasiliana na mwenyeji au mshirika kupata ufafanuzi.</li>
        <li>Simamisha au ondoa matangazo yanayoshindwa uthibitishaji.</li>
      </ul>
    </>
  )
}

export function FraudReporting() {
  const lang = useLegalLang()
  const title = lang === 'sw' ? 'Kuripoti Udanganyifu' : 'Fraud Reporting'
  const Body = lang === 'sw' ? FraudReportingSW : FraudReportingEN
  return (
    <LegalPage title={title}>
      <Body />
    </LegalPage>
  )
}
