# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running locally

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

No build step, no dependencies to install. The frontend is pure HTML/CSS/JS served as static files.

## Architecture

This is a **two-tier application**: a static frontend SPA and a Cloudflare Worker backend.

### Frontend (`index.html` + `assets/`)

Single-page app with five views, switched via `switchView()` in `app.js`:

| View | ID | Purpose |
|------|----|---------|
| CS · Acionamento | `view-cs` | Main CS table — ranks students by engagement score, generates WhatsApp outreach messages |
| Gestão · Saúde | `view-gest` | Turma-level evolution charts, risk grid, cycle comparison |
| Aluno · Perfil | `view-aluno` | Per-student profile with full attendance history, AI diagnosis, and AI outreach drafting |
| Chamada | `view-chamada` | Live attendance registration (P/C/F/V per student per week) saved to KV |
| Acionamentos | `view-acionamentos` | Log of all outreach actions performed by the CS team |

All data lives in three global variables populated at startup by `reloadAll()`:
- `allAlunos` — student list from Monday.com (via Worker `/dados`)
- `kvPresenca` — attendance records from Cloudflare KV (via Worker `/presenca/all`), shaped as `{ tab: { ciclo: { normName: { history: [{P,C,F,V}×5] } } } }`
- `kvGrupoScores` — WhatsApp group participation scores (via Worker `/grupo/score`)

The active cycle (month) is tracked by `cicloAtivo` (AAAA-MM string). `getKvEntry(tab, normName)` and `getKvTab(tab)` are the primary accessors into `kvPresenca`.

### Backend (`worker.js`) — Cloudflare Worker

Deployed at `https://am-painel-api.aceleradormedico2021.workers.dev`.

Required environment variables (Cloudflare Worker Settings → Variables):
- `MONDAY_TOKEN` — Monday.com API token
- `CS_PASSWORD` — master password fallback
- `CS_INVITE_CODE` — registration invite code
- `ANTHROPIC_API_KEY` — Claude API key
- `ZAPI_INSTANCE`, `ZAPI_TOKEN`, `ZAPI_GROUP_ID` — Z-API (WhatsApp gateway)
- `KV` binding — Cloudflare KV namespace `am-presenca`

Key API routes:
- `GET /dados` — fetches and merges Master + Mentoria + Winners boards from Monday.com + Google Sheets; cached 5 min in CF Cache
- `GET /presenca/all` — returns all KV attendance keys consolidated by tab/ciclo/normName
- `POST /presenca` — saves attendance for a tab/week; body `{ tab, semana, registros, date }`
- `POST /ai/diagnostico` — calls Claude API to generate student engagement analysis
- `POST /ai/acionamento` — calls Claude API to draft a personalized WhatsApp message
- `POST /ai/enviar` — sends via Z-API and logs the action in KV (`acionamento:{date}:{ts}`)
- `POST /zapi/webhook` — receives Z-API messages, classifies them via Claude (resultado/ajuda/outro), scores into `grupo_msgs:{week}:{normName}`
- Scheduled cron: sends daily WhatsApp summary to the team via `enviarResumoDiario()`

### Key data concepts

**Attendance schema:** Each record is `{P: bool, C: bool, F: bool, V: bool}` — Present, Camera on, Feedback given (specialty tabs only), Victory shared.

**Ciclo:** A monthly billing/activity cycle identified by `AAAA-MM`. KV keys follow `presenca:{tab}:{ciclo}:s{1-5}`. Week number within a cycle: days 1–7 = week 1, 8–14 = week 2, etc.

**Turmas:** `Master` and `Mentoria`. `isWinners` is a flag on Master students who also participate in Winners boards — they attend extra `Winners Encontro` sessions.

**Engagement score** (`calcCompositeScore`): weighted average across the student's tabs (Mentoria/Hotseat/Master/especialidade). Weights differ by turma. Per-tab score = P(50%) + C(25%) + V(25%); specialty tabs add F(20%).

**norm()** normalizes names for key lookups: lowercase, strip diacritics, collapse whitespace. Always use it when looking up students across boards/KV.

### Design tokens

CSS variables are defined in `assets/css/styles.css` `:root {}`. The authoritative values are in the **Paleta Oficial** section below — use those. The file currently contains legacy values (`#FFD600`, `Bebas Neue`, `Outfit`) that must be migrated to the official palette on any edit.

## Design System & Referências Visuais

> Toda mudança visual deve passar pelo critério: **"isso parece um dashboard premium de 2025?"** Se a resposta for não, refaça.

### Paleta Oficial — Acelerador Médico

Substitua os tokens antigos pelos valores abaixo ao editar ou criar CSS. Não inventar cores fora desta lista.

```css
/* Marca */
--acc:       #F9B701;
--acc-dark:  #C48E00;
--acc-dim:   rgba(249,183,1,0.15);
--acc-glow:  rgba(249,183,1,0.25);

/* Fundos */
--bg:      #07070A;
--s1:      #0D0D12;
--s2:      #121218;
--s3:      #18181F;
--s4:      #1E1E28;
--overlay: rgba(7,7,10,0.88);

/* Bordas */
--border:     rgba(255,255,255,0.07);
--border2:    rgba(255,255,255,0.12);
--border-acc: rgba(249,183,1,0.35);

/* Semânticas */
--safe:        #22D98A;
--safe-dim:    rgba(34,217,138,0.12);
--danger:      #FF3B5C;
--danger-dim:  rgba(255,59,92,0.12);
--warn:        #FF8C00;
--warn-dim:    rgba(255,140,0,0.12);
--blue:        #4D8EFF;
--blue-dim:    rgba(77,142,255,0.12);
--purple:      #A855F7;
--purple-dim:  rgba(168,85,247,0.12);

/* Texto */
--text:   #EEEEF5;
--text-2: #A0A0B8;
--text-3: #5A5A72;
```

