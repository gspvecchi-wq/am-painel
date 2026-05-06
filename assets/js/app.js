// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const BOARDS = {
  Master:   { id:'18365478944', tagCol:'tag_mm1cqsgs' },
  Mentoria: { id:'18391780128', tagCol:'tag_mm1cs0hm' }
};
const ESPECIALIDADES = ['Dermato&Oftalmo','Ortoped','Psiquiatras','Gestores','Emagrecimento','Cirurgiões'];
// Especialidades legado mantidas para exibição de dados históricos (março/abril)
const ESPECIALIDADES_LEGADO = ['Dermato','Oftalmo','Retomada'];
// Retorna lista de especialidades por ciclo
function getEspecialidadesPorCiclo(ciclo) {
  const CICLO_NOVO = '2026-05'; // a partir de maio usa a lista nova
  return ciclo >= CICLO_NOVO ? ESPECIALIDADES : [...ESPECIALIDADES, ...ESPECIALIDADES_LEGADO];
}
const AULAS_GERAIS   = ['Mentoria','Hotseat','Hotseat Simultâneo','Master'];
const AULAS_WINNERS  = ['Winners Encontro'];
const ALL_TABS       = [...AULAS_GERAIS, ...ESPECIALIDADES, ...ESPECIALIDADES_LEGADO, ...AULAS_WINNERS];

// ═══════════════════════════════════════════
// GENDER — explicit list + smart heuristics
// ═══════════════════════════════════════════
const FEM_NAMES = new Set(`abia,abigail,adelia,adelaide,adriana,agatha,agnes,aida,ailin,ainara,aisha,
alessandra,alessia,alexandra,alexia,alice,alicia,alina,aline,allana,amanda,amara,amelia,
ana,anabela,analia,ananda,anelise,angela,angelica,anita,anna,anne,antonia,ariana,ariane,
ariany,ariele,arlete,astrid,aurora,beatriz,bella,berenice,bianca,brigida,bruna,camila,
carla,carlota,carmela,carmelita,carmen,carolina,caroline,cassandra,cassia,cecilia,celeste,
celia,christiane,cintia,clara,clarissa,claudete,claudia,claudiane,cleonice,cleuza,conceicao,
cristiane,cristina,daiane,dalila,damaris,daniela,daniele,danielli,danielle,debora,denise,
diana,dominique,edna,eduarda,elaine,elane,eliana,elisa,elisabete,elizabeth,eloisa,eluiza,
emanuele,emilia,erica,erika,eunice,eva,eveline,fabiana,fatima,fernanda,flavia,francisca,
gabriela,gabriele,gisele,giulia,giovanna,grace,graciela,graziela,grazielle,heloisa,iara,
ines,ingrid,irene,iris,isabel,isabela,isabella,ivana,ivone,jacqueline,jamile,janaina,
jaqueline,jessica,joana,josefa,joyce,juliana,julieta,jurema,karina,karla,katia,lahis,
laila,lara,larissa,laura,lavinia,leila,leticia,lidia,lilian,liliane,livia,lorena,luana,
lucia,luciana,luisa,luiza,luzia,lydia,madalena,maisa,manuela,marcela,marcia,maria,mariana,
marina,marisa,maristela,marta,matilde,michelle,milena,mirela,miriam,monique,nadia,natalia,
nathalia,nathalie,nayara,neli,nelly,neuza,nicoly,nicole,nina,noemia,odete,olga,pamela,
patricia,paula,paola,priscila,priscilla,queila,rafaela,raquel,rebeca,rejane,renata,roberta,
rosana,rose,roseli,rosemeire,rosimeire,ruth,sabrina,samara,samira,sandra,sara,selma,sheila,
shirley,silvia,silvana,simone,solange,sonia,soraia,stefania,suelen,sueli,suzana,talita,
tamara,tania,tatiane,tatiana,thais,thays,thamires,valentina,valeria,vanessa,vera,veronica,
viviane,wania,yasmin,zenaide,rhafaelly,rhafaella,rhafaela`.replace(/\s+/g,'').split(',').filter(Boolean));

const MASC_NAMES = new Set(`abel,adalberto,adao,adeilson,adenilson,adilson,adriano,agostinho,alan,alberto,
alceu,aldair,aldo,alex,alexandre,alexsandro,alfredo,alisson,allan,almir,alonso,altair,
altamir,alvaro,amaro,anderson,andrei,andres,antonio,ariel,aristides,armando,arnaldo,artur,
arthur,augusto,aurelio,aylton,benedito,bento,bernardo,breno,bruno,caio,carlos,cassio,celso,
cesar,christian,ciro,claudio,cleber,cleiton,clemilson,clodoaldo,dario,david,davi,denis,
diogo,diego,dirceu,douglas,duarte,edgar,edmar,edmundo,edson,edu,eduardo,elcio,elder,elio,
eliseu,elvis,emerson,emilio,enio,erick,erik,ernesto,evaldo,evandro,ezequiel,fabio,felicio,
felipe,felix,fernando,flavio,francisco,frederico,gabriel,geovani,geraldo,gilberto,gilmar,
gilson,giovani,glauco,guilherme,gustavo,henrique,helio,heitor,hugo,igor,isaac,italo,ivan,
jair,jairo,jamil,janio,jardel,jeferson,jefferson,jhonatan,joao,joel,jonas,jonathan,jorge,
josimar,josue,junior,jurandir,kleber,laercio,laerte,leandro,leao,leo,leonardo,levi,lino,
lucas,luciano,luis,luiz,marcelo,marcio,marco,marcos,mario,mateus,matheus,mauricio,mauro,
maxwell,maycon,michel,miguel,mirko,moises,murilo,nelson,nicolas,nilson,noel,norton,odair,
oscar,osmar,osvaldo,otavio,pablo,paulo,pedro,rafael,raimundo,ramiro,raul,regis,reinaldo,
renan,renato,ricardo,roberto,rodrigo,rogerio,romario,romulo,ronaldo,ronei,roney,ronnie,
rubens,rudy,samuel,saulo,sergio,silvio,silas,simon,tarcisio,tiago,thiago,tito,tomaz,toni,
tony,valter,vando,vinicius,vitor,waldir,walter,wellington,willian,william,wilson,yago,yuri`.replace(/\s+/g,'').split(',').filter(Boolean));

// Strip suffixes like "2ª cadeira", "2º Cadeira" etc from name before processing
function cleanSuffix(name) {
  return (name||'').replace(/\s*\d[ªº°]\s*cadeira.*/i,'').replace(/\s*\(.*\)/g,'').trim();
}

function inferGender(rawName) {
  const name = cleanSuffix(rawName);
  const first = name.split(' ')[0].toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'');

  if (FEM_NAMES.has(first)) return 'F';
  if (MASC_NAMES.has(first)) return 'M';

  // Heuristics — ordered by specificity
  const femEndings = ['elly','ella','ela','elly','inha','iane','iani','iele','iele','ilis',
    'ais','eis','ahis','this','hys','ays','eis','uza','iza','ice','ece','ace',
    'ane','ene','ine','one','une','uda','ida','ada','eda','oda',
    'ura','ira','ara','era','ora',
    'lla','nna','ssa','tta'];
  const mascEndings = ['son','ton','ton','ndo','aldo','ildo','oldo','uldo',
    'erto','arto','irto','orto','urto',
    'inho','zinho','ao','ndo','rdo','ldo','bdo',
    'uel','ael','iel','oel',
    'or','ar','er','ir'];

  for (const e of femEndings) { if (first.endsWith(e)) return 'F'; }
  for (const e of mascEndings) { if (first.endsWith(e)) return 'M'; }

  // Terminal vowel heuristic — careful with exceptions
  if (first.endsWith('a') && first.length > 3) return 'F';
  if (first.endsWith('o') || first.endsWith('u')) return 'M';

  return 'M'; // last resort default
}

function tit(g)  { return g==='F' ? 'Dra' : 'Dr'; }
function sr_(g)  { return g==='F' ? 'Sra.' : 'Sr.'; }
function foc(g)  { return g==='F' ? 'focada' : 'focado'; }
function displayName(rawName) { return cleanSuffix(rawName); }

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
let allAlunos   = [];
let kvPresenca  = {}; // { tab: { ciclo: { normName: { history:[...] } } } }
let kvGrupoScores = {}; // { normName: { total, resultado, ajuda, duvida, outro, msgs } }
let cicloAtivo = ''; // AAAA-MM do ciclo sendo visualizado

// Retorna o ciclo ativo (padrão: mês atual)
function getCicloAtivo() {
  if (cicloAtivo) return cicloAtivo;
  return new Date().toISOString().slice(0, 7);
}

// Acesso unificado ao kvPresenca com ciclo
function getKvTab(tab, ciclo) {
  const c = ciclo || getCicloAtivo();
  return (kvPresenca[tab] || {})[c] || {};
}

function getKvEntry(tab, normName, ciclo) {
  return getKvTab(tab, ciclo)[normName] || null;
}
let csFilter       = 'todos';
let csPage         = 1;
const CS_PAGE_SIZE = 20;
let currentTab     = 'Mentoria';
let currentWeek    = 1;
let loaded         = false;
let _csDoctors     = [];
let gestTurmaFilter = 'todos'; // 'todos' | 'Master' | 'Mentoria'

// ─── especialidade helpers ───────────────────
// aluno.especialidades is now an array (e.g. ['Dermato','Psiquiatras'])
function hasEsp(aluno, tab) {
  if (!aluno.especialidades || !aluno.especialidades.length) return false;
  return aluno.especialidades.some(e => norm(e) === norm(tab));
}
function espLabel(aluno) {
  if (!aluno.especialidades || !aluno.especialidades.length) return '';
  return aluno.especialidades.join(', ');
}
// ─────────────────────────────────────────────

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Mostra/esconde overlay de login baseado na sessão
  const overlay = document.getElementById('loginOverlay');
  const savedEmail = localStorage.getItem('am_cs_email');
  const savedSenha = localStorage.getItem('am_cs_senha');
  if (overlay) {
    if (savedEmail && savedSenha) {
      overlay.style.display = 'none';
    } else {
      overlay.style.display = 'flex';
    }
  }

  updateBadge();
  reloadAll();

  // Glass scroll effect on topbar
  const _nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    _nav.classList.toggle('scrolled', window.scrollY > 4);
  }, { passive: true });

  // Auto-refresh a cada 5 min, só quando a aba estiver visível
  setInterval(() => {
    if (document.hidden) return;
    // Não recarrega se há presença marcada não salva na chamada
    const temNaoSalvo = Object.values(chamadaRegistros).some(r => r.P || r.C || r.F || r.V);
    if (temNaoSalvo) return;
    reloadAll();
  }, 5 * 60 * 1000);
});

// ═══════════════════════════════════════════
// WORKER URL — troca pela URL do seu Worker
// ═══════════════════════════════════════════
const WORKER_URL = 'https://am-painel-api.aceleradormedico2021.workers.dev/dados';

function updateBadge() {
  const now = new Date();
  const lbl = now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const txt = lbl.charAt(0).toUpperCase()+lbl.slice(1);
  document.getElementById('monthBadge').textContent = txt;
  const mm = document.getElementById('monthBadgeM'); if (mm) mm.textContent = txt;
}
function setStatus(live,txt,txt2='') {
  const cls = 's-dot '+(live?'s-live':'s-off');
  document.getElementById('sDot').className = cls;
  document.getElementById('sTxt').textContent = txt;
  document.getElementById('sTxt2').textContent = txt2;
  // Keep statusbar in sync
  const d2 = document.getElementById('sDot2'); if (d2) d2.className = cls;
  const t3 = document.getElementById('sTxt3'); if (t3) t3.textContent = txt;
  const t4 = document.getElementById('sTxt4'); if (t4) t4.textContent = txt2;
  // Sync mobile dock status
  const dm = document.getElementById('sDotM'); if (dm) dm.className = cls;
  const tm = document.getElementById('sTxtM'); if (tm) tm.textContent = txt;
}
function closeOv(id)  { document.getElementById(id).classList.remove('open'); }
function ovClick(e,id){ if(e.target===document.getElementById(id)) closeOv(id); }

