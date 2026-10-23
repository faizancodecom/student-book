const Store = {
  getNotes() {
    try { return JSON.parse(localStorage.getItem('sb_notes')) || []; }
    catch { return []; }
  },
  saveNotes(notes) { localStorage.setItem('sb_notes', JSON.stringify(notes)); },
  getNote(id) { return this.getNotes().find(n => n.id === id) || null; },
  createNote(title, content) {
    const notes = this.getNotes();
    const note = { id: Date.now() + Math.random() * 1000 | 0, title: title || 'Untitled', content: content || '', type: 'general', createdAt: new Date().toISOString() };
    notes.unshift(note);
    this.saveNotes(notes);
    return note;
  },
  updateNote(id, title, content, type) {
    const notes = this.getNotes();
    const idx = notes.findIndex(n => n.id === id);
    if (idx > -1) {
      if (title !== undefined) notes[idx].title = title;
      if (content !== undefined) notes[idx].content = content;
      if (type !== undefined) notes[idx].type = type;
      this.saveNotes(notes);
    }
  },
  deleteNote(id) { this.saveNotes(this.getNotes().filter(n => n.id !== id)); },

  getStickyNotes() {
    try { return JSON.parse(localStorage.getItem('sb_stickies')) || []; }
    catch { return []; }
  },
  saveStickyNotes(s) { localStorage.setItem('sb_stickies', JSON.stringify(s)); },
  addStickyNote(content, color) {
    const notes = this.getStickyNotes();
    notes.push({ id: Date.now() + Math.random() * 1000 | 0, content: content || '', color: color || 'yellow', createdAt: Date.now() });
    this.saveStickyNotes(notes);
    return notes;
  },
  updateStickyNote(id, content, color) {
    const notes = this.getStickyNotes();
    const idx = notes.findIndex(n => n.id === id);
    if (idx > -1) {
      if (content !== undefined) notes[idx].content = content;
      if (color !== undefined) notes[idx].color = color;
      this.saveStickyNotes(notes);
    }
  },
  deleteStickyNote(id) { this.saveStickyNotes(this.getStickyNotes().filter(n => n.id !== id)); },

  getTodos() {
    try { return JSON.parse(localStorage.getItem('sb_todos')) || []; }
    catch { return []; }
  },
  saveTodos(t) { localStorage.setItem('sb_todos', JSON.stringify(t)); },
  addTodo(text) {
    const todos = this.getTodos();
    todos.push({ id: Date.now() + Math.random() * 1000 | 0, text: text || '', done: false, createdAt: Date.now() });
    this.saveTodos(todos);
    return todos;
  },
  toggleTodo(id) {
    const todos = this.getTodos();
    const idx = todos.findIndex(t => t.id === id);
    if (idx > -1) { todos[idx].done = !todos[idx].done; this.saveTodos(todos); }
  },
  updateTodoText(id, text) {
    const todos = this.getTodos();
    const idx = todos.findIndex(t => t.id === id);
    if (idx > -1) { todos[idx].text = text; this.saveTodos(todos); }
  },
  deleteTodo(id) { this.saveTodos(this.getTodos().filter(t => t.id !== id)); },

  getSettings() {
    const defaults = { projectTitle: 'Student Book', projectDescription: 'Capture ideas, organize thoughts, study smarter.', theme: 'dark', aiProvider: 'openai', aiApiKey: '', aiModel: '', aiEndpoint: '' };
    try {
      const stored = JSON.parse(localStorage.getItem('sb_settings'));
      if (stored && typeof stored === 'object') return { ...defaults, ...stored };
    } catch {}
    return { ...defaults };
  },
  saveSettings(s) { localStorage.setItem('sb_settings', JSON.stringify(s)); },
  updateSetting(key, value) {
    const s = this.getSettings();
    s[key] = value;
    this.saveSettings(s);
    return s;
  }
};

const UI = {
  showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s ease'; setTimeout(() => toast.remove(), 300); }, 2500);
  },
  confirmDialog(message) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('confirm-overlay');
      const msgEl = document.getElementById('confirm-message');
      const yesBtn = document.getElementById('confirm-yes');
      const noBtn = document.getElementById('confirm-no');
      if (!overlay || !msgEl || !yesBtn || !noBtn) { resolve(true); return; }
      msgEl.textContent = message;
      overlay.classList.add('open');
      const cleanup = () => {
        overlay.classList.remove('open');
        yesBtn.removeEventListener('click', onYes);
        noBtn.removeEventListener('click', onNo);
      };
      const onYes = () => { cleanup(); resolve(true); };
      const onNo = () => { cleanup(); resolve(false); };
      yesBtn.addEventListener('click', onYes);
      noBtn.addEventListener('click', onNo);
    });
  },
  formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },
  truncate(text, len) { return text.length > len ? text.slice(0, len) + '...' : text; },
  shallowText(html) {
    return html.replace(/<img[^>]*>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  },
  sanitizeForAI(text) {
    return text.replace(/data:image\/[^;]+;base64[^'"\s,)]+/gi, ' [image] ').replace(/\b\w+\.(png|jpg|jpeg|gif|webp|bmp|svg)\b/gi, ' [image] ').replace(/!\[.*?\]\(.*?\)/g, ' [image] ').replace(/<img[^>]*>/gi, ' [image] ');
  }
};

const Theme = {
  init() {
    const settings = Store.getSettings();
    Theme.set(settings.theme || 'dark', false);
  },
  set(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) Store.updateSetting('theme', theme);
    const icons = {
      dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
      light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
      bw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 000 20V2z"/></svg>'
    };
    const labels = { dark: 'Switch to light mode', light: 'Switch to B&W mode', bw: 'Switch to dark mode' };
    document.querySelectorAll('[data-theme-toggle]').forEach(el => {
      el.innerHTML = icons[theme] || icons.dark;
      el.setAttribute('aria-label', labels[theme] || labels.dark);
    });
    const sel = document.getElementById('settings-theme');
    if (sel) sel.value = theme;
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = { dark: 'light', light: 'bw', bw: 'dark' };
    Theme.set(next[current] || 'dark');
  }
};

function showSettings() {
  const settings = Store.getSettings();
  document.getElementById('settings-project-title').value = settings.projectTitle || '';
  document.getElementById('settings-project-desc').value = settings.projectDescription || '';
  document.getElementById('settings-theme').value = settings.theme || 'dark';
  document.getElementById('settings-modal-overlay').classList.add('open');
}

function saveSettingsFromModal() {
  const title = document.getElementById('settings-project-title').value.trim() || 'Student Book';
  const desc = document.getElementById('settings-project-desc').value.trim() || '';
  const theme = document.getElementById('settings-theme').value;
  Store.updateSetting('projectTitle', title);
  Store.updateSetting('projectDescription', desc);
  Theme.set(theme);
  document.querySelectorAll('[data-project-title]').forEach(el => el.textContent = title);
  document.querySelectorAll('[data-project-desc]').forEach(el => {
    if (el) el.textContent = desc || 'Capture ideas, organize thoughts, study smarter.';
  });
  document.title = title + (document.querySelector('.editor-title-input') ? ' - Edit Note' : '');
  document.getElementById('settings-modal-overlay').classList.remove('open');
  UI.showToast('Settings saved');
}

function showAIConfig() {
  const settings = Store.getSettings();
  const prov = settings.aiProvider || 'openai';
  document.getElementById('ai-provider').value = prov;
  document.getElementById('ai-api-key').value = settings.aiApiKey || '';
  document.getElementById('ai-model').value = settings.aiModel || '';
  document.getElementById('ai-endpoint').value = settings.aiEndpoint || '';
  document.getElementById('ai-config-overlay').classList.add('open');
  suggestModel(prov);
  toggleBrowseBtn(prov);
}

function suggestModel(provider) {
  const models = { openai: 'gpt-4o-mini', anthropic: 'claude-3-haiku-20240307', openrouter: 'openai/gpt-4o-mini', google: 'gemini-1.5-flash', custom: '' };
  const inp = document.getElementById('ai-model');
  if (inp && !inp.value) inp.placeholder = models[provider] || '';
}

function toggleBrowseBtn(provider) {
  const btn = document.getElementById('browse-models-btn');
  const panel = document.getElementById('model-browse-panel');
  if (!btn) return;
  const show = provider === 'openrouter';
  btn.style.display = show ? '' : 'none';
  if (panel) panel.style.display = 'none';
}

async function browseOpenRouterModels() {
  const apiKey = document.getElementById('ai-api-key').value.trim();
  if (!apiKey) { UI.showToast('Enter your OpenRouter API key first'); return; }
  const select = document.getElementById('ai-model-list');
  const panel = document.getElementById('model-browse-panel');
  const freeOnly = document.getElementById('free-only');
  if (!select || !panel) return;
  select.innerHTML = '<option>Loading...</option>';
  panel.style.display = 'block';
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!res.ok) { select.innerHTML = '<option>Failed to load models</option>'; return; }
    const data = await res.json();
    const models = data.data || data;
    function render() {
      const free = freeOnly?.checked;
      select.innerHTML = models.filter(m => !free || m.pricing?.prompt === '0' || m.id?.includes('free')).map(m => {
        const price = m.pricing?.prompt ? `$${parseFloat(m.pricing.prompt).toFixed(6)}/tok` : '?';
        const isFree = !m.pricing || m.pricing.prompt === '0' || m.id?.includes('free');
        return `<option value="${m.id}" style="color:${isFree ? 'var(--accent-gold)' : 'inherit'}">${m.id}${isFree ? ' (free)' : ' — ' + price}</option>`;
      }).join('') || '<option>No models found</option>';
    }
    render();
    freeOnly?.addEventListener('change', render);
    select.addEventListener('change', () => {
      if (select.value) document.getElementById('ai-model').value = select.value;
    });
  } catch (e) {
    select.innerHTML = '<option>Error loading models</option>';
  }
}



