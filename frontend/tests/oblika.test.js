import { describe, expect, test } from 'vitest'
import { lepDatum, OCENE, STANJA } from '../src/oblika.js'

describe('oblika', () => {
  test('lepDatum vrne datum in uro v slovenski obliki', () => {
    const besedilo = lepDatum('2026-11-08T10:30:00')
    expect(besedilo).toContain('8. 11.')
    expect(besedilo).toContain('10:30')
  })

  test('STANJA vsebuje berljivo oznako za vsako stanje izposoje', () => {
    expect(Object.keys(STANJA)).toEqual(['zahtevana', 'odobrena', 'zavrnjena', 'preklicana', 'izdana', 'vrnjena'])
    expect(STANJA.izdana).toBe('Izdana')
  })

  test('OCENE so razvrščene od najboljše do najslabše', () => {
    expect(Object.keys(OCENE)).toEqual(['brez_poskodb', 'manjse_poskodbe', 'poskodovano'])
  })
})
