import { afterEach, describe, expect, test, vi } from 'vitest'
import { naloziUporabnika, odjava, prijava, uporabnik } from '../src/uporabnik.js'

function odgovor(status, telo) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(telo) }
}

afterEach(() => {
  vi.unstubAllGlobals()
  uporabnik.value = null
})

describe('uporabnik', () => {
  test('prijava shrani prijavljenega uporabnika', async () => {
    const fetchMock = vi.fn().mockResolvedValue(odgovor(200, { id: 3, vloga: 'clan' }))
    vi.stubGlobal('fetch', fetchMock)

    await prijava('clan@sposodimsi.si', 'geslo123')

    expect(uporabnik.value).toEqual({ id: 3, vloga: 'clan' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/prijava')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: 'clan@sposodimsi.si', geslo: 'geslo123' })
  })

  test('neuspešna prijava ne nastavi uporabnika', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      odgovor(401, { napaka: { koda: 'NAPACNA_PRIJAVA', sporocilo: 'Napačen e-naslov ali geslo' } })
    ))

    await expect(prijava('clan@sposodimsi.si', 'narobe')).rejects.toThrow('Napačen e-naslov ali geslo')
    expect(uporabnik.value).toBeNull()
  })

  test('naloziUporabnika brez seje nastavi uporabnika na null', async () => {
    uporabnik.value = { id: 1 }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(odgovor(401, { napaka: { sporocilo: 'Prijava je obvezna' } })))

    await naloziUporabnika()

    expect(uporabnik.value).toBeNull()
  })

  test('odjava pobriše uporabnika', async () => {
    uporabnik.value = { id: 1, vloga: 'skrbnik' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(odgovor(200, { ok: true })))

    await odjava()

    expect(uporabnik.value).toBeNull()
  })
})