// ═══════════════════════════════════════════
// RELOAD — chama o Worker
// ═══════════════════════════════════════════
async function enviarResumoWpp(teste=false) {
  const pwd = localStorage.getItem('am_cs_pwd') || '';
  if (!pwd) {
    alert('Faça login na aba Chamada primeiro para usar esta função.');
    return;
  }
  const numTeste = (document.getElementById('wppTeste').value || '').trim().replace(/\D/g,'');
  if (teste && !numTeste) {
    alert('Digite um número de teste antes de clicar em Testar.');
    return;
  }
  const btn = teste ? document.getElementById('btnWppTeste') : document.getElementById('btnWpp');
  const msg = document.getElementById('wppMsg');
  btn.disabled = true;
  btn.textContent = '⏳ Enviando...';
  msg.style.display = 'none';
  try {
    const body = teste ? JSON.stringify({ numTeste }) : JSON.stringify({});
    const res = await fetch(`${WORKER_BASE}/whatsapp/resumo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CS-Password': pwd, 'X-CS-Nome': localStorage.getItem('am_cs_nome')||csNomeAtual||'CS', 'X-CS-Email': localStorage.getItem('am_cs_email')||'' },
      body
    });
    if (res.ok) {
      const data = await res.json();
      msg.style.display = 'block';
      msg.style.background = 'rgba(0,232,122,.1)';
      msg.style.color = 'var(--safe)';
      msg.style.border = '1px solid rgba(0,232,122,.3)';
      if (data.info) {
        msg.textContent = `ℹ️ ${data.info}`;
        if (data.debug) console.log('WhatsApp debug:', data.debug);
      } else if (data.ok) {
        msg.textContent = `✓ ${data.categorias} categoria(s) enviada(s) para ${data.destinatarios} destinatário(s)`;
      } else {
        // Parcialmente ok — mostra o erro da Z-API
        const erro = data.resultados?.find(r => !r.ok);
        msg.style.background = 'rgba(255,149,0,.1)';
        msg.style.color = 'var(--warn)';
        msg.style.border = '1px solid rgba(255,149,0,.3)';
        msg.textContent = `⚠️ Z-API retornou: ${erro?.zapi || 'erro desconhecido'}`;
      }
    } else {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro desconhecido');
    }
  } catch(e) {
    msg.style.display = 'block';
    msg.style.background = 'rgba(255,51,85,.1)';
    msg.style.color = 'var(--danger)';
    msg.style.border = '1px solid rgba(255,51,85,.3)';
    msg.textContent = `✗ ${e.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = teste ? '🧪 Testar no número' : '📤 Enviar para o grupo';
    setTimeout(() => msg.style.display = 'none', 5000);
  }
}

async function reloadAll() {
  setStatus(false,'Carregando dados...');
  loaded = false;
  try {
    // Dispara as 3 chamadas em paralelo
    const [dadosRes, kvRes, grupoRes] = await Promise.all([
      fetch(WORKER_URL),
      fetch(WORKER_URL.replace('/dados','/presenca/all')).catch(() => null),
      fetch(WORKER_URL.replace('/dados','/grupo/score')).catch(() => null)
    ]);

    if (!dadosRes.ok) throw new Error(`HTTP ${dadosRes.status}`);
    const data = await dadosRes.json();
    if (data.error) throw new Error(data.error);

    allAlunos = data.allAlunos.map(a=>({...a, gender: inferGender(a.name), especialidades: a.especialidades || []}));

    try {
      kvPresenca = (kvRes && kvRes.ok) ? await kvRes.json() : {};
    } catch(e) { kvPresenca = {}; }
    popularCicloSelector();
    popularCicloSelectorCS();
    popularCicloSelectorChamada();

    try {
      const grupoData = (grupoRes && grupoRes.ok) ? await grupoRes.json() : {};
      kvGrupoScores = grupoData.scores || {};
    } catch(e) { kvGrupoScores = {}; }

    loaded = true;
    const now = new Date().toLocaleTimeString('pt-BR');
    setStatus(true,`${allAlunos.length} alunos`,`Atualizado ${now}`);
    updateBadge();
    csLoad();
    const av = document.querySelector('.view.active').id;
    if (av==='view-gest')    renderGest();
    if (av==='view-aluno')   renderAlunoView();
    if (av==='view-chamada') initChamada();
  } catch(e) {
    setStatus(false,'Erro ao carregar: '+e.message);
    console.error(e);
  }
}

// ═══════════════════════════════════════════
// DOCTOR BUILDER
// ═══════════════════════════════════════════
function getPool(tab) {
  if (tab==='Mentoria' || tab==='Hotseat' || tab==='Hotseat Simultâneo')
    return allAlunos;
  if (tab==='Master')
    return allAlunos.filter(a=>a.turma==='Master' || a.isWinners);
  if (tab==='Winners Encontro')
    return allAlunos.filter(a=>a.isWinners);
  if (ESPECIALIDADES.includes(tab)||ESPECIALIDADES_LEGADO.includes(tab))
    return allAlunos.filter(a=>hasEsp(a, tab));
  return allAlunos;
}

function buildDoctors(tab, week) {
  const sheetTab = getKvTab(tab);
  const pool = getPool(tab);
  const w = week-1;
  return pool.map(aluno=>{
    const entry = sheetTab[norm(aluno.name)]||null;
    const history = Array.from({length:5},(_,i)=>{
      return entry&&entry.history[i] ? entry.history[i] : {P:false,C:false,F:false,V:false};
    });
    const cur = history[w];
    let consAbs=0;
    for (let i=w; i>=0; i--) { if (!history[i].P) consAbs++; else break; }
    const isEsp = ESPECIALIDADES.includes(tab)||ESPECIALIDADES_LEGADO.includes(tab);
    const motivos=[];
    if (!cur.P) { motivos.push('ausente'); }
    else {
      if (!cur.C) motivos.push('camera');
      if (!cur.F && isEsp) motivos.push('feedback');
      if (!cur.V) motivos.push('vitoria');
    }
    const risk = calcRisk(history, week);
    return {...aluno, history, cur, consAbs, motivos, risk};
  });
}

// Used for gestão evolution charts
// Returns array of {w, pct, attended, total} per week up to currentWeek
function calcEvolutionByTurma(turma, upToWeek) {
  const pool = turma==='Master'
    ? allAlunos.filter(a=>a.turma==='Master'||a.isWinners)
    : allAlunos.filter(a=>a.turma===turma);
  if (!pool.length) return [];

  const weeks = [];
  for (let w=0; w<upToWeek; w++) {
    let totalSlots=0, attended=0;
    for (const aluno of pool) {
      // Tabs this turma attends
      const tabs = turma==='Master'
        ? (aluno.isWinners ? ['Mentoria','Hotseat','Hotseat Simultâneo','Master','Winners Encontro'] : ['Mentoria','Hotseat','Hotseat Simultâneo','Master'])
        : ['Mentoria','Hotseat','Hotseat Simultâneo'];
      // Add their specialty if any
      if (aluno.especialidades && aluno.especialidades.length) {
        for (const esp of aluno.especialidades) {
          const spec = ESPECIALIDADES.find(e=>norm(e)===norm(esp));
          if (spec) tabs.push(spec);
        }
      }
      for (const tab of tabs) {
        const entry = getKvEntry(tab, norm(aluno.name));
        totalSlots++;
        if (entry&&entry.history[w]&&entry.history[w].P) attended++;
      }
    }
    const pct = totalSlots ? Math.round(attended/totalSlots*100) : 0;
    weeks.push({w:w+1, pct, attended, total:totalSlots});
  }
  return weeks;
}

// ── COMPOSITE QUALITY SCORE ──────────────────
// Weighted scoring by turma priority order.
// Novos alunos (<60 dias) include especialidade weight.
// Each tab score = P(50%) + C(25%) + V(25%) [+ F(20%) for esp tabs, redistributed]
function calcCompositeScore(aluno, upToWeek) {
  const novo = isNovo(aluno);
  const hasEspTabs = aluno.especialidades && aluno.especialidades.length > 0;

  // Build weighted tab list based on turma
  // format: { tab, weight }
  let weightedTabs = [];

  if (aluno.isWinners) {
    weightedTabs = [
      { tab: 'Winners Encontro', w: 30 },
      { tab: 'Master',           w: 25 },
      { tab: 'Mentoria',         w: 20 },
      { tab: 'Hotseat',          w: 15 },
      { tab: 'Hotseat Simultâneo', w: (novo && hasEspTabs) ? 5 : 10 }
    ];
    if (novo && hasEspTabs) {
      for (const esp of aluno.especialidades) {
        const spec = ESPECIALIDADES.find(e=>norm(e)===norm(esp));
        if (spec) weightedTabs.push({ tab: spec, w: 5 });
      }
    }
  } else if (aluno.turma === 'Master') {
    weightedTabs = [
      { tab: 'Master',           w: 35 },
      { tab: 'Mentoria',         w: 25 },
      { tab: 'Hotseat',          w: 20 },
      { tab: 'Hotseat Simultâneo', w: (novo && hasEspTabs) ? 8 : 20 }
    ];
    if (novo && hasEspTabs) {
      for (const esp of aluno.especialidades) {
        const spec = ESPECIALIDADES.find(e=>norm(e)===norm(esp));
        if (spec) weightedTabs.push({ tab: spec, w: 12 });
      }
    }
  } else {
    // Mentoria turma
    weightedTabs = [
      { tab: 'Mentoria',           w: 35 },
      { tab: 'Hotseat',            w: 30 },
      { tab: 'Hotseat Simultâneo', w: (novo && hasEspTabs) ? 15 : 35 }
    ];
    if (novo && hasEspTabs) {
      for (const esp of aluno.especialidades) {
        const spec = ESPECIALIDADES.find(e=>norm(e)===norm(esp));
        if (spec) weightedTabs.push({ tab: spec, w: 20 });
      }
    }
  }

  // Normalize weights to sum 100
  const totalW = weightedTabs.reduce((s,t)=>s+t.w,0);

  let compositeScore = 0;
  for (const { tab, w } of weightedTabs) {
    const entry = getKvEntry(tab, norm(aluno.name));
    const isEspTab = ESPECIALIDADES.includes(tab)||ESPECIALIDADES_LEGADO.includes(tab);
    let pHit=0, cHit=0, vHit=0, fHit=0, slots=0;
    for (let i=0; i<upToWeek; i++) {
      const h = entry&&entry.history[i] ? entry.history[i] : {P:false,C:false,F:false,V:false};
      slots++;
      if(h.P) pHit++;
      if(h.P&&h.C) cHit++;
      if(h.P&&h.V) vHit++;
      if(isEspTab&&h.P&&h.F) fHit++;
    }
    if (!slots) continue;
    const pS = pHit/slots;
    const cS = cHit/slots;
    const vS = vHit/slots;
    let tabScore;
    if (isEspTab) {
      const fS = fHit/Math.max(pHit,1);
      tabScore = pS*50 + cS*15 + vS*15 + fS*20;
    } else {
      tabScore = pS*50 + cS*25 + vS*25;
    }
    compositeScore += tabScore * (w / totalW);
  }

  // Calls bonus: +5 per call with specialist, max +10
  const callsData = (kvPresenca['__calls__']||{})[norm(aluno.name)] || { leonardo: 0, bruno: 0 };
  const totalCalls = (callsData.leonardo||0) + (callsData.bruno||0);
  const callsBonus = Math.min(totalCalls * 5, 10); // max +10pts

  // Grupo bonus: últimas 4 semanas, já vem com cap de 15 do worker
  const grupoData = kvGrupoScores[norm(aluno.name)] || null;
  const grupoBonus = grupoData ? Math.min(grupoData.total || 0, 15) : 0;

  // Cap geral: 120% (100 base + 20 bônus)
  return Math.min(Math.round(compositeScore + callsBonus + grupoBonus), 120);
}

// Risk = inverse of composite score, weighted by consecutive absences
function calcRisk(history, upTo) {
  const weeks = history.slice(0, Math.min(upTo,5));
  if (!weeks.length) return 0;
  let consAbs=0;
  for (let i=weeks.length-1; i>=0; i--) { if (!weeks[i].P) consAbs++; else break; }
  const absRate = weeks.filter(w=>!w.P).length/weeks.length;
  const pres = weeks.filter(w=>w.P);
  const camRate  = pres.length ? pres.filter(w=>!w.C).length/pres.length : 1;
  const vitRate  = pres.length ? pres.filter(w=>!w.V).length/pres.length : 1;
  let score = consAbs*18 + absRate*35 + camRate*12 + vitRate*8;
  return Math.min(Math.round(score), 100);
}

// Detect if aluno is "new" — cycleStart within 60 days
function isNovo(aluno) {
  const ref = aluno.cycleStart || aluno.entryDate;
  if (!ref) return false;
  const d = new Date(ref);
  if (isNaN(d)) return false;
  return (Date.now() - d.getTime()) < 60*24*60*60*1000;
}

// Detect accelerated drop — composite score fell >30pp in last 2 weeks
function isQuedaAcelerada(aluno, upToWeek) {
  if (upToWeek < 3) return false;
  const recent = calcCompositeScoreWeek(aluno, upToWeek-1);
  const older  = calcCompositeScoreWeek(aluno, upToWeek-2);
  return (older - recent) >= 30;
}

// ── RENEWAL SCORE ─────────────────────────────────────────
// Retorna { score, daysLeft, label, color } ou null
function calcRenewalScore(aluno, upToWeek) {
  if (!aluno.cycleEnd) return null;
  const endDate = new Date(aluno.cycleEnd);
  if (isNaN(endDate)) return null;
  const daysLeft = Math.round((endDate - Date.now()) / (1000*60*60*24));
  // Só candidato: ciclo ativo, dentro de 90 dias do fim
  if (aluno.cycleStatus && /inativ/i.test(aluno.cycleStatus)) return null;
  if (daysLeft < 0 || daysLeft > 90) return null;
  const eng = calcCompositeScore(aluno, upToWeek);
  // Janela ideal: 15–60 dias restantes + engajamento ≥ 55%
  const inWindow = daysLeft >= 15 && daysLeft <= 60;
  const score = inWindow ? Math.round(eng * 0.7 + Math.max(0, 60 - daysLeft) * 0.5) : Math.round(eng * 0.4);
  let label, color;
  if (inWindow && eng >= 55) { label = '🔥 Renovar agora';  color = 'var(--safe)'; }
  else if (inWindow)          { label = '⏳ Janela aberta';  color = 'var(--warn)'; }
  else                        { label = `📅 ${daysLeft}d restantes`; color = 'var(--sub)'; }
  return { score, daysLeft, label, color };
}

// ── ALERT LEVEL ───────────────────────────────────────────
// Retorna { level:'urgente'|'atencao'|'silencioso', label, color, icon } ou null
function calcAlertLevel(aluno, upToWeek) {
  if (!upToWeek || upToWeek < 1) return null;
  const kvTab = getKvTab(currentTab || 'Mentoria');
  const entry = kvTab[norm(aluno.name)];
  const history = Array.from({length: upToWeek}, (_,i) =>
    entry?.history?.[i] || {P:false,C:false,F:false,V:false}
  );
  // 3+ faltas consecutivas → urgente
  let consAbs = 0;
  for (let i = history.length-1; i >= 0; i--) {
    if (!history[i].P) consAbs++; else break;
  }
  if (consAbs >= 3) return { level:'urgente', icon:'🔴', label:`${consAbs} faltas seguidas`, color:'var(--danger)' };
  // Queda acelerada → atenção
  if (isQuedaAcelerada(aluno, upToWeek))
    return { level:'atencao', icon:'🟡', label:'Queda acelerada', color:'var(--warn)' };
  // Presente mas câmera + vitórias zeradas → silencioso
  const presences = history.filter(h=>h.P);
  if (presences.length >= 2 && presences.every(h=>!h.C && !h.V))
    return { level:'silencioso', icon:'⚪', label:'Presente, desengajado', color:'var(--sub)' };
  return null;
}


// ── ASCENSÃO SCORE ────────────────────────────────────────
// Candidatos ao Master: turma Mentoria + engajamento alto
// consistente + vitórias na maioria das semanas
// Retorna 0–100 ou null se não elegível
function calcAscensaoScore(aluno, upToWeek) {
  if (aluno.turma !== 'Mentoria') return null;
  if (!upToWeek || upToWeek < 2) return null;

  // Critérios de qualificação baseados na Mentoria (aula principal)
  const kvTab = getKvTab('Mentoria');
  const entry = kvTab[norm(aluno.name)];
  const history = Array.from({length: upToWeek}, (_, i) =>
    entry?.history?.[i] || {P:false,C:false,F:false,V:false}
  );

  // Mínimo 70% de presença na Mentoria
  const presCount = history.filter(h => h.P).length;
  if (presCount / upToWeek < 0.7) return null;

  // Mínimo 50% das semanas presentes com vitória
  const presWeeks = history.filter(h => h.P);
  const vitRate = presWeeks.length
    ? presWeeks.filter(h => h.V).length / presWeeks.length
    : 0;
  if (vitRate < 0.5) return null;

  // Sem mais de 1 falta consecutiva
  let maxConsAbs = 0, consAbs = 0;
  for (const h of history) {
    if (!h.P) { consAbs++; maxConsAbs = Math.max(maxConsAbs, consAbs); }
    else consAbs = 0;
  }
  if (maxConsAbs > 1) return null;

  // Score final: usa calcCompositeScore para incluir especialidades
  return Math.min(calcCompositeScore(aluno, upToWeek), 100);
}

function calcCompositeScoreWeek(aluno, weekIdx) {
  const tabs = aluno.isWinners ? ['Mentoria','Hotseat','Hotseat Simultâneo','Master','Winners Encontro'] : aluno.turma==='Master' ? ['Mentoria','Hotseat','Hotseat Simultâneo','Master'] : ['Mentoria','Hotseat','Hotseat Simultâneo'];
  if (aluno.especialidades && aluno.especialidades.length) {
    for (const esp of aluno.especialidades) {
      const spec = ESPECIALIDADES.find(e=>norm(e)===norm(esp));
      if (spec && !tabs.includes(spec)) tabs.push(spec);
    }
  }
  let pHit=0,cHit=0,vHit=0,fHit=0,fSlots=0,total=0;
  for (const tab of tabs) {
    const entry = getKvEntry(tab, norm(aluno.name));
    const h = entry&&entry.history[weekIdx] ? entry.history[weekIdx] : {P:false,C:false,F:false,V:false};
    const isEspTab = ESPECIALIDADES.includes(tab)||ESPECIALIDADES_LEGADO.includes(tab);
    total++;
    if(h.P) pHit++; if(h.P&&h.C) cHit++; if(h.P&&h.V) vHit++;
    if(isEspTab){ fSlots++; if(h.P&&h.F) fHit++; }
  }
  const fScore = fSlots ? fHit/fSlots : 1;
  return Math.round((pHit/total)*40 + (cHit/total)*25 + (vHit/total)*25 + fScore*10);
}

function calcEngagement(aluno, week) {
  const tabs = aluno.isWinners ? ['Mentoria','Hotseat','Hotseat Simultâneo','Master','Winners Encontro'] : aluno.turma==='Master' ? ['Mentoria','Hotseat','Hotseat Simultâneo','Master'] : ['Mentoria','Hotseat','Hotseat Simultâneo'];
  if (aluno.especialidades && aluno.especialidades.length) {
    for (const esp of aluno.especialidades) {
      const spec = ESPECIALIDADES.find(e=>norm(e)===norm(esp));
      if (spec && !tabs.includes(spec)) tabs.push(spec);
    }
  }
  let total=0, attended=0;
  for (const tab of tabs) {
    const entry = getKvEntry(tab, norm(aluno.name));
    for (let w=0; w<week; w++) {
      total++;
      if (entry&&entry.history[w]&&entry.history[w].P) attended++;
    }
  }
  return total ? Math.round(attended/total*100) : 0;
}

// Presence rate for a tab on a specific week index (0-based)
function weekPresenceRate(tab, weekIdx) {
  const docs = buildDoctors(tab, weekIdx+1);
  if (!docs.length) return null;
  const present = docs.filter(d=>d.history[weekIdx].P).length;
  return { pct: Math.round(present/docs.length*100), present, total: docs.length };
}

// ═══════════════════════════════════════════
// CS VIEW
// ═══════════════════════════════════════════
let csSearchQuery = '';

function csLoad() {
  currentTab  = document.getElementById('csTab').value;
  currentWeek = parseInt(document.getElementById('csWeek').value);
  if (!loaded) {
    document.getElementById('csStats').style.display='none';
    document.getElementById('csMain').style.display='none';
    document.getElementById('csEmpty').style.display='block';
    return;
  }
  _csDoctors = buildDoctors(currentTab, currentWeek);

  // Current stats
  const present = _csDoctors.filter(d=>d.cur.P).length;
  const ausCount = _csDoctors.filter(d=>d.motivos.includes('ausente')).length;
  const camCount = _csDoctors.filter(d=>d.motivos.includes('camera')).length;
  const vitCount = _csDoctors.filter(d=>d.motivos.includes('vitoria')).length;

  document.getElementById('sTot').textContent = _csDoctors.length;
  document.getElementById('sPre').textContent = present;
  document.getElementById('sAus').textContent = ausCount;
  document.getElementById('sCam').textContent = camCount;
  document.getElementById('sVit').textContent = vitCount;

  // Delta vs previous week
  if (currentWeek > 1) {
    const prev = buildDoctors(currentTab, currentWeek - 1);
    const pPre = prev.filter(d=>d.cur.P).length;
    const pAus = prev.filter(d=>d.motivos.includes('ausente')).length;
    const pCam = prev.filter(d=>d.motivos.includes('camera')).length;
    const pVit = prev.filter(d=>d.motivos.includes('vitoria')).length;
    setStatDelta('dTot', _csDoctors.length, prev.length, currentWeek-1, 'neutral');
    setStatDelta('dPre', present,  pPre, currentWeek-1, 'positive');
    setStatDelta('dAus', ausCount, pAus, currentWeek-1, 'negative');
    setStatDelta('dCam', camCount, pCam, currentWeek-1, 'negative');
    setStatDelta('dVit', vitCount, pVit, currentWeek-1, 'negative');
  } else {
    ['dTot','dPre','dAus','dCam','dVit'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    });
  }

  document.getElementById('csStats').style.display='grid';
  document.getElementById('csMain').style.display='block';
  document.getElementById('csEmpty').style.display='none';
  updateFilterCounts();
  renderCsTable();
}

function setStatDelta(elId, curr, prev, prevWeek, direction) {
  const el = document.getElementById(elId);
  if (!el) return;
  const diff = curr - prev;
  if (diff === 0) {
    el.innerHTML = `<span class="delta-neutral">= S${prevWeek}</span>`;
    return;
  }
  const isGood = direction === 'neutral' ? null
    : direction === 'positive' ? diff > 0
    : diff < 0; // negative = good when decreasing
  const color = isGood === null ? 'var(--blue)'
    : isGood ? 'var(--safe)' : 'var(--danger)';
  const arrow = diff > 0 ? '▲' : '▼';
  const sign  = diff > 0 ? '+' : '';
  el.innerHTML = `<span style="color:${color}">${arrow} ${sign}${diff} vs S${prevWeek}</span>`;
}

function updateFilterCounts() {
  const all = _csDoctors.filter(d => d.motivos.length > 0 || d.consAbs >= 4);
  const counts = {
    'rf-todos':    all.length,
    'rf-ausente':  all.filter(d=>d.motivos.includes('ausente')).length,
    'rf-camera':   all.filter(d=>d.motivos.includes('camera')).length,
    'rf-feedback': all.filter(d=>d.motivos.includes('feedback')).length,
    'rf-vitoria':  all.filter(d=>d.motivos.includes('vitoria')).length,
    'rf-urgente':  all.filter(d=>calcAlertLevel(d,currentWeek)?.icon==='🔴').length,
    'rf-queda':    all.filter(d=>isQuedaAcelerada(d,currentWeek)).length,
    'rf-renovacao':all.filter(d=>{const r=calcRenewalScore(d,currentWeek);return r&&r.daysLeft>=0&&r.daysLeft<=60;}).length,
    'rf-master':   all.filter(d=>calcAscensaoScore(d,currentWeek)>0).length,
  };
  const labels = {
    'rf-todos':'Todos','rf-ausente':'Ausentes','rf-camera':'Sem câmera',
    'rf-feedback':'Sem feedback','rf-vitoria':'Sem vitória','rf-urgente':'Urgentes',
    'rf-queda':'Queda','rf-renovacao':'Renovação','rf-master':'Master'
  };
  Object.entries(labels).forEach(([id, lbl]) => {
    const el = document.querySelector(`label[for="${id}"]`);
    if (!el) return;
    const n = counts[id];
    el.innerHTML = n > 0
      ? `${lbl}<span class="filter-cnt">${n}</span>`
      : lbl;
  });
}

function csSearchTable(val) {
  csSearchQuery = (val || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  csPage = 1;
  renderCsTable();
}


function setPill(f,el) {
  csFilter=f;
  csPage = 1;
  csSearchQuery = '';
  const inp = document.getElementById('csSearch'); if (inp) inp.value = '';
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  renderCsTable();
  if (typeof syncMobileFilterUI === 'function') syncMobileFilterUI(f);
}

function renderCsTable() {
  const all  = _csDoctors.filter(d=>d.motivos.length>0||d.consAbs>=4);

  let list;
  if      (csFilter === 'todos')    list = all;
  else if (csFilter === 'urgente')  list = all.filter(d => calcAlertLevel(d, currentWeek)?.icon === '🔴');
  else if (csFilter === 'queda')    list = all.filter(d => isQuedaAcelerada(d, currentWeek));
  else if (csFilter === 'renovacao') list = all.filter(d => { const r=calcRenewalScore(d,currentWeek); return r && r.daysLeft>=0 && r.daysLeft<=60; });
  else if (csFilter === 'master')   list = all.filter(d => calcAscensaoScore(d, currentWeek) > 0);
  else                              list = all.filter(d => d.motivos.includes(csFilter));

  // Search filter
  if (csSearchQuery) {
    const qClean  = csSearchQuery.replace(/[^a-z0-9 ]/g, '').trim();
    const phoneQ  = csSearchQuery.replace(/\D/g, '');
    list = list.filter(d => {
      const fullName = norm(tit(d.gender) + ' ' + d.name);
      const rawName  = norm(d.name);
      const phone    = (d.phone||'').replace(/\D/g,'');
      return fullName.includes(qClean) || rawName.includes(qClean) ||
             (phoneQ && phone.includes(phoneQ));
    });
  }
  const tbody = document.getElementById('csTbody');
  if (!list.length) {
    tbody.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:36px;color:var(--sub)">Nenhum médico para acionar neste filtro 🎉</td></tr>`;
    renderCsMobileCards();
    renderCsPagination(0, 0);
    return;
  }
  renderCsMobileCards();
  // Sync mobile filter count
  const _mfCount = document.getElementById('csMfCount');
  if (_mfCount) _mfCount.textContent = list.length + ' resultado' + (list.length !== 1 ? 's' : '');

  // Paginação
  const totalPages = Math.ceil(list.length / CS_PAGE_SIZE);
  if (csPage > totalPages) csPage = totalPages;
  const start = (csPage - 1) * CS_PAGE_SIZE;
  const pageList = list.slice(start, start + CS_PAGE_SIZE);

  tbody.innerHTML=pageList.map(d=>{
    const rc       = d.risk>=60?'rh':d.risk>=30?'rm':'rl';
    const rcColor  = d.risk>=60?'var(--danger)':d.risk>=30?'var(--warn)':'var(--safe)';
    const rl       = d.risk>=60?'ALTO':d.risk>=30?'MÉD':'BAIXO';
    const badges   = d.motivos.map(m=>`<span class="b ${bCls(m)}">${bLbl(m)}</span>`).join('');
    const abs4     = d.consAbs>=4 ? `<span class="b b-4x">4+ aus.</span>` : '';
    const quedaB   = isQuedaAcelerada(d,currentWeek) ? `<span class="b" style="background:linear-gradient(135deg,rgba(255,51,85,.22),rgba(255,51,85,.11));color:var(--danger);border:1px solid rgba(255,51,85,.38);border-radius:6px">⚡ QUEDA</span>` : '';
    const novoB    = isNovo(d) ? `<span class="b" style="background:linear-gradient(135deg,rgba(77,142,255,.18),rgba(77,142,255,.09));color:var(--blue);border:1px solid rgba(77,142,255,.36);border-radius:6px">✦ NOVO</span>` : '';
    const alertB   = (()=>{ const a=calcAlertLevel(d,currentWeek); return a?`<span class="b" style="background:linear-gradient(135deg,rgba(255,51,85,.15),rgba(255,51,85,.07));color:${a.color};border:1px solid rgba(255,51,85,.28);border-radius:6px">${a.icon} ${a.label}</span>`:''; })();
    const renewB   = (()=>{ const r=calcRenewalScore(d,currentWeek); return (r&&r.daysLeft<=60&&r.daysLeft>=0)?`<span class="b" style="background:linear-gradient(135deg,rgba(34,217,138,.14),rgba(34,217,138,.07));color:${r.color};border:1px solid rgba(34,217,138,.28);border-radius:6px">${r.label}</span>`:''; })();
    const turmaTag = d.turma==='Master'
      ? `<span class="turma-m">Master</span>`
      : d.isWinners ? `<span class="turma-w">Winners</span>`
      : `<span class="turma-t">Mentoria</span>`;
    const dn = displayName(d.name);
    // Consecutive absences visual
    const absHtml  = d.consAbs>=4
      ? `<span class="abs-badge abs-crit">${d.consAbs}×</span>`
      : d.consAbs>=2
      ? `<span class="abs-badge abs-warn">${d.consAbs}×</span>`
      : `<span class="abs-zero">${d.consAbs}</span>`;
    return `<tr onclick="openDrModal('${esc(d.name)}')" style="--risk-c:${rcColor}">
      <td class="td-name"><div class="dr-name">${tit(d.gender)}. ${esc(dn)}</div>${d.phone?`<div class="dr-sub">${PHONE_ICON}${fmtPhone(d.phone)}</div>`:''}</td>
      <td>${turmaTag}</td>
      <td><div class="badges">${badges}${abs4}${quedaB}${novoB}${alertB}${renewB}</div></td>
      <td class="td-abs">${absHtml}</td>
      <td class="td-risk"><div class="rbar ${rc}"><div class="rbar-track"><div class="rbar-fill" style="width:${d.risk}%"></div></div><div class="rbar-info"><span class="rbar-txt">${d.risk}%</span><span class="rbar-lv">${rl}</span></div></div></td>
      <td class="td-act"><button class="dr-act-btn" onclick="event.stopPropagation();openDrModal('${esc(d.name)}')">Acionar <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button></td>
    </tr>`;
  }).join('');
  renderCsPagination(list.length, totalPages);
}

function renderCsPagination(total, totalPages) {
  let el = document.getElementById('csPagination');
  if (!el) {
    el = document.createElement('div');
    el.id = 'csPagination';
    el.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:6px;padding:16px 0;flex-wrap:wrap;';
    const tblWrap = document.getElementById('csTbody')?.closest('.tbl-wrap');
    if (tblWrap) tblWrap.after(el);
  }
  if (!total || totalPages <= 1) { el.innerHTML = ''; return; }

  const start = (csPage - 1) * CS_PAGE_SIZE + 1;
  const end = Math.min(csPage * CS_PAGE_SIZE, total);

  const btnStyle = (active) => `style="padding:5px 11px;border-radius:7px;border:1px solid ${active?'var(--acc)':'var(--border2)'};background:${active?'var(--acc)':'transparent'};color:${active?'#000':'var(--sub)'};font-size:12px;font-weight:${active?'700':'500'};cursor:pointer;transition:all .15s;"`;

  let html = `<span style="font-size:11px;color:var(--sub);margin-right:4px;">${start}–${end} de ${total}</span>`;
  html += `<button ${btnStyle(false)} onclick="csGoPage(${csPage-1})" ${csPage===1?'disabled':''}>‹</button>`;

  // Páginas
  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 7 && p > 2 && p < totalPages - 1 && Math.abs(p - csPage) > 1) {
      if (p === 3 || p === totalPages - 2) html += `<span style="color:var(--sub);padding:0 2px">…</span>`;
      continue;
    }
    html += `<button ${btnStyle(p===csPage)} onclick="csGoPage(${p})">${p}</button>`;
  }

  html += `<button ${btnStyle(false)} onclick="csGoPage(${csPage+1})" ${csPage===totalPages?'disabled':''}>›</button>`;
  el.innerHTML = html;
}