**Regras obrigatórias da paleta:**
- **NUNCA usar `#FFD600`** ou qualquer amarelo diferente de `#F9B701`
- **NUNCA inventar cores** fora desta paleta
- Hover do botão primário usa `--acc-dark` (`#C48E00`)
- Badge Master/VIP usa `--purple` com `--purple-dim` de fundo
- Cards selecionados/ativos usam `--border-acc` na borda
- Todos os `--*-dim` são usados como background de badges e estados sutis

### Logo oficial

Arquivo: `/Users/rodrigosouza/Desktop/IDV ACELERADRO MÉDICO/Identidade Visual/logo v1.svg`

O logo é um SVG com dois elementos:
- **Símbolo geométrico** (chevron/ângulo duplo à esquerda) — preenchido com `#F9B701` (`--acc`)
- **Logotipo textual "ACELERADOR MÉDICO"** — preenchido com `white`

Ao usar o logo no HTML, sempre importar o SVG diretamente (não usar PNG/JPG). A cor `#F9B701` no símbolo deve coincidir com `--acc` — nunca substituir por outra tonalidade de amarelo.

### Tipografia

- **Display / números grandes:** `font-family: 'Syne', sans-serif`, weight 700–800
- **Body / labels / tabelas:** `font-family: 'DM Sans', sans-serif`, weight 400–500
- **Nunca usar** Inter, Roboto, system-ui ou qualquer fonte genérica

Ao adicionar as fontes via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

### Cards de métricas (padrão obrigatório)

```css
.stat-card {
  background: var(--s2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px 16px;
  border-top: 2px solid <cor-semântica>; /* --acc, --safe, --danger, --warn ou --blue */
  transition: transform 0.18s, border-color 0.18s;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--border2);
}
.stat-num {           /* número principal */
  font-family: 'Syne', sans-serif;
  font-size: 2rem;    /* mínimo — pode ser maior */
  font-weight: 800;
  color: <cor-semântica>;
}
.stat-lbl {           /* label abaixo do número */
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
```

Hierarquia interna do card: **número grande → label pequeno → badge/status**. Nunca inverter.

### Hierarquia visual e espaçamento

- Espaçamento mínimo entre seções: `24px`
- Cada elemento precisa de espaço para respirar — sem informação colada
- Gráficos e charts sempre dentro de um card com padding (nunca soltos na página)
- Badges e status ficam abaixo do label, nunca ao lado do número

### Topbar

```css
.topbar {
  height: 52px;
  position: sticky;
  top: 0;
  background: rgba(7,7,10,0.92);   /* semitransparente — nunca sólido */
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
```

- Logo à esquerda, nav-tabs centralizados, ações à direita
- Tab ativo: `color: var(--acc)`, `background: rgba(255,214,0,0.08)` (`--acc-dim`)
- Tab inativo hover: `color: var(--text)`, `background: var(--s3)`

### Sidebar (quando existir)

```css
.sidebar {
  width: 220px;
  background: var(--s1);
  border-right: 1px solid var(--border);
}
.sidebar-item {
  height: 36px;
  border-radius: 8px;
  padding: 0 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}
.sidebar-item.active {
  background: rgba(255,214,0,0.08);
  color: var(--acc);
}
```

### Tabelas

```css
thead th {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
}
tbody tr {
  border-bottom: 1px solid var(--border);
}
tbody tr:hover {
  background: var(--s2);
}
td {
  padding: 10px 14px;
  font-family: 'DM Sans', sans-serif;
}
td:first-child {   /* coluna de nome */
  font-weight: 600;
  color: var(--text);
}
```

### Botões

```css
/* Primary */
.btn-primary {
  background: var(--acc);
  color: #000;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  height: 38px;
  border-radius: 9px;   /* nunca < 8px */
  border: none;
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-2);
  border: 1px solid var(--border);
  font-family: 'DM Sans', sans-serif;
  height: 38px;
  border-radius: 9px;
}
```

### Referências visuais de inspiração

Ao criar novos componentes, consultar mentalmente estas referências:

| Referência | O que tomar emprestado |
|------------|----------------------|
| **Crypto dashboard** | Azul escuro, cards com gráfico interno, stat strips horizontais |
| **POS Overview** | Dark marrom, densidade média, badges coloridos com bom contraste |
| **VertexGuard** | Dark roxo, risk score circular, tabela densa mas legível |
| **TailwindAdmin** | Dark neutro, stat cards com ícone colorido, sidebar clean |
| **Crextio HR** | Tipografia grande e audaciosa, cards arredondados, respiração generosa |

## Deploying changes

```bash
git add .
git commit -m "descrição"
git push
```

Cloudflare auto-deploys from GitHub in ~1 minute. The Worker (`worker.js`) and the static frontend deploy separately — the Worker via Cloudflare Workers CI, the frontend via Cloudflare Pages (or manually via `wrangler pages deploy`).
