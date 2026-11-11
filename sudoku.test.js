const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const html = fs.readFileSync(path.join(__dirname, "sudoku.html"), "utf8");
const inicio = html.indexOf("/* ============ LÓGICA DO JOGO");
const fim = html.indexOf("/* ============ INTERFACE");
assert.ok(inicio >= 0 && fim > inicio, "não encontrei o bloco de lógica no sudoku.html");

const {
  SIZE, LEVELS, candidates, solve, countSolutions, conflicts,
  isComplete, setCell, generate, formatTime,
} = new Function(
  html.slice(inicio, fim) +
  "\nreturn { SIZE, LEVELS, candidates, solve, countSolutions, conflicts, isComplete, setCell, generate, formatTime };"
)();

const toArr = s => s.split("").map(Number);
const PUZZLE   = toArr("100056000120001500064000310005640012");
const SOLUTION = toArr("123456456123231564564231312645645312");
const vazio = () => Array(SIZE).fill(0);
const ordenado = set => [...set].sort((a, b) => a - b);
const primeiraPista = PUZZLE.findIndex(v => v);
const primeiraVazia = PUZZLE.findIndex(v => !v);


test("tabuleiro: tem 36 células (6x6)", () => {
  assert.equal(SIZE, 36);
  assert.equal(PUZZLE.length, 36);
  assert.equal(SOLUTION.length, 36);
});

test("candidates: exclui números da linha, coluna e bloco", () => {
  const b = vazio();
  b[0] = 1; b[1] = 2; b[5] = 6;
  b[8] = 5;
  b[14] = 4;
  assert.deepEqual(candidates(b, 2), [3]);
});
test("candidates: bloco é de 2 linhas por 3 colunas (inclui a linha de baixo)", () => {
  const b = vazio();
  b[6] = 3;
  assert.deepEqual(candidates(b, 2), [1, 2, 4, 5, 6]);
});
test("candidates: célula de outro bloco não exclui o número", () => {
  const b = vazio();
  b[12] = 3;
  assert.deepEqual(candidates(b, 2), [1, 2, 3, 4, 5, 6]);
});
test("candidates: célula preenchida retorna vazio", () => {
  assert.deepEqual(candidates(PUZZLE, primeiraPista), []);
});
test("candidates: tabuleiro vazio permite 1 a 6", () => {
  assert.deepEqual(candidates(vazio(), 14), [1, 2, 3, 4, 5, 6]);
});

test("conflicts: tabuleiro vazio não tem conflitos", () => {
  assert.equal(conflicts(vazio()).size, 0);
});
test("conflicts: detecta duplicata na linha", () => {
  const b = vazio(); b[0] = 5; b[5] = 5;
  assert.deepEqual(ordenado(conflicts(b)), [0, 5]);
});
test("conflicts: detecta duplicata na coluna", () => {
  const b = vazio(); b[0] = 4; b[30] = 4;
  assert.deepEqual(ordenado(conflicts(b)), [0, 30]);
});
test("conflicts: detecta duplicata no bloco", () => {
  const b = vazio(); b[0] = 3; b[8] = 3;
  assert.deepEqual(ordenado(conflicts(b)), [0, 8]);
});
test("conflicts: mesmo número em blocos diferentes não conflita", () => {
  const b = vazio(); b[0] = 3; b[9] = 3; b[13] = 3;
  assert.equal(conflicts(b).size, 0);
});
test("conflicts: solução conhecida não tem conflitos", () => {
  assert.equal(conflicts(SOLUTION).size, 0);
});
test("conflicts: puzzle inicial válido não tem conflitos", () => {
  assert.equal(conflicts(PUZZLE).size, 0);
});

test("solve: resolve puzzle conhecido", () => {
  assert.deepEqual(solve(PUZZLE), SOLUTION);
});
test("solve: não altera o tabuleiro original", () => {
  const copia = PUZZLE.slice();
  solve(copia);
  assert.deepEqual(copia, PUZZLE);
});
test("solve: retorna null quando não há solução", () => {
  const b = vazio();
  [1, 2, 3, 4, 5].forEach((v, i) => { b[i] = v; });
  b[11] = 6;
  assert.equal(solve(b), null);
});
test("solve: modo aleatório gera tabuleiro completo e válido", () => {
  const s = solve(vazio(), true);
  assert.ok(s && isComplete(s));
});