function csGoPage(p) {
  const all = _csDoctors.filter(d=>d.motivos.length>0||d.consAbs>=4);
  const totalPages = Math.ceil(all.length / CS_PAGE_SIZE);
  if (p < 1 || p > totalPages) return;
  csPage = p;
  renderCsTable();
  document.getElementById('csTbody')?.closest('.tbl-wrap')?.scrollIntoView({behavior:'smooth', block:'start'});
}

function bCls(m){return{ausente:'b-aus',camera:'b-cam',feedback:'b-fb',vitoria:'b-vit'}[m]||'';}
function bLbl(m){return{ausente:'❌ Ausente',camera:'📷 Câmera',feedback:'💬 Feedback',vitoria:'🏆 Vitória'}[m]||m;}

function renderCsMobileCards() {
  const el = document.getElementById('csMobileList');
  if (!el) return;
  const all = _csDoctors.filter(d=>d.motivos.length>0||d.consAbs>=4);
  let list;
  if      (csFilter === 'todos')    list = all;
  else if (csFilter === 'urgente')  list = all.filter(d => calcAlertLevel(d, currentWeek)?.icon === '🔴');
  else if (csFilter === 'queda')    list = all.filter(d => isQuedaAcelerada(d, currentWeek));
  else if (csFilter === 'renovacao') list = all.filter(d => { const r=calcRenewalScore(d,currentWeek); return r && r.daysLeft>=0 && r.daysLeft<=60; });
  else if (csFilter === 'master')   list = all.filter(d => calcAscensaoScore(d, currentWeek) > 0);
  else                              list = all.filter(d => d.motivos.includes(csFilter));

  // Search filter
  if (csSearchQuery) {
    const qClean = csSearchQuery.replace(/[^a-z0-9 ]/g, '').trim();
    const phoneQ = csSearchQuery.replace(/\D/g, '');
    list = list.filter(d => {
      const fullName = norm(tit(d.gender) + ' ' + d.name);
      const rawName  = norm(d.name);
      const phone    = (d.phone||'').replace(/\D/g,'');
      return fullName.includes(qClean) || rawName.includes(qClean) ||
             (phoneQ && phone.includes(phoneQ));
    });
  }

  if (!list.length) {
    el.innerHTML = `<div class="cs-mc-empty">Nenhum médico para acionar neste filtro 🎉</div>`;
    return;
  }

  el.innerHTML = list.map(d => {
    const rc = d.risk>=60?'var(--danger)':d.risk>=30?'var(--warn)':'var(--safe)';
    const rl = d.risk>=60?'ALTO':d.risk>=30?'MÉD':'BAIXO';
    const badges = d.motivos.map(m=>`<span class="b ${bCls(m)}">${bLbl(m)}</span>`).join('');
    const abs4   = d.consAbs>=4 ? `<span class="b b-4x">4+ aus.</span>` : '';
    const quedaB = isQuedaAcelerada(d,currentWeek) ? `<span class="b" style="background:linear-gradient(135deg,rgba(255,51,85,.22),rgba(255,51,85,.11));color:var(--danger);border:1px solid rgba(255,51,85,.38);border-radius:6px">⚡ QUEDA</span>` : '';
    const novoB  = isNovo(d) ? `<span class="b" style="background:linear-gradient(135deg,rgba(77,142,255,.18),rgba(77,142,255,.09));color:var(--blue);border:1px solid rgba(77,142,255,.36);border-radius:6px">✦ NOVO</span>` : '';
    const alertB = (()=>{ const a=calcAlertLevel(d,currentWeek); return a?`<span class="b" style="background:linear-gradient(135deg,rgba(255,51,85,.15),rgba(255,51,85,.07));color:${a.color};border:1px solid rgba(255,51,85,.28);border-radius:6px">${a.icon} ${a.label}</span>`:''; })();
    const renewB = (()=>{ const r=calcRenewalScore(d,currentWeek); return (r&&r.daysLeft<=60&&r.daysLeft>=0)?`<span class="b" style="background:linear-gradient(135deg,rgba(34,217,138,.14),rgba(34,217,138,.07));color:${r.color};border:1px solid rgba(34,217,138,.28);border-radius:6px">${r.label}</span>`:''; })();
    const turmaTag = d.turma==='Master'
      ? `<span class="turma-m">Master</span>`
      : d.isWinners ? `<span class="turma-w">Winners</span>`
      : `<span class="turma-t">Mentoria</span>`;
    const dn = displayName(d.name);
    return `<div class="cs-mc" onclick="openDrModal('${esc(d.name)}')">
      <div class="cs-mc-risk-bar" style="background:${rc}"></div>
      <div class="cs-mc-body">
        <div class="cs-mc-header">
          <div class="cs-mc-name">${tit(d.gender)}. ${esc(dn)}</div>
          ${turmaTag}
        </div>
        ${d.phone?`<div class="cs-mc-phone">${PHONE_ICON}${fmtPhone(d.phone)}</div>`:''}
        <div class="cs-mc-badges">${badges}${abs4}${quedaB}${novoB}${alertB}${renewB}</div>
        <div class="cs-mc-footer">
          <span class="cs-mc-abs" style="color:${d.consAbs>=3?'var(--danger)':'var(--text-3)'}">
            ${d.consAbs} falta${d.consAbs!==1?'s':''} seguida${d.consAbs!==1?'s':''}
          </span>
          <span class="cs-mc-risk" style="color:${rc}">${d.risk}% ${rl}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function popularCicloSelector() {
  // Coleta todos os ciclos disponíveis no KV
  const ciclosSet = new Set();
  for (const tab of Object.keys(kvPresenca)) {
    if (tab === '__calls__' || tab === '__dates__') continue;
    for (const ciclo of Object.keys(kvPresenca[tab] || {})) {
      if (/^\d{4}-\d{2}$/.test(ciclo)) ciclosSet.add(ciclo);
    }
  }
  const sorted  = [...ciclosSet].sort().reverse();
  const mesAtual = new Date().toISOString().slice(0, 7);

  // Popula dropdown principal
  const sel = document.getElementById('gestCiclo');
  if (sel) {
    sel.innerHTML = '<option value="">Mês atual</option>';
    for (const c of sorted) {
      const label = new Date(c + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      sel.innerHTML += `<option value="${c}" ${c === mesAtual ? 'selected' : ''}>${label}</option>`;
    }
    cicloAtivo = sel.value || mesAtual;
  }

  // Popula selects do modo comparação se existirem
  if (modoComparacao) popularCicloSelectComparacao();
}

function scrollRenovacao(dir) {
  const el = document.getElementById('gestRenovacao');
  if (!el) return;
  el.scrollBy({ left: dir * 220, behavior: 'smooth' });
}

// ═══════════════════════════════════════════
// GESTÃO VIEW
// ═══════════════════════════════════════════

// Converte datas das semanas em semanas filtradas por período
// Modo comparação
let modoComparacao = false;

function toggleModoComparacao() {
  modoComparacao = !modoComparacao;
  const bar = document.getElementById('gestComparacaoBar');
  const btn = document.getElementById('btnComparar');
  if (modoComparacao) {
    bar.style.display = 'flex';
    btn.style.display = 'none';
    // Popula os selects de comparação com os ciclos disponíveis
    popularCicloSelectComparacao();
  } else {
    bar.style.display = 'none';
    btn.style.display = 'block';
  }
  renderGest();
}

function popularCicloSelectComparacao() {
  const ciclos = [];
  for (const tab of Object.keys(kvPresenca)) {
    if (tab === '__calls__' || tab === '__dates__') continue;
    for (const ciclo of Object.keys(kvPresenca[tab] || {})) {
      if (/^\d{4}-\d{2}$/.test(ciclo) && !ciclos.includes(ciclo)) ciclos.push(ciclo);
    }
  }
  ciclos.sort().reverse();
  const mesAtual = new Date().toISOString().slice(0, 7);
  const mesAnterior = ciclos.find(c => c < mesAtual) || ciclos[1] || ciclos[0] || mesAtual;

  ['gestCicloA','gestCicloB'].forEach((id, idx) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = ciclos.map(c => {
      const label = new Date(c + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const selected = (idx === 0 ? c === mesAnterior : c === mesAtual) ? 'selected' : '';
      return `<option value="${c}" ${selected}>${label}</option>`;
    }).join('');
  });
}

function onGestCicloChange() {
  cicloAtivo = document.getElementById('gestCiclo').value || new Date().toISOString().slice(0,7);
  renderGest();
}

// ── MODO COMPARAÇÃO ─────────────────────────────────────────
function renderGestComparacao() {
  const cicloA = document.getElementById('gestCicloA')?.value;
  const cicloB = document.getElementById('gestCicloB')?.value;
  if (!cicloA || !cicloB) return;

  const origCiclo = cicloAtivo;

  // detectMaxWeekForCiclo depende de cicloAtivo — setar antes de chamar
  cicloAtivo = cicloA;
  const maxA = detectMaxWeekForCiclo(cicloA);
  cicloAtivo = cicloB;
  const maxB = detectMaxWeekForCiclo(cicloB);
  cicloAtivo = origCiclo;

  const labelA = new Date(cicloA + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const labelB = new Date(cicloB + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Função auxiliar: calcula score médio para um ciclo
  function avgScoreForCiclo(ciclo, maxW) {
    cicloAtivo = ciclo;
    const scores = allAlunos.map(a => calcCompositeScore(a, maxW));
    return scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
  }

  cicloAtivo = cicloA;
  const engA = avgScoreForCiclo(cicloA, maxA);
  const quedaA = allAlunos.filter(a => isQuedaAcelerada(a, maxA)).length;
  const novosA = allAlunos.filter(a => isNovo(a)).length;

  cicloAtivo = cicloB;
  const engB = avgScoreForCiclo(cicloB, maxB);
  const quedaB = allAlunos.filter(a => isQuedaAcelerada(a, maxB)).length;
  const novosB = allAlunos.filter(a => isNovo(a)).length;

  cicloAtivo = origCiclo;

  // Delta helpers
  const delta = (a, b) => {
    const d = b - a;
    const color = d > 0 ? 'var(--safe)' : d < 0 ? 'var(--danger)' : 'var(--sub)';
    const sign  = d > 0 ? '+' : '';
    return `<span style="font-size:11px;color:${color};font-weight:700">${sign}${d}</span>`;
  };

  // KPIs comparação
  document.getElementById('gTotal').textContent = allAlunos.length;
  document.getElementById('gEngLbl').textContent = 'Score qualidade';
  document.getElementById('gAbsentLbl').textContent = 'Queda acelerada';

  document.getElementById('gEng').innerHTML =
    `<span style="color:var(--sub);font-size:20px">${engA}%</span>
     <span style="color:var(--sub);font-size:12px;margin:0 4px">→</span>
     <span style="color:var(--safe);font-size:28px">${engB}%</span>
     ${delta(engA, engB)}pp`;

  document.getElementById('gAbsent').innerHTML =
    `<span style="color:var(--sub);font-size:20px">${quedaA}</span>
     <span style="color:var(--sub);font-size:12px;margin:0 4px">→</span>
     <span style="color:var(--warn);font-size:28px">${quedaB}</span>
     ${delta(quedaA, quedaB)}`;

  // Risco alto por ciclo
  cicloAtivo = cicloA;
  const riscoA = allAlunos.filter(a => calcRisk(a.history || [], maxA) >= 60).length;
  cicloAtivo = cicloB;
  const riscoB = allAlunos.filter(a => calcRisk(a.history || [], maxB) >= 60).length;
  cicloAtivo = origCiclo;

  document.getElementById('gRisk').innerHTML =
    `<span style="color:var(--sub);font-size:20px">${riscoA}</span>
     <span style="color:var(--sub);font-size:12px;margin:0 4px">→</span>
     <span style="color:var(--danger);font-size:28px">${riscoB}</span>
     ${delta(riscoA, riscoB)}`;

  document.getElementById('gQueda').innerHTML =
    `<span style="color:var(--sub);font-size:20px">${quedaA}</span>
     <span style="color:var(--sub);font-size:12px;margin:0 4px">→</span>
     <span style="color:var(--warn);font-size:28px">${quedaB}</span>
     ${delta(quedaA, quedaB)}`;

  document.getElementById('gNovos').innerHTML =
    `<span style="color:var(--sub);font-size:20px">${novosA}</span>
     <span style="color:var(--sub);font-size:12px;margin:0 4px">→</span>
     <span style="color:var(--blue);font-size:28px">${novosB}</span>
     ${delta(novosA, novosB)}`;

  // Título dos comparativos
  document.getElementById('gestCompareSub').textContent =
    `${labelA} (A) vs ${labelB} (B) — presença por turma`;

  // Função: calcula presença média do mês inteiro para uma turma
  function monthAvgPresence(tab, ciclo, maxW) {
    const prev = cicloAtivo;
    cicloAtivo = ciclo;
    let totalPct = 0, count = 0;
    for (let w = 0; w < maxW; w++) {
      const r = weekPresenceRate(tab, w);
      if (r && r.total > 0) { totalPct += r.pct; count++; }
    }
    cicloAtivo = prev;
    return count > 0 ? Math.round(totalPct / count) : 0;
  }

  // Gráfico comparativo por turma — todas as turmas com dados
  const compareTabs = ALL_TABS.filter(tab => {
    const hasA = Object.keys((kvPresenca[tab] || {})[cicloA] || {}).length > 0;
    const hasB = Object.keys((kvPresenca[tab] || {})[cicloB] || {}).length > 0;
    return hasA || hasB;
  });
  const wcEl = document.getElementById('weekCompare');
  wcEl.innerHTML = compareTabs.map(tab => {
    // Média mensal
    const avgA = monthAvgPresence(tab, cicloA, maxA);
    const avgB = monthAvgPresence(tab, cicloB, maxB);

    // Última semana (comparativo pontual)
    cicloAtivo = cicloA;
    const rA = weekPresenceRate(tab, maxA - 1) || { pct: 0 };
    cicloAtivo = cicloB;
    const rB = weekPresenceRate(tab, maxB - 1) || { pct: 0 };
    cicloAtivo = origCiclo;

    const colorAvgA = avgA >= 70 ? 'var(--safe)' : avgA >= 40 ? 'var(--warn)' : 'var(--danger)';
    const colorAvgB = avgB >= 70 ? 'var(--safe)' : avgB >= 40 ? 'var(--warn)' : 'var(--danger)';
    const d = avgB - avgA;
    const dColor = d > 0 ? 'var(--safe)' : d < 0 ? 'var(--danger)' : 'var(--sub)';
    const dTxt = d > 0 ? '▲ +'+d+'pp' : d < 0 ? '▼ '+d+'pp' : '= Sem variação';

    return `<div class="wcard">
      <div class="wcard-title">${tab}</div>
      <div style="font-size:9px;color:var(--sub);margin-bottom:6px;letter-spacing:.08em">MÉDIA DO MÊS</div>
      <div style="display:flex;gap:12px;align-items:flex-end;margin:4px 0 10px;">
        <div style="text-align:center;flex:1">
          <div style="font-size:9px;color:var(--sub);margin-bottom:4px">A · ${labelA.split(' ')[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-weight:800;font-size:36px;color:${colorAvgA};line-height:1">${avgA}%</div>
        </div>
        <div style="font-size:18px;color:var(--sub)">→</div>
        <div style="text-align:center;flex:1">
          <div style="font-size:9px;color:var(--sub);margin-bottom:4px">B · ${labelB.split(' ')[0]}</div>
          <div style="font-family:'Inter',sans-serif;font-weight:800;font-size:36px;color:${colorAvgB};line-height:1">${avgB}%</div>
        </div>
      </div>
      <div class="wcard-delta" style="color:${dColor};background:transparent;border:1px solid ${dColor}">${dTxt}</div>
    </div>`;
  }).join('');

  // Gráficos de evolução comparativos
  renderEvolutionChartComparacao('chartMaster',   cicloA, cicloB, maxA, maxB, labelA, labelB, 'Master');
  renderEvolutionChartComparacao('chartMentoria', cicloA, cicloB, maxA, maxB, labelA, labelB, 'Mentoria');

  // Oculta seções que não fazem sentido em modo comparação
  document.getElementById('gestRiskMaster').innerHTML =
    '<div style="color:var(--sub);font-size:12px;padding:12px">Desative o modo comparação para ver o ranking de risco.</div>';
  document.getElementById('gestRiskMentoria').innerHTML = '';
}

function renderEvolutionChartComparacao(elId, cicloA, cicloB, maxA, maxB, labelA, labelB, turma) {
  const origCiclo = cicloAtivo;
  const el = document.getElementById(elId);

  cicloAtivo = cicloA;
  const weeksA = calcEvolutionByTurma(turma, maxA);
  cicloAtivo = cicloB;
  const weeksB = calcEvolutionByTurma(turma, maxB);
  cicloAtivo = origCiclo;

  if (!weeksA.length && !weeksB.length) {
    el.innerHTML = '<div style="color:var(--sub);font-size:11px;padding:20px">Sem dados</div>';
    return;
  }

  const allPcts = [...weeksA.map(w=>w.pct), ...weeksB.map(w=>w.pct), 1];
  const maxP = Math.max(...allPcts);

  const makeBar = (weeks, color, label) => weeks.map(b => `
    <div class="chart-col">
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height:${b.pct/maxP*100}%;background:${color};opacity:0.85">
          <span class="chart-bar-val" style="color:${color}">${b.pct}%</span>
        </div>
      </div>
      <div class="chart-lbl">S${b.w}</div>
    </div>`).join('');

  el.innerHTML = `
    <div style="width:100%">
      <div style="display:flex;gap:8px;margin-bottom:8px;font-size:10px;">
        <span style="color:var(--sub)">■ <span style="color:var(--acc)">${labelA.split(' ')[0]}</span></span>
        <span style="color:var(--sub)">■ <span style="color:var(--blue)">${labelB.split(' ')[0]}</span></span>
      </div>
      <div style="display:flex;gap:16px;align-items:flex-end;height:110px;">
        <div style="display:flex;gap:6px;align-items:flex-end;flex:1">${makeBar(weeksA,'var(--acc)',labelA)}</div>
        <div style="width:1px;background:var(--border2);height:80%;align-self:flex-end"></div>
        <div style="display:flex;gap:6px;align-items:flex-end;flex:1">${makeBar(weeksB,'var(--blue)',labelB)}</div>
      </div>
    </div>`;
}

function setGestTurma(turma, el) {
  gestTurmaFilter = turma;
  document.querySelectorAll('.gest-turma-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderGest();
}

function renderGest() {
  if (!loaded||!allAlunos.length) {
    document.getElementById('gestContent').style.display='none';
    document.getElementById('gestEmpty').style.display='block';
    return;
  }
  document.getElementById('gestContent').style.display='block';
  document.getElementById('gestEmpty').style.display='none';

  // Se modo comparação ativo, delega
  if (modoComparacao) {
    renderGestComparacao();
    return;
  }

  const gestWeekVal = parseInt(document.getElementById('gestWeek').value);
  const allWeeks    = gestWeekVal === 0;
  const maxWeek     = detectMaxWeekForCiclo(getCicloAtivo());

  // ── FILTRO DE TURMA ──────────────────────────
  const poolBase = gestTurmaFilter === 'Master'   ? allAlunos.filter(a=>a.turma==='Master'||a.isWinners)
                 : gestTurmaFilter === 'Mentoria' ? allAlunos.filter(a=>a.turma==='Mentoria')
                 : allAlunos;

  // ── INDICADOR DE MODO ────────────────────────
  const modeEl = document.getElementById('gestModeIndicator');
  if (modeEl) {
    const modeTurma = gestTurmaFilter === 'todos' ? 'Todos' : gestTurmaFilter;
    const modeWeek  = allWeeks ? 'Acumulado' : `Semana ${gestWeekVal}`;
    modeEl.innerHTML = `<span class="mode-pill">${modeWeek}</span><span class="mode-pill mode-pill-turma">${modeTurma}</span>`;
  }

  // ── KPIs ──────────────────────────────────
  const total = poolBase.length;

  let avgEng, absentCount;

  if (allWeeks) {
    const scores = poolBase.map(a=>calcCompositeScore(a, maxWeek));
    avgEng = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
    absentCount = poolBase.filter(a=>{
      let absCount=0;
      for(let w=0;w<maxWeek;w++){
        const entry=getKvEntry('Mentoria', norm(a.name));
        if(!entry||!entry.history[w]||!entry.history[w].P) absCount++;
      }
      return absCount > maxWeek/2;
    }).length;
    document.getElementById('gEngLbl').textContent    = 'Score qualidade acumulado';
    document.getElementById('gAbsentLbl').textContent = 'Faltaram >50% das semanas';
  } else {
    const scores = poolBase.map(a=>calcCompositeScoreWeek(a, gestWeekVal-1));
    avgEng = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
    const mentoriaDocs = buildDoctors('Mentoria', gestWeekVal);
    absentCount = mentoriaDocs.filter(d=>!d.cur.P && (gestTurmaFilter==='todos'||d.turma===gestTurmaFilter)).length;
    document.getElementById('gEngLbl').textContent    = `Score qualidade S${gestWeekVal}`;
    document.getElementById('gAbsentLbl').textContent = `Ausentes S${gestWeekVal}`;
  }

  document.getElementById('gTotal').textContent  = total;
  document.getElementById('gEng').textContent    = avgEng+'%';
  document.getElementById('gAbsent').textContent = absentCount;

  // ── WEEK COMPARISON CARDS ──────────────────
  const hasWinners = allAlunos.some(a=>a.isWinners);
  const compareTabs = [
    'Mentoria','Hotseat','Hotseat Simultâneo','Master',
    ...(hasWinners ? ['Winners Encontro'] : []),
    ...ESPECIALIDADES.filter(e=>allAlunos.some(a=>hasEsp(a, e)))
  ];
  const wcEl = document.getElementById('weekCompare');

  if (allWeeks) {
    document.getElementById('gestCompareSub').textContent = 'Presença semana a semana por turma';
    wcEl.innerHTML = compareTabs.map(tab=>{
      const weeks=[];
      for (let w=0; w<maxWeek; w++) {
        const r = weekPresenceRate(tab,w);
        if (r) weeks.push({w:w+1,...r});
      }
      if (!weeks.length) return '';
      const maxPct = Math.max(...weeks.map(w=>w.pct),1);
      const last  = weeks[weeks.length-1];
      const prev  = weeks.length>=2 ? weeks[weeks.length-2] : null;
      const delta = prev ? last.pct-prev.pct : null;
      const deltaCls = delta===null?'delta-eq':delta>0?'delta-up':delta<0?'delta-dn':'delta-eq';
      const deltaTxt = delta===null?'Primeira semana':delta>0?`▲ +${delta}pp vs S${last.w-1}`:delta<0?`▼ ${delta}pp vs S${last.w-1}`:`= Sem variação vs S${last.w-1}`;
      const bars = weeks.map(wk=>{
        const h = Math.max(Math.round(wk.pct/maxPct*60),3);
        const color = wk.pct>=70?'var(--safe)':wk.pct>=40?'var(--warn)':'var(--danger)';
        return `<div class="wweek">
          <div class="wweek-bar-wrap"><div class="wweek-bar" style="height:${h}px;background:${color}"></div></div>
          <div class="wweek-pct" style="color:${color}">${wk.pct}%</div>
          <div class="wweek-lbl">S${wk.w}</div>
        </div>`;
      }).join('');
      return `<div class="wcard">
        <div class="wcard-title">${tab}</div>
        <div class="wcard-weeks">${bars}</div>
        <div class="wcard-delta ${deltaCls}">${deltaTxt}</div>
      </div>`;
    }).join('');
  } else {
    // Semana isolada: mostra presença daquela semana por turma em cards simples
    document.getElementById('gestCompareSub').textContent = `Presença na Semana ${gestWeekVal}`;
    wcEl.innerHTML = compareTabs.map(tab=>{
      const r = weekPresenceRate(tab, gestWeekVal-1);
      if (!r) return '';
      const color = r.pct>=70?'var(--safe)':r.pct>=40?'var(--warn)':'var(--danger)';
      return `<div class="wcard">
        <div class="wcard-title">${tab}</div>
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:48px;color:${color};line-height:1;margin:8px 0">${r.pct}%</div>
        <div style="font-size:11px;color:var(--sub)">${r.present} de ${r.total} presentes</div>
      </div>`;
    }).join('');
  }

  // ── CHARTS ────────────────────────────────
  const chartWeeks = allWeeks ? maxWeek : gestWeekVal;
  renderEvolutionChart('chartMaster',   calcEvolutionByTurma('Master',chartWeeks),   'var(--acc)',  allAlunos.filter(a=>a.turma==='Master'||a.isWinners).length);
  renderEvolutionChart('chartMentoria', calcEvolutionByTurma('Mentoria',chartWeeks), 'var(--blue)', allAlunos.filter(a=>a.turma==='Mentoria').length);

  // ── COMPOSITE SCORES (aplica filtro de turma) ─
  const refW = allWeeks ? maxWeek : gestWeekVal;
  const withScores = poolBase.map(a=>{
    const score = calcCompositeScore(a, refW);
    const risk  = Math.min(100, 100-score);
    const queda = isQuedaAcelerada(a, refW);
    const novo  = isNovo(a);
    return {...a, score, risk, queda, novo};
  });

  // ── NEW KPIs ──────────────────────────────
  const quedaCount = withScores.filter(a=>a.queda).length;
  const novosCount = withScores.filter(a=>a.novo).length;
  const atRiskNew  = withScores.filter(a=>a.risk>=60).length;
  document.getElementById('gRisk').textContent  = atRiskNew;
  document.getElementById('gQueda').textContent = quedaCount;
  document.getElementById('gNovos').textContent = novosCount;

  // ── RISK CARDS — SPLIT BY TURMA ───────────
  function riskReason(a) {
    // Calcula métricas reais do aluno para mostrar o porquê do risco
    const tabs = a.turma==='Master'||a.isWinners
      ? ['Mentoria','Master','Hotseat','Hotseat Simultâneo']
      : ['Mentoria','Hotseat','Hotseat Simultâneo'];
    let pHit=0,cHit=0,vHit=0,slots=0;
    for (const tab of tabs) {
      const entry = getKvEntry(tab, norm(a.name));
      for (let i=0;i<refW;i++) {
        const h = entry?.history?.[i]||{P:false,C:false,F:false,V:false};
        slots++;
        if(h.P){pHit++;if(h.C)cHit++;if(h.V)vHit++;}
      }
    }
    if (!slots) return '';
    const pPct  = Math.round(pHit/slots*100);
    const cPct  = pHit ? Math.round(cHit/pHit*100) : 0;
    const vPct  = pHit ? Math.round(vHit/pHit*100) : 0;
    const pc = (v,ok) => `<span style="color:${v>=ok?'var(--safe)':v>=ok*0.5?'var(--warn)':'var(--danger)'}">${v}%</span>`;
    return `<div class="rc-reasons">
      <span title="Presença">P ${pc(pPct,70)}</span>
      <span title="Câmera">C ${pc(cPct,50)}</span>
      <span title="Vitória">V ${pc(vPct,50)}</span>
    </div>`;
  }

  function renderRiskGrid(elId, pool) {
    const top = [...pool].sort((a,b)=>b.risk-a.risk).slice(0,6);
    document.getElementById(elId).innerHTML = top.map(a=>{
      const cls = a.risk>=60?'r-h':a.risk>=30?'r-m':'r-l';
      const dn  = displayName(a.name);
      const quedaBadge  = a.queda ? `<span class="rc-badge rc-badge-danger">⚡ QUEDA</span>` : '';
      const novoBadge   = a.novo  ? `<span class="rc-badge rc-badge-blue">✦ NOVO</span>`   : '';
      const alertInfo   = calcAlertLevel(a, refW);
      const alertBadge  = alertInfo ? `<span class="rc-badge" style="color:${alertInfo.color};border-color:${alertInfo.color}33">${alertInfo.icon} ${alertInfo.label}</span>` : '';
      const renewInfo   = calcRenewalScore(a, refW);
      const renewBadge  = (renewInfo && renewInfo.daysLeft <= 60 && renewInfo.daysLeft >= 0)
        ? `<span class="rc-badge" style="color:${renewInfo.color};border-color:${renewInfo.color}33">${renewInfo.label}</span>` : '';
      const badges = [quedaBadge,novoBadge,alertBadge,renewBadge].filter(Boolean).join('');
      return `<div class="risk-card ${cls}" onclick="openDrModal('${esc(a.name)}')">
        <div class="rc-name">${tit(a.gender)}. ${esc(dn)}</div>
        <div class="rc-sub">${espLabel(a)||a.turma||'—'}</div>
        ${badges ? `<div class="rc-badges">${badges}</div>` : ''}
        ${riskReason(a)}
        <div class="rc-score">${a.risk}% risco</div>
        ${a.phone?`<div class="rc-detail">${a.phone}</div>`:''}
      </div>`;
    }).join('') || '<div style="color:var(--sub);font-size:12px;padding:12px">Sem dados</div>';
  }
  renderRiskGrid('gestRiskMaster',   withScores.filter(a=>a.turma==='Master'||a.isWinners));
  renderRiskGrid('gestRiskMentoria', withScores.filter(a=>a.turma==='Mentoria'));

  // ── WINNERS SECTION ───────────────────────
  const winnersAlunos = allAlunos.filter(a=>a.isWinners);
  const gestWinnersSection = document.getElementById('gestWinnersSection');
  if (gestWinnersSection) {
    if (winnersAlunos.length > 0) {
      gestWinnersSection.style.display = 'block';
      renderEvolutionChart('chartWinners', calcEvolutionByTurmaTab('Winners Encontro', chartWeeks), 'var(--blue)', winnersAlunos.length);
      renderRiskGrid('gestRiskWinners', withScores.filter(a=>a.isWinners));
    } else {
      gestWinnersSection.style.display = 'none';
    }
  }

  // ── RENOVAÇÃO RANKING ─────────────────────────────────────
  const renovacaoCandidates = allAlunos
    .map(a => ({ ...a, renScore: calcRenewalScore(a, refW) }))
    .filter(a => a.renScore && a.renScore.daysLeft >= 0 && a.renScore.daysLeft <= 90)
    .sort((a, b) => a.renScore.daysLeft - b.renScore.daysLeft);

  const renovEl = document.getElementById('gestRenovacao');
  renovEl.innerHTML = renovacaoCandidates.length
    ? renovacaoCandidates.map(a => {
        const dn = displayName(a.name);
        const r = a.renScore;
        const cls = r.score >= 70 ? 'r-l' : r.score >= 45 ? 'r-m' : 'r-h';
        return `<div class="risk-card ${cls}" onclick="openDrModal('${esc(a.name)}', false)" style="min-width:190px;flex-shrink:0;">
          <div class="rc-name">${tit(a.gender)}. ${esc(dn)}</div>
          <div class="rc-sub">${a.turma}${espLabel(a)?' · '+espLabel(a):''}</div>
          <div style="margin:4px 0"><span style="font-size:11px;color:${r.color};font-weight:700">${r.label}</span></div>
          <div class="rc-score" style="color:${r.color}">${r.score}%</div>
          <div class="rc-detail">${r.daysLeft} dias restantes · Eng. ${calcCompositeScore(a,refW)}%</div>
        </div>`;
      }).join('')
    : '<div style="color:var(--sub);font-size:12px;padding:12px">Nenhum aluno na janela de renovação</div>';
  // Atualiza visibilidade dos botões
  document.getElementById('btnRenLeft').style.display  = renovacaoCandidates.length > 3 ? 'flex' : 'none';
  document.getElementById('btnRenRight').style.display = renovacaoCandidates.length > 3 ? 'flex' : 'none';

  // ── ASCENSÃO RANKING ──────────────────────────────────────
  const ascensaoCandidates = allAlunos
    .map(a => ({ ...a, ascScore: calcAscensaoScore(a, refW) }))
    .filter(a => a.ascScore !== null)
    .sort((a, b) => b.ascScore - a.ascScore)
    .slice(0, 6);

  document.getElementById('gestAscensao').innerHTML = ascensaoCandidates.length
    ? ascensaoCandidates.map(a => {
        const dn = displayName(a.name);
        const score = a.ascScore;
        const color = score >= 80 ? 'var(--safe)' : score >= 65 ? 'var(--warn)' : 'var(--sub)';
        const label = score >= 80 ? '⭐ Pronto para Master' : score >= 65 ? '📈 Em evolução' : '🔍 Monitorar';
        return `<div class="risk-card r-l" onclick="openDrModal('${esc(a.name)}', false)">
          <div class="rc-name">${tit(a.gender)}. ${esc(dn)}</div>
          <div class="rc-sub">${espLabel(a)||'Mentoria'}</div>
          <div style="margin:4px 0"><span style="font-size:11px;color:${color};font-weight:700">${label}</span></div>
          <div class="rc-score" style="color:${color}">${score}%</div>
          <div class="rc-detail">Eng. ${calcCompositeScore(a,refW)}%${a.phone?' · '+a.phone:''}</div>
        </div>`;
      }).join('')
    : '<div style="color:var(--sub);font-size:12px;padding:12px">Nenhum candidato identificado ainda</div>';

  // ── RESULTADO × ENGAJAMENTO ─────────────
  const parseF = v => v ? parseFloat(String(v).replace(/[^0-9.,]/g,'').replace(',','.')) : null;
  const fmtRk = v => {
    if (!v || v <= 0) return null;
    if (v >= 1000000) return 'R$ ' + (v/1000000).toFixed(1).replace('.0','') + 'M';
    if (v >= 1000)    return 'R$ ' + (v/1000).toFixed(0) + 'k';
    return 'R$ ' + v.toFixed(0);
  };
  const roiCandidates = allAlunos
    .map(a => {
      const ini = parseF(a.fatInicial);
      const atu = parseF(a.fatAtual);
      const delta = (ini && atu && ini > 0) ? Math.round(((atu - ini) / ini) * 100) : null;
      const eng = calcCompositeScore(a, refW);
      return { ...a, fatIni: ini, fatAtu: atu, delta, eng };
    })
    .filter(a => a.delta !== null)
    .sort((a,b) => b.delta - a.delta)
    .slice(0, 12);

  document.getElementById('gestROI').innerHTML = roiCandidates.length
    ? roiCandidates.map(a => {
        const dn = displayName(a.name);
        const color = a.delta >= 50 ? 'var(--safe)' : a.delta >= 0 ? 'var(--warn)' : 'var(--danger)';
        const engColor = a.eng >= 70 ? 'var(--safe)' : a.eng >= 40 ? 'var(--warn)' : 'var(--danger)';
        return `<div class="risk-card" onclick="openDrModal('${esc(a.name)}', false)">
          <div class="rc-name">${tit(a.gender)}. ${esc(dn)}</div>
          <div class="rc-sub">${a.turma}</div>
          <div class="rc-score" style="color:${color}">${a.delta >= 0 ? '+' : ''}${a.delta}%</div>
          <div class="rc-detail" style="margin-top:4px">
            ${fmtRk(a.fatIni) ? fmtRk(a.fatIni) + ' → ' + (fmtRk(a.fatAtu)||'—') : '—'}
          </div>
          <div class="rc-detail">Eng. <span style="color:${engColor}">${a.eng}%</span></div>
        </div>`;
      }).join('')
    : '<div style="color:var(--sub);font-size:12px;padding:12px">Nenhum dado de faturamento cadastrado</div>';

  // ── ANIVERSARIANTES ──────────────────────
  const hoje = new Date();
  const diaHoje = String(hoje.getDate()).padStart(2,'0');
  const mesHoje = String(hoje.getMonth()+1).padStart(2,'0');
  const aniversariantes = allAlunos.filter(a => {
    if (!a.birthday) return false;
    const m = a.birthday.match(/(\d{1,2})[\/-](\d{1,2})/);
    if (!m) return false;
    return m[1].padStart(2,'0') === diaHoje && m[2].padStart(2,'0') === mesHoje;
  });
  document.getElementById('gestAniversariantes').innerHTML = aniversariantes.length
    ? aniversariantes.map(a => {
        const dn = displayName(a.name);
        return `<div class="risk-card" onclick="openDrModal('${esc(a.name)}', false)" style="border-color:rgba(255,200,0,.3)">
          <div style="font-size:20px;margin-bottom:4px">🎂</div>
          <div class="rc-name">${tit(a.gender)}. ${esc(dn)}</div>
          <div class="rc-sub">${a.turma}${espLabel(a)?' · '+espLabel(a):''}</div>
          <div style="margin-top:8px;font-size:11px;color:var(--warn);font-weight:700">Parabéns! 🎉</div>
        </div>`;
      }).join('')
    : '<div style="color:var(--sub);font-size:12px;padding:12px">Nenhum aniversariante hoje</div>';

  // ── ESPECIALIDADES AGGREGATE ──────────────
  const espComActive = ESPECIALIDADES.filter(e=>allAlunos.some(a=>hasEsp(a, e)));
  document.getElementById('espGrid').innerHTML = espComActive.map(esp=>{
    const pool = allAlunos.filter(a=>hasEsp(a, esp));
    if (!pool.length) return '';
    const scores = pool.map(a=>calcCompositeScore(a,refW));
    const avg = Math.round(scores.reduce((s,v)=>s+v,0)/scores.length);
    const color = avg>=70?'var(--safe)':avg>=40?'var(--warn)':'var(--danger)';
    const alert = avg<60 ? '⚠' : '';
    return `<div class="wcard" style="${avg<60?'border-color:rgba(255,51,85,.3)':''}">
      <div class="wcard-title">${alert} ${esp}</div>
      <div style="font-family:'Inter',sans-serif;font-weight:800;font-size:48px;color:${color};line-height:1;margin:8px 0">${avg}%</div>
      <div style="font-size:11px;color:var(--sub)">${pool.length} alunos · score qualidade</div>
    </div>`;
  }).join('');

}

// Detect how many weeks have any data in the sheet for a given ciclo
function detectMaxWeekForCiclo(ciclo) {
  let max = 1;
  for (const tab of AULAS_GERAIS) {
    const s = getKvTab(tab, ciclo);
    for (const entry of Object.values(s)) {
      for (let w=4; w>=0; w--) {
        if (entry.history[w]&&entry.history[w].P) { if(w+1>max) max=w+1; break; }
      }
    }
  }
  return Math.min(max, 5);
}

// Backward compat
function detectMaxWeek() {
  return detectMaxWeekForCiclo(getCicloAtivo());
}

// Engagement for a single week index (0-based)
function calcEngagementWeek(aluno, weekIdx) {
  const tabs = aluno.isWinners ? ['Mentoria','Hotseat','Hotseat Simultâneo','Master','Winners Encontro'] : aluno.turma==='Master' ? ['Mentoria','Hotseat','Hotseat Simultâneo','Master'] : ['Mentoria','Hotseat','Hotseat Simultâneo'];
  if (aluno.especialidades && aluno.especialidades.length) {
    for (const esp of aluno.especialidades) {
      const spec = ESPECIALIDADES.find(e=>norm(e)===norm(esp));
      if (spec && !tabs.includes(spec)) tabs.push(spec);
    }
  }
  let total=0, attended=0;
  for (const tab of tabs) {
    const entry = getKvEntry(tab, norm(aluno.name));
    total++;
    if (entry&&entry.history[weekIdx]&&entry.history[weekIdx].P) attended++;
  }
  return total ? Math.round(attended/total*100) : 0;
}

// calcEvolutionByTurmaTab — evolução de presença por tab específica (ex: 'Winners Encontro')
function calcEvolutionByTurmaTab(tab, upToWeek) {
  const pool = getPool(tab);
  if (!pool.length) return [];
  const weeks = [];
  for (let w=0; w<upToWeek; w++) {
    let total=0, attended=0;
    for (const aluno of pool) {
      const entry = getKvEntry(tab, norm(aluno.name));
      total++;
      if (entry && entry.history[w] && entry.history[w].P) attended++;
    }
    if (total > 0) weeks.push({ w: w+1, pct: Math.round(attended/total*100), attended, total });
  }
  return weeks;
}

function renderEvolutionChart(elId, weeks, color, totalAlunos) {
  const el = document.getElementById(elId);
  if (!weeks.length) { el.innerHTML=`<div style="color:var(--sub);font-size:11px;padding:20px 0">Sem dados registrados</div>`; return; }
  // Filtra semanas sem dados reais (0% com 0 presentes)
  const realWeeks = weeks.filter(b => b.attended > 0 || b.pct > 0);
  if (!realWeeks.length) { el.innerHTML=`<div style="color:var(--sub);font-size:11px;padding:20px 0">Sem presenças registradas</div>`; return; }
  const META = 70; // linha de meta de presença
  const BAR_H = 80; // px máximo de barra
  const barHtml = realWeeks.map(b=>{
    const px = Math.max(Math.round(b.pct * BAR_H / 100), 3);
    const barColor = b.pct >= META ? color : b.pct >= 40 ? 'var(--warn)' : 'var(--danger)';
    return `<div class="chart-col">
      <div class="chart-bar-wrap">
        <div class="chart-bar" style="height:${px}px;background:${barColor}">
          <span class="chart-bar-val" style="color:${barColor}">${b.pct}%</span>
        </div>
      </div>
      <div class="chart-lbl">S${b.w}</div>
    </div>`;
  }).join('');
  el.innerHTML = `<div class="chart-with-axis" style="position:relative;width:100%">
    <div class="chart-yaxis">
      <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
    </div>
    <div class="chart-bars-inner" style="position:relative;flex:1">
      <div class="chart-meta-line" style="bottom:${META}%" title="Meta: ${META}%">
        <span class="chart-meta-label">meta ${META}%</span>
      </div>
      ${barHtml}
    </div>
  </div>
  <div class="chart-legend">
    <span class="chart-legend-dot" style="background:${color}"></span>
    <span>Presença acumulada · ${totalAlunos} alunos</span>
  </div>`;
}




// ═══════════════════════════════════════════
// ALUNO VIEW
// ═══════════════════════════════════════════
function renderAlunoView() {
  if (!loaded||!allAlunos.length) {
    document.getElementById('alunoContent').style.display='none';
    document.getElementById('alunoEmpty').style.display='block';
    return;
  }
  document.getElementById('alunoContent').style.display='block';
  document.getElementById('alunoEmpty').style.display='none';
  renderProfiles();
}
function renderProfiles() {
  const q=(document.getElementById('searchInput').value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const list=allAlunos.filter(a=>!q||norm(a.name).includes(q));
  const grid=document.getElementById('profileGrid');
  if (!list.length) { grid.innerHTML=`<div style="color:var(--sub);font-size:12px">Nenhum resultado.</div>`; return; }
  grid.innerHTML=list.slice(0,80).map(a=>{
    const eng=calcCompositeScore(a, detectMaxWeek());
    const color=eng<40?'var(--danger)':eng<70?'var(--warn)':'var(--safe)';
    const dn=displayName(a.name);
    return `<div class="profile-card" onclick="openDrModal('${esc(a.name)}', false)">
      <div class="pc-name">${tit(a.gender)}. ${esc(dn)}</div>
      <div class="pc-sub">${a.turma}${espLabel(a)?' · '+espLabel(a):''}</div>
      <div class="pc-bar"><div class="pc-bar-fill" style="width:${eng}%;background:${color}"></div></div>
      <div class="pc-pct" style="color:${color}">${eng}% engajamento</div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════
// DR MODAL — visão completa do mês
// ═══════════════════════════════════════════
function openDrModal(name, showMsgs=true) {
  const aluno = allAlunos.find(a=>a.name===name);
  if (!aluno) return;
  const g = aluno.gender, dn = displayName(name);

  // ── Abas que este aluno frequenta ────────
  const alunoTabs = aluno.isWinners
    ? ['Mentoria','Hotseat','Hotseat Simultâneo','Master','Winners Encontro']
    : aluno.turma==='Master'
    ? ['Mentoria','Hotseat','Hotseat Simultâneo','Master']
    : ['Mentoria','Hotseat','Hotseat Simultâneo'];
  if (aluno.especialidades && aluno.especialidades.length) {
    for (const esp of aluno.especialidades) {
      const spec = ESPECIALIDADES.find(e=>norm(e)===norm(esp));
      if (spec && !alunoTabs.includes(spec)) alunoTabs.push(spec);
    }
  }

  // ── Últimas 4 semanas do calendário (com ou sem dados) ──
  function getLastNWeekSlots(n) {
    const resultado = [];
    const hoje = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(hoje);
      d.setDate(d.getDate() - i * 7);
      const ciclo = d.toISOString().slice(0, 7);
      const dia = d.getDate();
      const semIdx = dia <= 7 ? 0 : dia <= 14 ? 1 : dia <= 21 ? 2 : dia <= 28 ? 3 : 4;
      resultado.unshift({ ciclo, w: semIdx });
    }
    return resultado;
  }
  const slots = getLastNWeekSlots(4);

  // ── Agrega dados por slot ──
  function getSlotData(ciclo, w) {
    let slots_=0, P=0, C=0, F=0, V=0, espSlots=0, espF=0;
    for (const tab of alunoTabs) {
      const entry = kvPresenca[tab]?.[ciclo]?.[norm(name)];
      const h = entry?.history?.[w] || null;
      slots_++;
      if (h) {
        if (h.P) P++;
        if (h.P && h.C) C++;
        if (h.P && h.F) F++;
        if (h.P && h.V) V++;
      }
      if (ESPECIALIDADES.includes(tab) || ESPECIALIDADES_LEGADO.includes(tab)) {
        espSlots++;
        if (h && h.P && h.F) espF++;
      }
    }
    return { slots: slots_, P, C, F, V, espSlots, espF };
  }

  const weekData = slots.map(s => getSlotData(s.ciclo, s.w));

  // Label de cada semana: "S3·Abr"
  const mesAbrev = ciclo => new Date(ciclo + '-15').toLocaleDateString('pt-BR', { month: 'short' }).replace('.','');
  const weekLabels = slots.map(s => `S${s.w+1}·${mesAbrev(s.ciclo)}`);

  // ── KPIs totais (todas as semanas) ──────
  const totalWeeks = weekData.length;
  let totSlots=0, totP=0, totC=0, totF=0, totV=0, totEspSlots=0, totEspF=0;
  for (const d of weekData) {
    totSlots   += d.slots;
    totP       += d.P;
    totC       += d.C;
    totF       += d.F;
    totV       += d.V;
    totEspSlots += d.espSlots;
    totEspF    += d.espF;
  }

  const presRate  = totSlots   ? Math.round(totP/totSlots*100)        : 0;
  const camRate   = totP       ? Math.round(totC/totP*100)            : 0;
  const vitRate   = totP       ? Math.round(totV/totP*100)            : 0;
  const fbRate    = totEspSlots ? Math.round(totEspF/totEspSlots*100) : null;

  // ── Score de engajamento composto ────────
  const pScore  = totSlots     ? totP/totSlots       : 0;
  const cScore  = totSlots     ? totC/totSlots       : 0;
  const vScore  = totSlots     ? totV/totSlots       : 0;
  const fScore  = totEspSlots  ? totEspF/totEspSlots : 1;
  const engScore = Math.round(pScore*40 + cScore*25 + vScore*25 + fScore*10);
  const engColor = engScore>=70?'var(--safe)':engScore>=40?'var(--warn)':'var(--danger)';

  // ── Tendência ──
  let trendLabel = '➡ Estável', trendColor = 'var(--sub)';
  if (totalWeeks >= 3) {
    const mid = Math.floor(totalWeeks/2);
    const firstHalf  = weekData.slice(0,mid);
    const secondHalf = weekData.slice(mid);
    const avg = arr => {
      const s = arr.reduce((a,d)=>a+(d.slots?d.P/d.slots:0),0);
      return arr.length ? s/arr.length : 0;
    };
    const diff = avg(secondHalf) - avg(firstHalf);
    if (diff > 0.15)       { trendLabel='📈 Subindo';  trendColor='var(--safe)'; }
    else if (diff < -0.15) { trendLabel='📉 Caindo';   trendColor='var(--danger)'; }
  }

  // ── Mini-grid de semanas com label de mês ──
  const dotRow = (label, color, vals) => `
    <div class="ph-row">
      <div class="ph-lbl">${label}</div>
      <div class="ph-dots">
        ${weekLabels.map((lbl, w) => {
          const on = vals[w];
          return `<div class="ph-dot ${on?'ph-dot-on':'ph-dot-off'}" style="${on?'background:'+color:''}" title="${lbl}">${lbl}</div>`;
        }).join('')}
        ${weekLabels.length === 0 ? `<div style="color:var(--sub);font-size:10px">Sem dados</div>` : ''}
      </div>
    </div>`;

  const pVals = weekData.map(d=>d.P>0);
  const cVals = weekData.map(d=>d.C>0);
  const vVals = weekData.map(d=>d.V>0);
  const fVals = weekData.map(d=>d.espSlots>0 && d.F>0);

  // ── Monta o modal ─────────────────────────
  document.getElementById('mName').textContent=`${tit(g)}. ${dn}`;
  // Monta label de turma — pode ter múltiplas (Master, Winners, especialidades)
  const turmasAluno = [];
  if (aluno.isWinners) { turmasAluno.push('Master'); turmasAluno.push('Winners'); }
  else { turmasAluno.push(aluno.turma); }
  const espLbl = espLabel(aluno);
  if (espLbl) turmasAluno.push(...espLbl.split(', '));
  const turmaTagsModal = turmasAluno.map(t => {
    if (t==='Master')   return `<span class="turma-m">${t}</span>`;
    if (t==='Mentoria') return `<span class="turma-t">${t}</span>`;
    if (t==='Winners')  return `<span class="turma-w">${t}</span>`;
    return `<span class="modal-esp-tag">${t}</span>`;
  }).join('');
  const phoneHtml = aluno.phone
    ? `<div class="modal-phone">${PHONE_ICON}${fmtPhone(aluno.phone)}</div>` : '';
  const entryHtml = aluno.entryDate
    ? `<span class="modal-entry">Entrou: ${aluno.entryDate}</span>` : '';
  document.getElementById('mMeta').innerHTML =
    `<div class="modal-meta-badges">${turmaTagsModal}${entryHtml}</div>${phoneHtml}`;

  // Substitui mHist por grid histórico
  document.getElementById('mHist').innerHTML=`
    <div class="ph-grid">
      ${dotRow('Presença','var(--safe)', pVals)}
      ${dotRow('Câmera','var(--warn)', cVals)}
      ${dotRow('Vitória','var(--blue)', vVals)}
      ${totEspSlots > 0 ? dotRow('Feedback','#9966FF', fVals) : ''}
    </div>`;

  // KPIs
  // Faturamento
  const fatIni = aluno.fatInicial ? parseFloat(String(aluno.fatInicial).replace(/[^0-9.,]/g,'').replace(',','.')) : null;
  const fatAtu = aluno.fatAtual   ? parseFloat(String(aluno.fatAtual).replace(/[^0-9.,]/g,'').replace(',','.'))   : null;
  const fatDelta = (fatIni && fatAtu && fatIni > 0) ? Math.round(((fatAtu - fatIni) / fatIni) * 100) : null;
  const fatDeltaR = (fatIni && fatAtu) ? fatAtu - fatIni : null;
  const fmtR = v => {
    if (v >= 1000000) return 'R$ ' + (v/1000000).toFixed(1).replace('.0','') + 'M';
    if (v >= 1000)    return 'R$ ' + (v/1000).toFixed(0) + 'k';
    return 'R$ ' + v.toFixed(0);
  };
  const fatColor = fatDelta === null ? 'var(--sub)' : fatDelta >= 0 ? 'var(--safe)' : 'var(--danger)';

  document.getElementById('mStats').innerHTML=`
    <div class="mstat">
      <div class="mstat-v" style="color:${engColor}">${engScore}%</div>
      <div class="mstat-l">Engajamento</div>
    </div>
    <div class="mstat">
      <div class="mstat-v" style="color:var(--safe)">${totP}/${totSlots}</div>
      <div class="mstat-l">Presenças</div>
    </div>
    <div class="mstat">
      <div class="mstat-v" style="color:var(--warn)">${camRate}%</div>
      <div class="mstat-l">Câmera</div>
    </div>
    <div class="mstat">
      <div class="mstat-v" style="color:var(--blue)">${vitRate}%</div>
      <div class="mstat-l">Vitórias</div>
    </div>
    ${fbRate!==null?`<div class="mstat"><div class="mstat-v" style="color:#9966FF">${fbRate}%</div><div class="mstat-l">Feedback</div></div>`:''}
    <div class="mstat">
      <div class="mstat-v" style="color:${trendColor};font-size:13px">${trendLabel}</div>
      <div class="mstat-l">Tendência</div>
    </div>
    ${fatIni ? `<div class="mstat"><div class="mstat-v" style="color:var(--sub);font-size:13px">${fmtR(fatIni)}</div><div class="mstat-l">Fat. inicial</div></div>` : ''}
    ${fatAtu ? `<div class="mstat"><div class="mstat-v" style="color:var(--sub);font-size:13px">${fmtR(fatAtu)}</div><div class="mstat-l">Fat. atual</div></div>` : ''}
    ${fatDelta !== null ? `<div class="mstat"><div class="mstat-v" style="color:${fatColor};font-size:13px">${fatDelta >= 0 ? '+' : ''}${fatDelta}%${fatDeltaR ? ' · ' + (fatDeltaR >= 0 ? '+' : '') + fmtR(fatDeltaR) : ''}</div><div class="mstat-l">Crescimento</div></div>` : ''}
    ${(()=>{ const g=kvGrupoScores[norm(aluno.name)]; if(!g||!g.msgs) return '<div class="mstat"><div class="mstat-v" style="color:var(--sub);font-size:13px">—</div><div class="mstat-l">Grupo</div></div>'; const icons=[g.resultado?'🏆'+g.resultado:'',g.ajuda?'🤝'+g.ajuda:'',g.duvida?'❓'+g.duvida:''].filter(Boolean).join(' '); return '<div class="mstat"><div class="mstat-v" style="color:var(--acc);font-size:13px">+'+g.total+'pts</div><div class="mstat-l">Grupo '+(icons||'💬'+g.msgs)+'</div></div>'; })()}`;

  // Seção IA — visível sempre que autenticado
  const aiSection = document.getElementById('mAISection');
  if (aiSection) {
    aiSection.style.display = csAuthenticated ? 'block' : 'none';
    // Limpa output anterior
    document.getElementById('aiOutput').style.display = 'none';
    document.getElementById('aiLoading').style.display = 'none';
  }
  // Guarda dados do aluno aberto para uso pelas funções de IA
  window._aiAlunoAtual = aluno;
  window._aiAlunoWeekData = weekData;
  window._aiAlunoTotalWeeks = totalWeeks;
  window._aiAlunoScore = engScore;
  window._aiAlunoTrend = trendLabel;

  // ── Calls com Especialistas ──────────────
  renderCallsSection(name);

  document.getElementById('drOv').classList.add('open');
}

// ── CALLS COM ESPECIALISTAS ──────────────────────────────
const ESPECIALISTAS = [
  { key: 'leonardo', nome: 'Leonardo Nunes', total: 12 },
  { key: 'bruno',    nome: 'Bruno Guimarães', total: 1  }
];

function getCallsData(normName) {
  // Lê do kvPresenca sob a chave especial 'calls'
  const callsKv = kvPresenca['__calls__'] || {};
  return callsKv[normName] || { leonardo: 0, bruno: 0 };
}

function renderCallsSection(name) {
  const section  = document.getElementById('mCallsSection');
  const content  = document.getElementById('mCallsContent');
  const normName = norm(name);
  const data     = getCallsData(normName);
  const canEdit  = csAuthenticated;

  section.style.display = 'block';
  content.innerHTML = ESPECIALISTAS.map(esp => {
    const used = data[esp.key] || 0;
    const pct  = Math.round(used / esp.total * 100);
    const barColor = used >= esp.total ? 'var(--danger)' : used > 0 ? 'var(--acc)' : 'var(--s3)';
    const canAdd = canEdit && used < esp.total;
    const canRemove = canEdit && used > 0;
    return `<div class="calls-row">
      <div class="calls-info">
        <div class="calls-name">${esp.nome}</div>
        <div class="calls-count">${used} de ${esp.total} call${esp.total>1?'s':''} ${used>=esp.total?'<span style="color:var(--danger)">· Esgotado</span>':''}</div>
      </div>
      <div class="calls-bar-wrap">
        <div class="calls-bar-track"><div class="calls-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
      </div>
      ${canEdit ? `
        <div style="display:flex;gap:6px">
          <button class="calls-btn" style="padding:5px 8px;font-size:12px" ${!canRemove?'disabled':''} onclick="registerCall('${normName}','${esp.key}',-1)">−</button>
          <button class="calls-btn" ${!canAdd?'disabled':''} onclick="registerCall('${normName}','${esp.key}',1)">+ Registrar</button>
        </div>` : `<div style="font-size:12px;font-weight:700;color:${barColor}">${pct}%</div>`}
    </div>`;
  }).join('');
}

async function registerCall(normName, espKey, delta) {
  const pwd = localStorage.getItem('am_cs_pwd');
  if (!pwd) return;

  // Atualiza local imediatamente
  if (!kvPresenca['__calls__']) kvPresenca['__calls__'] = {};
  if (!kvPresenca['__calls__'][normName]) kvPresenca['__calls__'][normName] = { leonardo: 0, bruno: 0 };
  const cur = kvPresenca['__calls__'][normName][espKey] || 0;
  const esp = ESPECIALISTAS.find(e => e.key === espKey);
  kvPresenca['__calls__'][normName][espKey] = Math.max(0, Math.min(esp.total, cur + delta));

  // Re-renderiza a seção
  const aluno = allAlunos.find(a => norm(a.name) === normName);
  if (aluno) renderCallsSection(aluno.name);

  // Salva no KV via Worker (reutiliza endpoint /presenca com tab='__calls__')
  try {
    await fetch(`${WORKER_BASE}/presenca`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json','X-CS-Password': pwd,'X-CS-Nome': localStorage.getItem('am_cs_nome')||csNomeAtual||'CS', 'X-CS-Email': localStorage.getItem('am_cs_email')||'' },
      body: JSON.stringify({
        tab: '__calls__',
        semana: 1,
        registros: { [normName]: kvPresenca['__calls__'][normName] }
      })
    });
  } catch(e) { console.error('Erro ao salvar call:', e); }
}

// ═══════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════
function buildMsgs({name,motivos,consAbs,tab,g}) {
  const fn=name.split(' ')[0], t=tit(g), s=sr_(g), f=foc(g);
  const msgs=[];
  if (consAbs>=4) { msgs.push({label:'🚨 4+ Ausências', text:msg4x(name,fn,t,s)}); }
  else if (motivos.includes('ausente')) {
    msgs.push({label:'❌ Ausente',  text:msgAus(name,fn,t,s,tab)});
    msgs.push({label:'⏱ +4h',      text:`- ${t}. ${fn}?`});
    msgs.push({label:'⏱ +2h',      text:`- ${t}. ${fn}, conseguiu ver minha mensagem?`});
    msgs.push({label:'📞 Ligação',  text:msgLig(name,fn,t,s,tab)});
  }
  if (motivos.includes('camera'))   msgs.push({label:'📷 Câmera',   text:msgCam(name,fn,t,s,f)});
  if (motivos.includes('feedback')) msgs.push({label:'💬 Feedback',  text:msgFb(name,fn,t,s)});
  if (motivos.includes('vitoria')&&!motivos.includes('ausente')) msgs.push({label:'🏆 Vitória', text:msgVit(name,fn,t)});
  if (!msgs.length) msgs.push({label:'💬 Contato', text:`Olá, ${t}. ${fn}! Tudo bem?\n\nPassando para verificar como está sendo seu aproveitamento na mentoria. Conta comigo para o que precisar!\n\nUm abraço!`});
  return msgs;
}
function msgAus(name,fn,t,s,tab){return `Olá, ${t}. ${name}! Tudo bem?\n\nPercebemos que ${s} não conseguiu estar presente ontem no encontro da ${tab}.\n\nImagino que a sua rotina pode estar intensa e, muitas vezes, imprevistos acontecem.\n\nMas queremos muito garantir que ${s} aproveite ao máximo tudo o que a mentoria pode gerar para a sua vida.\n\n- Este horário está inviável ${t}. ${fn}?\n- O que podemos fazer para te ajudar a priorizar este horário?\n\nEstamos juntos e queremos muito te ver crescer!\n\nUm abraço!`;}
function msgCam(name,fn,t,s,f){return `${t}. ${name}, tudo bem?\n\nFicamos felizes em ver você presente na mentoria!\n\nUm detalhe que sempre faz muita diferença é participar com a câmera aberta, porque isso:\n- aumenta muito a troca com o mentor e com o grupo.\n- te deixa mais ${f}.\n\nIncentivo ${s} a abrir a câmera nos próximos encontros — tenho certeza que vai tirar ainda mais proveito.\n\nConta de verdade comigo. Queremos muito te ver crescer.\n\nUm abracoooo ${t}. ${fn}!`;}
function msgFb(name,fn,t,s){return `Oláaaa ${t}. ${name}, tudo bem?\n\nPercebemos que ${s} participou da mentoria ontem, mas não deu feedback sobre como foi a sua semana.\n\nTe incentivamos ${t}. ${fn} a nas próximas vezes assim que entrar já "levantar a mão" virtual e falar sobre suas vitórias, avanços e dúvidas.\n\nDessa forma a mentoria se torna mais transformadora na sua vida.\n\n${t}. ${fn} acha que dá pra fazer mais isso?\n\nConta de verdade comigo. Queremos muito te ver crescer! 💪🏼\n\nUm abraçoooo ${t}. ${fn}!!!`;}
function msgVit(name,fn,t){return `Oláaaa ${t}. ${name}, tudo bem?\n\nQue bom ter você presente na mentoria!\n\nQueria te incentivar a compartilhar seus avanços e vitórias nas próximas aulas — não importa o tamanho, cada passo conta.\n\nIsso energiza o grupo inteiro e faz você perceber o quanto já evoluiu, ${t}. ${fn}.\n\nConta de verdade comigo. Queremos muito te ver crescer! 💪🏼`;}
function msg4x(name,fn,t,s){return `Oláaaa ${t}. ${name}, tudo bem?\n\nPercebemos que ${s} não conseguiu participar dos últimos 4 encontros da mentoria.\n\nImagino que a rotina médica pode ser bastante intensa e imprevistos acontecem.\n\nPorém, para manter o nível de engajamento e aproveitamento do grupo, temos uma política interna: mentorados que permanecem mais de 4 encontros consecutivos sem participação precisam de ajustes na agenda.\n\nNosso objetivo é garantir que todos que estejam no programa realmente aproveitem a mentoria.\n\nSempre que precisar de apoio para retomar sua participação, conte conosco.\n\nUm abraço ${t}. ${fn}!!`;}
function msgLig(name,fn,t,s,tab){return `[SCRIPT DE LIGAÇÃO — ${tab.toUpperCase()}]\n\n"Oláaaaaa ${t}. ${fn}! Aqui é a [Seu Nome], sua customer experience do Acelerador Médico.\n\nÉ algo rápido que tenho para falar com ${s}, tem 2 minutinhos disponível?\n\nEntão, percebi que ${t}. ${fn} não conseguiu participar na última ${tab} [informar dia e horário].\n\nTe incentivamos a entrar ${t}. ${fn} — um único insight de repente pode mudar seus resultados e sua vida, e nós queremos muito te ver crescer e ter retorno do seu investimento.\n\nNão só entrar, mas abrir a câmera, perguntar, pedir feedback semanal e tomar decisões ${t}. ${fn}. Isto é o que te faz estar sempre com a energia alta e produzindo, vendendo, captando mais.\n\nVamos melhorar esse aproveitamento ${t}. ${fn}? Posso contar com uma participação maior?\n\nPerfeito!! Excelente dia e conta de verdade comigo o tempo inteiro.\n\nUm abraço ${t}. ${fn}oooo!"`;}

// ═══════════════════════════════════════════
// MOBILE NAV — hamburger drawer
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// MOBILE FILTER SHEET
// ═══════════════════════════════════════════
const MF_LABELS = {
  todos:'Todos', ausente:'Ausentes', camera:'Sem câmera',
  feedback:'Sem feedback', vitoria:'Sem vitória', urgente:'Urgentes',
  queda:'Queda', renovacao:'Renovação', master:'Master'
};

function openMobileFilter() {
  const sheet = document.getElementById('csMfSheet');
  if (!sheet) return;
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Sync active state
  sheet.querySelectorAll('.cs-mf-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === csFilter);
  });
}

function closeMobileFilter() {
  const sheet = document.getElementById('csMfSheet');
  if (!sheet) return;
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function setMobileFilter(btn) {
  const f = btn.dataset.filter;
  // Trigger the matching hidden pill
  const pill = document.getElementById('pill-' + f);
  if (pill) pill.click();
  closeMobileFilter();
}

function syncMobileFilterUI(f) {
  const label = document.getElementById('csMfLabel');
  if (label) label.textContent = MF_LABELS[f] || 'Todos';
  // Update active class on sheet options
  document.querySelectorAll('.cs-mf-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === f);
  });
  // Update count
  const countEl = document.getElementById('csMfCount');
  if (countEl && typeof _csDoctors !== 'undefined') {
    const all = _csDoctors.filter(d => d.motivos.length > 0 || d.consAbs >= 4);
    let list;
    if      (f === 'todos')    list = all;
    else if (f === 'urgente')  list = all.filter(d => calcAlertLevel(d, currentWeek)?.icon === '🔴');
    else if (f === 'queda')    list = all.filter(d => isQuedaAcelerada(d, currentWeek));
    else if (f === 'renovacao') list = all.filter(d => { const r=calcRenewalScore(d,currentWeek); return r && r.daysLeft>=0 && r.daysLeft<=60; });
    else if (f === 'master')   list = all.filter(d => calcAscensaoScore(d, currentWeek) > 0);
    else                       list = all.filter(d => d.motivos.includes(f));
    countEl.textContent = list.length + ' resultado' + (list.length !== 1 ? 's' : '');
  }
}

function toggleMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  const btn    = document.getElementById('mobileHamburger');
  const isOpen = drawer.classList.contains('open');
  drawer.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  drawer.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
  document.body.style.overflow = isOpen ? '' : 'hidden';
}
function closeMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  const btn    = document.getElementById('mobileHamburger');
  drawer.classList.remove('open');
  btn.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════
function switchView(id,el) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-tab, .mobile-nav-item').forEach(t=>t.classList.remove('active'));
  document.getElementById('view-'+id).classList.add('active');
  if (el) el.classList.add('active');
  // Sync counterpart (desktop ↔ mobile)
  document.querySelectorAll(`[data-view="${id}"]`).forEach(btn=>btn.classList.add('active'));
  if (id==='gest'          && loaded) renderGest();
  if (id==='aluno'         && loaded) renderAlunoView();
  if (id==='chamada'       && loaded) initChamada();
  if (id==='acionamentos')           initAcionamentos();
}

