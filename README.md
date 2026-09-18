# Acervo Criativo

Site estático em Astro para um acervo artístico pessoal. A home funciona como uma entrada editorial: exibe as publicações em um mosaico aleatório a cada carregamento. As séries, os prints e os canvas possuem páginas próprias; o `/acervo` apresenta todas as obras em uma visão de mosaico mais densa e documental.

O site não possui backend ou banco de dados próprio. O painel opcional usa Pages CMS, conecta-se ao GitHub e grava o conteúdo diretamente neste repositório.

## Stack

- Astro
- TypeScript
- Astro Content Collections
- Markdown/MDX
- CSS próprio, sem framework visual

## Rodar localmente

Instale as dependências uma vez:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

O site ficará disponível em `http://localhost:4321`.

O comando `npm run dev` limpa arquivos gerados anteriormente para evitar que páginas excluídas reapareçam por cache.

## Validação e build

Verifique tipos, schemas e arquivos Astro:

```bash
npm run check
```

Gere a versão estática para publicação:

```bash
npm run build
```

O build limpa automaticamente `dist`, `.astro` e o cache de conteúdo antes de gerar as páginas. A saída final fica em `dist/`.

Visualize a última build localmente:

```bash
npm run preview
```

## Estrutura principal

```text
public/images/       imagens locais publicadas
src/content/works/   obras e registros
src/content/series/  séries e projetos
src/content/texts/   ensaios e anotações
src/content/references/ referências de pesquisa
src/components/      componentes Astro reutilizáveis
src/pages/            rotas do site
src/styles/           tokens e estilos globais
src/utils/            funções compartilhadas de ordenação
templates/            modelos de conteúdo
```

## Publicar uma obra

Use `templates/obra.md` como ponto de partida. Copie-o para:

```text
src/content/works/nome-da-obra.md
```

O nome do arquivo vira o slug da URL. Por exemplo:

```text
src/content/works/prada-hash.md
```

gera:

```text
/acervo/prada-hash/
```

Para exibir uma obra nas páginas específicas, use `type: print`, `type: canvas` ou `type: escultura` no frontmatter. Use `type: referencia` para diferenciar imagens de pesquisa das obras autorais. As obras com `type: fotografia` continuam no Arquivo geral. O nome do arquivo ou o nome da imagem não define a categoria: a classificação vem do campo `type`.

Todos os campos do frontmatter são opcionais. Um arquivo mínimo válido é:

```md
---
coverImage: /images/prada-hash.jpeg
---

Texto opcional sobre a obra.
```

Quando não houver `title`, nenhum título será exibido. Quando não houver `type`, será usado `outro`. Quando não houver imagem, a interface exibirá um espaço reservado.

Use `publishedAt: YYYY-MM-DD` para definir a data de publicação. As listagens, exceto a home, mostram as entradas mais novas primeiro; quando esse campo não existir, a ordenação usa `date`, `year` ou `period` como fallback.

## Publicar Prints e Canvas

Prints e canvas usam o mesmo modelo de obra e a mesma página de detalhe do Arquivo. Para publicar um print:

1. Copie `templates/obra.md` para `src/content/works/nome-do-print.md`.
2. Defina `type: print` no frontmatter.
3. Adicione a imagem em `public/images/` e informe o caminho em `coverImage`.
4. Execute `npm run check` e faça o build.

O trabalho aparecerá em `/prints/` e também no `/acervo/` geral. Ao clicar na imagem, a página aberta será `/acervo/nome-do-print/`.

Para publicar um canvas, siga os mesmos passos usando `type: canvas`. A página `/canvas/` permanece vazia enquanto não houver uma obra com esse tipo.

Para publicar uma escultura, use `type: escultura`. Para cadastrar uma imagem de referência, use `type: referencia`; ela seguirá o mesmo modelo visual de uma fotografia, mas ficará identificada como referência.

Os registros atuais chamados `print-01` a `print-05` continuam classificados como `fotografia`; por isso, aparecem no Arquivo geral e não em `/prints/`.

## Publicar uma série

Use `templates/serie.md` e copie o arquivo para `src/content/series/nome-da-serie.md`. Toda série precisa de `coverImage` e `coverAlt`. Os slugs listados em `works`, `references` e `texts` fazem as relações da página.

As séries aparecem em `/series/`, em uma galeria clicável. Elas não são repetidas na home.

