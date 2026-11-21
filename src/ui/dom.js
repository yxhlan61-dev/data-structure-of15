const icons = {
    tree:'<path d="M12 5v6m-7 5v-5h14v5"/><rect x="9" y="2" width="6" height="5" rx="1.4"/><rect x="2" y="16" width="6" height="5" rx="1.4"/><rect x="16" y="16" width="6" height="5" rx="1.4"/>',
    book:'<path d="M12 6.4a9.4 9.4 0 0 0-8.5-1.9v13a9.4 9.4 0 0 1 8.5 1.9 9.4 9.4 0 0 1 8.5-1.9v-13A9.4 9.4 0 0 0 12 6.4Zm0 0v13"/>',
    lab:'<path d="M9 3h6m-5 0v7l-5.4 8.3A1.8 1.8 0 0 0 6.1 21h11.8a1.8 1.8 0 0 0 1.5-2.7L14 10V3M8 15h8"/>',
    search:'<circle cx="10.7" cy="10.7" r="6.1"/><path d="m15.2 15.2 4.4 4.4"/>',
    moon:'<path d="M21 13.5A9 9 0 1 1 10.5 3a7 7 0 0 0 10.5 10.5Z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    chev:'<path d="m9 5 7 7-7 7"/>',
    grid:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16M12 4v16"/>',
    play:'<path d="m8 5 11 7-11 7z"/>',
    pause:'<path d="M9 5v14m6-14v14"/>',
    path:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h8a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8"/>',
    heap:'<path d="m12 4 8 5-8 5-8-5 8-5Zm-8 9 8 5 8-5M4 17l8 5 8-5"/>',
    bits:'<path d="M6 5v6m-2 0h4m8-6h2v6h-2zM6 15h2v5H6zm11 0v5m-2 0h4"/>',
    forest:'<path d="M8 21v-5m8 5v-5M8 3 3 14h10L8 3Zm8 1-4 8m1 3h8L16 4"/>',
    check:'<path d="m5 12 4 4 10-10"/>',
    reset:'<path d="M4 11a8 8 0 1 1 1 6m-1-6V5m0 6h6"/>',
    split:'<path d="M12 4v6m0 0L5 16m7-6 7 6"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>'
};
export const icon = (key, extra = '') => `<svg class="ico ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key] || ''}</svg>`;
export const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const byId = id => document.getElementById(id);

export const demoHref = id => '#lab/' + id;
