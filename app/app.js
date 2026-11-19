// Leonida Trophy Guide — checklist, tracker, roadmap and cited guides.
// Loads app/data/trophies.json (the only fetch; same-origin, offline-safe),
// saves earned trophies in localStorage, and exports/imports progress as JSON.
const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';
const listEl = document.getElementById('trophyList');
const detailPane = document.getElementById('detailPane');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const spoilerBox = document.getElementById('spoilers');
const earnedOnlyBox = document.getElementById('earnedOnly');
const kindButtons = [...document.querySelectorAll('#kindFilters button')];

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourceLinks = doc.source_links || {};
const sourceNames = {
  PowerPyx: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
  Exophase: 'Exophase — GTA 6 trophies (official list)',
  PSNProfiles: 'PSNProfiles — GTA 6 trophies (official list)',
  'Output Lag': 'Output Lag — GTA 6 Trophy List',
  'Planet GTA 6': 'Planet GTA 6 — GTA 6 Trophies',
};
const KIND_LABELS = { story: 'Story', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };

let earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
let kind = params.get('kind') || 'all';
let selectedId = Number(params.get('open')) || 1;
let seeded = false;

// Screenshot helper: ?seed=N ticks the first N trophies (by list order) so a
// render shows progress. The platinum and the 100% gold are never seeded —
// they can only be earned last. It never overwrites a real saved checklist.
if (params.get('seed') && !localStorage.getItem(STORAGE_KEY)) {
  const n = Math.max(0, Math.min(trophies.length, Number(params.get('seed')) || 0));
  trophies
    .filter((t) => t.id !== 1 && t.id !== 14)
    .slice(0, n)
    .forEach((t) => earned.add(t.name));
  seeded = true;
}
if (params.get('grade')) gradeSelect.value = params.get('grade');
if (params.get('spoilers') === 'on') spoilerBox.checked = true;

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function isHidden(trophy) {
  return spoilerBox.checked && trophy.kind === 'story' && !earned.has(trophy.name);
}

function gradeCountsText() {
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  return grades
    .map((g) => {
      const total = trophies.filter((t) => t.grade === g).length;
      const done = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
      return `${g[0].toUpperCase() + g.slice(1)} ${done}/${total}`;
    })
    .join(' · ');
}

function trophyMatches(trophy) {
  if (kind === 'missable' && !trophy.missable) return false;
  if (kind !== 'all' && kind !== 'missable' && trophy.kind !== kind) return false;
  if (gradeSelect.value !== 'all' && trophy.grade !== gradeSelect.value) return false;
  if (earnedOnlyBox.checked && !earned.has(trophy.name)) return false;
  const q = searchInput.value.trim().toLowerCase();
  if (q && !(trophy.name.toLowerCase().includes(q) || trophy.guide.toLowerCase().includes(q))) return false;
  return true;
}

function renderProgress() {
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = Math.round((done / trophies.length) * 100);
  document.getElementById('progressText').textContent = `${done} of ${trophies.length} earned`;
  document.getElementById('progressPct').textContent = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressBar').setAttribute('aria-valuenow', String(done));
  document.getElementById('gradeCounts').textContent = gradeCountsText();
  for (const stage of [1, 2, 3]) {
    const inStage = trophies.filter((t) => t.stage === stage);
    const doneStage = inStage.filter((t) => earned.has(t.name)).length;
    document.getElementById(`stageCount${stage}`).textContent = `${doneStage}/${inStage.length} earned in this stage.`;
  }
}

function renderMissables() {
  const missable = trophies.filter((t) => t.missable);
  document.getElementById('missableList').innerHTML = '';
  const p = document.getElementById('missableList');
  p.textContent = `Flagged in this guide: ${missable.map((t) => `${t.name} (${t.grade})`).join(', ')}. Every other trophy can be earned after the story in free-roam.`;
}

function renderSources() {
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const [key, url] of Object.entries(sourceLinks)) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = sourceNames[key] || key;
    li.append(a);
    ul.append(li);
  }
}

