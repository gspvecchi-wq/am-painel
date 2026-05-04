// ═══════════════════════════════════════════
// AM PAINEL — Cloudflare Worker v2
// Variáveis de ambiente (Settings → Variables):
//   MONDAY_TOKEN      → token da API do Monday
//   CS_PASSWORD       → senha mestre (fallback)
//   CS_INVITE_CODE    → código de convite para cadastro (ex: AM2026CS)
//   ANTHROPIC_API_KEY → chave da API da Claude (IA)
//   ZAPI_INSTANCE     → instância Z-API
//   ZAPI_TOKEN        → token Z-API
//   ZAPI_GROUP_ID     → ID do grupo WhatsApp
// Bindings (Settings → Associações):
//   KV            → namespace am-presenca
// ═══════════════════════════════════════════

const BOARDS = {
  Master:   { id: '18365478944', tagCol: 'tag_mm1cqsgs', cycleStartCol: 'text_mm1zggek',  cycleEndCol: 'text_mm1zpfk1',  statusCol: 'color_mkxfjmp5', birthdayCol: 'text_mm1k47vw', fatInicialCol: 'numeric_mkza7eqa', fatAtualCol: 'numeric_mkzarebx', dateFormat: 'DD/MM/YYYY' },
  Mentoria: { id: '18391780128', tagCol: 'tag_mm1cs0hm', cycleStartCol: 'date_mkyhk48j',  cycleEndCol: 'date_mm1jafnr',  statusCol: 'status',         birthdayCol: 'text_mm0gfhvt', fatInicialCol: 'text_mm1r6dnd',    fatAtualCol: 'text_mm1rp2mr' },
  Winners:  { id: '18392478822', tagCol: null,            cycleStartCol: 'text_mkyrgm3a',  cycleEndCol: 'text_mkyrq340',  statusCol: null,              birthdayCol: null,             fatInicialCol: null,               fatAtualCol: null,              dateFormat: 'DD/MM/YYYY' }
};
const ESPECIALIDADES    = ['Dermato','Oftalmo','Ortoped','Psiquiatras','Gestores','Emagrecimento','Retomada','Cirurgiões'];
const AULAS_GERAIS      = ['Mentoria','Hotseat','Hotseat Simultâneo','Master'];
const AULAS_WINNERS     = ['Winners Encontro']; // aula exclusiva Winners
const ALL_TABS          = [...AULAS_GERAIS, ...ESPECIALIDADES, ...AULAS_WINNERS];
const CACHE_TTL      = 300;

// Converte DD/MM/YYYY ou YYYY-MM-DD para YYYY-MM-DD (ISO)
function parseDate(str) {
  if (!str) return '';
  str = str.trim();
  // DD/MM/YYYY
  const dmY = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmY) return `${dmY[3]}-${dmY[2].padStart(2,'0')}-${dmY[1].padStart(2,'0')}`;
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0,10);
  return str;
}

// Calcula semana do mês: dia 1-7=1, 8-14=2, 15-21=3, 22-28=4, 29+=5
function dateToSemana(dateStr) {
  const day = new Date(dateStr + 'T12:00:00').getDate();
  if (day <= 7)  return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  if (day <= 28) return 4;
  return 5;
}

// Retorna o AAAA-MM da data — identifica o ciclo mensal
function dateToCiclo(dateStr) {
  return dateStr.slice(0, 7); // "2026-04"
}

// Chave KV no novo formato
function kvKey(tab, ciclo, semana) {
  return 'presenca:' + tab + ':' + ciclo + ':s' + semana;
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-CS-Password, X-CS-Nome, X-CS-Email',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    try {
      if (url.pathname === '/auth' && request.method === 'POST') {
        return await handleAuth(request, env);
      }
      if (url.pathname === '/auth/cadastro' && request.method === 'POST') {
        return await handleCadastro(request, env);
      }
      if (url.pathname === '/auth/login' && request.method === 'POST') {
        return await handleLogin(request, env);
      }
      if (url.pathname === '/auth/reset-senha' && request.method === 'POST') {
        return await handleResetSenha(request, env);
      }
      if (url.pathname === '/auth/usuarios' && request.method === 'GET') {
        return await handleListUsuarios(request, env);
      }
      if (url.pathname === '/dados' && request.method === 'GET') {
        return await handleDados(request, env, ctx);
      }
      if (url.pathname === '/presenca' && request.method === 'GET') {
        return await handleGetPresenca(url, env);
      }
      if (url.pathname === '/presenca' && request.method === 'POST') {
        return await handlePostPresenca(request, env);
      }
      if (url.pathname === '/presenca/all' && request.method === 'GET') {
        return await handleGetAllPresenca(env);
      }

      if (url.pathname === '/zapi/grupos' && request.method === 'GET') {
        return await handleZapiGrupos(env);
      }
      // Webhook da Z-API — recebe mensagens dos grupos
      if (url.pathname === '/zapi/webhook' && request.method === 'POST') {
        return await handleZapiWebhook(request, env);
      }
      // Score de participação no grupo por semana
      if (url.pathname === '/grupo/score' && request.method === 'GET') {
        return await handleGetGrupoScore(url, env);
      }
      if (url.pathname === '/whatsapp/resumo' && request.method === 'POST') {
        return await handleWhatsappResumo(request, env);
      }
      if (url.pathname === '/migrar-especialidade' && request.method === 'POST') {
        return await handleMigrarEspecialidade(request, env);
      }
      if (url.pathname === '/ai/diagnostico' && request.method === 'POST') {
        return await handleAIDiagnostico(request, env);
      }
      if (url.pathname === '/ai/acionamento' && request.method === 'POST') {
        return await handleAIAcionamento(request, env);
      }
      if (url.pathname === '/ai/enviar' && request.method === 'POST') {
        return await handleAIEnviar(request, env);
      }
      if (url.pathname === '/acionamentos' && request.method === 'GET') {
        return await handleGetAcionamentos(url, env);
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: cors });
    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(enviarResumoDiario(env));
  }
};

// ═══════════════════════════════════════════
// AUTH helpers
// ═══════════════════════════════════════════

// Retorna { ok: true, nome: '...' } ou { ok: false }
// Aceita: X-CS-Password (senha) + X-CS-Nome (nome) + X-CS-Email (email)
// Fallback: CS_PASSWORD mestra para compatibilidade
async function resolveUser(request, env) {
  const pwd   = request.headers.get('X-CS-Password') || '';
  const nome  = request.headers.get('X-CS-Nome')     || '';
  const email = request.headers.get('X-CS-Email')    || '';

  // Tenta lista de usuários individuais (legado CS_USERS)
  if (env.CS_USERS) {
    try {
      const users = JSON.parse(env.CS_USERS);
      const user  = users.find(u => u.nome === nome && u.senha === pwd);
      if (user) return { ok: true, nome: user.nome };
    } catch(e) { /* ignora JSON inválido */ }
  }

  // Fallback: senha mestra (mantém compatibilidade)
  if (pwd === env.CS_PASSWORD) return { ok: true, nome: nome || 'CS' };

  // Tenta usuário cadastrado no KV
  if (pwd && env.KV) {
    const pwdHash = await sha256(pwd);
    // Busca direta por e-mail (O(1)) — mais confiável que nome
    if (email) {
      try {
        const raw = await env.KV.get('user:' + email.toLowerCase());
        if (raw) {
          const u = JSON.parse(raw);
          if (u.senhaHash === pwdHash) return { ok: true, nome: u.nome };
        }
      } catch(e) { /* ignora */ }
    }
    // Fallback: itera por nome (compatibilidade com sessões sem X-CS-Email)
    if (nome) {
      try {
        const list = await env.KV.list({ prefix: 'user:' });
        for (const { name } of list.keys) {
          const raw = await env.KV.get(name);
          if (!raw) continue;
          const u = JSON.parse(raw);
          if (u.nome === nome && u.senhaHash === pwdHash) {
            return { ok: true, nome: u.nome };
          }
        }
      } catch(e) { /* ignora erros de KV */ }
    }
  }

  return { ok: false };
}

