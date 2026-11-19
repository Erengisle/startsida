/* Referatkontroll – jämförelsen (samma regler som referat.py i skillen referatkontroll).
   Allt körs i webbläsaren. Inget skickas någonstans. */
(function (root) {
  "use strict";
  const RX = /[a-zåäöéüA-ZÅÄÖÉÜ0-9]+(?:-[a-zåäöéüA-ZÅÄÖÉÜ]+)?/g;
  const QCH = '"”“«»';
  const BARRIAR = "\u0000"; // skiljer källorna åt så att ingen följd korsar två källor
  const MAN = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"];

  function toks(s) {
    const out = []; let m; RX.lastIndex = 0;
    while ((m = RX.exec(s)) !== null) out.push([m[0].toLowerCase(), m.index, m.index + m[0].length]);
    return out;
  }

  /* Ratcliff/Obershelp-likhet, som difflib.SequenceMatcher(None,a,b).ratio() */
  function matches(a, b) {
    if (!a.length || !b.length) return 0;
    // längsta gemensamma delsträng
    let best = 0, ai = 0, bj = 0;
    let prev = new Array(b.length + 1).fill(0), cur = new Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          cur[j] = prev[j - 1] + 1;
          if (cur[j] > best) { best = cur[j]; ai = i - best; bj = j - best; }
        } else cur[j] = 0;
      }
      [prev, cur] = [cur, prev]; cur.fill(0);
    }
    if (!best) return 0;
    return best + matches(a.slice(0, ai), b.slice(0, bj)) + matches(a.slice(ai + best), b.slice(bj + best));
  }
  const ratioCache = new Map();
  function ratio(a, b) {
    if (a === b) return 1;
    const k = a + "\u0001" + b;
    if (ratioCache.has(k)) return ratioCache.get(k);
    const r = (a.length + b.length) ? 2 * matches(a, b) / (a.length + b.length) : 1;
    if (ratioCache.size > 200000) ratioCache.clear();
    ratioCache.set(k, r); return r;
  }

  /* Citat i citat: byter de inre citattecknen mot mellanslag (längden ändras inte) */
  function nastlade(txt) {
    const ut = txt.split("");
    const radRx = /[^\n]+/g; let rad;
    while ((rad = radRx.exec(txt)) !== null) {
      const stack = [];
      for (let k = 0; k < rad[0].length; k++) {
        const c = rad[0][k]; if (QCH.indexOf(c) < 0) continue;
        const p = rad.index + k;
        const fore = p > rad.index ? txt[p - 1] : " ";
        const efter = p + 1 < rad.index + rad[0].length ? txt[p + 1] : " ";
        let oppnar;
        if (c === "“" || c === "«") oppnar = true;
        else if (c === "»") oppnar = false;
        else oppnar = (/\s/.test(fore) || (QCH + "(").indexOf(fore) >= 0) && (/[\p{L}\p{N}]/u.test(efter) || QCH.indexOf(efter) >= 0);
        if (oppnar || !stack.length) stack.push(p);
        else { const q = stack.pop(); if (stack.length) { ut[q] = " "; ut[p] = " "; } }
      }
    }
    return ut.join("");
  }

  function analysera(txt, kalla, opt) {
    opt = opt || {};
    const LANGT_CITAT = opt.langtCitat || 15;
    // källor: en sträng eller en lista med strängar
    const kallor = Array.isArray(kalla) ? kalla : [kalla];
    const KT = []; // [ord, källindex, start, slut]
    kallor.forEach((k, ki) => { if (KT.length) KT.push([BARRIAR, -1, 0, 0]); toks(k).forEach(t => KT.push([t[0], ki, t[1], t[2]])); });
    const src = KT.map(t => t[0]);
    const SRC = " " + src.join(" ") + " ";
    const TITLAR = (opt.titlar || []).map(t => toks(t).map(x => x[0])).filter(t => t.length);
    const pos = new Map(); src.forEach((w, j) => { if (!pos.has(w)) pos.set(w, []); pos.get(w).push(j); });

    const eq = (a, b, f) => a === b || (f && a !== BARRIAR && b !== BARRIAR && a.length >= 5 && b.length >= 5 && ratio(a, b) >= 0.8);
    function cover(w, n, f) {
      const cov = new Array(w.length).fill(false); let i = 0;
      while (i < w.length) {
        let best = 0;
        for (let j = 0; j < src.length; j++) {
          let k = 0;
          while (i + k < w.length && j + k < src.length && eq(w[i + k], src[j + k], f)) k++;
          if (k > best) best = k;
        }
        if (best >= n) { for (let x = i; x < i + best; x++) cov[x] = true; i += best; } else i++;
      }
      return cov;
    }
    function bestMatch(q) {
      const n = q.length, qs = q.join(" ");
      // kandidater: startpunkter där minst ett ord i citatet står på "rätt" plats
      const kand = new Set();
      q.forEach((w, t) => (pos.get(w) || []).forEach(j => { for (let d = -3; d <= 3; d++) { const s = j - t + d; if (s >= 0 && s < src.length) kand.add(s); } }));
      let bestr = 0, bj = 0, bl = n;
      for (const j of kand) {
        for (let L = Math.max(1, n - 3); L < n + 4; L++) {
          const win = src.slice(j, j + L); if (!win.length || win.includes(BARRIAR)) continue;
          const r = ratio(qs, win.join(" "));
          if (r > bestr) { bestr = r; bj = j; bl = Math.min(L, src.length - j); }
        }
      }
      return [bestr, bj, bl];
    }

    const T = toks(txt), w = T.map(t => t[0]), N = w.length, kind = new Array(N).fill(null);
    TITLAR.forEach(TIT => { const L = TIT.length; for (let i = 0; i + L <= N; i++) if (TIT.every((x, k) => w[i + k] === x)) for (let x = i; x < i + L; x++) kind[x] = "titel"; });
    const taken = [], felcit = [], langa = [];
    const qtxt = nastlade(txt);
    const QRX = [/``(.+?)``/g, /''(.+?)''/g, /"([^"\n]+)"/g, /”([^”\n]+)”/g, /“([^”\n]+)”/g, /(?<![a-zåäö])'([^'\n]+)'/g];
    for (const rx of QRX) {
      let m; rx.lastIndex = 0;
      while ((m = rx.exec(qtxt)) !== null) {
        const s = m.index + m[0].indexOf(m[1]), e = s + m[1].length;
        if (taken.some(([a, b]) => s < b && e > a)) continue;
        taken.push([s, e]);
        let idx = []; T.forEach((t, i) => { if (t[1] >= s && t[2] <= e) idx.push(i); });
        if (!idx.length || idx.every(i => kind[i] === "titel")) continue;
        idx = idx.filter(i => kind[i] !== "titel");
        const q = idx.map(i => w[i]);
        if (SRC.indexOf(" " + q.join(" ") + " ") >= 0) {
          idx.forEach(i => kind[i] = "citat");
          if (q.length >= LANGT_CITAT) langa.push([txt.slice(s, e).trim(), q.length]);
        } else if (q.length >= 3) {
          const [r, j, l] = bestMatch(q);
          if (r >= 0.7) {
            idx.forEach(i => kind[i] = "felcitat");
            const a = KT[j], b = KT[j + l - 1];
            felcit.push([txt.slice(s, e).trim(), (a && b && a[1] === b[1]) ? kallor[a[1]].slice(a[2], b[3]) : ""]);
          }
        }
      }
    }
    const c5 = cover(w, 5, false), cF = cover(w, 4, true), lvl = new Array(N).fill(0);
    for (let i = 0; i < N; i++) if (kind[i] === null) lvl[i] = c5[i] ? 2 : (cF[i] ? 1 : 0);
    function demote(level, minlen) {
      let i = 0;
      while (i < N) {
        if (lvl[i] >= level) {
          let j = i; while (j + 1 < N && lvl[j + 1] >= level) j++;
          if (j - i + 1 < minlen) for (let x = i; x <= j; x++) lvl[x] = level - 1;
          i = j + 1;
        } else i++;
      }
    }
    demote(2, 5); demote(1, 4);
    const lab = w.map((_, i) => kind[i] || ["egen", "nara", "exakt"][lvl[i]]);
    const cnt = {}; ["egen", "nara", "exakt", "citat", "felcitat"].forEach(k => cnt[k] = lab.filter(x => x === k).length);
    const tot = Math.max(1, cnt.egen + cnt.nara + cnt.exakt + cnt.citat + cnt.felcitat);
    // längsta följd avskrivet (ordagrant eller nästan) utan citattecken
    let langst = 0, run = 0; lab.forEach(k => { run = (k === "exakt" || k === "nara") ? run + 1 : 0; if (run > langst) langst = run; });
    return { T, lab, cnt, tot, felcit, langa, langst, ord: N };
  }

  const ORDN = ["egen", "citat", "felcitat", "nara", "exakt"];
  function pct(c, tot) {
    const raw = {}, f = {}; ORDN.forEach(k => { raw[k] = 100 * c[k] / tot; f[k] = Math.floor(raw[k]); });
    const rest = 100 - ORDN.reduce((s, k) => s + f[k], 0);
    ORDN.slice().sort((a, b) => (raw[b] - f[b]) - (raw[a] - f[a])).slice(0, rest).forEach(k => f[k]++);
    return f;
  }

  /* ---------- Källhänvisning ---------- */
  function _best(T, target) {
    const tw = toks(target).map(t => t[0]), n = tw.length, ts = tw.join(" "); let best = [0, null, null];
    if (!n) return best;
    for (let i = 0; i < T.length; i++) for (let L = Math.max(1, n - 1); L < n + 2; L++) {
      if (i + L > T.length) break;
      const r = ratio(ts, T.slice(i, i + L).map(t => t[0]).join(" "));
      if (r > best[0]) best = [r, T[i][1], T[i + L - 1][2]];
    }
    return best;
  }
  function _quoted(txt, s, e) {
    const fore = txt.slice(Math.max(0, s - 3), s), efter = txt.slice(e, e + 3);
    return [..."\"”“'`«"].some(q => fore.includes(q)) && [..."\"”“'`»"].some(q => efter.includes(q));
  }
  const _norm = x => toks(x.replace(/-/g, " ")).map(t => t[0]);
  const _ordlikt = (a, b) => a === b || (a.length >= 3 && b.length >= 3 && ratio(a, b) >= 0.75);
  function _hittar(txt, target) {
    const tw = _norm(target), w = _norm(txt), n = tw.length;
    for (let i = 0; i + n <= w.length; i++) if (tw.every((x, k) => _ordlikt(w[i + k], x))) return true;
    return false;
  }
  function kallkontroll(txt, KI) {
    const T = toks(txt), out = [];
    if (KI.titel) {
      const [r, s, e] = _best(T, KI.titel);
      if (_hittar(txt, KI.titel)) out.push(["Titel", "ok", (s !== null && _quoted(txt, s, e)) ? "" : "Sätt titeln inom citattecken."]);
      else if (r >= 0.75) out.push(["Titel", "nastan", `Du skrev ”${txt.slice(s, e)}”. Titeln ska ha samma ord som i texten.`]);
      else out.push(["Titel", "saknas", "Titeln saknas."]);
    }
    if (KI.forfattare) {
      const efter = KI.forfattare.trim().split(/\s+/).pop();
      if (_hittar(txt, KI.forfattare)) out.push(["Författare", "ok", ""]);
      else if (_hittar(txt, efter)) out.push(["Författare", "nastan", "Skriv hela namnet (för- och efternamn) första gången."]);
      else out.push(["Författare", "saknas", "Författarens namn saknas."]);
    }
    if (KI.publikation) out.push(["Tidning", _hittar(txt, KI.publikation) ? "ok" : "saknas", _hittar(txt, KI.publikation) ? "" : "Tidningens/publikationens namn saknas."]);
    if (KI.datum && /^\d{4}-\d{2}-\d{2}$/.test(KI.datum)) {
      const [y, m, d] = KI.datum.split("-"); const J = " " + T.map(t => t[0]).join(" ") + " ";
      const mn = MAN[+m - 1];
      const varianter = [`${y} ${m} ${d}`, `${+d} ${mn} ${y}`, `${d} ${mn} ${y}`, `${+d} ${+m} ${y}`, `${d} ${m} ${y}`];
      if (varianter.some(v => J.includes(" " + v + " "))) out.push(["Datum", "ok", ""]);
      else {
        const mm = txt.match(new RegExp(`\\b(1[89]|20)\\d\\d[-/ .]\\d{1,2}[-/ .]\\d{1,2}\\b|\\b\\d{1,2}[-/ .]\\d{1,2}[-/ .](1[89]|20)\\d\\d\\b|\\b\\d{1,2} (${MAN.join("|")}) (1[89]|20)\\d\\d\\b`, "i"));
        out.push(["Datum", mm ? "fel" : "saknas", mm ? `Du skrev ”${mm[0]}”. Kontrollera datumet.` : "Datumet saknas."]);
      }
    }
    return out;
  }

  root.Referat = { toks, ratio, nastlade, analysera, pct, kallkontroll, ORDN };
  if (typeof module !== "undefined") module.exports = root.Referat;
})(typeof window !== "undefined" ? window : globalThis);