// ── Chamada: seletor de ciclo ────────────────
function popularCicloSelectorChamada() {
  const sel = document.getElementById('chamadaCiclo');
  if (!sel) return;
  const ciclos = [];
  for (const tab of Object.keys(kvPresenca)) {
    if (tab === '__calls__' || tab === '__dates__') continue;
    for (const ciclo of Object.keys(kvPresenca[tab] || {})) {
      if (/^\d{4}-\d{2}$/.test(ciclo) && !ciclos.includes(ciclo)) ciclos.push(ciclo);
    }
  }
  ciclos.sort().reverse();
  const mesAtual = new Date().toISOString().slice(0,7);
  if (!ciclos.includes(mesAtual)) ciclos.unshift(mesAtual);
  sel.innerHTML = ciclos.map(c => {
    const label = new Date(c+'-15').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    return `<option value="${c}" ${c===mesAtual?'selected':''}>${label.charAt(0).toUpperCase()+label.slice(1)}</option>`;
  }).join('');
}

// ── CS: seletor de ciclo ────────────────────
function popularCicloSelectorCS() {
  const sel = document.getElementById('csCiclo');
  if (!sel) return;
  const ciclos = [];
  for (const tab of Object.keys(kvPresenca)) {
    if (tab === '__calls__' || tab === '__dates__') continue;
    for (const ciclo of Object.keys(kvPresenca[tab] || {})) {
      if (/^\d{4}-\d{2}$/.test(ciclo) && !ciclos.includes(ciclo)) ciclos.push(ciclo);
    }
  }
  ciclos.sort().reverse();
  const mesAtual = new Date().toISOString().slice(0,7);
  if (!ciclos.includes(mesAtual)) ciclos.unshift(mesAtual);
  sel.innerHTML = ciclos.map(c => {
    const label = new Date(c+'-15').toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    return `<option value="${c}" ${c===mesAtual?'selected':''}>${label.charAt(0).toUpperCase()+label.slice(1)}</option>`;
  }).join('');
}