// ═══════════════════════════════════════════
// POST /auth — verifica senha
// ═══════════════════════════════════════════
async function handleAuth(request, env) {
  const result = await resolveUser(request, env);
  if (result.ok) {
    return new Response(JSON.stringify({ ok: true, nome: result.nome }), { headers: cors });
  }
  return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401, headers: cors });
}

// ═══════════════════════════════════════════
// /dados — Monday + Sheets
// ═══════════════════════════════════════════
async function handleDados(request, env, ctx) {
  const cacheKey = new Request('https://am-cache/dados-v2', request);
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  try {
    const [master, mentoria, winnersRaw] = await Promise.all([
      fetchBoard(env.MONDAY_TOKEN, BOARDS.Master, 'Master'),
      fetchBoard(env.MONDAY_TOKEN, BOARDS.Mentoria, 'Mentoria'),
      fetchBoard(env.MONDAY_TOKEN, BOARDS.Winners, 'Winners')
    ]);

    // Índice do Master por nome normalizado
    const masterIndex = {};
    for (const a of master) masterIndex[norm(a.name)] = a;

    // Merge Winners no Master:
    // — turma permanece 'Master', isWinners=true é a flag que identifica Winners
    // — cycleStart/cycleEnd vêm do board Winners
    // — fat e birthday já estão no Master
    const winnersNames = new Set();
    for (const w of winnersRaw) {
      const key = norm(w.name);
      winnersNames.add(key);
      if (masterIndex[key]) {
        masterIndex[key].isWinners = true;
        if (w.cycleStart) masterIndex[key].cycleStart = w.cycleStart;
        if (w.cycleEnd)   masterIndex[key].cycleEnd   = w.cycleEnd;
      }
    }

    // Winners que não estão no Master (raro — entrada própria com isWinners=true)
    const winnersOrfaos = winnersRaw
      .filter(w => !masterIndex[norm(w.name)])
      .map(w => ({ ...w, turma: 'Master', isWinners: true }));

    const masterNames = new Set(master.map(a => norm(a.name)));

    const allAlunos = [
      ...master,
      ...mentoria.filter(a => !masterNames.has(norm(a.name))),
      ...winnersOrfaos  // só Winners que não existem no Master
    ];

    const sheetResults = await Promise.allSettled(
      ALL_TABS.map(tab => fetchSheet(env.SHEET_ID, tab).then(data => ({ tab, data })))
    );
    const sheetData = {};
    sheetResults.forEach(r => {
      if (r.status === 'fulfilled') sheetData[r.value.tab] = r.value.data;
    });

    const payload = JSON.stringify({ allAlunos, sheetData, updatedAt: Date.now() });
    const response = new Response(payload, {
      headers: { ...cors, 'Cache-Control': `public, max-age=${CACHE_TTL}` }
    });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

// ═══════════════════════════════════════════
// GET /presenca?tab=X&semana=N
// ═══════════════════════════════════════════
async function handleGetPresenca(url, env) {
  const tab    = url.searchParams.get('tab');
  const semana = url.searchParams.get('semana');
  const ciclo  = url.searchParams.get('ciclo');
  if (!tab || !semana) {
    return new Response(JSON.stringify({ error: 'tab e semana obrigatorios' }), { status: 400, headers: cors });
  }
  // Sem fallback — ciclo diferente = dados diferentes
  const key = ciclo
    ? 'presenca:' + tab + ':' + ciclo + ':s' + semana
    : 'presenca:' + tab + ':s' + semana;
  const data = await env.KV.get(key);
  return new Response(data || '{}', { headers: cors });
}

// ═══════════════════════════════════════════
// POST /presenca — salva presença no KV
// Body: { tab, semana, registros: { normName: {P,C,F,V,name} } }
// ═══════════════════════════════════════════
async function handlePostPresenca(request, env) {
  const _auth = await resolveUser(request, env);
  if (!_auth.ok) {
    return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401, headers: cors });
  }
  const csNome = _auth.nome;
  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }
  const { tab, semana, registros, date } = body;
  if (!tab || !registros) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), { status: 400, headers: cors });
  }
  // __calls__ usa chave própria sem semana — merge com dados existentes
  if (tab === '__calls__') {
    const existing = await env.KV.get('presenca:__calls__');
    const cur = existing ? JSON.parse(existing) : {};
    Object.assign(cur, registros);
    await env.KV.put('presenca:__calls__', JSON.stringify(cur));
    return new Response(JSON.stringify({ ok: true, key: 'presenca:__calls__', total: Object.keys(cur).length }), { headers: cors });
  }
  if (!semana) {
    return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), { status: 400, headers: cors });
  }
  // Novo formato: presenca:{tab}:{AAAA-MM}:s{N}
  const ciclo = date ? dateToCiclo(date) : new Date().toISOString().slice(0,7);
  const semanaFinal = date ? dateToSemana(date) : parseInt(semana);
  const key = `presenca:${tab}:${ciclo}:s${semanaFinal}`;
  const payload = { ...registros };
  if (date) payload.__date__ = date;
  await env.KV.put(key, JSON.stringify(payload));
  // Invalida caches
  await caches.default.delete(new Request('https://am-cache/dados-v2'));
  await caches.default.delete(new Request('https://am-cache/presenca-all-v1'));
  return new Response(JSON.stringify({ ok: true, key, total: Object.keys(registros).length }), { headers: cors });
}

