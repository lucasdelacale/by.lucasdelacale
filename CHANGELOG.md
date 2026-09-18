# Changelog

## v1.1

### Conteúdo

- Adicionada a página `/esculturas/`.
- Adicionado o tipo `referencia` para diferenciar referências de obras autorais.
- Adicionadas imagens complementares para outros ângulos e detalhes das obras.
- Séries passaram a permitir seleção das obras relacionadas pelo CMS.
- A home mistura obras, referências e textos em um feed aleatório, sem incluir séries.
- Na home, cards com imagens exibem somente tipo e ano; o título aparece na página individual.

### Publicação

- Adicionada integração com Pages CMS em `.pages.yml`.
- O CMS edita obras e séries diretamente no GitHub.
- Uploads são armazenados em `public/images/`.
- Cada publicação aciona automaticamente o GitHub Actions e o deploy no Pages.
- Criado o atalho `https://lucasdelacale.com/post/` para abrir o CMS.

### Interface

- Link do Instagram adicionado à página Sobre.
- Títulos das páginas individuais de obras tiveram a escala reduzida.
- Menu de contexto e arraste das imagens foram bloqueados como proteção contra cópias casuais.

### Operação

- A branch `main` é a versão publicada.
- A branch `v1` preserva o estado anterior à integração do CMS.
- A branch `feature/admin-cms` mantém o histórico de desenvolvimento do painel.