function onCsCicloChange() {
  cicloAtivo = document.getElementById('csCiclo').value || new Date().toISOString().slice(0,7);
  csLoad();
}

function onChamadaCicloChange() {
  // Select oculto — sem ação visual necessária
  loadChamada();
}

// Verifica se a data selecionada é da semana atual e mostra/oculta aviso
function checkSemanaAtual() {
  const dateStr = document.getElementById('chamadaData')?.value;
  const aviso = document.getElementById('chamadaPassadaAviso');
  if (!aviso) return;
  if (!dateStr) { aviso.style.display='none'; return; }
  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0,10);
  const semanaHoje = dateToSemana(hojeStr);
  const cicloHoje = hojeStr.slice(0,7);
  const semanaData = dateToSemana(dateStr);
  const cicloData = dateStr.slice(0,7);
  const isSemanaAtual = (cicloData === cicloHoje && semanaData === semanaHoje);
  aviso.style.display = isSemanaAtual ? 'none' : 'block';
  window._chamadaSemanaAtual = isSemanaAtual;
}

// ═══════════════════════════════════════════
// CHAMADA — Registration
// ═══════════════════════════════════════════
const WORKER_BASE = WORKER_URL.replace('/dados','');
let csAuthenticated = false;
let csNomeAtual = 'Preview'; // nome do CS logado
let chamadaRegistros = {}; // normName → {P,C,F,V,name}