// ═══════════════════════════════════════════
// GET /presenca/all — toda presença do KV
// ═══════════════════════════════════════════
async function handleGetAllPresenca(env) {
  try {
    // Cache de 5min no CF Cache — igual ao /dados
    const cacheKey = new Request('https://am-cache/presenca-all-v1');
    const cached = await caches.default.match(cacheKey);
    if (cached) return new Response(cached.body, { headers: cors });

    const list = await env.KV.list({ prefix: 'presenca:' });
    const result = {};
    await Promise.all(list.keys.map(async ({ name }) => {
      const parts  = name.split(':');
      const tab    = parts[1];
      const data   = await env.KV.get(name);
      if (!data) return;
      let registros;
      try { registros = JSON.parse(data); } catch { return; }
      if (!registros || typeof registros !== 'object') return;
      // __calls__ tem estrutura própria: { normName: { leonardo: N, bruno: N } }
      if (tab === '__calls__') {
        result['__calls__'] = registros;
        return;
      }
      if (!parts[2]) return;
      // Detecta formato: antigo (s1) ou novo (2026-04:s2 → parts[2]="2026-04", parts[3]="s2")
      let semPart, ciclo;
      if (parts[2].startsWith('s')) {
        semPart = parts[2]; ciclo = 'legacy';
      } else {
        ciclo = parts[2]; semPart = parts[3] || '';
      }
      if (!semPart.startsWith('s')) return;
      const semIdx = parseInt(semPart.replace('s','')) - 1;
      if (isNaN(semIdx) || semIdx < 0 || semIdx > 4) return;
      // Estrutura: result[tab][ciclo][normName] = { history }
      if (!result[tab]) result[tab] = {};
      if (!result[tab][ciclo]) result[tab][ciclo] = {};

      // Extrai __date__
      const aulaDate = registros.__date__ || null;
      if (!result.__dates__) result.__dates__ = {};
      if (!result.__dates__[tab]) result.__dates__[tab] = {};
      if (!result.__dates__[tab][ciclo]) result.__dates__[tab][ciclo] = {};
      if (aulaDate) result.__dates__[tab][ciclo][`s${semIdx+1}`] = aulaDate;

      for (const [normName, pcfv] of Object.entries(registros)) {
        if (normName === '__date__') continue;
        if (!pcfv || typeof pcfv !== 'object') continue;
        if (!result[tab][ciclo][normName]) {
          result[tab][ciclo][normName] = {
            name: pcfv.name || normName,
            history: Array.from({length:5}, ()=>({P:false,C:false,F:false,V:false}))
          };
        }
        result[tab][ciclo][normName].history[semIdx] = { P:!!pcfv.P, C:!!pcfv.C, F:!!pcfv.F, V:!!pcfv.V };
      }
    }));
    const body = JSON.stringify(result);
    const response = new Response(body, { headers: cors });
    // Salva no CF Cache por 5min
    const toCache = new Response(body, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=300' } });
    await caches.default.put(cacheKey, toCache);
    return response;
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

// ═══════════════════════════════════════════
// MONDAY
// ═══════════════════════════════════════════
async function fetchBoard(token, board, turma) {
  const query = `{
    boards(ids: ${board.id}) {
      items_page(limit: 500) {
        items {
          name
          column_values {
            id text
            ... on TagsValue { tags { name } }
          }
        }
      }
    }
  }`;
  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token, 'API-Version': '2024-01' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error(`Monday HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  const items = json?.data?.boards?.[0]?.items_page?.items || [];
  return items.map(item => {
    let especialidades = [], phone = '', entryDate = '', cycleStart = '', cycleEnd = '', cycleStatus = '', birthday = '', fatInicial = '', fatAtual = '';
    for (const col of (item.column_values || [])) {
      if (col.id === board.tagCol) {
        especialidades = col.tags?.length > 0 ? col.tags.map(t => t.name) : (col.text ? [col.text] : []);
      } else if (['phone','phone_1','phone0','telefone','phone_mkyh9wm6','phone_mkxfdrtf'].includes(col.id) && col.text) {
        phone = col.text;
      } else if (['date4','date','data_de_onboarding','data'].includes(col.id) && col.text) {
        entryDate = col.text;
      } else if (board.cycleStartCol && col.id === board.cycleStartCol && col.text) {
        cycleStart = parseDate(col.text);
      } else if (board.cycleEndCol && col.id === board.cycleEndCol && col.text) {
        cycleEnd = parseDate(col.text);
      } else if (board.statusCol && col.id === board.statusCol && col.text) {
        cycleStatus = col.text;
      } else if (board.birthdayCol && col.id === board.birthdayCol && col.text) {
        birthday = col.text;
      } else if (board.fatInicialCol && col.id === board.fatInicialCol && col.text) {
        fatInicial = col.text;
      } else if (board.fatAtualCol && col.id === board.fatAtualCol && col.text) {
        fatAtual = col.text;
      }
    }
    return { name: item.name.trim(), phone, entryDate, turma, especialidades, cycleStart, cycleEnd, cycleStatus, birthday, fatInicial, fatAtual };
  }).filter(a => a.name);
}

// ═══════════════════════════════════════════
// SHEETS
// ═══════════════════════════════════════════
async function fetchSheet(sheetId, tab) {
  if (!sheetId) return {};
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url);
  if (!res.ok) return {};
  return parseSheet(await res.text());
}

function parseSheet(csv) {
  const rows = csvParse(csv), result = {};
  for (let r = 2; r < rows.length; r++) {
    const row  = rows[r];
    const name = clean(row[0]);
    if (!name || name.toLowerCase() === 'nome') continue;
    const history = Array.from({ length: 5 }, (_, w) => {
      const base = 1 + w * 4;
      return { P: chk(row[base]), C: chk(row[base+1]), F: chk(row[base+2]), V: chk(row[base+3]) };
    });
    result[norm(name)] = { name, history };
  }
  return result;
}

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function norm(s) {
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}
function clean(v) { return (v||'').replace(/^"|"$/g,'').trim(); }
function chk(v)   { return ['x','v','sim','1','true','✓','s'].includes(clean(v).toLowerCase()); }
function csvParse(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    const cols = []; let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; }
      else if (line[i] === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += line[i];
    }
    cols.push(cur.trim());
    rows.push(cols);
  }
  return rows;
}

// ═══════════════════════════════════════════
// MIGRAÇÃO — Emagrecimento1 + Emagrecimento2 → Emagrecimento
// POST /migrar-especialidade
// Body (opcional): { "ciclo": "2026-04" }  — padrão: mês atual
// ═══════════════════════════════════════════
async function handleMigrarEspecialidade(request, env) {
  const _auth = await resolveUser(request, env);
  if (!_auth.ok) {
    return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401, headers: cors });
  }

  const body = await request.json().catch(() => ({}));
  const ciclo = body.ciclo || new Date().toISOString().slice(0, 7);

  const semanas = [1, 2, 3, 4, 5];
  const fontes = ['Emagrecimento1', 'Emagrecimento2'];
  const destino = 'Emagrecimento';
  const resultado = [];

  for (const semana of semanas) {
    const destKey = `presenca:${destino}:${ciclo}:s${semana}`;
    const destRaw = await env.KV.get(destKey);
    const destData = destRaw ? JSON.parse(destRaw) : {};
    let houveAlteracao = false;

    for (const fonte of fontes) {
      const srcKey = `presenca:${fonte}:${ciclo}:s${semana}`;
      const srcRaw = await env.KV.get(srcKey);
      if (!srcRaw) continue;
      let srcData;
      try { srcData = JSON.parse(srcRaw); } catch { continue; }

      for (const [normName, pcfv] of Object.entries(srcData)) {
        if (normName === '__date__') {
          if (!destData.__date__) destData.__date__ = pcfv;
          continue;
        }
        if (!pcfv || typeof pcfv !== 'object') continue;
        if (!destData[normName]) {
          destData[normName] = { ...pcfv };
        } else {
          destData[normName].P = !!(destData[normName].P || pcfv.P);
          destData[normName].C = !!(destData[normName].C || pcfv.C);
          destData[normName].F = !!(destData[normName].F || pcfv.F);
          destData[normName].V = !!(destData[normName].V || pcfv.V);
          if (!destData[normName].name && pcfv.name) destData[normName].name = pcfv.name;
        }
        houveAlteracao = true;
      }
    }

    if (houveAlteracao) {
      await env.KV.put(destKey, JSON.stringify(destData));
      const totalAlunos = Object.keys(destData).filter(k => k !== '__date__').length;
      resultado.push({ semana, key: destKey, alunos: totalAlunos, migrado: true });
    } else {
      resultado.push({ semana, key: destKey, alunos: 0, migrado: false, info: 'sem dados nas fontes' });
    }
  }

  await caches.default.delete(new Request('https://am-cache/presenca-all-v1'));
  await caches.default.delete(new Request('https://am-cache/dados-v2'));

  return new Response(JSON.stringify({ ok: true, ciclo, fontes, destino, semanas: resultado }), { headers: cors });
}


// ═══════════════════════════════════════════
// WHATSAPP — Z-API + Resumo Diário
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// GRUPO IDs monitorados
// ═══════════════════════════════════════════
const GRUPOS_MONITORADOS = {
  '120363149810256820-group': 'Master',
  '558796250201-1616258422':  'Mentoria'
};

// Pesos por categoria (cap semanal: 20 pts)
const GRUPO_PESOS = { resultado: 10, ajuda: 5 };
const GRUPO_CAP_SEMANAL = 15;

// Retorna a chave ISO da semana: AAAA-Www
function isoWeekKey(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2,'0')}`;
}

// Classifica mensagem via IA
async function classificarMensagem(env, texto) {
  // Fallback por palavras-chave — funciona mesmo sem IA
  const t = texto.toLowerCase();
  const isResultado = /r\$|reais|paciente|fechei|faturei|fiz|bati|meta|resultado|conquist|vendas?|consulta|mil hoje|mil essa|mil no|captei/.test(t);
  const isAjuda = /\?/.test(texto) === false && /recomendo|sugiro|no seu caso|tenta|funciona assim|o que funciona|pode fazer|dica é|experiência|faço assim|uso o|uso a/.test(t);

  if (!env.ANTHROPIC_API_KEY) {
    return isResultado ? 'resultado' : isAjuda ? 'ajuda' : 'outro';
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        system: 'Classifique a mensagem de um médico em grupo de mentoria. Responda APENAS com uma palavra:\n"resultado" — somente se mencionar conquista com número, valor financeiro, meta batida, pacientes fechados ou resultado mensurável. Ex: "fechei 3 pacientes", "fiz R$12mil hoje".\n"ajuda" — somente se responder diretamente uma pergunta de outro membro com informação útil e específica. Concordância, opinião ou conclusão NÃO é ajuda.\n"outro" — qualquer outra coisa.',
        messages: [{ role: 'user', content: texto.slice(0, 500) }]
      })
    });
    if (!res.ok) {
      // IA indisponível — usa fallback por palavras-chave
      return isResultado ? 'resultado' : isAjuda ? 'ajuda' : 'outro';
    }
    const data = await res.json();
    const cat = (data.content?.[0]?.text || '').trim().toLowerCase();
    return ['resultado','ajuda'].includes(cat) ? cat : 'outro';
  } catch {
    return isResultado ? 'resultado' : isAjuda ? 'ajuda' : 'outro';
  }
}

