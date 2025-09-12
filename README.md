Estuda AÍ — Pacote FINAL (comparável ao layout de referência)

Conteúdo do ZIP:
- index.html
- assets/
  - css/style.css
  - js/script.js
  - images/
    - logoicon.png        -> ícone (PNG transparente, 512x512 recomendado)
    - logotext.png       -> logo completo (PNG or SVG, recommended 600x200)
    - hero-illustration.png -> hero mockup/ilustração (1200x800 recommended)
    - favicon.ico        -> favicon (.ico)

Principais funcionalidades implementadas:
- Parallax leve no hero (mousemove + scroll)
- Ajuste de altura do parallax: `.parallax-bg` usa min-height para evitar corte
- Badge animado no plano destaque (pulse/glow)
- Sticky CTA (fechável) + floating CTA
- Depoimentos com estrelas ⭐⭐⭐⭐⭐ e autoplay
- FAQ interativo com perguntas divertidas e aria attributes
- A/B testing de CTAs (A/B salvo em localStorage, exposto em window.ESTUDA_VARIANT)
- SEO: title, meta description, OG/Twitter tags (ajuste og:image para seu domínio)
- FAQ schema (JSON-LD)
- Hooks (comentários) para GTM / Meta Pixel no head
- Smooth scroll e reveal animations via IntersectionObserver

Como usar:
1. Substitua as imagens em assets/images mantendo os **mesmos nomes**.
2. Ajuste a tag og:image no <head> para apontar ao seu domínio (substitua https://seudominio.com).
3. Abra index.html localmente para testar.
4. Faça deploy em Vercel/Netlify/S3 ou similar.

Se quiser, posso também:
- Gerar WebP/2x e atualizar <picture> para imagens responsivas.
- Inserir snippet do GTM/Meta Pixel se você me passar as IDs.
- Otimizar imagens e ajustar copy dos CTAs para rodar A/B controlado.

Obrigado! Boa sorte com a campanha 🚀