// ── LOGIN OVERLAY ────────────────────────────────────────────
function toggleOverlayCadastro(show) {
  document.getElementById('loginForm2').style.display    = show ? 'none'  : 'block';
  document.getElementById('cadastroForm2').style.display = show ? 'block' : 'none';
  document.getElementById('resetSenhaForm2').style.display = 'none';
  document.getElementById('loginErr2').style.display     = 'none';
  document.getElementById('cadErr2').style.display       = 'none';
}

function toggleOverlayReset(show) {
  document.getElementById('loginForm2').style.display      = show ? 'none'  : 'block';
  document.getElementById('cadastroForm2').style.display   = 'none';
  document.getElementById('resetSenhaForm2').style.display = show ? 'block' : 'none';
  document.getElementById('loginErr2').style.display       = 'none';
  if (document.getElementById('resetErr2')) document.getElementById('resetErr2').style.display = 'none';
}

async function doResetSenha() {
  const email         = document.getElementById('resetEmail2').value.trim();
  const novaSenha     = document.getElementById('resetNovaSenha2').value.trim();
  const codigoConvite = document.getElementById('resetCodigo2').value.trim();
  const errEl         = document.getElementById('resetErr2');
  if (!email || !novaSenha || !codigoConvite) {
    errEl.textContent = 'Preencha todos os campos.'; errEl.style.display = 'block'; return;
  }
  const res = await fetch(WORKER_BASE + '/auth/reset-senha', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, novaSenha, codigoConvite })
  }).catch(() => null);
  if (!res) { errEl.textContent = 'Erro de conexão.'; errEl.style.display = 'block'; return; }
  const data = await res.json();
  if (res.ok && data.ok) {
    localStorage.setItem('am_cs_email', email);
    localStorage.setItem('am_cs_senha', novaSenha);
    localStorage.setItem('am_cs_pwd',   novaSenha);
    dismissOverlay(data.nome, email, data.funcao);
  } else {
    errEl.textContent = data.error || 'Erro ao redefinir senha.';
    errEl.style.display = 'block';
  }
}