function saveAIConfig() {
  Store.updateSetting('aiProvider', document.getElementById('ai-provider').value);
  Store.updateSetting('aiApiKey', document.getElementById('ai-api-key').value);
  Store.updateSetting('aiModel', document.getElementById('ai-model').value);
  Store.updateSetting('aiEndpoint', document.getElementById('ai-endpoint').value);
  document.getElementById('ai-config-overlay').classList.remove('open');
  UI.showToast('AI configuration saved');
}

async function callAISummarize(text) {
  const settings = Store.getSettings();
  if (!settings.aiApiKey) {
    return 'Please configure your AI API key in settings (gear icon).';
  }

  text = UI.sanitizeForAI(text);
  const prompt = `Please provide a concise summary of the following notes:\n\n${text}`;

  try {
    let response;
    const provider = settings.aiProvider;
    const model = settings.aiModel;
    const key = settings.aiApiKey;

    if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: model || 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], max_tokens: 500 })
      });
    } else if (provider === 'anthropic') {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: model || 'claude-3-haiku-20240307', max_tokens: 500, messages: [{ role: 'user', content: prompt }] })
      });
    } else if (provider === 'openrouter') {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}`, 'HTTP-Referer': 'https://student-book.app', 'X-Title': 'Student Book' },
        body: JSON.stringify({ model: model || 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], max_tokens: 500 })
      });
    } else if (provider === 'google') {
      const geminiModel = model || 'gemini-1.5-flash';
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 500 } })
      });
    } else if (provider === 'custom' && settings.aiEndpoint) {
      response = await fetch(settings.aiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model: model || 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], max_tokens: 500 })
      });
    } else {
      return 'Select a valid AI provider and enter your API key.';
    }

    if (!response.ok) {
      const err = await response.text();
      if (err.toLowerCase().includes('image') && (err.toLowerCase().includes('not support') || err.toLowerCase().includes('cannot'))) {
        return 'This AI model does not support image input. Remove images from your note or try a different model.';
      }
      return `API error (${response.status}): ${err.slice(0, 200)}`;
    }

    const data = await response.json();
    let summary = '';
    if (provider === 'anthropic') {
      summary = data.content?.[0]?.text || JSON.stringify(data);
    } else if (provider === 'google') {
      summary = data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
    } else {
      summary = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || JSON.stringify(data);
    }
    return summary;
  } catch (e) {
    return `Request failed: ${e.message}`;
  }
}

function initHome() {
  const grid = document.getElementById('notes-grid');
  const searchInput = document.getElementById('search-input');
  if (!grid) return;

  const settings = Store.getSettings();
  document.querySelectorAll('[data-project-title]').forEach(el => el.textContent = settings.projectTitle || 'Student Book');
  document.querySelectorAll('[data-project-desc]').forEach(el => {
    if (el) el.textContent = settings.projectDescription || 'Capture ideas, organize thoughts, study smarter.';
  });
  document.title = settings.projectTitle || 'Student Book';

  renderNotes();
  renderStickyNotes();
  renderTodos();

  document.querySelectorAll('[data-action="new-note"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const note = Store.createNote();
      window.location.href = `editor.html?id=${note.id}`;
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', renderNotes);
  }

  document.querySelectorAll('[data-action="settings"]').forEach(btn => {
    btn.addEventListener('click', showSettings);
  });

  document.querySelectorAll('[data-action="reaction-test"]').forEach(btn => {
    btn.addEventListener('click', startReactionTest);
  });

  const todoInput = document.getElementById('todo-input');
  const todoAddBtn = document.getElementById('todo-add-btn');
  if (todoAddBtn && todoInput) {
    function addTodo() {
      const text = todoInput.value.trim();
      if (text) { Store.addTodo(text); todoInput.value = ''; renderTodos(); }
    }
    todoAddBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(); });
  }
}

function renderTodos() {
  const list = document.getElementById('todo-list');
  if (!list) return;
  const todos = Store.getTodos();
  if (todos.length === 0) { list.innerHTML = '<p style="font-size:.82rem;color:var(--text-muted);padding:.5rem 0">No tasks yet.</p>'; return; }
  list.innerHTML = todos.map((t, i) => `
    <div class="todo-item" style="animation-delay:${i * 0.03}s" data-id="${t.id}">
      <input type="checkbox" class="todo-check" ${t.done ? 'checked' : ''} data-todo-toggle="${t.id}">
      <input type="text" class="todo-text ${t.done ? 'done' : ''}" value="${t.text.replace(/"/g,'&quot;')}" data-todo-edit="${t.id}">
      <button class="todo-delete" data-todo-delete="${t.id}">&times;</button>
    </div>
  `).join('');

  list.querySelectorAll('[data-todo-toggle]').forEach(cb => {
    cb.addEventListener('change', () => {
      Store.toggleTodo(parseInt(cb.dataset.todoToggle));
      renderTodos();
    });
  });
  list.querySelectorAll('[data-todo-edit]').forEach(inp => {
    inp.addEventListener('change', () => {
      Store.updateTodoText(parseInt(inp.dataset.todoEdit), inp.value);
    });
    inp.addEventListener('blur', () => {
      const id = parseInt(inp.dataset.todoEdit);
      const t = Store.getTodos().find(t => t.id === id);
      if (t) inp.classList.toggle('done', t.done);
    });
  });
  list.querySelectorAll('[data-todo-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      Store.deleteTodo(parseInt(btn.dataset.todoDelete));
      renderTodos();
    });
  });
}

let notesPage = 0;
const NOTES_PER_PAGE = 5;

function renderNotes() {
  const grid = document.getElementById('notes-grid');
  if (!grid) return;
  const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  let notes = Store.getNotes();
  if (query) notes = notes.filter(n => { const t = n.title.toLowerCase(); const c = UI.stripHtml(n.content).toLowerCase(); return t.includes(query) || c.includes(query); });

  const totalNotes = notes.length;

  if (totalNotes === 0 && !query) {
    grid.innerHTML = `<div class="empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><h2>No notes yet</h2><p>Create your first note to get started.</p><button class="btn btn-primary" data-action="new-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Note</button></div>`;
    grid.querySelector('[data-action="new-note"]')?.addEventListener('click', () => { const n = Store.createNote(); window.location.href = `editor.html?id=${n.id}`; });
    return;
  }
  if (totalNotes === 0 && query) {
    grid.innerHTML = `<div class="empty-state"><svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><h2>No results</h2><p>No notes match "${query}".</p></div>`;
    return;
  }

  if (!query && notesPage * NOTES_PER_PAGE >= totalNotes) notesPage = 0;
  const start = query ? 0 : notesPage * NOTES_PER_PAGE;
  const end = query ? totalNotes : Math.min(start + NOTES_PER_PAGE, totalNotes);
  const pageNotes = query ? notes : notes.slice(start, end);
  const showing = query ? totalNotes : end;

  const typeLabels = { general: 'Note', lecture: 'Lecture', study: 'Study Guide', project: 'Project', quick: 'Quick Note' };

  let html = pageNotes.map((note, i) => `
    <div class="note-card" style="animation-delay: ${i * 0.04}s" data-id="${note.id}">
      ${note.type && note.type !== 'general' ? `<span class="note-card-badge">${typeLabels[note.type] || note.type}</span>` : ''}
      <div class="note-card-title">${note.title || 'Untitled'}</div>
      <div class="note-card-preview">${UI.truncate(UI.stripHtml(note.content) || 'No content yet', 180)}</div>
      <div class="note-card-footer">
        <span class="note-card-date">${UI.formatDate(note.createdAt)}</span>
        <div class="note-card-actions">
          <button class="btn-icon btn-danger" data-action="delete" data-id="${note.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (!query && totalNotes > NOTES_PER_PAGE) {
    const hasMore = end < totalNotes;
    html += `<div style="grid-column:1/-1;text-align:center;padding-top:.5rem">
      <span style="font-size:.78rem;color:var(--text-muted);margin-right:.75rem">Showing ${showing} of ${totalNotes}</span>
      ${hasMore ? `<button class="btn btn-ghost" id="notes-load-more" style="font-size:.8rem;padding:.35rem .85rem">Load more</button>` : ''}
      ${notesPage > 0 ? `<button class="btn btn-ghost" id="notes-show-less" style="font-size:.8rem;padding:.35rem .85rem">Show less</button>` : ''}
    </div>`;
  }

  grid.innerHTML = html;

  grid.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="delete"]')) return;
      window.location.href = `editor.html?id=${parseInt(card.dataset.id)}`;
    });
  });
  grid.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      UI.confirmDialog('Delete this note?').then(ok => { if (ok) { Store.deleteNote(parseInt(btn.dataset.id)); renderNotes(); UI.showToast('Note deleted'); } });
    });
  });
  document.getElementById('notes-load-more')?.addEventListener('click', () => { notesPage++; renderNotes(); });
  document.getElementById('notes-show-less')?.addEventListener('click', () => { notesPage = Math.max(0, notesPage - 1); renderNotes(); });
}

