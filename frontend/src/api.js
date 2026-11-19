// Naslov API-ja se nastavi z okoljsko spremenljivko VITE_API_URL ob gradnji.
// Privzeto je '/api': v razvoju zahteve posreduje Vite, v produkciji pa frontend
// streže isti Express, ki teče na istem naslovu (ADR 0003).
export const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function api(pot, moznosti = {}) {
  const odgovor = await fetch(API_URL + pot, {
    ...moznosti,
    headers: { 'Content-Type': 'application/json', ...moznosti.headers },
  })

  const telo = await odgovor.json().catch(() => null)

  if (!odgovor.ok) {
    const napaka = new Error(telo?.napaka?.sporocilo || 'Napaka pri povezavi s strežnikom')
    napaka.koda = telo?.napaka?.koda
    napaka.status = odgovor.status
    throw napaka
  }

  return telo
}