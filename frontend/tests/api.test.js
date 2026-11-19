import { afterEach, describe, expect, test, vi } from 'vitest'
import { api, API_URL } from '../src/api.js'

// Lažen odgovor strežnika za fetch
function odgovor(status, telo) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => (telo === undefined ? Promise.reject(new Error('ni JSON')) : Promise.resolve(telo)),
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('api', () => {
  test('privzeti naslov API-ja je /api', () => {
    expect(API_URL).toBe('/api')
  })

  test('pošlje zahtevo na /api z JSON glavo in vrne telo odgovora', async () => {
    const fetchMock = vi.fn().mockResolvedValue(odgovor(200, { status: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)

    const telo = await api('/health')

    expect(telo).toEqual({ status: 'ok' })
    expect(fetchMock).toHaveBeenCalledWith('/api/health', {
      headers: { 'Content-Type': 'application/json' },
    })
  })

  test('ohrani metodo, telo in dodatne glave', async () => {
    const fetchMock = vi.fn().mockResolvedValue(odgovor(201, { id: 1 }))
    vi.stubGlobal('fetch', fetchMock)

    await api('/izposoje', { method: 'POST', body: '{}', headers: { 'X-Test': '1' } })

    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'POST',
      body: '{}',
      headers: { 'Content-Type': 'application/json', 'X-Test': '1' },
    })
  })

  test('ob napaki vrže sporočilo, kodo in status iz enotnega formata napak', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      odgovor(409, { napaka: { koda: 'TERMIN_ZASEDEN', sporocilo: 'Oprema je zasedena' } })
    ))

    await expect(api('/izposoje', { method: 'POST' })).rejects.toMatchObject({
      message: 'Oprema je zasedena',
      koda: 'TERMIN_ZASEDEN',
      status: 409,
    })
  })

  test('če strežnik ne vrne JSON, vrže splošno sporočilo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(odgovor(500)))

    await expect(api('/oprema')).rejects.toMatchObject({
      message: 'Napaka pri povezavi s strežnikom',
      status: 500,
    })
  })
})