// ═══════════════════════════════════════════
// POST /zapi/webhook — recebe eventos da Z-API
// ═══════════════════════════════════════════
async function handleZapiWebhook(request, env) {
  let body;
  try { body = await request.json(); } catch {
    return new Response('ok', { headers: cors });
  }

  // Z-API: phone = grupo, senderPhone = remetente (para grupos)
  const grupoPhone = body.phone || body.chatId || '';
  const remetentePhone = body.senderPhone || body.participantPhone
    || body.participant || body.sender || '';
  const texto = body.text?.message || body.text || body.body || body.message || '';
  const tipo  = body.type || body.messageType || '';

  // Ignora não-texto e delivery receipts
  if (!texto || typeof texto !== 'string' || texto.trim().length < 3) {
    return new Response('ok', { headers: cors });
  }
  if (tipo === 'ReceiveDeliveryReceipt' || tipo === 'DeliveryCallback') {
    return new Response('ok', { headers: cors });
  }

  // Verifica se é dos grupos monitorados
  if (!GRUPOS_MONITORADOS[grupoPhone]) {
    return new Response('ok', { headers: cors });
  }

  // Normaliza número do remetente
  const numRemetente = String(remetentePhone).replace(/\D/g,'');
  if (!numRemetente || numRemetente.length < 10) {
    return new Response('ok', { headers: cors });
  }

  // Busca aluno pelo número — cache do CF ou Monday direto
  let normName = null;
  try {
    let allAlunos = [];
    const cacheKey = new Request('https://am-cache/dados-v2');
    const cached = await caches.default.match(cacheKey);
    if (cached) {
      const dados = await cached.json();
      allAlunos = dados.allAlunos || [];
    } else {
      // Cache expirou — busca direto do Monday (só Master e Mentoria)
      const [master, mentoria] = await Promise.all([
        fetchBoard(env.MONDAY_TOKEN, BOARDS.Master, 'Master'),
        fetchBoard(env.MONDAY_TOKEN, BOARDS.Mentoria, 'Mentoria')
      ]);
      allAlunos = [...master, ...mentoria];
    }
    const aluno = allAlunos.find(a => {
      const p = (a.phone || '').replace(/\D/g,'');
      return p === numRemetente
        || p === '55' + numRemetente
        || '55' + p === numRemetente
        || p.slice(-8) === numRemetente.slice(-8);
    });
    if (aluno) normName = norm(aluno.name);
  } catch { /* ignora */ }


  if (!normName) {
    return new Response('ok', { headers: cors });
  }

  // Classifica mensagem
  const categoria = await classificarMensagem(env, texto);
  const pontos = GRUPO_PESOS[categoria] || 0; // outro = 0 pts
  if (!pontos) return new Response('ok', { headers: cors }); // sem pontos, ignora
  const semana = isoWeekKey(new Date());
  const kvKey  = `grupo_msgs:${semana}:${normName}`;

  // Lê score atual da semana e aplica cap
  const existing = await env.KV.get(kvKey);
  const atual = existing ? JSON.parse(existing) : { total: 0, resultado: 0, ajuda: 0, duvida: 0, outro: 0, msgs: 0 };
  const pontosFinais = Math.min(pontos, GRUPO_CAP_SEMANAL - atual.total);

  if (pontosFinais > 0) {
    atual.total    = Math.min(atual.total + pontos, GRUPO_CAP_SEMANAL);
    atual[categoria] = (atual[categoria] || 0) + 1;
    atual.msgs     = (atual.msgs || 0) + 1;
    await env.KV.put(kvKey, JSON.stringify(atual), { expirationTtl: 60 * 60 * 24 * 90 });
  }

  return new Response('ok', { headers: cors });
}

// ═══════════════════════════════════════════
// GET /grupo/score — retorna scores das últimas 4 semanas agregados por aluno
// ═══════════════════════════════════════════
async function handleGetGrupoScore(url, env) {
  try {
    // Gera as 4 semanas (atual + 3 anteriores)
    const semanas = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      semanas.push(isoWeekKey(d));
    }

    // Agrega scores de todas as semanas por aluno
    const scores = {};
    for (const semana of semanas) {
      const list = await env.KV.list({ prefix: `grupo_msgs:${semana}:` });
      for (const { name } of list.keys) {
        const normName = name.split(':').slice(2).join(':');
        const raw = await env.KV.get(name);
        if (!raw) continue;
        const s = JSON.parse(raw);
        if (!scores[normName]) {
          scores[normName] = { total: 0, resultado: 0, ajuda: 0, msgs: 0 };
        }
        scores[normName].total    += s.total    || 0;
        scores[normName].resultado += s.resultado || 0;
        scores[normName].ajuda    += s.ajuda    || 0;
        scores[normName].msgs     += s.msgs     || 0;
      }
    }

    // Cap total em 15pts (4 semanas × 15pts max = 60 bruto, mas cap final é 15)
    for (const k of Object.keys(scores)) {
      scores[k].total = Math.min(scores[k].total, 15);
    }

    return new Response(JSON.stringify({ ok: true, semanas, scores }), { headers: cors });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

async function handleZapiGrupos(env) {
  if (!env.ZAPI_INSTANCE || !env.ZAPI_TOKEN) {
    return new Response(JSON.stringify({ error: 'Z-API não configurada' }), { status: 400, headers: cors });
  }
  try {
    const url = `https://api.z-api.io/instances/${env.ZAPI_INSTANCE}/token/${env.ZAPI_TOKEN}/chats?page=1&pageSize=100`;
    const res = await fetch(url, {
      headers: { 'Client-Token': env.ZAPI_CLIENT_TOKEN || '' }
    });
    const data = await res.json();
    const lista = Array.isArray(data) ? data : (data.chats || []);
    // Retorna grupos com todos os campos para diagnóstico
    const grupos = lista
      .filter(c => c.isGroup || (c.id || c.phone || c.chatId || '')?.includes('@g.us'))
      .map(c => ({
        id:   c.id || c.phone || c.chatId || c.groupId || null,
        nome: c.name || c.subject || c.title || c.chatName || null
      }));
    return new Response(JSON.stringify({ ok: true, total: lista.length, grupos }), { headers: cors });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

async function zapiSend(env, dest, message) {
  const isGroup = dest.includes('@g.us') || dest.includes('-group');
  const endpoint = isGroup ? 'send-text' : 'send-text';
  const phone = isGroup ? undefined : dest;
  const group = isGroup ? dest : undefined;
  const url = `https://api.z-api.io/instances/${env.ZAPI_INSTANCE}/token/${env.ZAPI_TOKEN}/${endpoint}`;
  const body = isGroup
    ? { phone: dest, message }
    : { phone: dest, message };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': env.ZAPI_CLIENT_TOKEN || ''
    },
    body: JSON.stringify({ phone: dest, message })
  });
  const text = await res.text();
  if (!res.ok) console.error(`Z-API error [${dest}] ${res.status}:`, text);
  else console.log(`Z-API ok [${dest}]:`, text);
  return { ok: res.ok, status: res.status, body: text };
}

