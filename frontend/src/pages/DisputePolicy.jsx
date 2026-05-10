import { LegalPage } from './LegalPage'
import { useLegalLang } from './legal/useLegalLang'

function DisputePolicyEN() {
  return (
    <>
      <p>
        If something goes wrong with a booking, contact support as soon as possible. Early reporting helps resolve
        issues faster.
      </p>
      <h2>Recommended steps</h2>
      <ul>
        <li>Confirm details with the host via WhatsApp (check-in time, exact directions, rules).</li>
        <li>If you arrive and the listing differs materially from what was advertised, report immediately.</li>
        <li>Provide photos, messages, and any payment reference numbers.</li>
      </ul>
      <h2>Resolution</h2>
      <p>
        MakaziPlus may help mediate, but the host/partner is responsible for delivery of the stay or service. Refunds,
        reschedules, or alternatives depend on the situation and payment method.
      </p>
    </>
  )
}

function DisputePolicySW() {
  return (
    <>
      <p>
        Endapo kitu kitaenda vibaya kuhusu mahifadhi, wasiliana na huduma kwa wateja haraka iwezekanavyo. Kuripoti
        mapema husaidia kutatua matatizo kwa wakati.
      </p>
      <h2>Hatua zinazopendekezwa</h2>
      <ul>
        <li>Thibitisha maelezo na mwenyeji kupitia WhatsApp (muda wa kuingia, maelekezo halisi, sheria).</li>
        <li>
          Ukiwasili na kugundua kuwa hali ya nyumba inatofautiana sana na ilivyotangazwa, ripoti mara moja.
        </li>
        <li>Toa picha, ujumbe, na nambari yoyote ya kumbukumbu ya malipo.</li>
      </ul>
      <h2>Utatuzi</h2>
      <p>
        MakaziPlus inaweza kusaidia katika upatanishi, lakini mwenyeji au mshirika ndiye mwenye wajibu wa kutoa
        malazi au huduma. Marejesho ya pesa, mabadiliko ya tarehe, au njia mbadala hutegemea hali ya tatizo na
        njia ya malipo.
      </p>
    </>
  )
}

export function DisputePolicy() {
  const lang = useLegalLang()
  const title = lang === 'sw' ? 'Sera ya Migogoro' : 'Dispute Policy'
  const Body = lang === 'sw' ? DisputePolicySW : DisputePolicyEN
  return (
    <LegalPage title={title}>
      <Body />
    </LegalPage>
  )
}
