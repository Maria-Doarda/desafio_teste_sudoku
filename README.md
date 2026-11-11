# Sudoku 6x6 em JavaScript

**Aluna:** Maria Eduarda Pereira Ribeiro
**RA:** 24224683-2

Lógica do jogo Sudoku 6x6 escrita em JavaScript puro (sem bibliotecas), acompanhada de uma suíte de testes automatizados.

## Arquivos

| Arquivo | Descrição |
|---|---|
| `sudoku.html` | Contém o código JavaScript do jogo (lógica e interface). |
| `sudoku.test.js` | Casos de teste automatizados da lógica em JavaScript. |

## 1. Especificação do desafio

**Objetivo:** implementar a lógica do jogo Sudoku 6x6 em JavaScript e criar casos de teste para ela.

### Regras do jogo

O tabuleiro tem 6x6 células, divididas em 6 blocos de **2 linhas por 3 colunas**. O jogador deve preencher todas as células vazias com números de **1 a 6**, de modo que **nenhum número se repita** na mesma linha, na mesma coluna ou no mesmo bloco 2x3.

### Representação do tabuleiro

O tabuleiro é uma **lista com 36 números** (linha por linha). O valor `0` representa uma célula vazia. A célula da linha `r` e coluna `c` fica na posição `r * 6 + c`.

### Requisitos da lógica

- **Candidatos:** calcular quais números podem ser colocados em uma célula vazia, respeitando linha, coluna e bloco.
- **Detecção de conflitos:** identificar as células com números repetidos em linha, coluna ou bloco.
- **Resolução:** resolver qualquer tabuleiro válido, devolvendo `null` quando não houver solução.
- **Contagem de soluções:** contar quantas soluções um tabuleiro tem, com um limite para encerrar a busca.
- **Fim de jogo:** reconhecer quando o tabuleiro está completo e sem conflitos.
- **Edição de células:** permitir preencher e apagar células vazias, recusando células fixas (pistas iniciais) e valores fora de 0 a 6.
- **Geração de tabuleiros:** gerar um puzzle aleatório com **solução única**, em três níveis de dificuldade: fácil (20 pistas), médio (16) e difícil (12).
- **Tempo:** converter segundos para o formato `mm:ss`.

### Funções implementadas

| Função | O que faz |
|---|---|
| `candidates(b, i)` | Lista os números possíveis para a célula `i`. |
| `conflicts(b)` | Retorna as posições com números repetidos em linha, coluna ou bloco. |
| `solve(b)` | Resolve o tabuleiro; devolve `null` se não houver solução. |
| `countSolutions(b, limite)` | Conta quantas soluções existem, parando no limite. |
| `isComplete(b)` | Diz se o tabuleiro está completo e sem conflitos. |
| `setCell(b, puzzle, i, v)` | Preenche uma célula, recusando células fixas e valores fora de 0 a 6. |
| `generate(nivel)` | Gera um puzzle e sua solução. |
| `formatTime(s)` | Converte segundos para o formato `mm:ss`. |

## 2. Funcionamento dos casos de teste

Os testes verificam a lógica em JavaScript de forma automática. Eles usam o executor de testes que já vem no **Node.js** (versão 18 ou superior), então não há nada para instalar.

### Como executar

1. Coloque `sudoku.html` e `sudoku.test.js` **na mesma pasta**.
2. Abra um terminal nessa pasta.
3. Execute:

```
node --test sudoku.test.js
```

No final aparece o resumo, com as linhas `# pass` (testes que passaram) e `# fail` (testes que falharam). Quando um teste falha, a saída mostra o nome dele e a diferença entre o valor esperado e o obtido.

### Como os testes funcionam

- O arquivo `sudoku.test.js` **lê o código JavaScript do próprio `sudoku.html`**, extraindo o bloco de lógica do jogo. Assim, os testes verificam exatamente o código do jogo.
- Cada teste é escrito com `test("descrição", () => { ... })`.
- As verificações usam `node:assert/strict`: `assert.equal` compara valores simples (números, textos) e `assert.deepEqual` compara o conteúdo de listas.
- Há dois dados prontos no início do arquivo, usados nos testes que precisam de um resultado conhecido: `PUZZLE` (um puzzle 6x6 conhecido, com 16 pistas e solução única) e `SOLUTION` (a solução dele). Os testes que alteram o tabuleiro trabalham sobre uma cópia (`PUZZLE.slice()`), para não afetar os demais.
- Como o gerador de tabuleiros é aleatório, os testes dele verificam **propriedades** (solução válida, solução única, quantidade de pistas) em vez de comparar com um tabuleiro fixo.
- Há testes específicos para o formato dos blocos (2 linhas por 3 colunas), para garantir que o bloco não seja confundido com 3 linhas por 2 colunas.

### O que é testado (35 casos)

| Função | Casos | O que se verifica |
|---|---|---|
| tabuleiro | 1 | O tabuleiro tem 36 células (6x6). |
| `candidates` | 5 | Exclui números da linha, coluna e bloco; bloco tem 2 linhas por 3 colunas; célula de outro bloco não exclui o número; célula preenchida não tem candidatos; tabuleiro vazio permite 1 a 6. |
| `conflicts` | 7 | Tabuleiro vazio sem conflitos; detecta repetição em linha, coluna e bloco; mesmo número em blocos diferentes não conflita; solução e puzzle válidos não têm conflitos. |
| `solve` | 4 | Resolve puzzle conhecido; não altera o original; devolve `null` sem solução; modo aleatório gera tabuleiro válido. |
| `countSolutions` | 4 | Solução única no puzzle conhecido; respeita o limite; tabuleiro resolvido conta 1; sem solução conta 0. |
| `isComplete` | 3 | Verdadeiro para solução válida; falso para tabuleiro incompleto; falso para tabuleiro cheio com conflito. |
| `setCell` | 3 | Recusa células fixas; permite preencher e apagar células vazias; rejeita valores fora de 0 a 6. |
| `formatTime` | 1 | Formata segundos como `mm:ss`. |
| `generate` | 7 | Solução válida; tabuleiro com 36 células e valores de 0 a 6; puzzle coerente com a solução; solução única; pistas conforme a dificuldade; resolver reproduz a solução; nível desconhecido usa o médio. |

### Resultado esperado

```
# tests 35
# pass 35
# fail 0
```