async function consolidarKV(env) {
  // Reutiliza o CF Cache do /presenca/all se disponível
  const cacheKey = new Request('https://am-cache/presenca-all-v1');
  const cached = await caches.default.match(cacheKey);
  if (cached) return await cached.json();

  // Cache miss — lê o KV diretamente
  const list = await env.KV.list({ prefix: 'presenca:' });
  const result = {};
  await Promise.all(list.keys.map(async ({ name }) => {
    const parts = name.split(':');
    const tab   = parts[1];
    const data  = await env.KV.get(name);
    if (!data) return;
    let registros;
    try { registros = JSON.parse(data); } catch { return; }
    if (!registros || typeof registros !== 'object') return;
    if (tab === '__calls__') { result['__calls__'] = registros; return; }
    if (!parts[2]) return;
    const semIdx = parseInt(parts[2].replace('s','')) - 1;
    if (isNaN(semIdx) || semIdx < 0 || semIdx > 4) return;
    if (!result[tab]) result[tab] = {};
    for (const [normName, pcfv] of Object.entries(registros)) {
      if (!pcfv || typeof pcfv !== 'object') continue;
      if (!result[tab][normName]) {
        result[tab][normName] = { name: pcfv.name || normName, history: Array.from({length:5}, ()=>({P:false,C:false,F:false,V:false})) };
      }
      result[tab][normName].history[semIdx] = { P:!!pcfv.P, C:!!pcfv.C, F:!!pcfv.F, V:!!pcfv.V };
    }
  }));
  return result;
}

async function calcularAlertas(env) {
  // Carrega KV consolidado diretamente
  const kvAll = await consolidarKV(env);

  // Carrega alunos do Monday via fetchBoard (mesmo método que /dados)
  const [masterItems, mentoriaItems] = await Promise.all([
    fetchBoard(env.MONDAY_TOKEN, BOARDS.Master, 'Master'),
    fetchBoard(env.MONDAY_TOKEN, BOARDS.Mentoria, 'Mentoria')
  ]);

  const alunos = [];
  for (const item of [...masterItems, ...mentoriaItems]) {
    if (item.cycleStatus && /inativ/i.test(item.cycleStatus)) continue;
    alunos.push({ name: item.name, turma: item.turma, cycleEnd: item.cycleEnd || '', cycleStatus: item.cycleStatus || '', birthday: item.birthday || '' });
  }

  // Detecta semana máxima
  const MAX_WEEKS = 5;
  let maxWeek = 1;
  for (const tab of AULAS_GERAIS) {
    const tabData = kvAll[tab] || {};
    for (const entry of Object.values(tabData)) {
      if (!entry?.history) continue;
      for (let w = MAX_WEEKS - 1; w >= 0; w--) {
        if (entry.history[w]?.P) { maxWeek = Math.max(maxWeek, w + 1); break; }
      }
    }
  }

  const urgentes = [], queda = [], renovacao = [], master = [];

  for (const aluno of alunos) {
    // Histórico de faltas: verifica todas as abas do aluno por semana
    // Uma semana conta como "presente" se teve P em qualquer aba que participa
    const abasTurma = aluno.turma === 'Master'
      ? ['Mentoria','Hotseat','Master']
      : ['Mentoria','Hotseat'];
    // Especialidades do aluno (vêm do fetchBoard)
    if (aluno.especialidades && aluno.especialidades.length) {
      for (const esp of aluno.especialidades) {
        if (kvAll[esp] && !abasTurma.includes(esp)) abasTurma.push(esp);
      }
    }
    // Por semana: presente se teve P em qualquer aba
    const presencaPorSemana = Array.from({length: maxWeek}, (_, w) =>
      abasTurma.some(tab => (kvAll[tab] || {})[norm(aluno.name)]?.history?.[w]?.P)
    );

    // 3+ semanas consecutivas sem presença em nenhuma aba
    let consAbs = 0;
    for (let i = maxWeek - 1; i >= 0; i--) {
      if (!presencaPorSemana[i]) consAbs++; else break;
    }
    if (consAbs >= 3) {
      urgentes.push({ name: aluno.name, turma: aluno.turma, consAbs });
      // não faz continue — renovação pode aparecer junto
    } else {
      // Queda acelerada (só se não é urgente) — usa presencaPorSemana
      if (maxWeek >= 3) {
        const recent = presencaPorSemana[maxWeek - 2] ? 1 : 0;
        const older  = presencaPorSemana[maxWeek - 3] ? 1 : 0;
        if (older - recent >= 1) queda.push({ name: aluno.name, turma: aluno.turma });
      }
    }

    // Renovação — independente de urgente ou queda
    if (aluno.cycleEnd) {
      const daysLeft = Math.round((new Date(aluno.cycleEnd) - Date.now()) / (1000*60*60*24));
      if (daysLeft >= 0 && daysLeft <= 90) {
        renovacao.push({ name: aluno.name, turma: aluno.turma, daysLeft });
      }
    }

    // Candidatos ao Master — usa histórico da aba Mentoria
    if (aluno.turma === 'Mentoria' && maxWeek >= 2) {
      const entryMentoria = (kvAll['Mentoria'] || {})[norm(aluno.name)];
      const histMentoria = entryMentoria?.history || [];
      const semanas = histMentoria.slice(0, maxWeek);
      const presCount = semanas.filter(h => h?.P).length;
      const vitCount  = semanas.filter(h => h?.P && h?.V).length;
      if (presCount / maxWeek >= 0.7 && vitCount / Math.max(presCount, 1) >= 0.5) {
        master.push({ name: aluno.name });
      }
    }
  }

  // Aniversariantes do dia
  const aniversariantes = calcularAniversariantes(alunos);

  return { urgentes, queda, renovacao, master, aniversariantes };
}

function calcularAniversariantes(alunos) {
  const hoje = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const diaHoje = String(hoje.getDate()).padStart(2, '0');
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
  const lista = [];
  for (const aluno of alunos) {
    if (!aluno.birthday) continue;
    const match = aluno.birthday.match(/(\d{1,2})[\/\-](\d{1,2})/);
    if (!match) continue;
    const dia = match[1].padStart(2, '0');
    const mes = match[2].padStart(2, '0');
    if (dia === diaHoje && mes === mesHoje) lista.push({ name: aluno.name, turma: aluno.turma });
  }
  return lista;
}

