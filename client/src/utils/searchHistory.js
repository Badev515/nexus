

const KEY = 'nexus_search_history';
const MAX_ITEMS = 8;

export function getSearchHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(term) {
  const current = getSearchHistory().filter((t) => t.toLowerCase() !== term.toLowerCase());
  const updated = [term, ...current].slice(0, MAX_ITEMS);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function removeFromSearchHistory(term) {
  const updated = getSearchHistory().filter((t) => t.toLowerCase() !== term.toLowerCase());
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function clearSearchHistory() {
  localStorage.removeItem(KEY);
  return [];
}