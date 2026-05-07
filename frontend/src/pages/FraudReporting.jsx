import { LegalPage } from './LegalPage'

export function FraudReporting() {
  return (
    <LegalPage title="Fraud Reporting">
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
    </LegalPage>
  )
}