let stickyPage = 0;
const STICKY_PER_PAGE = 10;

function isCustomColor(c) { return c && c.startsWith('#'); }

function getTextColorForBg(hex) {
  if (!hex || !hex.startsWith('#')) return '#2c2420';
  const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#1a1625' : '#f5efe0';
}

const STICKY_COLORS = ['yellow','green','blue','pink'];

function renderStickyNotes() {
  const grid = document.getElementById('sticky-grid');
  if (!grid) return;
  const all = Store.getStickyNotes();
  if (all.length === 0) { stickyPage = 0;
    grid.innerHTML = `<div class="empty-state" style="padding:1.5rem"><p style="color:var(--text-muted);font-size:.85rem">No sticky notes yet.</p></div>`;
    return;
  }
  const total = all.length;
  if (stickyPage * STICKY_PER_PAGE >= total) stickyPage = 0;
  const start = stickyPage * STICKY_PER_PAGE;
  const end = Math.min(start + STICKY_PER_PAGE, total);
  const notes = all.slice(start, end);

  let html = notes.map((n, i) => {
    const color = n.color || 'yellow';
    const isCustom = isCustomColor(color);
    const bgStyle = isCustom ? `background:${color};color:${getTextColorForBg(color)}` : '';
    const colorClass = isCustom ? 'sticky-note-custom' : `sticky-note-${color}`;
    return `
    <div class="sticky-note ${colorClass}" style="animation-delay:${i * 0.04}s;${bgStyle}" data-id="${n.id}">
      <textarea class="sticky-note-content" data-sticky-edit="${n.id}" placeholder="Write something...">${n.content || ''}</textarea>
      <div class="sticky-note-color-row">
        ${STICKY_COLORS.map(c => `<span class="sticky-color-dot sticky-note-${c} ${c === color && !isCustom ? 'active' : ''}" data-sticky-color="${n.id}" data-color="${c}"></span>`).join('')}
        <input type="color" class="sticky-custom-color" data-sticky-color="${n.id}" data-sticky-color-val="${color}" value="${isCustom ? color : '#fef3c7'}" title="Custom color">
      </div>
      <button class="sticky-note-delete" data-sticky-delete="${n.id}">&times;</button>
    </div>`;
  }).join('');

  if (total > STICKY_PER_PAGE) {
    const hasMore = end < total;
    html += `<div style="grid-column:1/-1;text-align:center;padding-top:.3rem;display:flex;align-items:center;justify-content:center;gap:.75rem">
      <span style="font-size:.76rem;color:var(--text-muted)">${end} of ${total}</span>
      ${hasMore ? `<button class="btn btn-ghost" id="sticky-load-more" style="font-size:.78rem;padding:.3rem .7rem">Load more</button>` : ''}
      ${stickyPage > 0 ? `<button class="btn btn-ghost" id="sticky-show-less" style="font-size:.78rem;padding:.3rem .7rem">Show less</button>` : ''}
    </div>`;
  }

  grid.innerHTML = html;

  grid.querySelectorAll('[data-sticky-edit]').forEach(ta => {
    ta.addEventListener('input', () => {
      Store.updateStickyNote(parseInt(ta.dataset.stickyEdit), ta.value, undefined);
    });
  });

  grid.querySelectorAll('[data-sticky-color]').forEach(dot => {
    dot.addEventListener('click', () => {
      const id = parseInt(dot.dataset.stickyColor);
      const color = dot.dataset.color;
      Store.updateStickyNote(id, undefined, color);
      const noteEl = dot.closest('.sticky-note');
      if (noteEl) {
        noteEl.className = noteEl.className.replace(/sticky-note-\w+/g, '').replace('sticky-note-custom', '').trim();
        noteEl.classList.add('sticky-note-' + color);
        noteEl.style.background = '';
        noteEl.style.color = '';
        noteEl.querySelectorAll('.sticky-color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const cp = noteEl.querySelector('.sticky-custom-color');
        if (cp) cp.value = '#fef3c7';
      }
    });
  });

  grid.querySelectorAll('.sticky-custom-color').forEach(inp => {
    inp.addEventListener('input', () => {
      const id = parseInt(inp.dataset.stickyColor);
      const color = inp.value;
      Store.updateStickyNote(id, undefined, color);
      const noteEl = inp.closest('.sticky-note');
      if (noteEl) {
        noteEl.className = noteEl.className.replace(/sticky-note-\w+/g, '').replace('sticky-note-custom', '').trim();
        noteEl.classList.add('sticky-note-custom');
        noteEl.style.background = color;
        noteEl.style.color = getTextColorForBg(color);
        noteEl.querySelectorAll('.sticky-color-dot').forEach(d => d.classList.remove('active'));
      }
    });
  });

  grid.querySelectorAll('[data-sticky-delete]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      Store.deleteStickyNote(parseInt(btn.dataset.stickyDelete));
      renderStickyNotes();
    });
  });
  document.getElementById('sticky-load-more')?.addEventListener('click', () => { stickyPage++; renderStickyNotes(); });
  document.getElementById('sticky-show-less')?.addEventListener('click', () => { stickyPage = Math.max(0, stickyPage - 1); renderStickyNotes(); });
}

