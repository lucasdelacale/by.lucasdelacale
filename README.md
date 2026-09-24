# Acervo Criativo

Versão atual: **v1.1**. Consulte o [histórico de versões](CHANGELOG.md).

Site estático em Astro para um acervo artístico pessoal. A home funciona como uma entrada editorial: exibe as publicações em um mosaico aleatório a cada carregamento. `/trabalhos/` reúne as peças à venda (prints, canvas e esculturas) com valor, disponibilidade e selo vermelho de galeria; as séries possuem páginas próprias; o `/acervo` apresenta todas as obras em uma visão de mosaico mais densa e documental.

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

Valide IDs, tipos, séries e imagens locais:

```bash
npm run validate:content
```

Reduza imagens antes de subir pelo painel (limite ~3,3 MB, ver [Limite de upload](#limite-de-upload-erro-413)):

```bash
npm run optimize -- caminho/da/foto.jpg
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
public/images/                  imagens locais publicadas
src/content/works/fotografias/  obras autorais            (CMS: Obras)
src/content/works/prints/       prints à venda            (CMS: Prints)
src/content/works/gravuras/     gravuras à venda          (CMS: Gravuras)
src/content/works/canvas/       canvas à venda            (CMS: Canvas)
src/content/works/esculturas/   esculturas à venda        (CMS: Esculturas)
src/content/works/referencias/  referências de pesquisa   (CMS: Referências)
src/content/series/             séries e projetos         (CMS: Séries)
src/content/texts/              ensaios e anotações
src/components/                 componentes Astro reutilizáveis
src/pages/                      rotas do site
src/styles/                     tokens e estilos globais
src/utils/                      funções compartilhadas
templates/                      modelos de conteúdo
```

As obras vivem em subpastas por área de gerenciamento, mas a URL usa apenas o nome do arquivo: `src/content/works/prints/nome-do-print.md` gera `/acervo/nome-do-print/`. Por isso **o nome do arquivo precisa ser único entre todas as pastas de `works/`**.

## Publicar uma obra

Use `templates/obra.md` como ponto de partida e copie-o para a pasta da área certa:

```text
src/content/works/fotografias/nome-da-obra.md   → Obras
src/content/works/prints/nome-do-print.md       → Prints
src/content/works/canvas/nome-do-canvas.md      → Canvas
src/content/works/esculturas/nome-da-peca.md    → Esculturas
src/content/works/referencias/nome-da-ref.md    → Referências
```

O nome do arquivo vira o slug da URL. Por exemplo:

```text
src/content/works/prints/prada-hash.md
```

gera:

```text
/acervo/prada-hash/
```

O nome do arquivo e o nome da imagem não definem a categoria: a classificação vem do campo `type`, que é **carimbado automaticamente pela seção do CMS** (`fotografia`, `print`, `canvas`, `escultura` ou `referencia`). Ao criar o arquivo à mão, mantenha o `type` coerente com a pasta.

Todos os campos do frontmatter são opcionais. Um arquivo mínimo válido é:

```md
---
coverImage: /images/prada-hash.jpeg
---

Texto opcional sobre a obra.
```

Quando não houver `title`, nenhum título será exibido. Quando não houver `type`, será usado `outro`. Quando não houver imagem, a interface exibirá um espaço reservado.

Use `publishedAt: YYYY-MM-DD` para definir a data de publicação. As listagens, exceto a home, mostram as entradas mais novas primeiro; quando esse campo não existir, a ordenação usa `date`, `year` ou `period` como fallback.

## Publicar trabalhos à venda

Prints, gravuras, canvas e esculturas são as peças comercializáveis. Elas usam o mesmo modelo de obra e a mesma página de detalhe do Arquivo, e aparecem em `/trabalhos/` com filtros por tipo. Para publicar um print:

1. No CMS, entre em **Trabalhos → Prints** e crie uma entrada. Se fizer manualmente, copie `templates/obra.md` para `src/content/works/prints/nome-do-print.md`.
2. A área do CMS carimba `type: print` automaticamente.
3. Adicione a imagem pelo próprio campo de imagem e informe o caminho gerado em `coverImage`.
4. Informe `price` (valor em reais, sem símbolo) e deixe `sold: false`.
5. Execute `npm run check` e faça o build.

O trabalho aparecerá em `/trabalhos/` e também no `/acervo/` geral. Ao clicar na imagem, a página aberta será `/acervo/nome-do-print/`. Para uma gravura, canvas ou escultura, use as áreas correspondentes no CMS. Os tipos são `gravura`, `canvas` e `escultura`.

### Valor, vendida e o ponto vermelho

| Campo | Efeito |
|---|---|
| `price: 1200` | exibe `R$ 1.200,00` nos cards de `/trabalhos/` e na linha `Preço` do detalhe |
| `sold: true` | exibe o selo vermelho de galeria sobre a imagem e a marcação `Vendida` |

Enquanto `sold` for `false` e houver `price`, o detalhe mostra `Status: Disponível` e o botão **Consultar →** (um `mailto` com o nome da obra no assunto). Ao marcar `sold: true`, o botão desaparece e o status passa a ser `Vendida`.

O ponto vermelho é o mesmo adesivo que as galerias colam ao lado da peça vendida: aparece no canto inferior direito da imagem em todas as superfícies onde a obra é listada.

## Publicar uma série

Use `templates/serie.md` e copie o arquivo para `src/content/series/nome-da-serie.md`. Toda série precisa de `coverImage` e `coverAlt`.

A relação entre obra e série se autora **pelo campo `Série` da obra** (`series: nome-da-serie.md`), que tem seletor no painel e funciona nos dois sentidos: a obra aparece na página da série, e a série aparece como etiqueta na obra. Não é necessário preencher nada na série.

As séries aparecem em `/series/`, em uma galeria clicável. Elas não são repetidas na home.

## Painel de publicação

O arquivo `.pages.yml` configura o Pages CMS para editar conteúdo pelo navegador. O painel usa o GitHub como fonte de conteúdo. Imagens antigas continuam em `public/images/`; novos uploads são organizados em subpastas de `public/images/works/` ou `public/images/series/` conforme a área.

Para acessar o painel:

1. Abra `https://app.pagescms.org/`.
2. Entre com a conta do GitHub que possui acesso ao repositório.
3. Autorize o Pages CMS no repositório `by.lucasdelacale`.
4. Selecione a branch `main` depois que a configuração for incorporada a ela.
5. Use as áreas do menu lateral para criar ou editar conteúdo.

As áreas do painel espelham as pastas de conteúdo:

| Área do CMS | Onde grava | O que é |
|---|---|---|
| **Trabalhos → Prints** | `src/content/works/prints/` | peças à venda em print |
| **Trabalhos → Gravuras** | `src/content/works/gravuras/` | peças à venda em gravura |
| **Trabalhos → Canvas** | `src/content/works/canvas/` | peças à venda em canvas |
| **Trabalhos → Esculturas** | `src/content/works/esculturas/` | peças à venda em escultura |
| **Obras** | `src/content/works/fotografias/` | obras autorais |
| **Referências** | `src/content/works/referencias/` | imagens de pesquisa |
| **Séries** | `src/content/series/` | séries e projetos |
| **Textos** | `src/content/texts/` | ensaios e anotações |
| **Banco de imagens** | `src/data/media-inventory.json` | status e locais de uso das imagens |

O campo `type` aparece bloqueado no formulário: ele é carimbado pela seção em que o item é criado e não pode ser editado à mão. Os campos `Valor (R$)` e `Vendida` só existem nas três áreas de Trabalhos.

O formulário de obras inclui imagem principal, imagens complementares, materiais, dimensões, tags e obras relacionadas. A relação com a série se faz pelo campo **Série** da própria obra. O formulário de séries tem título, período, capa e descrição. Como o filename é derivado do título, mantenha títulos/nomes de arquivo únicos entre as obras. Textos podem ser criados pela área **Textos**.

O **Banco de imagens** é automático. Ele marca cada arquivo como `PUBLICADA` quando a imagem aparece em algum conteúdo, ou `DISPONÍVEL` quando ainda não é usada. O workflow atualiza esse inventário depois de mudanças em imagens ou conteúdos; não edite essa área manualmente.

Cada salvamento gera um commit no GitHub e inicia automaticamente o workflow de publicação. O painel não cria um banco de dados separado.

> **Atenção:** o Pages CMS não filtra itens por campo — cada área mostra exatamente os arquivos da sua pasta. Por isso as áreas têm pastas próprias e `subfolders: false`. A configuração usa `settings.content: true`, então campos de frontmatter que não aparecem no formulário são preservados ao salvar. Ainda assim, relações devem ser mantidas pelo formulário ou pelo modelo documentado.

## Imagens

Imagens adicionadas manualmente podem ficar em:

```text
public/images/
```

Pelo CMS, use o seletor da própria entrada. Todas as imagens são selecionadas da raiz central `public/images/`, que é onde estão os arquivos atuais e também onde imagens adicionadas manualmente pelo computador devem ser colocadas.

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

### Limite de upload (erro 413)

O painel do Pages CMS (`app.pagescms.org`) roda na **Vercel**, que corta o corpo do request em **4,5 MB**, e o arquivo trafega codificado em base64 (que cresce ~33%). O limite prático é **≈ 3,3 MB por imagem**. Acima disso o upload falha com **413** — é limite do serviço, não há configuração no `.pages.yml` que mude isso (ver [pagescms#284](https://github.com/pages-cms/pages-cms/issues/284) e [pagescms#393](https://github.com/hunvreus/pagescms/issues/393)).

Antes de subir uma foto, reduza-a:

```bash
npm run optimize -- caminho/da/foto.jpg
```

O script (usa o `sips` do macOS, sem dependências) redimensiona para no máximo 2400px no maior lado e regrava o JPEG em qualidade 80, preservando o perfil de cor. Ele mostra o tamanho em base64 do resultado e avisa se ainda estiver acima do limite.

Depois que o CMS consegue aceitar o upload, o workflow `.github/workflows/optimize-uploaded-images.yml` também faz essa otimização automaticamente no GitHub antes do deploy. Isso não consegue resolver um 413: o erro ocorre antes do commit, enquanto o arquivo ainda está sendo enviado ao Pages CMS.

```bash
npm run optimize -- public/images/               # uma pasta inteira, no lugar
npm run optimize -- foto.jpg --dry-run           # só mostra o que faria
npm run optimize -- foto.jpg --out public/images # grava em outro diretório
npm run optimize -- foto.jpg --max 1800 --quality 70
```

Referência de tamanho depois do `optimize`:

| Situação | Upload pelo CMS |
|---|---|
| até ~3,3 MB | funciona |
| acima de ~3,3 MB | erro 413 |

**Alternativa** quando a imagem precisa ficar grande: ignore o painel e commit o arquivo direto em `public/images/` (arraste no GitHub ou `git add`). O limite de 4,5 MB só existe no upload do CMS — o repositório aceita arquivos muito maiores.

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

A relação com a série é a exceção: use o campo `series` na obra, apontando para o arquivo da série (`series: nome-da-serie.md`).

## Publicação

O site é gerado como HTML estático. Em um serviço conectado ao GitHub, o fluxo recomendado é:

1. Adicionar ou alterar o Markdown e as imagens.
2. Executar `npm run check` localmente.
3. Fazer commit e push para o repositório.
4. Configurar o serviço para executar `npm run build`.
5. Publicar a pasta `dist/` gerada.

### Comportamento das listagens

- A home embaralha somente as publicações no navegador a cada carregamento; a ordem das séries não é envolvida porque elas não aparecem na home.
- Na home, obras e referências com imagens exibem a etiqueta de série (quando houver), o tipo e o ano; os títulos aparecem nas páginas individuais.
- `/acervo/`, `/trabalhos/` e `/series/` usam ordenação da publicação mais nova para a mais antiga.
- `/trabalhos/` filtra `print`, `gravura`, `canvas` e `escultura` e permite restringir por tipo pelos botões acima da grade.
- A data principal é `publishedAt`. Sem ela, o site usa `date`, `year` ou `period` como fallback.
- Quando uma listagem não tem trabalhos, a mensagem explica que ainda não há conteúdo publicado.

O projeto pode ser hospedado em serviços como Netlify, Vercel ou GitHub Pages. A configuração específica do domínio fica em `astro.config.mjs`:

```js
site: 'https://seu-dominio.com'
```

### GitHub Pages

O workflow `.github/workflows/deploy.yml` instala as dependências, executa `npm run check`, executa `npm run build`, publica `dist/` e faz o deploy no Pages a cada push na branch `main`.

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
- `/trabalhos/` peças à venda (prints, gravuras, canvas e esculturas) com filtros por tipo.
- `/prints/`, `/canvas/` e `/esculturas/` redirecionam para `/trabalhos/` para preservar links antigos.
- `/series/` séries e projetos.
- `/textos/[slug]/` leitura individual de textos publicados; `/textos/` redireciona para a home.
- `/referencias/` redireciona para o Arquivo; referências continuam publicadas como registros do acervo.
- `/sobre/` apresentação e contato.
- `/post/` atalho para o painel de publicação do Pages CMS.