function renderDetail(trophy) {
  const hidden = isHidden(trophy);
  document.getElementById('detailName').textContent = hidden ? 'Hidden story trophy' : trophy.name;
  document.getElementById('detailMeta').textContent = hidden
    ? 'Story trophy · hidden until earned'
    : `${trophy.grade[0].toUpperCase() + trophy.grade.slice(1)} · ${KIND_LABELS[trophy.kind] || trophy.kind} · Stage ${trophy.stage} of the roadmap`;
  const sourcesLine = document.getElementById('detailSourcesLine');
  sourcesLine.replaceChildren();
  if (!hidden) {
    const strong = document.createElement('strong');
    strong.textContent = 'Sources: ';
    sourcesLine.append(strong, document.createTextNode((trophy.sources || []).join(' · ')));
  }
  document.getElementById('detailDesc').textContent = hidden
    ? 'Its name and description stay hidden until you earn it.'
    : `“${trophy.description}”`;
  const flags = document.getElementById('detailFlags');
  flags.replaceChildren();
  if (trophy.missable) {
    const s = document.createElement('span');
    s.className = 'tag missable';
    s.textContent = 'Potentially missable';
    flags.append(s);
  }
  if (trophy.guide.startsWith('UNCONFIRMED')) {
    const s = document.createElement('span');
    s.className = 'tag unconfirmed';
    s.textContent = 'Trigger unconfirmed at launch';
    flags.append(s);
  }
  document.getElementById('detailGuide').textContent = hidden
    ? 'Earn this trophy to reveal its guide — its name and steps would spoil the story.'
    : trophy.guide;
  const src = document.getElementById('detailSources');
  src.replaceChildren();
  const strong = document.createElement('strong');
  strong.textContent = 'Sources: ';
  src.append(strong);
  src.append(document.createTextNode('guide written in our own words from:'));
  for (const key of trophy.sources || []) {
    const a = document.createElement('a');
    a.href = sourceLinks[key] || '#sources';
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = sourceNames[key] || key;
    src.append(a);
  }
  const check = document.getElementById('detailCheck');
  check.checked = earned.has(trophy.name);
  check.onchange = () => {
    toggleEarned(trophy);
  };
}

function toggleEarned(trophy) {
  if (earned.has(trophy.name)) earned.delete(trophy.name);
  else earned.add(trophy.name);
  saveProgress();
  renderAll();
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatches);
  document.getElementById('emptyNote').hidden = shown.length > 0 || kind === 'online';
  document.getElementById('onlineNote').hidden = kind !== 'online';
  document.getElementById('listNote').textContent =
    kind === 'online'
      ? 'Online filter: this game has no online trophies.'
      : `Showing ${shown.length} of ${trophies.length} trophies. Click a trophy to read its guide.`;
  for (const trophy of shown) {
    const hidden = isHidden(trophy);
    const card = document.createElement('article');
    card.className = 'trophy' + (earned.has(trophy.name) ? ' earned' : '') + (trophy.id === selectedId ? ' selected' : '');
    card.tabIndex = 0;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Earned: ${trophy.name}`);
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEarned(trophy);
    });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 't-name';
    name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
    const desc = document.createElement('div');
    desc.className = 't-desc';
    desc.textContent = hidden ? 'Hidden until earned.' : trophy.description;
    const tags = document.createElement('div');
    tags.className = 't-tags';
    const kindTag = document.createElement('span');
    kindTag.className = `tag kind-${trophy.kind}`;
    kindTag.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
    tags.append(kindTag);
    if (trophy.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'Missable';
      tags.append(m);
    }
    if (trophy.guide.startsWith('UNCONFIRMED')) {
      const u = document.createElement('span');
      u.className = 'tag unconfirmed';
      u.textContent = 'Unconfirmed';
      tags.append(u);
    }
    body.append(name, desc, tags);
    const grade = document.createElement('span');
    grade.className = `grade ${trophy.grade}`;
    grade.textContent = trophy.grade;
    card.append(box, body, grade);
    card.addEventListener('click', () => {
      selectedId = trophy.id;
      renderAll();
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectedId = trophy.id;
        renderAll();
      }
    });
    listEl.append(card);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  const selected = trophies.find((t) => t.id === selectedId) || trophies[0];
  renderDetail(selected);
}

kindButtons.forEach((button) => {
  button.addEventListener('click', () => {
    kind = button.dataset.kind;
    kindButtons.forEach((b) => b.classList.toggle('active', b === button));
    renderAll();
  });
  button.classList.toggle('active', button.dataset.kind === kind);
});
searchInput.addEventListener('input', renderAll);
gradeSelect.addEventListener('change', renderAll);
spoilerBox.addEventListener('change', renderAll);
earnedOnlyBox.addEventListener('change', renderAll);

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.name));
    earned = new Set((names || []).filter((n) => valid.has(n)));
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveProgress();
  renderAll();
});

renderMissables();
renderSources();
renderAll();

// Deep-link view: ?view=roadmap moves the roadmap and missables sections
// above the checklist so they are the first thing on the page (used for
// the roadmap screenshot, where scrolling to them is not available).
if (params.get('view') === 'roadmap') {
  const main = document.querySelector('.layout');
  main.before(document.getElementById('roadmap'), document.getElementById('missables'));
}

// Jump to a section when the page is opened with a #roadmap or #missables
// hash, or with ?scroll=<id>. Done synchronously, right after the checklist
// has rendered, so the layout is final before the browser paints.
const scrollTarget = params.get('scroll') || (location.hash ? location.hash.slice(1) : '');
if (scrollTarget) {
  const target = document.getElementById(scrollTarget);
  if (target) target.scrollIntoView();
}