function initEditor() {
  const urlParams = new URLSearchParams(window.location.search);
  const noteId = parseInt(urlParams.get('id'));
  const titleInput = document.getElementById('note-title');
  const editor = document.getElementById('editor-content') || document.querySelector('.editor-content');
  const saveBtn = document.getElementById('save-btn');
  const backBtn = document.getElementById('back-btn');
  const wordCount = document.getElementById('word-count');

  const settings = Store.getSettings();
  document.querySelectorAll('[data-project-title]').forEach(el => el.textContent = settings.projectTitle || 'Student Book');
  document.title = (settings.projectTitle || 'Student Book') + ' - Edit Note';

  let currentNote = noteId ? Store.getNote(noteId) : null;
  let isDirty = false;
  let saveTimeout = null;

  if (currentNote) {
    titleInput.value = currentNote.title;
    editor.innerHTML = currentNote.content || '';
  } else {
    currentNote = Store.createNote();
    window.history.replaceState(null, '', `editor.html?id=${currentNote.id}`);
  }

  function markDirty() {
    isDirty = true;
    if (saveBtn) saveBtn.style.color = 'var(--accent-gold)';
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(doSave, 800);
    updateWordCount();
  }

  function doSave() {
    const title = titleInput.value.trim() || 'Untitled';
    const content = editor.innerHTML;
    Store.updateNote(currentNote.id, title, content);
    isDirty = false;
    if (saveBtn) saveBtn.style.removeProperty('color');
    UI.showToast('Saved');
  }

  function updateWordCount() {
    if (!wordCount) return;
    const text = UI.stripHtml(editor.innerHTML);
    wordCount.textContent = `${text.trim() ? text.trim().split(/\s+/).length : 0} words`;
  }

  if (titleInput) titleInput.addEventListener('input', markDirty);
  if (editor) {
    editor.addEventListener('input', markDirty);
    editor.addEventListener('paste', () => setTimeout(markDirty, 50));
  }
  if (saveBtn) saveBtn.addEventListener('click', doSave);
  if (backBtn) backBtn.addEventListener('click', () => { if (isDirty) doSave(); window.location.href = 'index.html'; });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); doSave(); }
  });
  window.addEventListener('beforeunload', () => { if (isDirty) doSave(); });

  initToolbar(editor);
  initImageUpload(editor);
  initImageToolbar(editor);
  initColorFormatting(editor);
  initZoom();
  initVoiceTyping(editor);
  initAIEditor(editor);
  initGrammarChecker(editor);
  initExamGenerator(editor);
  initExport();
  updateWordCount();

  document.querySelectorAll('[data-action="settings"]').forEach(btn => btn.addEventListener('click', showSettings));
}

function initZoom() {
  const zin = document.getElementById('zoom-in');
  const zout = document.getElementById('zoom-out');
  const zd = document.getElementById('zoom-display');
  const wrapper = document.querySelector('.editor-zoom-wrapper');
  if (!zin || !zout || !wrapper) return;
  let level = 100;
  function update() {
    wrapper.style.transform = `scale(${level / 100})`;
    if (zd) zd.textContent = `${level}%`;
  }
  zin.addEventListener('click', () => { level = Math.min(200, level + 10); update(); });
  zout.addEventListener('click', () => { level = Math.max(50, level - 10); update(); });

  let pinchDist = 0;
  wrapper.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    level = Math.max(50, Math.min(200, level + (e.deltaY > 0 ? -5 : 5)));
    update();
  }, { passive: false });

  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 2 || !pinchDist) return;
    e.preventDefault();
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    const diff = dist - pinchDist;
    if (Math.abs(diff) > 10) {
      level = Math.max(50, Math.min(200, level + (diff > 0 ? 5 : -5)));
      pinchDist = dist;
      update();
    }
  }, { passive: false });

  wrapper.addEventListener('touchend', (e) => { if (e.touches.length < 2) pinchDist = 0; }, { passive: true });
}

function initToolbar(editor) {
  document.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      const val = btn.dataset.value || null;
      editor.focus();
      document.execCommand(cmd, false, val);
      btn.classList.toggle('active');
    });
  });
}

function initImageUpload(editor) {
  const imgBtn = document.getElementById('image-btn');
  const fileInput = document.getElementById('image-input') || (() => {
    const fi = document.createElement('input');
    fi.id = 'image-input'; fi.type = 'file'; fi.accept = 'image/*';
    fi.style.display = 'none'; document.body.appendChild(fi); return fi;
  })();

  if (imgBtn) imgBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { UI.showToast('Image too large (max 2MB)'); fileInput.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      editor.focus();
      document.execCommand('insertHTML', false, `<img src="${e.target.result}" alt="Uploaded image" style="max-width:100%;height:auto;border-radius:8px;margin:.5em auto;display:block" />`);
      fileInput.value = '';
      editor.dispatchEvent(new Event('input'));
    };
    reader.onerror = () => { UI.showToast('Failed to read image'); fileInput.value = ''; };
    reader.readAsDataURL(file);
  });
}

function initVoiceTyping(editor) {
  const btn = document.getElementById('voice-btn');
  if (!btn) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { btn.style.display = 'none'; return; }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  let isListening = false;
  let finalText = '';

  btn.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
      isListening = false;
      btn.classList.remove('recording');
      btn.title = 'Voice typing';
      UI.showToast('Voice typing stopped');
    } else {
      finalText = '';
      recognition.start();
      isListening = true;
      btn.classList.add('recording');
      btn.title = 'Stop voice typing';
      UI.showToast('Voice typing active...');
    }
  });

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript + ' ';
      } else {
        interim += event.results[i][0].transcript;
      }
    }
    if (finalText) {
      editor.focus();
      document.execCommand('insertText', false, finalText);
      finalText = '';
      editor.dispatchEvent(new Event('input'));
    }
  };

  recognition.onerror = () => {
    if (isListening) {
      isListening = false;
      btn.classList.remove('recording');
      UI.showToast('Voice typing error');
    }
  };

  recognition.onend = () => {
    if (isListening) {
      recognition.start();
    }
  };
}

