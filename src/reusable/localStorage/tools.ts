export function loadFromStorage(id: string) {
  const stringifiedData = localStorage.getItem(id);
  return stringifiedData ? JSON.parse(stringifiedData) : null;
}

export function checkIfElementExistsInStorage(id: string) {
  const stringifiedData = localStorage.getItem(id);
  return !!stringifiedData;
}

export function saveToStorage(id: string, data: unknown) {
  localStorage.setItem(id, JSON.stringify(data));
}

export function removeFromStorage(id: string) {
  localStorage.removeItem(id);
}
