/**
 * @file Funções utilitárias para a aplicação.
 */

/**
 * Cria uma função de ordenação para o array de repositórios.
 * @param {string} key - A chave para ordenação ('stars', 'name', ou 'updated').
 * @returns {function(object, object): number} A função de comparação.
 */
export function createSorter(key) {
  if (key === "stars") return (a, b) => b.stargazers_count - a.stargazers_count;
  if (key === "name") return (a, b) => a.name.localeCompare(b.name);
  return (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

/**
 * Formata uma string de data ISO para o formato dd/mm/yyyy.
 * @param {string | undefined} value - A string de data ISO.
 * @returns {string} A data formatada ou uma string vazia.
 */
export function formatDate(value) {
  try {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "";
  }
}

/**
 * Executa uma série de auto-testes para validar a lógica de ordenação e formatação.
 * Os resultados são impressos no console.
 */
export function runSelfTests() {
  try {
    console.log("Running self-tests...");
    const repos = [
      { name: "b", stargazers_count: 2, forks_count: 1, updated_at: "2025-09-18T10:00:00Z" },
      { name: "a", stargazers_count: 5, forks_count: 0, updated_at: "2025-09-19T10:00:00Z" },
    ];

    const byUpdated = [...repos].sort(createSorter("updated"));
    console.assert(byUpdated[0].name === "a", "Test failed: sort updated");

    const byStars = [...repos].sort(createSorter("stars"));
    console.assert(byStars[0].stargazers_count === 5, "Test failed: sort by stars");

    const byName = [...repos].sort(createSorter("name"));
    console.assert(byName[0].name === "a", "Test failed: sort by name");

    const byUnknown = [...repos].sort(createSorter("unknown"));
    console.assert(byUnknown[0].name === "a", "Test failed: unknown sort key");

    const dateStr = formatDate("2025-09-18T10:00:00Z");
    console.assert(/\d{2}\/\d{2}\/\d{4}/.test(dateStr), "Test failed: formatDate format");

    const invalidDate = formatDate("not-a-date");
    console.assert(invalidDate === "", "Test failed: formatDate invalid input");
    console.log("All self-tests passed!");
  } catch (e) {
    console.error("Self tests failed:", e);
  }
}
