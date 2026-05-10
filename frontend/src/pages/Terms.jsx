import { LegalPage } from './LegalPage'
import { useLegalLang } from './legal/useLegalLang'

function TermsEN() {
  return (
    <>
      <p>
        MakaziPlus connects guests with property owners, managers, agents, and travel partners. Listings are created and
        managed by hosts and partners.
      </p>
      <h2>Host responsibility</h2>
      <p>
        Hosts are responsible for the accuracy of listing information, photos, pricing, rules, and availability. If any
        detail is incorrect, guests may report the listing and MakaziPlus may pause or remove it.
      </p>
      <h2>Verification</h2>
      <p>
        Verification tiers (Unverified, Makazi Verified, Premium Verified) indicate the level of checks completed. They
        do not guarantee the condition of the property on every date.
      </p>
      <h2>Payments and disputes</h2>
      <p>
        Payment terms and cancellation/dispute handling depend on the service and partner involved. Where applicable,
        MakaziPlus may assist with dispute resolution, but hosts and partners remain responsible for delivery of the
        service booked.
      </p>
    </>
  )
}

function TermsSW() {
  return (
    <>
      <p>
        MakaziPlus huunganisha wageni na wamiliki wa nyumba, wasimamizi, mawakala, na washirika wa safari. Matangazo
        ya malazi huundwa na kusimamiwa na wenyeji na washirika.
      </p>
      <h2>Wajibu wa mwenyeji</h2>
      <p>
        Wenyeji wana wajibu wa kuhakikisha usahihi wa maelezo ya tangazo, picha, bei, sheria, na upatikanaji.
        Endapo maelezo yoyote si sahihi, wageni wanaweza kuripoti tangazo na MakaziPlus inaweza kusimamisha au
        kuondoa tangazo hilo.
      </p>
      <h2>Uthibitishaji</h2>
      <p>
        Viwango vya uthibitishaji (Haijathibitishwa, Imethibitishwa na Makazi, Imethibitishwa kwa Kiwango cha Juu)
        huonyesha kiwango cha ukaguzi uliokamilika. Havihakikishi hali ya nyumba kwa kila tarehe.
      </p>
      <h2>Malipo na migogoro</h2>
      <p>
        Masharti ya malipo na utaratibu wa kufuta au kushughulikia migogoro hutegemea huduma na mshirika husika.
        Pale inapowezekana, MakaziPlus inaweza kusaidia katika kutatua migogoro, lakini wenyeji na washirika
        ndio wanaobaki na wajibu wa kutoa huduma iliyowekwa.
      </p>
    </>
  )
}

export function Terms() {
  const lang = useLegalLang()
  const title = lang === 'sw' ? 'Sheria na Masharti' : 'Terms & Conditions'
  const Body = lang === 'sw' ? TermsSW : TermsEN
  return (
    <LegalPage title={title}>
      <Body />
    </LegalPage>
  )
}