function montarResumo(categorias) {
  const now = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const labels = {
    urgentes:  '🔴 Faltas consecutivas',
    queda:     '🟡 Queda acelerada',
    renovacao: '🔥 Oportunidades de renovação',
    master:          '⭐ Candidatos ao Master',
    aniversariantes: '🎂 Aniversariantes hoje'
  };
  const temAniversario = categorias.some(c => c.key === 'aniversariantes');
  let msg = temAniversario
    ? 'Bom diaa timee incrível! 🎉\n\nTemos aniversariantes hoje e alunos precisando de cuidado.\n\nBora cuidar? 👇🏻\n\n'
    : 'Bom diaa timee incrível!\n\nTemos alunos precisando de cuidado hoje.\n\nBora cuidar? 👇🏻\n\n';
  for (const cat of categorias) {
    msg += `${labels[cat.key]}: *${cat.itens.length} aluno${cat.itens.length !== 1 ? 's' : ''}*\n`;
  }
  msg += `\n_Painel AM · ${now}_`;
  return msg;
}

async function enviarResumoDiario(env) {
  if (!env.ZAPI_INSTANCE || !env.ZAPI_TOKEN) {
    console.log('Z-API não configurada, pulando envio.');
    return;
  }

  const { urgentes, queda, renovacao, master, aniversariantes } = await calcularAlertas(env);
  const categorias = [
    { key: 'urgentes',        itens: urgentes        },
    { key: 'queda',           itens: queda           },
    { key: 'renovacao',       itens: renovacao       },
    { key: 'master',          itens: master          },
    { key: 'aniversariantes', itens: aniversariantes }
  ].filter(c => c.itens.length > 0);

  if (!categorias.length) {
    console.log('Sem alertas hoje, nenhuma mensagem enviada.');
    return;
  }

  const destinatarios = await getDestinatarios(env);

  // Monta resumo base
  let msg = montarResumo(categorias);

  // Enriquece com análise da IA se ANTHROPIC_API_KEY configurada
  if (env.ANTHROPIC_API_KEY) {
    try {
      const totalUrgentes  = urgentes.length;
      const totalQueda     = queda.length;
      const totalRenovacao = renovacao.length;
      const promptResumo = `Escreva um parágrafo curto (3-4 linhas) de análise semanal para o time de CS de uma mentoria médica.
Dados do dia:
- Alunos urgentes (3+ faltas): ${totalUrgentes}
- Alunos em queda acelerada: ${totalQueda}
- Oportunidades de renovação: ${totalRenovacao}
- Candidatos ao Master: ${master.length}
Tom: direto, motivador para o time agir. Comece com um emoji. Sem saudação.`;

      const analise = await callClaude(env, AI_SYSTEM, promptResumo);
      if (analise) msg = analise + '\n\n' + msg;
    } catch(e) {
      console.log('IA indisponível, enviando resumo sem análise:', e.message);
    }
  }

  for (const dest of destinatarios) {
    await zapiSend(env, dest, msg);
    await new Promise(r => setTimeout(r, 1000));
  }

  // Segunda-feira: envia também o relatório de acionamentos da semana
  const diaSemana = new Date().getDay(); // 0=dom, 1=seg
  if (diaSemana === 1) {
    try {
      const relatorio = await gerarRelatorioAcionamentos(env);
      if (relatorio) {
        await new Promise(r => setTimeout(r, 2000));
        for (const dest of destinatarios) {
          await zapiSend(env, dest, relatorio);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } catch(e) {
      console.log('Erro ao gerar relatório de acionamentos:', e.message);
    }
  }
}

async function getDestinatarios(env) {
  if (env.ZAPI_GROUP_ID) return [env.ZAPI_GROUP_ID];
  return [env.ZAPI_NUM_CEO, env.ZAPI_NUM_SUP].filter(Boolean);
}

async function handleWhatsappResumo(request, env) {
  const _auth = await resolveUser(request, env);
  if (!_auth.ok) {
    return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401, headers: cors });
  }
  const csNome = _auth.nome;
  if (!env.ZAPI_INSTANCE || !env.ZAPI_TOKEN) {
    return new Response(JSON.stringify({ error: 'Z-API não configurada' }), { status: 500, headers: cors });
  }

  // Lê body para verificar se é modo teste
  const body = await request.json().catch(() => ({}));
  const numTeste = body.numTeste || null;

  const { urgentes, queda, renovacao, master, aniversariantes } = await calcularAlertas(env);
  const categorias = [
    { key: 'urgentes',        itens: urgentes        },
    { key: 'queda',           itens: queda           },
    { key: 'renovacao',       itens: renovacao       },
    { key: 'master',          itens: master          },
    { key: 'aniversariantes', itens: aniversariantes }
  ].filter(c => c.itens.length > 0);

  if (!categorias.length) {
    return new Response(JSON.stringify({ ok: true, info: 'Sem alertas hoje — nenhuma mensagem enviada.' }), { headers: cors });
  }

  // Modo teste: envia só para o número informado
  const destinatarios = numTeste ? [numTeste] : await getDestinatarios(env);
  if (!destinatarios.length) {
    return new Response(JSON.stringify({ error: 'Nenhum destinatário configurado' }), { status: 500, headers: cors });
  }

  const msg = montarResumo(categorias);
  const resultados = [];
  for (const dest of destinatarios) {
    const r = await zapiSend(env, dest, msg);
    resultados.push({ dest, ok: r.ok, status: r.status, zapi: r.body });
    await new Promise(r => setTimeout(r, 1000));
  }

  const algumErro = resultados.some(r => !r.ok);
  return new Response(JSON.stringify({
    ok: !algumErro,
    teste: !!numTeste,
    categorias: categorias.length,
    destinatarios: destinatarios.length,
    resultados
  }), { headers: cors });
}

// ═══════════════════════════════════════════
// IA — PROMPTS (versionar aqui para manutenção fácil)
// ═══════════════════════════════════════════
const AI_SYSTEM = `Você é um analista de CS (Customer Success) especializado em mentorias médicas.
Escreva sempre em português brasileiro, de forma direta e acionável.
Seja objetivo: máximo 3 parágrafos curtos. Sem jargões, sem enrolação.`;

const PROMPT_DIAGNOSTICO = (aluno) => `
Analise o engajamento deste aluno de mentoria médica e escreva um diagnóstico curto (2-3 parágrafos) para o time de CS.

DADOS DO ALUNO:
- Nome: ${aluno.nome}
- Turma: ${aluno.turma}
- Score de engajamento: ${aluno.score}%
- Presenças: ${aluno.presencas} de ${aluno.totalSlots} aulas
- Taxa de câmera: ${aluno.camera}%
- Taxa de vitórias: ${aluno.vitorias}%
- Faltas consecutivas: ${aluno.faltasConsecutivas}
- Tendência: ${aluno.tendencia}
- Dias restantes no ciclo: ${aluno.diasRestantes !== null ? aluno.diasRestantes : 'não informado'}
- Faturamento inicial: ${aluno.fatInicial || 'não informado'}
- Faturamento atual: ${aluno.fatAtual || 'não informado'}
- Novo aluno (<60 dias): ${aluno.novo ? 'Sim' : 'Não'}

Foque em: momento atual do aluno, principais riscos e uma recomendação de ação para o CS.
Não repita os números literalmente — interprete-os.`;

