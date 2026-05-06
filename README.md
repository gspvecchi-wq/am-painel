# AM · Painel CS — Acelerador Médico

## Estrutura do Projeto

```
acelerador-cs/
├── index.html              ← App principal
├── worker.js               ← Cloudflare Worker (backend/proxy) — não mexa
├── README.md               ← Este arquivo
└── assets/
    ├── css/
    │   └── styles.css      ← Todo o CSS do projeto
    ├── js/
    │   └── app.js          ← Todo o JavaScript do projeto
    ├── icons/              ← Ícones SVG (adicione aqui)
    └── fonts/              ← Fontes locais se necessário
```

## Como editar

1. **Visual/Layout** → edite `assets/css/styles.css`
2. **Lógica/Dados** → edite `assets/js/app.js`
3. **Estrutura HTML** → edite `index.html`
4. **Backend/API** → edite `worker.js` (com cuidado)

## Como subir no GitHub → Cloudflare

1. Faça as alterações
2. Salve os arquivos
3. No terminal VS Code:
   ```bash
   git add .
   git commit -m "descrição da mudança"
   git push
   ```
4. O Cloudflare atualiza automaticamente em ~1 minuto

## Variáveis CSS (Design Tokens)

Todas as cores e espaçamentos estão em `assets/css/styles.css` no bloco `:root { }`.
Para mudar a identidade visual, altere apenas esse bloco.

```css
:root {
  --bg: #060608;        /* fundo principal */
  --acc: #FFD600;       /* amarelo Acelerador */
  --danger: #FF3355;    /* vermelho */
  --safe: #00E87A;      /* verde */
  --warn: #FF9500;      /* laranja */
  --blue: #4488FF;      /* azul */
}
```