function initAIEditor(editor) {
  const btn = document.getElementById('ai-summarize-btn');
  if (!btn) return;
  const resultEl = document.getElementById('ai-summarize-result');
  if (!resultEl) return;

  btn.addEventListener('click', async () => {
    const text = UI.stripHtml(editor.innerHTML).trim();
    if (!text) { UI.showToast('Write some content first'); return; }

    btn.disabled = true;
    btn.innerHTML = '<span class="ai-loading-dots"><span></span><span></span><span></span></span>';
    resultEl.style.display = 'block';
    resultEl.innerHTML = '<div class="ai-result" style="padding:.75rem;background:var(--paper-bg-alt);border-radius:var(--radius-sm);color:var(--paper-text);font-size:.85rem;animation:fadeIn .3s"><p style="opacity:.6">Summarizing...</p></div>';

    const summary = await callAISummarize(text);

    resultEl.innerHTML = `<div class="ai-result" style="padding:.85rem 1rem;background:var(--paper-bg);border-radius:var(--radius-sm);color:var(--paper-text);font-size:.88rem;line-height:1.6;animation:fadeIn .3s"><h4 style="font-family:var(--font-display);font-weight:600;margin-bottom:.4rem;font-size:.95rem">AI Summary</h4><p>${summary.replace(/\n/g, '<br>')}</p></div>`;

    // scroll to result
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg> <span>Summarize</span>`;
  });
}

function initExport() {
  const btn = document.getElementById('export-pdf-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const title = document.querySelector('.editor-title-input')?.value?.trim() || document.querySelector('[data-project-title]')?.textContent || 'Untitled';
    const printHeader = document.querySelector('.editor-print-header');
    if (printHeader) printHeader.textContent = title;
    setTimeout(() => window.print(), 100);
  });
}

function initImageToolbar(editor) {
  const toolbar = document.getElementById('img-toolbar');
  if (!toolbar) return;
  let currentImg = null;
  let handles = [];
  let dragState = null;

  function clearSel() {
    toolbar.classList.remove('open');
    handles.forEach(h => h.remove());
    handles = [];
    if (currentImg) { currentImg.classList.remove('selected'); currentImg = null; }
    dragState = null;
  }

  function updateHandlePos() {
    if (!currentImg) return;
    const r = currentImg.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const positions = [
      { cls: 'handle-nw', left: r.left, top: r.top },
      { cls: 'handle-n', left: r.left + r.width / 2 - 6, top: r.top },
      { cls: 'handle-ne', left: r.right - 12, top: r.top },
      { cls: 'handle-w', left: r.left, top: r.top + r.height / 2 - 6 },
      { cls: 'handle-move', left: r.left + r.width / 2 - 7, top: r.top + r.height / 2 - 7 },
      { cls: 'handle-e', left: r.right - 12, top: r.top + r.height / 2 - 6 },
      { cls: 'handle-sw', left: r.left, top: r.bottom - 12 },
      { cls: 'handle-s', left: r.left + r.width / 2 - 6, top: r.bottom - 12 },
      { cls: 'handle-se', left: r.right - 12, top: r.bottom - 12 }
    ];
    handles.forEach((h, i) => {
      if (positions[i]) {
        h.style.left = positions[i].left + 'px';
        h.style.top = positions[i].top + 'px';
      }
    });
  }

  function createHandles(img) {
    handles.forEach(h => h.remove());
    handles = [];
    const types = [
      { pos: 'nw', cursor: 'nw-resize' }, { pos: 'n', cursor: 'n-resize' }, { pos: 'ne', cursor: 'ne-resize' },
      { pos: 'w', cursor: 'w-resize' }, { pos: 'move', cursor: 'move' }, { pos: 'e', cursor: 'e-resize' },
      { pos: 'sw', cursor: 'sw-resize' }, { pos: 's', cursor: 's-resize' }, { pos: 'se', cursor: 'se-resize' }
    ];
    types.forEach(t => {
      const el = document.createElement('div');
      el.className = 'img-handle handle-' + t.pos;
      el.style.cssText = `position:fixed;width:12px;height:12px;background:var(--accent-gold);border:2px solid var(--bg-primary);border-radius:2px;z-index:500;cursor:${t.cursor};opacity:0;transition:opacity .15s`;
      document.body.appendChild(el);
      handles.push(el);
      setTimeout(() => el.style.opacity = '1', 10);

      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = img.getBoundingClientRect();
        const startW = img.offsetWidth;
        const startH = img.offsetHeight;
        const aspect = startW / startH;
        const startX = e.clientX;
        const startY = e.clientY;

        if (t.pos === 'move') {
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
          const startMarginL = parseFloat(img.style.marginLeft) || 0;
          const startMarginT = parseFloat(img.style.marginTop) || 0;
          function onMove(ev) {
            img.style.marginLeft = (startMarginL + ev.clientX - startX) + 'px';
            img.style.marginTop = (startMarginT + ev.clientY - startY) + 'px';
            updateHandlePos();
          }
          function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); img.dispatchEvent(new Event('input')); }
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
          return;
        }

        function onMove(ev) {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          let nw = startW, nh = startH;
          const p = t.pos;
          if (p.includes('e')) { nw = Math.max(40, startW + dx); nh = nw / aspect; }
          else if (p.includes('w')) { nw = Math.max(40, startW - dx); nh = nw / aspect; }
          else if (p.includes('s')) { nh = Math.max(30, startH + dy); nw = nh * aspect; }
          else if (p.includes('n')) { nh = Math.max(30, startH - dy); nw = nh * aspect; }
          img.style.width = nw + 'px';
          img.style.height = nh + 'px';
          updateHandlePos();
        }
        function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); img.dispatchEvent(new Event('input')); }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  }

  editor.addEventListener('mousedown', (e) => {
    const img = e.target.closest('img');
    if (!img || !editor.contains(img)) {
      if (!e.target.closest('#img-toolbar') && !e.target.closest('.img-handle')) clearSel();
      return;
    }
    e.preventDefault();
    clearSel();
    currentImg = img;
    img.classList.add('selected');
    createHandles(img);
    updateHandlePos();

    const rect = img.getBoundingClientRect();
    toolbar.style.top = (rect.top - 46) + 'px';
    toolbar.style.left = Math.max(6, rect.left + (rect.width / 2) - 80) + 'px';
    toolbar.classList.add('open');

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const startMarginL = parseFloat(img.style.marginLeft) || 0;
    const startMarginT = parseFloat(img.style.marginTop) || 0;

    function onMove(ev) {
      img.style.marginLeft = (startMarginL + ev.clientX - e.clientX) + 'px';
      img.style.marginTop = (startMarginT + ev.clientY - e.clientY) + 'px';
      updateHandlePos();
      const tr = img.getBoundingClientRect();
      toolbar.style.top = (tr.top - 46) + 'px';
      toolbar.style.left = Math.max(6, tr.left + (tr.width / 2) - 80) + 'px';
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      img.dispatchEvent(new Event('input'));
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  toolbar.querySelector('[data-img-center]')?.addEventListener('click', () => {
    if (!currentImg) return;
    currentImg.style.display = 'block';
    currentImg.style.margin = '1em auto';
    currentImg.style.cssFloat = 'none';
    editor.dispatchEvent(new Event('input'));
  });

  toolbar.querySelectorAll('[data-img-width]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentImg) return;
      currentImg.style.width = btn.dataset.imgWidth;
      currentImg.style.height = 'auto';
      currentImg.style.marginLeft = '';
      currentImg.style.marginTop = '';
      updateHandlePos();
      editor.dispatchEvent(new Event('input'));
    });
  });

  toolbar.querySelector('[data-img-delete]')?.addEventListener('click', () => {
    if (!currentImg) return;
    UI.confirmDialog('Delete this image?').then(ok => {
      if (ok) { currentImg.remove(); clearSel(); editor.dispatchEvent(new Event('input')); }
    });
  });

  document.addEventListener('scroll', () => { if (currentImg) updateHandlePos(); }, true);
  window.addEventListener('resize', () => { if (currentImg) updateHandlePos(); });
}

function initColorFormatting(editor) {
  const textColorInput = document.getElementById('text-color-input');
  const bgColorInput = document.getElementById('bg-color-input');
  if (textColorInput) {
    textColorInput.addEventListener('input', () => {
      editor.focus();
      document.execCommand('foreColor', false, textColorInput.value);
    });
  }
  if (bgColorInput) {
    bgColorInput.addEventListener('input', () => {
      editor.focus();
      document.execCommand('hiliteColor', false, bgColorInput.value);
    });
  }
  document.querySelectorAll('[data-color-preset]').forEach(el => {
    el.addEventListener('click', () => {
      editor.focus();
      const type = el.dataset.colorPreset;
      const color = el.dataset.color;
      if (type === 'text') document.execCommand('foreColor', false, color);
      else document.execCommand('hiliteColor', false, color);
    });
  });
}

function initGrammarChecker(editor) {
  const btn = document.getElementById('grammar-btn');
  const bar = document.getElementById('grammar-bar');
  const countEl = document.getElementById('grammar-count');
  const listEl = document.getElementById('grammar-list');
  const fixAllBtn = document.getElementById('grammar-fix-all');
  if (!btn || !bar) return;

  let currentErrors = [];
  let tooltipEl = null;

  function removeHighlights() {
    editor.normalize();
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
    const toRemove = [];
    while (walker.nextNode()) {
      const parent = walker.currentNode.parentElement;
      if (parent && parent.classList && parent.classList.contains('grammar-error-span')) {
        toRemove.push(parent);
      }
    }
    toRemove.forEach(el => {
      const text = document.createTextNode(el.textContent);
      el.parentNode.replaceChild(text, el);
    });
    editor.normalize();
  }

  function highlightErrors(errors) {
    removeHighlights();
    if (!errors.length) return;
    editor.normalize();
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(node => {
      let text = node.textContent;
      let modified = false;
      for (const err of errors) {
        if (!err.word || err.word.length < 2) continue;
        const idx = text.toLowerCase().indexOf(err.word.toLowerCase());
        if (idx === -1) continue;
        const before = text.slice(0, idx);
        const after = text.slice(idx + err.word.length);
        const span = document.createElement('span');
        span.className = 'grammar-error-span';
        span.dataset.errorIdx = errors.indexOf(err);
        span.textContent = text.slice(idx, idx + err.word.length);
        const frag = document.createRange().createContextualFragment(before);
        frag.appendChild(span);
        frag.appendChild(document.createTextNode(after));
        node.parentNode.replaceChild(frag, node);
        modified = true;
        break;
      }
      if (modified) editor.normalize();
    });

    editor.querySelectorAll('.grammar-error-span').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(el.dataset.errorIdx);
        const err = currentErrors[idx];
        if (!err) return;
        showTooltip(e.clientX, e.clientY, err, el);
      });
    });
  }

  function showTooltip(x, y, err, targetEl) {
    if (tooltipEl) tooltipEl.remove();
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'grammar-error-tooltip';
    tooltipEl.innerHTML = `<h5>${err.word}</h5><p>${err.message || 'Possible error'}</p>
      ${err.suggestion ? `<button class="btn btn-primary" data-fix-single style="font-size:.75rem;padding:.25rem .5rem">${err.suggestion}</button>` : ''}
      <button class="btn btn-ghost" data-dismiss-tip style="font-size:.75rem;padding:.25rem .5rem">Dismiss</button>`;
    tooltipEl.style.left = Math.min(x, window.innerWidth - 300) + 'px';
    tooltipEl.style.top = (y + 12) + 'px';
    document.body.appendChild(tooltipEl);

    tooltipEl.querySelector('[data-fix-single]')?.addEventListener('click', () => {
      targetEl.textContent = err.suggestion;
      targetEl.className = '';
      tooltipEl.remove(); tooltipEl = null;
      countErrors();
      editor.dispatchEvent(new Event('input'));
    });
    tooltipEl.querySelector('[data-dismiss-tip]')?.addEventListener('click', () => {
      targetEl.className = '';
      tooltipEl.remove(); tooltipEl = null;
      countErrors();
    });
  }

  function countErrors() {
    const remaining = editor.querySelectorAll('.grammar-error-span').length;
    if (countEl) countEl.textContent = remaining;
    if (listEl) listEl.innerHTML = remaining ? `<span style="color:var(--accent-crimson);font-size:.82rem">${remaining} issue${remaining > 1 ? 's' : ''} remaining</span>` : '<span style="color:var(--accent-gold);font-size:.82rem">No issues found</span>';
  }

  function checkWithRules(text) {
    const errors = [];
    const rules = [
      { regex: /\b(there)\s+(is|are|was|were)\b/gi, check: (m) => m[1].toLowerCase() === 'there' ? null : 'Use "there"', suggestion: 'there' },
      { regex: /\byour\s+(is|are|was|were|going|coming|book|car|house|idea|name|project)\b/gi, check: (m) => null, suggestion: '' },
      { regex: /\bi\b/g, check: (m) => null, suggestion: 'I' },
    ];
    const words = text.match(/\b[a-zA-Z]{2,}\b/g) || [];
    const commonMistakes = {
      'teh': 'the', 'recieve': 'receive', 'beleive': 'believe', 'occured': 'occurred',
      'seperate': 'separate', 'definately': 'definitely', 'goverment': 'government',
      'thier': 'their', 'recieve': 'receive', 'alot': 'a lot', 'untill': 'until',
      'wich': 'which', 'happend': 'happened', 'ocassion': 'occasion',
      'accomodate': 'accommodate', 'embarass': 'embarrass', 'calender': 'calendar'
    };
    const seen = new Set();
    words.forEach(w => {
      const lower = w.toLowerCase();
      if (commonMistakes[lower] && !seen.has(lower)) {
        seen.add(lower);
        const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
        errors.push({ word: w, message: `Possible spelling mistake`, suggestion: commonMistakes[lower] });
      }
    });
    const lower = text.toLowerCase();
    const grammarRules = [
      { pattern: /\byour\b(?=\s+(is|are|was|were|going|doing|making|taking|giving)\b)/gi,
        msg: 'Use "you\'re" (you are) instead of "your"', fix: (m) => "you're" },
      { pattern: /\bits\b(?=\s+(a|the|is|was|going|beautiful|very|quite|really|too)\b)/gi,
        msg: 'Use "it\'s" (it is) instead of "its"', fix: (m) => "it's" },
      { pattern: /\bthats\b/gi, msg: 'Use "that\'s" (that is)', fix: (m) => "that's" },
    ];
    for (const rule of grammarRules) {
      let match;
      rule.pattern.lastIndex = 0;
      while ((match = rule.pattern.exec(lower)) !== null) {
        errors.push({ word: match[0], message: rule.msg, suggestion: rule.fix(match[0]) });
      }
    }
    return errors;
  }

  btn.addEventListener('click', async () => {
    const text = UI.shallowText(editor.innerHTML);
    if (!text.trim()) { UI.showToast('Write some content first'); return; }

    bar.classList.add('open');
    if (countEl) countEl.textContent = '...';
    if (listEl) listEl.innerHTML = '';

    removeHighlights();
    currentErrors = [];

    const settings = Store.getSettings();
    if (settings.aiApiKey) {
      if (countEl) countEl.textContent = 'AI...';
      try {
        const aiResult = await callAISummarize(`Check the following text for ALL grammar, spelling, and punctuation errors. For EACH error found, output exactly one line in this format:
ERROR: [wrong word/phrase] -> [correction] | [brief reason]

Return ONLY the error lines, one per error. If no errors, return "NO ERRORS".

Text: ${text.slice(0, 2000)}`);
        if (aiResult && !aiResult.includes('NO ERRORS')) {
          const aiErrors = [];
          aiResult.split('\n').forEach(line => {
            const m = line.match(/ERROR:\s*["']?([^"'->]+)["']?\s*->\s*["']?([^"'|]+)["']?\s*\|?\s*(.*)/i);
            if (m) aiErrors.push({ word: m[1].trim(), suggestion: m[2].trim(), message: m[3].trim() || 'AI suggestion' });
          });
          if (aiErrors.length > 0) currentErrors = aiErrors;
        }
      } catch(e) {}
    }

    if (currentErrors.length === 0) {
      currentErrors = checkWithRules(text);
    }

    if (currentErrors.length === 0) {
      if (countEl) countEl.textContent = '0';
      if (listEl) listEl.innerHTML = '<span style="color:var(--accent-gold);font-size:.82rem">No issues found</span>';
      return;
    }

    if (countEl) countEl.textContent = currentErrors.length;
    highlightErrors(currentErrors.slice(0, 30));
    if (listEl) {
      listEl.innerHTML = currentErrors.slice(0, 15).map((e, i) =>
        `<div style="font-size:.8rem;padding:.25rem 0;display:flex;align-items:center;gap:.5rem">
          <span style="color:var(--accent-crimson);flex-shrink:0">${i + 1}.</span>
          <span style="color:var(--text-primary)">${e.word}</span>
          <span style="color:var(--text-muted);font-size:.75rem">→ ${e.suggestion || '?'}</span>
        </div>`
      ).join('');
      if (currentErrors.length > 15) listEl.innerHTML += `<div style="font-size:.75rem;color:var(--text-muted);padding-top:.25rem">+${currentErrors.length - 15} more issues</div>`;
    }
  });

  fixAllBtn?.addEventListener('click', async () => {
    if (currentErrors.length === 0) return;
    const settings = Store.getSettings();
    if (settings.aiApiKey) {
      fixAllBtn.disabled = true;
      fixAllBtn.textContent = 'Fixing...';
      try {
        const corrected = await callAISummarize(`Fix ALL grammar and spelling errors in the following text. Return ONLY the corrected text, nothing else.\n\n${UI.shallowText(editor.innerHTML).slice(0, 2000)}`);
        if (corrected && !corrected.includes('API error') && corrected.length > 10) {
          editor.innerHTML = corrected.replace(/\n/g, '<br>');
          currentErrors = [];
          bar.classList.remove('open');
          if (listEl) listEl.innerHTML = '';
          if (countEl) countEl.textContent = '0';
          editor.dispatchEvent(new Event('input'));
          UI.showToast('Grammar fixed by AI');
          fixAllBtn.disabled = false;
          fixAllBtn.textContent = 'Fix All';
          return;
        }
      } catch(e) {}
      fixAllBtn.disabled = false;
      fixAllBtn.textContent = 'Fix All';
    }
    removeHighlights();
    let html = editor.innerHTML;
    for (const err of currentErrors) {
      if (err.suggestion) {
        const re = new RegExp('\\b' + err.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
        html = html.replace(re, err.suggestion);
      }
    }
    editor.innerHTML = html;
    currentErrors = [];
    bar.classList.remove('open');
    if (listEl) listEl.innerHTML = '';
    if (countEl) countEl.textContent = '0';
    editor.dispatchEvent(new Event('input'));
    UI.showToast('Grammar fixed');
  });

  document.getElementById('grammar-close')?.addEventListener('click', () => {
    bar.classList.remove('open');
    removeHighlights();
    currentErrors = [];
  });

  document.addEventListener('click', (e) => {
    if (tooltipEl && !e.target.closest('.grammar-error-tooltip') && !e.target.closest('.grammar-error-span')) {
      tooltipEl.remove(); tooltipEl = null;
    }
  });
}

function startReactionTest() {
  const overlay = document.getElementById('reaction-overlay');
  if (!overlay) return;
  let state = 'waiting';
  let startTime = 0;
  let timeoutId = null;
  let canClick = false;

  function reset() {
    overlay.className = 'reaction-test-overlay waiting open';
    overlay.innerHTML = `<div class="reaction-test-content"><h2>Wait for green...</h2><p>Click when the screen turns green</p></div>`;
    state = 'waiting';
    canClick = false;
    const delay = 1500 + Math.random() * 3000;
    timeoutId = setTimeout(() => {
      overlay.className = 'reaction-test-overlay ready open';
      overlay.innerHTML = `<div class="reaction-test-content"><h2>Click now!</h2><p style="font-size:3rem;margin-top:1rem">&#9679;</p></div>`;
      state = 'ready';
      canClick = true;
      startTime = Date.now();
    }, delay);
  }

  overlay.addEventListener('click', () => {
    if (state === 'waiting') {
      clearTimeout(timeoutId);
      overlay.className = 'reaction-test-overlay result open';
      overlay.innerHTML = `<div class="reaction-test-content"><h2>Too soon!</h2><p>You clicked before the green.</p><button class="btn" id="reaction-retry">Try Again</button></div>`;
      state = 'result';
      overlay.querySelector('#reaction-retry')?.addEventListener('click', (e) => { e.stopPropagation(); reset(); });
    } else if (state === 'ready' && canClick) {
      canClick = false;
      const time = Date.now() - startTime;
      overlay.className = 'reaction-test-overlay result open';
      overlay.innerHTML = `<div class="reaction-test-content"><div class="result-time">${time}</div><div class="result-ms">milliseconds</div><p style="margin-top:.5rem;opacity:.7">${time < 200 ? 'Lightning fast!' : time < 300 ? 'Great reaction!' : time < 400 ? 'Good' : time < 500 ? 'Average' : 'Keep practicing'}</p><button class="btn" id="reaction-retry">Try Again</button></div>`;
      state = 'result';
      overlay.querySelector('#reaction-retry')?.addEventListener('click', (e) => { e.stopPropagation(); reset(); });
    } else if (state === 'result') {
      overlay.classList.remove('open');
    }
  });

  reset();
}