const PROMPT_ACIONAMENTO = (aluno) => `
Escreva uma mensagem de acionamento personalizada para este aluno de mentoria médica.
A mensagem será enviada pelo WhatsApp pelo time de CS.

DADOS DO ALUNO:
- Nome: ${aluno.nome} (primeiro nome: ${aluno.firstName})
- Tratamento: ${aluno.tratamento} (Dr. ou Dra.)
- Turma: ${aluno.turma}
- Motivos de acionamento: ${aluno.motivos.join(', ') || 'acompanhamento geral'}
- Score de engajamento: ${aluno.score}%
- Faltas consecutivas: ${aluno.faltasConsecutivas}
- Tendência: ${aluno.tendencia}
- Dias restantes no ciclo: ${aluno.diasRestantes !== null ? aluno.diasRestantes : 'não informado'}

REGRAS OBRIGATÓRIAS:
- Sempre inicie se referindo ao aluno como "${aluno.tratamento} ${aluno.firstName}" — nunca use só o primeiro nome sem o Dr./Dra.
- Tom: acolhedor, direto, sem pressão excessiva
- Comprimento: 3-5 parágrafos curtos
- Termine com uma pergunta aberta que incentive resposta
- Não mencione números exatos de faltas ou scores
- Adapte ao motivo: se ausente → incentivo a voltar; se sem câmera → benefícios da câmera; se renovação próxima → valor gerado
- NÃO inclua assinatura, nome do remetente ou despedida formal no final`;

// ── Helper central para chamadas à API da Claude ──
async function callClaude(env, systemPrompt, userPrompt) {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY não configurada');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Claude API error: ' + err);
  }

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

// ═══════════════════════════════════════════
// POST /ai/diagnostico
// Body: { aluno: { nome, turma, score, presencas, totalSlots, camera, vitorias,
//                  faltasConsecutivas, tendencia, diasRestantes, fatInicial, fatAtual, novo } }
// ═══════════════════════════════════════════
async function handleAIDiagnostico(request, env) {
  const _auth = await resolveUser(request, env);
  if (!_auth.ok) {
    return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401, headers: cors });
  }
  const csNome = _auth.nome;

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const { aluno } = body;
  if (!aluno || !aluno.nome) {
    return new Response(JSON.stringify({ error: 'Dados do aluno ausentes' }), { status: 400, headers: cors });
  }

  try {
    const texto = await callClaude(env, AI_SYSTEM, PROMPT_DIAGNOSTICO(aluno));
    return new Response(JSON.stringify({ ok: true, texto }), { headers: cors });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

// ═══════════════════════════════════════════
// POST /ai/acionamento
// Body: { aluno: { nome, firstName, tratamento, turma, motivos, score,
//                  faltasConsecutivas, tendencia, diasRestantes } }
// ═══════════════════════════════════════════
async function handleAIAcionamento(request, env) {
  const _auth = await resolveUser(request, env);
  if (!_auth.ok) {
    return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401, headers: cors });
  }
  const csNome = _auth.nome;

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const { aluno } = body;
  if (!aluno || !aluno.nome) {
    return new Response(JSON.stringify({ error: 'Dados do aluno ausentes' }), { status: 400, headers: cors });
  }

  try {
    const texto = await callClaude(env, AI_SYSTEM, PROMPT_ACIONAMENTO(aluno));
    return new Response(JSON.stringify({ ok: true, texto }), { headers: cors });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: cors });
  }
}

// ═══════════════════════════════════════════
// POST /ai/enviar — envia mensagem via Z-API e registra log
// Body: { alunoNome, alunoPhone, mensagem, motivos }
// ═══════════════════════════════════════════
async function handleAIEnviar(request, env) {
  const _auth = await resolveUser(request, env);
  if (!_auth.ok) {
    return new Response(JSON.stringify({ error: 'Senha incorreta' }), { status: 401, headers: cors });
  }
  const csNome = _auth.nome;

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const { alunoNome, alunoPhone, mensagem, motivos, forcar } = body;
  if (!alunoNome || !mensagem) {
    return new Response(JSON.stringify({ error: 'Dados obrigatórios ausentes' }), { status: 400, headers: cors });
  }

  // Verifica se aluno já foi acionado nos últimos 5 dias (a menos que forcar=true)
  if (!forcar) {
    const hoje = new Date().toISOString().slice(0, 10);
    const cincoDiasAtras = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);
    const list = await env.KV.list({ prefix: 'acionamento:' });
    let ultimoAcionamento = null;
    for (const { name } of list.keys) {
      const parts = name.split(':');
      const data = parts[1];
      if (data < cincoDiasAtras || data > hoje) continue;
      const raw = await env.KV.get(name);
      if (!raw) continue;
      try {
        const r = JSON.parse(raw);
        if (r.alunoNome === alunoNome) {
          if (!ultimoAcionamento || r.hora > ultimoAcionamento) {
            ultimoAcionamento = r.hora;
          }
        }
      } catch { continue; }
    }
    if (ultimoAcionamento) {
      const minutosDesdeUltimo = (Date.now() - new Date(ultimoAcionamento).getTime()) / 60000;
      if (minutosDesdeUltimo < 7200) { // menos de 5 dias
        return new Response(JSON.stringify({
          acionamentoRecente: true,
          minutosDesdeUltimo: Math.round(minutosDesdeUltimo),
          ultimoAcionamento
        }), { headers: cors });
      }
    }
  }

  // Normaliza número: remove não-dígitos, garante DDI 55
  const phoneRaw = (alunoPhone || '').replace(/\D/g, '');
  const phone = phoneRaw.startsWith('55') ? phoneRaw : '55' + phoneRaw;
  const phoneValido = phone.length >= 12 && phone.length <= 13;

  let enviadoWhatsapp = false;
  let zapiError = null;

  if (phoneValido && env.ZAPI_INSTANCE && env.ZAPI_TOKEN) {
    try {
      const zapiRes = await zapiSend(env, phone, mensagem);
      enviadoWhatsapp = zapiRes.ok;
      if (!zapiRes.ok) zapiError = zapiRes.body;
    } catch(e) {
      zapiError = e.message;
    }
  }

  // Registra no KV independente do resultado do WhatsApp
  const now      = new Date();
  const data     = now.toISOString().slice(0, 10); // AAAA-MM-DD
  const tsKey    = now.getTime().toString();
  const kvKey    = 'acionamento:' + data + ':' + tsKey;
  const registro = {
    alunoNome,
    phone: phoneValido ? phone : null,
    motivos: motivos || [],
    csNome,
    via: enviadoWhatsapp ? 'whatsapp' : (phoneValido ? 'whatsapp-erro' : 'manual'),
    hora: now.toISOString(),
    mensagem: mensagem.slice(0, 500) // limita tamanho no KV
  };
  await env.KV.put(kvKey, JSON.stringify(registro), { expirationTtl: 60 * 60 * 24 * 90 }); // 90 dias

  return new Response(JSON.stringify({
    ok: true,
    enviadoWhatsapp,
    phoneValido,
    zapiError,
    csNome
  }), { headers: cors });
}

// ═══════════════════════════════════════════
// GET /acionamentos?de=AAAA-MM-DD&ate=AAAA-MM-DD
// ═══════════════════════════════════════════
async function handleGetAcionamentos(url, env) {
  const de  = url.searchParams.get('de')  || new Date().toISOString().slice(0, 10);
  const ate = url.searchParams.get('ate') || de;

  // Lista todas as chaves no intervalo de datas
  const list = await env.KV.list({ prefix: 'acionamento:' });
  const registros = [];

  for (const { name } of list.keys) {
    // acionamento:AAAA-MM-DD:timestamp
    const parts = name.split(':');
    if (parts.length < 3) continue;
    const data = parts[1];
    if (data < de || data > ate) continue;
    const raw = await env.KV.get(name);
    if (!raw) continue;
    try { registros.push(JSON.parse(raw)); } catch { continue; }
  }

  // Ordena por hora
  registros.sort((a, b) => a.hora.localeCompare(b.hora));

  return new Response(JSON.stringify({ ok: true, total: registros.length, registros }), { headers: cors });
}

