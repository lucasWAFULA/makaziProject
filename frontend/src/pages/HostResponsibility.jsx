import { LegalPage } from './LegalPage'
import { useLegalLang } from './legal/useLegalLang'

function HostResponsibilityEN() {
  return (
    <>
      <p>
        Hosts must ensure that listings accurately represent the property. This includes photos, location, amenities,
        rules, and pricing.
      </p>
      <ul>
        <li>Provide real, recent photos and a walkthrough video link where possible.</li>
        <li>Pin accurate GPS location or provide a clear landmark.</li>
        <li>Respond to guests promptly and honor confirmed bookings.</li>
        <li>Report any changes to availability, pricing, or access restrictions immediately.</li>
      </ul>
      <p>
        MakaziPlus may pause, reject, or suspend listings that are inaccurate, misleading, or repeatedly reported.
      </p>
    </>
  )
}

function HostResponsibilitySW() {
  return (
    <>
      <p>
        Wenyeji ni lazima wahakikishe kwamba matangazo yanaonyesha kwa usahihi nyumba husika. Hii inajumuisha picha,
        eneo, huduma, sheria, na bei.
      </p>
      <ul>
        <li>Toa picha halisi za hivi karibuni na kiungo cha video ya kutembelea ndani inapowezekana.</li>
        <li>Weka eneo sahihi la GPS au eleza kivutio cha karibu kwa uwazi.</li>
        <li>Jibu wageni kwa wakati na heshimu mahifadhi yaliyothibitishwa.</li>
        <li>Ripoti mara moja mabadiliko yoyote ya upatikanaji, bei, au vizuizi vya kuingia.</li>
      </ul>
      <p>
        MakaziPlus inaweza kusimamisha, kukataa, au kufungia matangazo yasiyo sahihi, yenye kupotosha, au
        yanayoripotiwa mara kwa mara.
      </p>
    </>
  )
}

export function HostResponsibility() {
  const lang = useLegalLang()
  const title = lang === 'sw' ? 'Wajibu wa Mwenyeji' : 'Host Responsibility'
  const Body = lang === 'sw' ? HostResponsibilitySW : HostResponsibilityEN
  return (
    <LegalPage title={title}>
      <Body />
    </LegalPage>
  )
}