function initExamGenerator(editor) {
  const btn = document.getElementById('exam-btn');
  const modal = document.getElementById('exam-modal');
  const overlay = document.getElementById('exam-overlay');
  const contentEl = document.getElementById('exam-content');
  const navEl = document.getElementById('exam-nav');
  const prevBtn = document.getElementById('exam-prev-btn');
  const nextBtn = document.getElementById('exam-next-btn');
  const submitBtn = document.getElementById('exam-submit-btn');
  const progressEl = document.getElementById('exam-progress');
  const startBtn = document.getElementById('exam-start-btn');
  if (!btn || !modal) return;

  let examQuestions = [];
  let userAnswers = {};
  let currentIdx = 0;

  function close() { overlay.classList.remove('open'); }
  btn.addEventListener('click', () => overlay.classList.add('open'));
  modal.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(el => el.addEventListener('click', close));
  overlay?.addEventListener('click', (e) => { if (e.target === e.currentTarget) close(); });

  function renderQuestion() {
    if (!examQuestions.length) return;
    const q = examQuestions[currentIdx];
    const saved = userAnswers[q.id] || '';
    let optHtml = '';

    if (q.type === 'multiple choice') {
      const letters = ['A','B','C','D'];
      optHtml = '<div class="q-options">';
      letters.forEach(l => {
        const optMatch = q.text.match(new RegExp(l + '\\)\\s*([^A-D)]+)'));
        if (optMatch) {
          optHtml += `<label class="${saved === l ? 'selected' : ''}"><input type="radio" name="q_opt" value="${l}" ${saved === l ? 'checked' : ''}> ${optMatch[1].trim()}</label>`;
        }
      });
      optHtml += '</div>';
    } else {
      optHtml = `<div class="q-options">
        <label class="${saved === 'True' ? 'selected' : ''}"><input type="radio" name="q_opt" value="True" ${saved === 'True' ? 'checked' : ''}> True</label>
        <label class="${saved === 'False' ? 'selected' : ''}"><input type="radio" name="q_opt" value="False" ${saved === 'False' ? 'checked' : ''}> False</label>
      </div>`;
    }

    contentEl.innerHTML = `<div class="exam-question">
      <div class="q-num">Question ${currentIdx + 1} (${q.type === 'multiple choice' ? 'MCQ' : 'True/False'})</div>
      <div class="q-text">${q.displayText.replace(/\n/g, '<br>')}</div>
      ${optHtml}
    </div>`;

    document.querySelectorAll('input[name="q_opt"]').forEach(el => {
      el.addEventListener('change', () => {
        userAnswers[q.id] = el.value;
      });
    });

    progressEl.textContent = `${currentIdx + 1} of ${examQuestions.length}`;
    prevBtn.style.display = currentIdx > 0 ? '' : 'none';
    if (currentIdx < examQuestions.length - 1) {
      nextBtn.style.display = '';
      submitBtn.style.display = 'none';
    } else {
      nextBtn.style.display = 'none';
      submitBtn.style.display = '';
    }
  }

  async function generateExam() {
    const text = UI.shallowText(editor.innerHTML);
    if (!text.trim()) { UI.showToast('Write some content first'); return; }
    const settings = Store.getSettings();
    if (!settings.aiApiKey) { UI.showToast('Configure AI API key in settings'); return; }

    contentEl.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem">AI is generating exam questions...</p>';
    navEl.style.display = 'none';

    const prompt = `Based on the following notes, create an exam with ONLY multiple choice and true/false questions. AI decides the best number of questions (between 3-10). 

Notes:
${text.slice(0, 3000)}

For each question, use this exact format:
Q: [question text]
Type: [multiple choice or true/false]
${'For multiple choice, list options as:\nA) ...\nB) ...\nC) ...\nD) ...\nANSWER: [letter]'}
${'For true/false:\nANSWER: True or ANSWER: False'}

Separate each question with ---`;

    try {
      const result = await callAISummarize(prompt);
      examQuestions = [];
      userAnswers = {};
      currentIdx = 0;
      const blocks = result.split('---').filter(b => b.trim());

      blocks.forEach((block, i) => {
        const typeMatch = block.match(/Type:\s*(multiple choice|true\/false)/i);
        const qType = typeMatch ? typeMatch[1].toLowerCase() : 'multiple choice';
        const answerMatch = block.match(/ANSWER:\s*([^\]]+)/i);
        const correctAnswer = answerMatch ? answerMatch[1].trim().toUpperCase() : '';

        let qText = block.replace(/ANSWER:[^\]]+/i, '').replace(/Q:\s*/i, '').replace(/Type:\s*(multiple choice|true\/false)/i, '').trim();
        const optionsMatch = qText.match(/[A-D]\)\s*[^A-D)]+/g);
        const displayText = optionsMatch ? qText.replace(/[A-D]\)\s*[^A-D)]+/g, '').trim() : qText;

        const id = 'q_' + i;
        examQuestions.push({ id, type: qType, text: qText, displayText, correctAnswer });
      });

      if (!examQuestions.length) throw new Error('No questions generated');
      navEl.style.display = 'flex';
      renderQuestion();
    } catch (e) {
      contentEl.innerHTML = '<p style="color:var(--accent-crimson);text-align:center;padding:2rem">Error generating exam. Check your API key and try again.</p>';
    }
  }

  startBtn?.addEventListener('click', generateExam);

  prevBtn?.addEventListener('click', () => {
    if (currentIdx > 0) { currentIdx--; renderQuestion(); }
  });
  nextBtn?.addEventListener('click', () => {
    if (currentIdx < examQuestions.length - 1) { currentIdx++; renderQuestion(); }
  });

  submitBtn?.addEventListener('click', async () => {
    const settings = Store.getSettings();
    if (!settings.aiApiKey) { UI.showToast('Configure AI API key'); return; }

    const results = [];
    examQuestions.forEach(q => {
      const ans = userAnswers[q.id] || '(no answer)';
      results.push(`Question: ${q.displayText || q.text}\nExpected: ${q.correctAnswer}\nUser: ${ans}`);
    });

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="ai-loading-dots"><span></span><span></span><span></span></span> Evaluating...';
    navEl.querySelectorAll('button:not(#exam-submit-btn)').forEach(b => b.style.display = 'none');

    const evalPrompt = `Evaluate these exam answers (MCQ and True/False). For each question return [CORRECT] or [INCORRECT] followed by 1-2 sentence feedback.\n\n${results.join('\n---\n')}`;

    try {
      const evalResult = await callAISummarize(evalPrompt);
      const feedbacks = evalResult.split(/\[(CORRECT|INCORRECT|PARTIAL)\]/gi).filter(s => s.trim());
      let correct = 0;
      let html = '';

      examQuestions.forEach((q, i) => {
        const fbIdx = i * 2;
        const status = feedbacks[fbIdx] || '';
        const comment = feedbacks[fbIdx + 1] || '';
        const isCorrect = /^CORRECT$/i.test(status);
        const isPartial = /^PARTIAL$/i.test(status);
        const isWrong = /^INCORRECT$/i.test(status);
        if (isCorrect) correct++;
        html += `<div class="exam-result-item">
          <div><strong>Q${i + 1}:</strong> ${(q.displayText || q.text).slice(0, 80)}${(q.displayText || q.text).length > 80 ? '...' : ''}</div>
          <div><span class="${isCorrect ? 'r-correct' : 'r-wrong'}">${isCorrect ? 'Correct' : isPartial ? 'Partial' : 'Incorrect'}</span> | Your answer: ${userAnswers[q.id] || '(none)'} | Correct: ${q.correctAnswer}</div>
          <div class="r-feedback">${comment.replace(/\n/g, '<br>') || 'No feedback'}</div>
        </div>`;
      });

      const score = Math.round((correct / examQuestions.length) * 100);
      const advice = settings.aiApiKey ? await callAISummarize(`The user scored ${correct}/${examQuestions.length} (${score}%) on an exam. Give one paragraph of encouraging study advice.`) : 'Keep studying!';

      contentEl.innerHTML = `<div class="exam-summary">
        <h3>Your Results</h3>
        <div class="score">${correct}/${examQuestions.length}</div>
        <p style="color:var(--text-secondary);font-size:.9rem">${score}%</p>
        <div class="advice">${advice.replace(/\n/g, '<br>')}</div>
      </div>${html}<div style="text-align:center;padding-top:1rem"><button class="btn btn-primary" onclick="document.getElementById('exam-overlay')?.classList.remove('open')">Close</button></div>`;
      navEl.style.display = 'none';
    } catch (e) {
      contentEl.innerHTML = '<p style="color:var(--accent-crimson);text-align:center;padding:2rem">Evaluation failed. Try again.</p>';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();

  document.querySelectorAll('[data-theme-toggle]').forEach(el => {
    el.addEventListener('click', (e) => Theme.toggle());
  });

  document.querySelectorAll('[data-action="ai-config"]').forEach(el => {
    el.addEventListener('click', showAIConfig);
  });
  document.getElementById('ai-provider')?.addEventListener('change', (e) => { suggestModel(e.target.value); toggleBrowseBtn(e.target.value); });
  document.getElementById('browse-models-btn')?.addEventListener('click', browseOpenRouterModels);

  document.querySelectorAll('[data-action="add-sticky"]').forEach(el => {
    el.addEventListener('click', () => {
      Store.addStickyNote('', 'yellow');
      renderStickyNotes();
      UI.showToast('Sticky note added');
    });
  });

  document.getElementById('settings-save-btn')?.addEventListener('click', saveSettingsFromModal);
  document.querySelectorAll('#settings-modal-overlay .modal-close-btn, #settings-modal-overlay .modal-cancel-btn').forEach(el => {
    el.addEventListener('click', () => document.getElementById('settings-modal-overlay')?.classList.remove('open'));
  });
  document.getElementById('settings-modal-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('open'); });

  document.getElementById('ai-config-save-btn')?.addEventListener('click', saveAIConfig);
  document.querySelectorAll('#ai-config-overlay .modal-close-btn, #ai-config-overlay .modal-cancel-btn').forEach(el => {
    el.addEventListener('click', () => document.getElementById('ai-config-overlay')?.classList.remove('open'));
  });
  document.getElementById('ai-config-overlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('open'); });

  if (document.getElementById('notes-grid')) initHome();
  if (document.getElementById('editor-content') || document.querySelector('.editor-content')) initEditor();
});