// ═══════════════════════════════════════════
// RELATÓRIO SEMANAL DE ACIONAMENTOS (helper para o cron)
// ═══════════════════════════════════════════
async function gerarRelatorioAcionamentos(env) {
  // Pega os últimos 7 dias
  const ate = new Date();
  const de  = new Date(ate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const deStr  = de.toISOString().slice(0, 10);
  const ateStr = ate.toISOString().slice(0, 10);

  const list = await env.KV.list({ prefix: 'acionamento:' });
  const registros = [];
  for (const { name } of list.keys) {
    const parts = name.split(':');
    if (parts.length < 3) continue;
    const data = parts[1];
    if (data < deStr || data > ateStr) continue;
    const raw = await env.KV.get(name);
    if (!raw) continue;
    try { registros.push(JSON.parse(raw)); } catch { continue; }
  }

  if (!registros.length) return null;

  // Agrupa por CS
  const porCS = {};
  for (const r of registros) {
    const nome = r.csNome || 'CS';
    if (!porCS[nome]) porCS[nome] = { total: 0, whatsapp: 0, manual: 0 };
    porCS[nome].total++;
    if (r.via === 'whatsapp') porCS[nome].whatsapp++;
    else porCS[nome].manual++;
  }

  let msg = `📊 *Acionamentos da semana (${deStr.slice(8)}/→${ateStr.slice(8)}/${ateStr.slice(5,7)})*\n\n`;
  msg += `Total: *${registros.length}* acionamentos\n`;
  for (const [nome, stats] of Object.entries(porCS)) {
    msg += `• ${nome}: ${stats.total} (${stats.whatsapp} via WPP, ${stats.manual} copiados)\n`;
  }

  return msg;
}

// ═══════════════════════════════════════════
// AUTH — CADASTRO / LOGIN via KV
// Chave KV: user:{email} → JSON { nome, email, funcao, senhaHash, criadoEm }
// ═══════════════════════════════════════════

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

const FUNCOES_VALIDAS = ['CEO','CS','Líder','GP','Estrategista'];

// POST /auth/cadastro
// Body: { nome, email, funcao, senha, codigoConvite }
async function handleCadastro(request, env) {
  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const { nome, email, funcao, senha, codigoConvite } = body;

  // Validações básicas
  if (!nome || !email || !funcao || !senha || !codigoConvite) {
    return new Response(JSON.stringify({ error: 'Todos os campos são obrigatórios' }), { status: 400, headers: cors });
  }
  if (!FUNCOES_VALIDAS.includes(funcao)) {
    return new Response(JSON.stringify({ error: 'Função inválida' }), { status: 400, headers: cors });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'E-mail inválido' }), { status: 400, headers: cors });
  }
  if (senha.length < 6) {
    return new Response(JSON.stringify({ error: 'Senha deve ter no mínimo 6 caracteres' }), { status: 400, headers: cors });
  }

  // Valida código de convite
  const codigoValido = env.CS_INVITE_CODE || '';
  if (!codigoValido || codigoConvite.trim() !== codigoValido.trim()) {
    return new Response(JSON.stringify({ error: 'Código de convite inválido' }), { status: 401, headers: cors });
  }

  // Verifica se e-mail já existe
  const kvKey = 'user:' + email.toLowerCase().trim();
  const existing = await env.KV.get(kvKey);
  if (existing) {
    return new Response(JSON.stringify({ error: 'E-mail já cadastrado' }), { status: 409, headers: cors });
  }

  // Salva usuário no KV
  const senhaHash = await sha256(senha);
  const usuario = {
    nome:      nome.trim(),
    email:     email.toLowerCase().trim(),
    funcao,
    senhaHash,
    criadoEm: new Date().toISOString()
  };
  await env.KV.put(kvKey, JSON.stringify(usuario));

  return new Response(JSON.stringify({
    ok: true,
    nome: usuario.nome,
    email: usuario.email,
    funcao: usuario.funcao
  }), { headers: cors });
}

// POST /auth/login
// Body: { email, senha }
async function handleLogin(request, env) {
  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const { email, senha } = body;
  if (!email || !senha) {
    return new Response(JSON.stringify({ error: 'E-mail e senha obrigatórios' }), { status: 400, headers: cors });
  }

  const kvKey = 'user:' + email.toLowerCase().trim();
  const raw = await env.KV.get(kvKey);

  if (!raw) {
    return new Response(JSON.stringify({ error: 'E-mail ou senha incorretos' }), { status: 401, headers: cors });
  }

  const usuario = JSON.parse(raw);
  const senhaHash = await sha256(senha);

  if (senhaHash !== usuario.senhaHash) {
    return new Response(JSON.stringify({ error: 'E-mail ou senha incorretos' }), { status: 401, headers: cors });
  }

  return new Response(JSON.stringify({
    ok: true,
    nome:   usuario.nome,
    email:  usuario.email,
    funcao: usuario.funcao
  }), { headers: cors });
}

// POST /auth/reset-senha
// Body: { email, novaSenha, codigoConvite }
async function handleResetSenha(request, env) {
  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers: cors });
  }

  const { email, novaSenha, codigoConvite } = body;
  if (!email || !novaSenha || !codigoConvite) {
    return new Response(JSON.stringify({ error: 'Todos os campos são obrigatórios' }), { status: 400, headers: cors });
  }
  if (novaSenha.length < 6) {
    return new Response(JSON.stringify({ error: 'Senha deve ter no mínimo 6 caracteres' }), { status: 400, headers: cors });
  }

  // Valida código de convite
  const codigoValido = env.CS_INVITE_CODE || '';
  if (!codigoValido || codigoConvite.trim() !== codigoValido.trim()) {
    return new Response(JSON.stringify({ error: 'Código de convite inválido' }), { status: 401, headers: cors });
  }

  // Busca usuário existente
  const kvKey = 'user:' + email.toLowerCase().trim();
  const raw = await env.KV.get(kvKey);
  if (!raw) {
    return new Response(JSON.stringify({ error: 'E-mail não cadastrado' }), { status: 404, headers: cors });
  }

  const usuario = JSON.parse(raw);
  const novaSenhaHash = await sha256(novaSenha);
  usuario.senhaHash = novaSenhaHash;
  await env.KV.put(kvKey, JSON.stringify(usuario));

  return new Response(JSON.stringify({
    ok: true,
    nome:   usuario.nome,
    email:  usuario.email,
    funcao: usuario.funcao
  }), { headers: cors });
}

// GET /auth/usuarios — lista usuários (requer senha mestre)
async function handleListUsuarios(request, env) {
  const pwd = request.headers.get('X-CS-Password') || '';
  if (pwd !== env.CS_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: cors });
  }

  const list = await env.KV.list({ prefix: 'user:' });
  const usuarios = [];
  for (const { name } of list.keys) {
    const raw = await env.KV.get(name);
    if (!raw) continue;
    try {
      const u = JSON.parse(raw);
      usuarios.push({ nome: u.nome, email: u.email, funcao: u.funcao, criadoEm: u.criadoEm });
    } catch { continue; }
  }
  return new Response(JSON.stringify({ ok: true, total: usuarios.length, usuarios }), { headers: cors });
}