test("countSolutions: puzzle conhecido tem solução única", () => {
  assert.equal(countSolutions(PUZZLE, 2), 1);
});
test("countSolutions: tabuleiro vazio respeita o limite", () => {
  assert.equal(countSolutions(vazio(), 2), 2);
});
test("countSolutions: tabuleiro já resolvido conta 1", () => {
  assert.equal(countSolutions(SOLUTION, 2), 1);
});
test("countSolutions: puzzle sem solução conta 0", () => {
  const b = vazio();
  [1, 2, 3, 4, 5].forEach((v, i) => { b[i] = v; });
  b[11] = 6;
  assert.equal(countSolutions(b, 2), 0);
});

test("isComplete: verdadeiro para solução válida", () => {
  assert.equal(isComplete(SOLUTION), true);
});
test("isComplete: falso para tabuleiro incompleto", () => {
  assert.equal(isComplete(PUZZLE), false);
});
test("isComplete: falso para tabuleiro cheio com conflito", () => {
  const b = SOLUTION.slice(); b[0] = b[1];
  assert.equal(isComplete(b), false);
});

test("setCell: não permite editar célula inicial", () => {
  const b = PUZZLE.slice();
  const antes = b[primeiraPista];
  assert.equal(setCell(b, PUZZLE, primeiraPista, antes % 6 + 1), false);
  assert.equal(b[primeiraPista], antes);
});
test("setCell: permite preencher e apagar célula vazia", () => {
  const b = PUZZLE.slice();
  assert.equal(setCell(b, PUZZLE, primeiraVazia, 4), true);
  assert.equal(b[primeiraVazia], 4);
  assert.equal(setCell(b, PUZZLE, primeiraVazia, 0), true);
  assert.equal(b[primeiraVazia], 0);
});
test("setCell: rejeita valores fora de 0-6", () => {
  const b = PUZZLE.slice();
  assert.equal(setCell(b, PUZZLE, primeiraVazia, 7), false);
  assert.equal(setCell(b, PUZZLE, primeiraVazia, -1), false);
  assert.equal(b[primeiraVazia], 0);
});

test("formatTime: formata minutos e segundos", () => {
  assert.equal(formatTime(0), "00:00");
  assert.equal(formatTime(65), "01:05");
  assert.equal(formatTime(3599), "59:59");
});

test("generate: solução gerada é válida e completa", () => {
  assert.equal(isComplete(generate("easy").solution), true);
});
test("generate: tabuleiro tem 36 células com valores de 0 a 6", () => {
  const { puzzle, solution } = generate("medium");
  assert.equal(puzzle.length, 36);
  assert.equal(solution.length, 36);
  puzzle.forEach(v => assert.ok(v >= 0 && v <= 6));
});
test("generate: puzzle é consistente com a solução", () => {
  const { puzzle, solution } = generate("easy");
  puzzle.forEach((v, i) => assert.ok(v === 0 || v === solution[i], "célula " + i));
});
test("generate: puzzle tem solução única", () => {
  assert.equal(countSolutions(generate("medium").puzzle, 2), 1);
});
test("generate: quantidade de pistas segue a dificuldade", () => {
  const n = p => p.filter(Boolean).length;
  const facil = n(generate("easy").puzzle);
  const dificil = n(generate("hard").puzzle);
  assert.ok(facil >= LEVELS.easy, "fácil tem " + facil);
  assert.ok(dificil >= LEVELS.hard, "difícil tem " + dificil);
  assert.ok(dificil <= facil, "difícil (" + dificil + ") deveria ter ≤ pistas que fácil (" + facil + ")");
});
test("generate: resolver o puzzle reproduz a solução", () => {
  const { puzzle, solution } = generate("medium");
  assert.deepEqual(solve(puzzle), solution);
});
test("generate: nível desconhecido cai no médio", () => {
  const { puzzle } = generate("inexistente");
  assert.ok(puzzle.filter(Boolean).length >= LEVELS.medium);
});
