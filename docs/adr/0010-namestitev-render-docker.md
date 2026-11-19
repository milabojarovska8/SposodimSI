# Namestitev na Render z Docker sliko iz artefakta

- Status: sprejeto

## Kontekst in problem

Aplikacijo je treba samodejno namestiti ob vsakem pushu v `main`, potem ko so lint, build in testi uspeli. Namestitev mora uporabiti rezultat joba `build` in aplikacije ne sme graditi znova. Hkrati mora ostati veljavna ADR 0003: frontend in API morata teči na istem naslovu, da piškotek seje deluje brez CORS.

## Obravnavane alternative

* Frontend na Netlify, backend na Render, vsak na svojem naslovu
* Render gradi aplikacijo neposredno iz repozitorija
* Docker slika iz artefakta joba `build`, objavljena v GitHub Container Registry, ki jo namesti Render

## Sprejeta odločitev

Izbrana alternativa: "Docker slika iz artefakta", ker job `deploy` le prekopira že zgrajeni paket v sliko in je ne gradi znova, Express pa v isti storitvi streže frontend in API (skladno z ADR 0003). Ločena gostitelja bi zahtevala CORS in piškotke `sameSite=none`. Gradnja na Renderju bi pomenila ponovno gradnjo, ki je cevovod ne nadzoruje.

### Posledice

* Pozitivno, ker v produkcijo pride natanko tisto, kar je bilo zgrajeno in preizkušeno v cevovodu.
* Pozitivno, ker je za aplikacijo dovolj en javni naslov in ena storitev.
* Negativno, ker mora biti paket v GitHub Container Registry javen, da ga Render lahko prenese.
* Negativno, ker se brezplačna storitev na Renderju po nedejavnosti ustavi, zato je prva zahteva počasnejša, brezplačna baza pa velja omejen čas.