## Painel de publicação

O arquivo `.pages.yml` configura o Pages CMS para editar obras e séries pelo navegador. O painel usa o GitHub como fonte de conteúdo e as imagens continuam sendo salvas em `public/images/`.

Para acessar o painel:

1. Abra `https://app.pagescms.org/`.
2. Entre com a conta do GitHub que possui acesso ao repositório.
3. Autorize o Pages CMS no repositório `by.lucasdelacale`.
4. Selecione a branch `main` depois que a configuração for incorporada a ela.
5. Use as áreas `Obras` e `Séries` para criar ou editar conteúdo.

O formulário de obras inclui imagem principal, imagens complementares, tipo, materiais, dimensões, tags e relações com outras obras. O formulário de séries permite selecionar as obras que pertencem a cada série.

Cada salvamento gera um commit no GitHub e inicia automaticamente o workflow de publicação. O painel não cria um banco de dados separado.

## Imagens

Coloque as imagens em:

```text
public/images/
```

No frontmatter, use o caminho público, sem incluir `public`:

```yaml
coverImage: /images/prada-hash.jpeg
gallery:
  - /images/prada-hash-detalhe-01.jpg
  - /images/prada-hash-detalhe-02.jpg
```

O nome e a extensão precisam corresponder exatamente ao arquivo. `IMG_0185.JPG` é diferente de `img_0185.jpg` em servidores com diferenciação de maiúsculas e minúsculas.

Use imagens otimizadas e, sempre que possível, nomes simples sem espaços ou caracteres especiais.

As imagens são apresentadas sem bordas visuais. O mosaico controla o tamanho dos cards, enquanto títulos, tipos e anos ficam alinhados dentro da largura de cada imagem.

## Outros conteúdos

Os modelos disponíveis são:

- `templates/obra.md` para trabalhos autorais.
- `templates/quick.md` para um registro rápido de obra.
- `templates/serie.md` para séries e projetos.
- `templates/texto.md` para ensaios, diários e anotações.
- `templates/referencia.md` para artistas, livros, filmes, lugares e objetos de pesquisa.

As relações entre conteúdos usam os slugs dos arquivos:

```yaml
relatedWorks:
  - prada-hash
```

## Publicação

O site é gerado como HTML estático. Em um serviço conectado ao GitHub, o fluxo recomendado é:

1. Adicionar ou alterar o Markdown e as imagens.
2. Executar `npm run check` localmente.
3. Fazer commit e push para o repositório.
4. Configurar o serviço para executar `npm run build`.
5. Publicar a pasta `dist/` gerada.

### Comportamento das listagens

- A home embaralha somente as publicações no navegador a cada carregamento; a ordem das séries não é envolvida porque elas não aparecem na home.
- `/acervo/`, `/prints/`, `/canvas/`, `/series/`, `/textos/` e `/referencias/` usam ordenação da publicação mais nova para a mais antiga.
- A data principal é `publishedAt`. Sem ela, o site usa `date`, `year` ou `period` como fallback.
- Quando uma listagem não tem trabalhos, a mensagem exibida é `NENHUM TRABALHO PULICADO`.

O projeto pode ser hospedado em serviços como Netlify, Vercel ou GitHub Pages. A configuração específica do domínio fica em `astro.config.mjs`:

```js
site: 'https://seu-dominio.com'
```

### GitHub Pages

Este repositório já possui o workflow `.github/workflows/deploy.yml`. Ele instala as dependências, executa `npm run build`, publica `dist/` e faz o deploy no Pages.

No GitHub, abra `Settings > Pages` e selecione `GitHub Actions` em `Source`. Não selecione a publicação direta do branch, porque o repositório contém o código-fonte Astro e não a saída final em `dist/`.

O endereço principal do site é:

```text
https://lucasdelacale.com/
```

O endereço provisório do GitHub Pages continua disponível em `https://lucasdelacale.github.io/by.lucasdelacale/`.

## Rotas

- `/` home editorial aleatória de publicações.
- `/acervo/` arquivo geral de obras em mosaico.
- `/acervo/[slug]/` página individual da obra.
- `/prints/` trabalhos em formato print.
- `/canvas/` trabalhos em canvas.
- `/series/` séries e projetos.
- `/textos/` ensaios e anotações.
- `/referencias/` referências.
- `/sobre/` apresentação e contato.
