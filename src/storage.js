export const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(`ds-review:${key}`)) ?? fallback; }
    catch { return fallback; }
};
export const write = (key, value) => {
    try { localStorage.setItem(`ds-review:${key}`, JSON.stringify(value)); return true; }
    catch { return false; }
};