function dismissOverlay(nome, email, funcao) {
  csAuthenticated = true;
  csNomeAtual = nome;
  localStorage.setItem('am_cs_nome',  nome);
  localStorage.setItem('am_cs_funcao', funcao);
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('chamadaLogin').style.display = 'none';
  document.getElementById('chamadaForm').style.display  = 'block';
  loadChamada();
}

function doLogin() {
  const email = document.getElementById('csLoginEmail2').value.trim();
  const senha = document.getElementById('csLoginPwdNew2').value.trim();
  const errEl = document.getElementById('loginErr2');
  if (!email || !senha) { errEl.textContent='Preencha e-mail e senha.'; errEl.style.display='block'; return; }
  fetch(WORKER_BASE+'/auth/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email, senha })
  }).then(async r=>{
    const data = await r.json();
    if (r.ok && data.ok) {
      localStorage.setItem('am_cs_email', email);
      localStorage.setItem('am_cs_senha', senha);
      localStorage.setItem('am_cs_pwd',   senha);
      dismissOverlay(data.nome, email, data.funcao);
    } else {
      errEl.textContent = data.error || 'E-mail ou senha incorretos.';
      errEl.style.display = 'block';
    }
  }).catch(()=>{ errEl.textContent='Erro de conexão.'; errEl.style.display='block'; });
}

async function doCadastro() {
  const nome          = document.getElementById('cadNome2').value.trim();
  const email         = document.getElementById('cadEmail2').value.trim();
  const funcao        = document.getElementById('cadFuncao2').value;
  const senha         = document.getElementById('cadSenha2').value.trim();
  const codigoConvite = document.getElementById('cadCodigo2').value.trim();
  const errEl         = document.getElementById('cadErr2');
  if (!nome||!email||!funcao||!senha||!codigoConvite) {
    errEl.textContent='Preencha todos os campos.'; errEl.style.display='block'; return;
  }
  const res = await fetch(WORKER_BASE+'/auth/cadastro', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ nome, email, funcao, senha, codigoConvite })
  }).catch(()=>null);
  if (!res) { errEl.textContent='Erro de conexão.'; errEl.style.display='block'; return; }
  const data = await res.json();
  if (res.ok && data.ok) {
    localStorage.setItem('am_cs_email', email);
    localStorage.setItem('am_cs_senha', senha);
    localStorage.setItem('am_cs_pwd',   senha);
    dismissOverlay(data.nome, email, data.funcao);
  } else {
    errEl.textContent = data.error || 'Erro ao criar conta.';
    errEl.style.display = 'block';
  }
}

// Legado — mantido para compatibilidade com aba Chamada
function csLogin() { doLogin(); }

function initChamada() {
  if (!loaded) return;
  const savedEmail = localStorage.getItem('am_cs_email');
  const savedSenha = localStorage.getItem('am_cs_senha');
  if (savedEmail && savedSenha && !csAuthenticated) {
    fetch(WORKER_BASE+'/auth/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email: savedEmail, senha: savedSenha })
    }).then(async r=>{
      if (r.ok) {
        const data = await r.json();
        if (data.ok) {
          csAuthenticated = true;
          csNomeAtual = data.nome;
          localStorage.setItem('am_cs_pwd', savedSenha);
          localStorage.setItem('am_cs_nome', data.nome);
          if(document.getElementById('loginOverlay')) document.getElementById('loginOverlay').style.display = 'none';
          document.getElementById('chamadaLogin').style.display='none';
          document.getElementById('chamadaForm').style.display='block';
          const dataEl = document.getElementById('chamadaData');
          if (!dataEl.value) dataEl.value = new Date().toISOString().slice(0,10);
          popularCicloSelectorChamada();
          atualizarSemanaBadge();
          checkSemanaAtual();
          loadChamada();
        }
      }
    }).catch(()=>{});
  }
  if (csAuthenticated) {
    document.getElementById('chamadaLogin').style.display='none';
    document.getElementById('chamadaForm').style.display='block';
    const dataEl = document.getElementById('chamadaData');
    if (!dataEl.value) dataEl.value = new Date().toISOString().slice(0,10);
    popularCicloSelectorChamada();
    atualizarSemanaBadge();
    checkSemanaAtual();
    loadChamada();
  }
}


// Calcula semana do mês com base no dia: 1-7=s1, 8-14=s2, 15-21=s3, 22-28=s4, 29+=s5
function dateToSemana(dateStr) {
  if (!dateStr) return 1;
  const day = new Date(dateStr + 'T12:00:00').getDate();
  if (day <= 7)  return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  if (day <= 28) return 4;
  return 5;
}

function semanaLabel(dateStr) {
  const s = dateToSemana(dateStr);
  const day = dateStr ? new Date(dateStr + 'T12:00:00').getDate() : null;
  return `Semana ${s}${day ? ' (dia ' + day + ')' : ''}`;
}

function atualizarSemanaBadge() {
  const date = document.getElementById('chamadaData')?.value;
  const badge = document.getElementById('semanaBadge');
  if (!badge) return;
  if (!date) { badge.textContent = ''; return; }
  badge.textContent = `S${dateToSemana(date)}`;
}

async function loadChamada() {
  if (!csAuthenticated||!loaded) return;
  const tab  = document.getElementById('chamadaTab').value;
  const date = document.getElementById('chamadaData').value || new Date().toISOString().slice(0,10);
  const semana = dateToSemana(date);

  // Limpa busca ao trocar aula/data
  const busca = document.getElementById('chamadaBusca');
  if (busca) busca.value = '';

  // Load existing KV data for this tab/semana/ciclo
  const ciclo = date.slice(0, 7); // AAAA-MM
  const res = await fetch(`${WORKER_BASE}/presenca?tab=${encodeURIComponent(tab)}&semana=${semana}&ciclo=${ciclo}`);
  const existing = res.ok ? await res.json() : {};
  chamadaRegistros = {};

  // Set date default to today if not set
  const todayStr = new Date().toISOString().slice(0,10);
  if (!document.getElementById('chamadaData').value) {
    document.getElementById('chamadaData').value = existing.__date__ || todayStr;
  }

  // Build pool
  const pool = getChamadaPool(tab);

  // Merge existing into registros
  pool.forEach(aluno => {
    const key = norm(aluno.name);
    chamadaRegistros[key] = existing[key] || {P:false,C:false,F:false,V:false,name:aluno.name};
  });

  renderChamadaTable(pool);
  updateChamadaStats(pool);
}

function getChamadaPool(tab) {
  if (tab==='Mentoria' || tab==='Hotseat' || tab==='Hotseat Simultâneo')
    return allAlunos;
  if (tab==='Master')
    return allAlunos.filter(a=>a.turma==='Master' || a.isWinners);
  if (tab==='Winners Encontro')
    return allAlunos.filter(a=>a.isWinners);
  if (ESPECIALIDADES.includes(tab)||ESPECIALIDADES_LEGADO.includes(tab))
    return allAlunos.filter(a=>hasEsp(a, tab));
  return allAlunos;
}

function renderChamadaTable(pool) {
  const tab = document.getElementById('chamadaTab').value;
  const isEsp = ESPECIALIDADES.includes(tab)||ESPECIALIDADES_LEGADO.includes(tab);
  const isSoP = tab === 'Hotseat Simultâneo'; // só P visível
  const tbody = document.getElementById('chamadaTbody');
  tbody.innerHTML = pool.map(aluno=>{
    const key = norm(aluno.name);
    const r = chamadaRegistros[key]||{P:false,C:false,F:false,V:false};
    const dn = displayName(aluno.name);
    const dash = '<td style="color:var(--sub);text-align:center;font-size:10px">—</td>';
    return `<tr class="chamada-row${r.P?' presente':''}" id="crow-${escId(key)}">
      <td><div class="dr-name">${tit(aluno.gender)}. ${esc(dn)}</div>${espLabel(aluno)?`<div class="dr-sub">${espLabel(aluno)}</div>`:''}</td>
      <td><button class="pcfv-btn${r.P?' on-P':''}" data-field="P" onclick="togglePCFV('${escId(key)}','P')" title="Presente">P</button></td>
      ${isSoP ? dash : `<td><button class="pcfv-btn${r.C?' on-C':''}" data-field="C" onclick="togglePCFV('${escId(key)}','C')" title="Câmera">C</button></td>`}
      ${isSoP ? dash : (isEsp||tab==='Winners Encontro'?`<td><button class="pcfv-btn${r.F?' on-F':''}" data-field="F" onclick="togglePCFV('${escId(key)}','F')" title="Feedback">F</button></td>`:dash)}
      ${isSoP ? dash : `<td><button class="pcfv-btn${r.V?' on-V':''}" data-field="V" onclick="togglePCFV('${escId(key)}','V')" title="Vitória">V</button></td>`}
    </tr>`;
  }).join('');
}

function togglePCFV(keyId, field) {
  const key = decodeURIComponent(keyId.replace(/__/g,'%'));
  if (!chamadaRegistros[key]) return;
  // Não permite marcar C/F/V sem P
  if (field !== 'P' && !chamadaRegistros[key].P) return;
  chamadaRegistros[key][field] = !chamadaRegistros[key][field];
  // Se desmarca P, limpa C/F/V
  if (field==='P' && !chamadaRegistros[key].P) {
    chamadaRegistros[key].C = false;
    chamadaRegistros[key].F = false;
    chamadaRegistros[key].V = false;
  }
  // Re-render just this row
  const r = chamadaRegistros[key];
  const row = document.getElementById('crow-'+keyId);
  if (!row) return;
  row.className = 'chamada-row'+(r.P?' presente':'');
  row.querySelectorAll('.pcfv-btn').forEach(btn => {
    const f = btn.dataset.field;
    if (f) btn.classList.toggle('on-'+f, !!r[f]);
  });
  updateChamadaStats(getChamadaPool(document.getElementById('chamadaTab').value));
}

function updateChamadaStats(pool) {
  const isEsp = ESPECIALIDADES.includes(document.getElementById('chamadaTab').value);
  const total   = pool.length;
  const present = Object.values(chamadaRegistros).filter(r=>r.P).length;
  const absent  = total - present;
  const comCam  = Object.values(chamadaRegistros).filter(r=>r.P&&r.C).length;
  const comVit  = Object.values(chamadaRegistros).filter(r=>r.P&&r.V).length;
  const comFb   = isEsp ? Object.values(chamadaRegistros).filter(r=>r.P&&r.F).length : null;

  document.getElementById('chamadaStats').innerHTML = `
    <div class="stat-card sc-acc" style="padding:10px 16px;min-width:90px"><div class="stat-num" style="font-size:28px">${total}</div><div class="stat-lbl">Total</div></div>
    <div class="stat-card sc-grn" style="padding:10px 16px;min-width:90px"><div class="stat-num" style="font-size:28px;color:var(--safe)">${present}</div><div class="stat-lbl">Presentes</div></div>
    <div class="stat-card sc-red" style="padding:10px 16px;min-width:90px"><div class="stat-num" style="font-size:28px;color:var(--danger)">${absent}</div><div class="stat-lbl">Ausentes</div></div>
    <div class="stat-card sc-org" style="padding:10px 16px;min-width:90px"><div class="stat-num" style="font-size:28px;color:var(--warn)">${comCam}</div><div class="stat-lbl">Com câmera</div></div>
    ${isEsp ? `<div class="stat-card sc-pur" style="padding:10px 16px;min-width:90px"><div class="stat-num" style="font-size:28px;color:#9966FF">${comFb}</div><div class="stat-lbl">Com feedback</div></div>` : ''}
    <div class="stat-card sc-blu" style="padding:10px 16px;min-width:90px"><div class="stat-num" style="font-size:28px;color:var(--blue)">${comVit}</div><div class="stat-lbl">Com vitória</div></div>`;
}

async function salvarChamada() {
  const tab    = document.getElementById('chamadaTab').value;
  const date   = document.getElementById('chamadaData').value || new Date().toISOString().slice(0,10);
  const semana = dateToSemana(date);
  const pwd    = localStorage.getItem('am_cs_pwd')||'';
  const msg    = document.getElementById('chamadaSaveMsg');

  // Confirmação antes de salvar
  const dataFmt = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR');
  const ok = confirm(`Confirmar salvamento:\n\nAula: ${tab}\nData: ${dataFmt}\nSemana: ${semana}\n\nEstá correto?`);
  if (!ok) return;

  const nome = localStorage.getItem('am_cs_nome') || csNomeAtual || 'CS';

  let res;
  try {
    res = await fetch(WORKER_BASE+'/presenca', {
      method: 'POST',
      headers: {'Content-Type':'application/json','X-CS-Password': pwd, 'X-CS-Nome': nome, 'X-CS-Email': localStorage.getItem('am_cs_email')||''},
      body: JSON.stringify({tab, semana, date, registros: chamadaRegistros})
    });
  } catch(e) {
    msg.style.display='block';
    msg.style.background='rgba(255,51,85,.1)';
    msg.style.color='var(--danger)';
    msg.style.border='1px solid rgba(255,51,85,.3)';
    msg.textContent='Erro de conexão: ' + e.message;
    setTimeout(()=>msg.style.display='none', 5000);
    return;
  }

  msg.style.display='block';
  if (res.ok) {
    const data = await res.json();
    msg.style.background='rgba(0,232,122,.1)';
    msg.style.color='var(--safe)';
    msg.style.border='1px solid rgba(0,232,122,.3)';
    msg.textContent=`✓ Chamada salva! ${data.total} alunos registrados para ${tab} · Semana ${semana} · ${dataFmt}`;
    reloadAll();
  } else {
    let errMsg = 'Erro ao salvar.';
    try { const d = await res.json(); errMsg = d.error || errMsg; } catch {}
    msg.style.background='rgba(255,51,85,.1)';
    msg.style.color='var(--danger)';
    msg.style.border='1px solid rgba(255,51,85,.3)';
    msg.textContent=`✗ ${errMsg} (HTTP ${res.status})`;
  }
  setTimeout(()=>msg.style.display='none', 5000);
}

// Safe ID encoding for norm names (may contain special chars)
function escId(s) { return encodeURIComponent(s).replace(/%/g,'__'); }

