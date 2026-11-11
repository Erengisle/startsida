# Min startsida

En personlig startsida med samlade länkar för undervisning och administration. Sidan är en statisk webbsida som publiceras via GitHub Pages.

**Adress:** https://erengisle.github.io/startsida/

## Vad sidan är till för

Allt jag behöver under en arbetsdag på ett ställe: administrativa system, betygsunderlag per kurs, planeringar per klass, övningar för SVA, statistiksidor till undervisningen och bedömningsverktyg. Sidan är byggd för eget bruk, men upplägget går att återanvända.

## Innehåll

Sidan är indelad i sektioner med knappar. Varje knapp har en rubrik och en kort beskrivning.

| Sektion | Innehåll |
|---|---|
| **Snabbåtkomst** | Noteringar (Google-dokument), tom veckoplanering, Drive-mapp för anmälan till komplettering |
| **Administrativt** | Läsårsplan, ämnesfördjupning, Vklass, Skola24, närvaroregistrering med QR, ProRenata, incidentrapport, Heroma |
| **Mina kurser – betygsunderlag** | Dashboards för SVA 1, SVA 2, SVE 3 och Historia 1b (samtliga klasser). Dessutom särskild prövning i Historia 1b med elevsida och Drive-mapp |
| **Mina planeringar** | Planeringssidor per kurs och klass. För Historia 1b även begreppsträning och Drive-mapp per klass |
| **Ämnessidor** | Statistik och diagram: World Bank Open Data, Gapminder (material och Labs), Landguiden, SCB:s Kvinnor och män |
| **Övningar för SVA** | Ordföljd på tavlan och Relativa bisatser |
| **Bedömningsverktyg** | Skills i Claude för bedömning och kontroll. Knappen *Kopiera startrad* kopierar en rad som klistras in i en ny chatt |

Många länkar går till inloggningssidor (Vklass, Skola24, Heroma, ProRenata). Det är avsiktligt: sidan innehåller inga lösenord eller personuppgifter.

## Funktioner

- **Sök:** filtrerar knapparna. Om inget matchar visas "Inga länkar matchar sökningen".
- **Ordna om:** knapparna och sektionerna kan flyttas med dra och släpp. Ordningen sparas i webbläsaren, och *Återställ ordning* går tillbaka till grundläget.
- **Ny flik:** alla länkar öppnas i en ny flik.
- **Mobilanpassad:** sidan använder responsiv layout.
- **Ej sökbar:** sidan har `noindex, nofollow` och ska inte dyka upp i sökmotorer.

## Publicering

Sidan ligger i ett publikt GitHub-repo och publiceras med GitHub Pages. Med ett gratiskonto måste repot vara publikt för att sidan ska visas. Görs repot privat slutar sidan fungera.

Eleverna når inte claude.ai i skolan, och därför delas klassrumssidor via GitHub Pages.

## Använda upplägget själv

1. Skapa ett eget repo på GitHub och kopiera in sidans filer.
2. Byt ut länkarna mot dina egna.
3. Aktivera GitHub Pages under *Settings → Pages*.
4. Lägg inga lösenord eller elevuppgifter på sidan. Det är ett publikt repo.

## Att tänka på

- Länkar till Google Drive, Apps Script och Google-dokument fungerar bara för den som har behörighet. Länkarna i den här versionen går till mina egna filer.
- Dashboards och bedömningsverktyg bygger på mitt eget material och på Claude. De är inte färdiga att användas av andra utan anpassning.