function filtrarChamada() {
  const q = norm(document.getElementById('chamadaBusca').value);
  const rows = document.querySelectorAll('#chamadaTbody tr.chamada-row');
  rows.forEach(row => {
    const name = norm(row.querySelector('.dr-name')?.textContent || '');
    row.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
}

// ═══════════════════════════════════════════
// IA — funções de frontend
// ═══════════════════════════════════════════
let _aiLoadingInterval = null;

function aiLoadingStart() {
  document.getElementById('aiLoading').style.display = 'block';
  document.getElementById('aiOutput').style.display = 'none';
  let dots = 0;
  const labels = ['🤖 Gerando análise', '🤖 Gerando análise.', '🤖 Gerando análise..', '🤖 Gerando análise...'];
  _aiLoadingInterval = setInterval(() => {
    dots = (dots + 1) % labels.length;
    const el = document.getElementById('aiLoadingDots');
    if (el) el.textContent = labels[dots];
  }, 400);
}

function aiLoadingStop() {
  clearInterval(_aiLoadingInterval);
  document.getElementById('aiLoading').style.display = 'none';
}

function aiShowOutput(texto) {
  document.getElementById('aiOutputText').value = texto;
  document.getElementById('aiOutput').style.display = 'block';
  document.getElementById('aiEnvioStatus').style.display = 'none';
  // Aviso de número
  const aluno = window._aiAlunoAtual;
  const phone = (aluno?.phone || '').replace(/\D/g,'');
  const phoneValido = phone.length >= 10;
  const warn = document.getElementById('aiPhoneWarn');
  if (warn) warn.style.display = phoneValido ? 'none' : 'block';
  // Texto do botão
  const btnEnviar = document.getElementById('btnEnviarWpp');
  if (btnEnviar) {
    btnEnviar.textContent = phoneValido ? '📤 ENVIAR WHATSAPP' : '📋 REGISTRAR (sem número)';
    btnEnviar.style.background = phoneValido ? 'var(--safe)' : 'var(--warn)';
  }
}

function copyAI() {
  const texto = document.getElementById('aiOutputText').value;
  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.querySelector('#aiOutput button');
    if (btn) { btn.textContent = '✓ COPIADO'; setTimeout(() => btn.textContent = '📋 COPIAR', 2000); }
  });
}

async function enviarAcionamento(forcar = false) {
  const aluno    = window._aiAlunoAtual;
  const mensagem = document.getElementById('aiOutputText').value.trim();
  if (!aluno || !mensagem) return;

  const pwd  = localStorage.getItem('am_cs_pwd') || '';
  const nome = localStorage.getItem('am_cs_nome') || csNomeAtual || 'CS';
  const motivos = (_csDoctors.find(x => x.name === aluno.name)?.motivos || []);
  const phone = (aluno.phone || '').replace(/\D/g,'');
  const phoneValido = phone.length >= 10;

  const statusEl = document.getElementById('aiEnvioStatus');
  const btnEnviar = document.getElementById('btnEnviarWpp');
  btnEnviar.disabled = true;
  btnEnviar.textContent = '⏳ Enviando...';
  statusEl.style.display = 'none';

  try {
    const res = await fetch(WORKER_BASE + '/ai/enviar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CS-Password': pwd,
        'X-CS-Nome': nome,
        'X-CS-Email': localStorage.getItem('am_cs_email')||''
      },
      body: JSON.stringify({
        alunoNome:  aluno.name,
        alunoPhone: phone,
        mensagem,
        motivos,
        forcar
      })
    });
    const data = await res.json();

    // Aluno já foi acionado recentemente — pede confirmação
    if (data.acionamentoRecente && !forcar) {
      btnEnviar.disabled = false;
      btnEnviar.textContent = phoneValido ? '📤 ENVIAR WHATSAPP' : '📋 REGISTRAR (sem número)';
      const mins = Math.round(data.minutosDesdeUltimo);
      const tempoStr = mins < 60 ? mins + ' minutos' : mins < 1440 ? Math.round(mins/60) + ' horas' : Math.round(mins/1440) + ' dias';
      const conf = confirm(`⚠️ ${displayName(aluno.name)} já foi acionado(a) há ${tempoStr}.\n\nQuer enviar novamente?`);
      if (conf) enviarAcionamento(true);
      return;
    }

    statusEl.style.display = 'block';
    if (data.enviadoWhatsapp) {
      statusEl.style.background = 'rgba(0,232,122,.1)';
      statusEl.style.color = 'var(--safe)';
      statusEl.style.border = '1px solid rgba(0,232,122,.3)';
      const hora = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
      statusEl.textContent = '✓ Enviado para ' + tit(aluno.gender) + '. ' + displayName(aluno.name) + ' · ' + hora;
    } else if (data.ok) {
      statusEl.style.background = 'rgba(255,149,0,.1)';
      statusEl.style.color = 'var(--warn)';
      statusEl.style.border = '1px solid rgba(255,149,0,.3)';
      statusEl.textContent = phoneValido
        ? '⚠️ Registrado, mas houve erro no WhatsApp: ' + (data.zapiError || 'erro desconhecido')
        : '📋 Registrado como acionamento manual (sem número).';
    } else {
      throw new Error(data.error || 'Erro desconhecido');
    }
    // Reabilita botão após sucesso
    btnEnviar.disabled = false;
    btnEnviar.textContent = '✓ Concluído';
    setTimeout(() => {
      btnEnviar.textContent = phoneValido ? '📤 ENVIAR WHATSAPP' : '📋 REGISTRAR (sem número)';
    }, 3000);
  } catch(e) {
    statusEl.style.display = 'block';
    statusEl.style.background = 'rgba(255,51,85,.1)';
    statusEl.style.color = 'var(--danger)';
    statusEl.style.border = '1px solid rgba(255,51,85,.3)';
    statusEl.textContent = '✗ Erro: ' + e.message;
    btnEnviar.disabled = false;
    btnEnviar.textContent = phoneValido ? '📤 ENVIAR WHATSAPP' : '📋 REGISTRAR (sem número)';
  }
}

function buildAlunoPayload() {
  const aluno = window._aiAlunoAtual;
  if (!aluno) return null;
  const weekData = window._aiAlunoWeekData || [];
  const totalWeeks = window._aiAlunoTotalWeeks || 1;

  const totSlots = weekData.slice(0, totalWeeks).reduce((s, d) => s + d.slots, 0);
  const totP     = weekData.slice(0, totalWeeks).reduce((s, d) => s + d.P, 0);
  const totC     = weekData.slice(0, totalWeeks).reduce((s, d) => s + d.C, 0);
  const totV     = weekData.slice(0, totalWeeks).reduce((s, d) => s + d.V, 0);
  const camera   = totP ? Math.round(totC / totP * 100) : 0;
  const vitorias = totP ? Math.round(totV / totP * 100) : 0;

  // Faltas consecutivas
  let faltasConsecutivas = 0;
  for (let i = totalWeeks - 1; i >= 0; i--) {
    if (!weekData[i]?.P) faltasConsecutivas++;
    else break;
  }

  // Dias restantes
  let diasRestantes = null;
  if (aluno.cycleEnd) {
    diasRestantes = Math.round((new Date(aluno.cycleEnd) - Date.now()) / (1000 * 60 * 60 * 24));
  }

  // Faturamento formatado
  const fmtFat = v => {
    if (!v) return null;
    const n = parseFloat(String(v).replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (!n) return null;
    if (n >= 1000000) return 'R$ ' + (n/1000000).toFixed(1).replace('.0','') + 'M';
    if (n >= 1000)    return 'R$ ' + (n/1000).toFixed(0) + 'k';
    return 'R$ ' + n.toFixed(0);
  };

  const firstName = aluno.name.split(' ')[0];
  const tratamento = aluno.gender === 'F' ? 'Dra.' : 'Dr.';

  return {
    nome: aluno.name,
    firstName,
    tratamento,
    turma: aluno.turma,
    score: window._aiAlunoScore || 0,
    presencas: totP,
    totalSlots: totSlots,
    camera,
    vitorias,
    faltasConsecutivas,
    tendencia: window._aiAlunoTrend || '—',
    diasRestantes,
    fatInicial: fmtFat(aluno.fatInicial),
    fatAtual:   fmtFat(aluno.fatAtual),
    novo: isNovo(aluno),
    motivos: (_csDoctors.find(x => x.name === aluno.name)?.motivos || [])
  };
}

async function gerarDiagnostico() {
  const payload = buildAlunoPayload();
  if (!payload) return;
  const pwd  = localStorage.getItem('am_cs_pwd')  || '';
  const nome = localStorage.getItem('am_cs_nome') || '';

  aiLoadingStart();
  try {
    const res = await fetch(WORKER_BASE + '/ai/diagnostico', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CS-Password': pwd, 'X-CS-Nome': nome, 'X-CS-Email': localStorage.getItem('am_cs_email')||'' },
      body: JSON.stringify({ aluno: payload })
    });
    const data = await res.json();
    aiLoadingStop();
    if (data.ok) {
      aiShowOutput(data.texto);
    } else {
      aiShowOutput('Erro: ' + (data.error || 'Falha ao gerar diagnóstico'));
    }
  } catch(e) {
    aiLoadingStop();
    aiShowOutput('Erro de conexão: ' + e.message);
  }
}

async function gerarAcionamentoIA() {
  const payload = buildAlunoPayload();
  if (!payload) return;
  const pwd  = localStorage.getItem('am_cs_pwd')  || '';
  const nome = localStorage.getItem('am_cs_nome') || '';

  aiLoadingStart();
  try {
    const res = await fetch(WORKER_BASE + '/ai/acionamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CS-Password': pwd, 'X-CS-Nome': nome, 'X-CS-Email': localStorage.getItem('am_cs_email')||'' },
      body: JSON.stringify({ aluno: payload })
    });
    const data = await res.json();
    aiLoadingStop();
    if (data.ok) {
      aiShowOutput(data.texto);
    } else {
      aiShowOutput('Erro: ' + (data.error || 'Falha ao gerar mensagem'));
    }
  } catch(e) {
    aiLoadingStop();
    aiShowOutput('Erro de conexão: ' + e.message);
  }
}

// ═══════════════════════════════════════════
// ACIONAMENTOS — Histórico
// ═══════════════════════════════════════════
function initAcionamentos() {
  const pwd = localStorage.getItem('am_cs_pwd');
  const loginDiv = document.getElementById('acLogin');
  if (!pwd) {
    if (loginDiv) loginDiv.style.display = 'block';
    return;
  }
  if (loginDiv) loginDiv.style.display = 'none';
  // Preenche datas padrão: hoje e 7 dias atrás
  const hoje = new Date().toISOString().slice(0,10);
  const seteDias = new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0,10);
  const deEl = document.getElementById('acDeData');
  const ateEl = document.getElementById('acAteData');
  if (deEl && !deEl.value) deEl.value = seteDias;
  if (ateEl && !ateEl.value) ateEl.value = hoje;
  carregarAcionamentos();
}

async function carregarAcionamentos() {
  const pwd = localStorage.getItem('am_cs_pwd');
  if (!pwd) return;
  const de  = document.getElementById('acDeData')?.value || new Date(Date.now()-7*24*60*60*1000).toISOString().slice(0,10);
  const ate = document.getElementById('acAteData')?.value || new Date().toISOString().slice(0,10);

  document.getElementById('acLoading').style.display = 'block';
  document.getElementById('acEmpty').style.display = 'none';
  document.getElementById('acTblWrap').style.display = 'none';
  document.getElementById('acStats').innerHTML = '';

  try {
    const res = await fetch(`${WORKER_BASE}/acionamentos?de=${de}&ate=${ate}`, {
      headers: { 'X-CS-Password': pwd, 'X-CS-Nome': localStorage.getItem('am_cs_nome')||csNomeAtual||'CS', 'X-CS-Email': localStorage.getItem('am_cs_email')||'' }
    });
    const data = await res.json();
    document.getElementById('acLoading').style.display = 'none';

    if (!data.ok || !data.registros?.length) {
      document.getElementById('acEmpty').style.display = 'block';
      return;
    }

    const registros = data.registros;

    // Stats por CS
    const porCS = {};
    for (const r of registros) {
      const n = r.csNome || 'CS';
      if (!porCS[n]) porCS[n] = { total: 0, wpp: 0, manual: 0 };
      porCS[n].total++;
      if (r.via === 'whatsapp') porCS[n].wpp++;
      else porCS[n].manual++;
    }

    // Renderiza stats
    const statColors = ['var(--acc)','var(--safe)','var(--blue)','var(--warn)','#9966FF'];
    let statsHtml = `<div class="stat-card sc-acc" style="padding:10px 16px;min-width:90px"><div class="stat-num" style="font-size:28px">${registros.length}</div><div class="stat-lbl">Total acionamentos</div></div>`;
    Object.entries(porCS).forEach(([nome, s], i) => {
      const cor = statColors[(i+1) % statColors.length];
      statsHtml += `<div class="stat-card" style="padding:10px 16px;min-width:90px;border-color:rgba(255,255,255,.08)">
        <div class="stat-num" style="font-size:24px;color:${cor}">${s.total}</div>
        <div class="stat-lbl">${nome}</div>
        <div style="font-size:10px;color:var(--sub);margin-top:2px">${s.wpp} WPP · ${s.manual} manual</div>
      </div>`;
    });
    document.getElementById('acStats').innerHTML = statsHtml;

    // Renderiza tabela
    const fmtHora = iso => {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    };
    const viaBadge = via => {
      if (via === 'whatsapp')       return '<span style="color:var(--safe);font-weight:700;font-size:10px">✓ WPP</span>';
      if (via === 'whatsapp-erro')  return '<span style="color:var(--warn);font-weight:700;font-size:10px">⚠️ WPP</span>';
      return '<span style="color:var(--sub);font-size:10px">📋 Manual</span>';
    };

    document.getElementById('acTbody').innerHTML = [...registros].reverse().map(r => {
      const motivos = (r.motivos||[]).map(m=>`<span class="b ${bCls(m)}">${bLbl(m)}</span>`).join('');
      const msgPreview = (r.mensagem||'').slice(0,80).replace(/\n/g,' ') + ((r.mensagem||'').length > 80 ? '…' : '');
      return `<tr>
        <td style="white-space:nowrap;font-size:11px;color:var(--sub)">${fmtHora(r.hora)}</td>
        <td><div style="font-weight:600;font-size:12px">${esc(r.alunoNome||'—')}</div></td>
        <td style="font-size:12px;color:var(--acc);font-weight:600">${esc(r.csNome||'CS')}</td>
        <td><div class="badges">${motivos||'<span style="color:var(--sub);font-size:10px">—</span>'}</div></td>
        <td>${viaBadge(r.via)}</td>
        <td style="font-size:11px;color:var(--sub);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(r.mensagem||'')}">${esc(msgPreview)||'—'}</td>
      </tr>`;
    }).join('');

    document.getElementById('acTblWrap').style.display = 'block';
  } catch(e) {
    document.getElementById('acLoading').style.display = 'none';
    document.getElementById('acEmpty').style.display = 'block';
    document.getElementById('acEmpty').textContent = 'Erro ao carregar: ' + e.message;
  }
}

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function norm(s){return(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();}
function fmtPhone(raw){
  var d=(raw||'').replace(/\D/g,'');
  if(!d)return'';
  if(d.startsWith('55')&&d.length>11)d=d.slice(2);
  if(d.length===11)return'('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);
  if(d.length===10)return'('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6);
  return d;
}
var PHONE_ICON='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.38 2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 16z"/></svg>';
function csvParse(text){const rows=[];for(const line of text.split('\n')){const cols=[];let cur='',inQ=false;for(let i=0;i<line.length;i++){if(line[i]==='"'){inQ=!inQ;}else if(line[i]===','&&!inQ){cols.push(cur.trim());cur='';}else cur+=line[i];}cols.push(cur.trim());rows.push(cols);}return rows;}
function clean(v){return(v||'').replace(/^"|"$/g,'').trim();}
function chk(v){const s=clean(v).toLowerCase();return['x','v','sim','1','true','✓','s'].includes(s);}
function esc(s){return(s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');}
function escHtml(t){return(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');}

// ═══════════════════════════════════════════
// BORDER GLOW — vanilla adaptation of BorderGlow (React Bits)
// Colored border shimmer tracks the cursor along each stat card edge
// ═══════════════════════════════════════════
(function() {
  function initBorderGlow() {
    document.querySelectorAll('.cs-stat-card').forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--bx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--by', (e.clientY - rect.top) + 'px');
      });
      card.addEventListener('mouseleave', function() {
        card.style.setProperty('--bx', '-400px');
        card.style.setProperty('--by', '-400px');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBorderGlow);
  } else {
    initBorderGlow();
  }
  window.initBorderGlow = initBorderGlow;
})();

// ═══════════════════════════════════════════
// SPOTLIGHT CARD — vanilla adaptation of SpotlightCard (React Bits)
// White spotlight follows cursor inside each card, fades in on hover
// ═══════════════════════════════════════════
(function() {
  function initSpotlight() {
    var cards = document.querySelectorAll('.card-spotlight');
    cards.forEach(function(card) {
      // Move spotlight to cursor position
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      });

      // Reset spotlight off-screen on leave so it doesn't flash on re-entry
      card.addEventListener('mouseleave', function() {
        card.style.setProperty('--mouse-x', '-200px');
        card.style.setProperty('--mouse-y', '-200px');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpotlight);
  } else {
    initSpotlight();
  }
  window.initSpotlight = initSpotlight;
})();

// ═══════════════════════════════════════════
// THEME TOGGLE — dark (default) / light
// ═══════════════════════════════════════════
(function() {
  function applyTheme(theme) {
    document.body.classList.toggle('light-theme', theme === 'light');
    document.getElementById('themeToggle')?.classList.toggle('light-mode', theme === 'light');
    // Update mobile dock icon (moon in dark, sun in light)
    var iconM = document.getElementById('themeIconM');
    if (iconM) {
      if (theme === 'light') {
        iconM.setAttribute('fill', 'none');
        iconM.setAttribute('stroke', 'currentColor');
        iconM.setAttribute('stroke-width', '2');
        iconM.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
      } else {
        iconM.setAttribute('fill', 'currentColor');
        iconM.removeAttribute('stroke');
        iconM.removeAttribute('stroke-width');
        iconM.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
      }
    }
    // Swap logo between white (dark) and dark (light) versions
    var logoEl = document.querySelector('.topbar-logo-img');
    if (logoEl) logoEl.src = theme === 'light' ? 'assets/icons/logo-preto.png' : 'assets/icons/logo.png';
    try { localStorage.setItem('am-theme', theme); } catch(e) {}
  }

  window.toggleTheme = function() {
    var isLight = document.body.classList.contains('light-theme');
    applyTheme(isLight ? 'dark' : 'light');
  };

  // Restore saved preference
  var saved = 'dark';
  try { saved = localStorage.getItem('am-theme') || 'dark'; } catch(e) {}
  if (saved === 'light') applyTheme('light');
})();

// ── Search: document-level fallback (always fires regardless of DOM timing) ──
document.addEventListener('input', function(e) {
  if (e.target && e.target.id === 'csSearch') {
    if (typeof csSearchTable === 'function') csSearchTable(e.target.value);
  }
});
