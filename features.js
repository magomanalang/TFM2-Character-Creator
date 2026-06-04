
// ─────────────────────────────────────────────────────────────
// RECIPE SYSTEM — features.js
// Handles: built-in recipes, custom recipe book (localStorage),
//          Recipe Picker modal, Save-as-Recipe modal,
//          Import/Export, and the Index panel + Champion Sheet.
// ─────────────────────────────────────────────────────────────

'use strict';

// ── BUILT-IN RECIPES (modular — add more here freely) ─────────

const BUILTIN_RECIPES = [
  {
    id: 'builtin_0',
    title: 'Basic Target Projectile Attack',
    desc: 'Homing projectile that follows the target. Best for basic attacks.',
    pairing: 'casting_type:"Targeting", casting_target:"Enemy", attack_type:"BaseAttack"',
    category: 'Basic Attack',
    json: '{\n  "duration": 18,\n  "cooltime": 50,\n  "start_timing": 8,\n  "cancelable": true,\n  "range": 52000,\n  "casting_type": "Targeting",\n  "casting_target": "Enemy",\n  "attack_type": "BaseAttack",\n  "effect": {\n    "type": "TargetProjectile",\n    "speed": 4500,\n    "name": "my_attack",\n    "applied_target": "Enemy",\n    "applied_effects": [\n      { "effect": { "type": "Attack", "damage": 0, "attack_ratio": 100 } }\n    ]\n  }\n}',
  },
  {
    id: 'builtin_1',
    title: 'Directional Piercing Skill',
    desc: 'Linear projectile that pierces all enemies in a line.',
    pairing: 'casting_type:"Direction", casting_target:"Enemy", attack_type:"Skill"',
    category: 'Skill / Projectile',
    json: '{\n  "duration": 20,\n  "cooltime": 240,\n  "start_timing": 8,\n  "cancelable": false,\n  "range": 65000,\n  "casting_type": "Direction",\n  "casting_target": "Enemy",\n  "attack_type": "Skill",\n  "effect": {\n    "type": "LinearProjectile",\n    "penetrate": true,\n    "speed": 4200,\n    "range": 65000,\n    "name": "my_skill",\n    "shape": { "Circle": { "radius": 8000 } },\n    "applied_target": "Enemy",\n    "applied_effects": [\n      { "effect": { "type": "ApAttack", "damage": 50, "attack_ratio": 80 } }\n    ]\n  }\n}',
  },
  {
    id: 'builtin_2',
    title: 'Self Buff',
    desc: 'Buff the caster with stat bonuses for a duration.',
    pairing: 'casting_type:"None", casting_target:"AllyOnlySelf", attack_type:"Skill"',
    category: 'Buffs',
    json: '{\n  "duration": 15,\n  "cooltime": 360,\n  "start_timing": 0,\n  "cancelable": false,\n  "range": 0,\n  "casting_type": "None",\n  "casting_target": "AllyOnlySelf",\n  "attack_type": "Skill",\n  "effect": {\n    "type": "AddCasterBuff",\n    "buff_state": {\n      "name": "my_focus",\n      "duration": { "Time": { "tick": 180 } },\n      "magic_power": 20,\n      "skill_cooldown_mult": 15\n    }\n  }\n}',
  },
  {
    id: 'builtin_3',
    title: 'Area Ultimate (AOE Around Caster)',
    desc: 'Instant AOE around caster. Damage + stun all enemies nearby.',
    pairing: 'casting_type:"None", casting_target:"Enemy", attack_type:"Skill"',
    category: 'Ultimate / AOE',
    json: '{\n  "duration": 30,\n  "cooltime": 900,\n  "start_timing": 10,\n  "cancelable": false,\n  "range": 0,\n  "casting_type": "None",\n  "casting_target": "Enemy",\n  "attack_type": "Skill",\n  "effect": {\n    "type": "RangeEffect",\n    "shape": { "Circle": { "radius": 42000 } },\n    "target": "Enemy",\n    "apply_type": "AroundCaster",\n    "effects": [\n      { "type": "ApAttack", "damage": 120, "attack_ratio": 100 },\n      { "type": "Stun", "duration": 45 }\n    ]\n  }\n}',
  },
  {
    id: 'builtin_4',
    title: 'Dash Then Delayed Hit',
    desc: 'Rush to target then deal damage after a short delay.',
    pairing: 'casting_type:"Targeting", casting_target:"Enemy", attack_type:"Skill"',
    category: 'Movement & Attack',
    json: '{\n  "duration": 24,\n  "cooltime": 300,\n  "start_timing": 6,\n  "cancelable": false,\n  "range": 50000,\n  "casting_type": "Targeting",\n  "casting_target": "Enemy",\n  "attack_type": "Skill",\n  "effect": {\n    "type": "Combine",\n    "effects": [\n      { "type": "Rush", "speed": 3500, "range": 50000, "casting_target": "Enemy", "penetrate": false },\n      { "type": "Delayed", "tick": 12, "effects": [\n        { "type": "Attack", "damage": 70, "attack_ratio": 100 }\n      ]}\n    ]\n  }\n}',
  },
  {
    id: 'builtin_5',
    title: 'Random Enemy Bolt',
    desc: 'Auto-targets a random enemy in range.',
    pairing: 'casting_type:"None", casting_target:"Enemy", attack_type:"Skill"',
    category: 'Targeting',
    json: '{\n  "duration": 18,\n  "cooltime": 240,\n  "start_timing": 6,\n  "cancelable": false,\n  "range": 65000,\n  "casting_type": "None",\n  "casting_target": "Enemy",\n  "attack_type": "Skill",\n  "effect": {\n    "type": "RandomTarget",\n    "range": 65000,\n    "casting_target": "EnemyChampion",\n    "from_projectile": false,\n    "effects": [\n      { "type": "ApAttack", "damage": 80, "attack_ratio": 70 }\n    ]\n  }\n}',
  },
  {
    id: 'builtin_6',
    title: 'Trigger a Registered Visual',
    desc: 'Fire a named visual effect at target. Pair with Combine for damage+visual.',
    pairing: 'Use inside Combine or standalone.',
    category: 'Visuals / VFX',
    json: '{\n  "duration": 15,\n  "cooltime": 120,\n  "start_timing": 0,\n  "cancelable": false,\n  "range": 0,\n  "casting_type": "None",\n  "casting_target": "Enemy",\n  "attack_type": "Skill",\n  "effect": { "type": "ViewEffect", "name": "my_burst" }\n}',
  },
  {
    id: 'builtin_7',
    title: 'Heal on Hit (Lifesteal Buff)',
    desc: 'Add a vampire buff to caster that heals on damage dealt.',
    pairing: 'casting_type:"None", casting_target:"AllyOnlySelf", attack_type:"Skill"',
    category: 'Buffs',
    json: '{\n  "duration": 15,\n  "cooltime": 480,\n  "start_timing": 0,\n  "cancelable": false,\n  "range": 0,\n  "casting_type": "None",\n  "casting_target": "AllyOnlySelf",\n  "attack_type": "Skill",\n  "effect": {\n    "type": "AddCasterBuff",\n    "buff_state": {\n      "name": "my_vamp",\n      "duration": { "Time": { "tick": 300 } },\n      "vamp": 30\n    }\n  }\n}',
  },
  {
    id: 'builtin_8',
    title: 'Chain Lightning (Bounce)',
    desc: 'Homing projectile that bounces to nearby targets on hit.',
    pairing: 'casting_type:"Targeting", casting_target:"Enemy", attack_type:"Skill"',
    category: 'Skill / Projectile',
    json: '{\n  "duration": 20,\n  "cooltime": 240,\n  "start_timing": 8,\n  "cancelable": false,\n  "range": 52000,\n  "casting_type": "Targeting",\n  "casting_target": "Enemy",\n  "attack_type": "Skill",\n  "effect": {\n    "type": "TargetSplashProjectile",\n    "speed": 5000,\n    "range": 35000,\n    "name": "my_chain",\n    "applied_target": "Enemy",\n    "applied_effects": [\n      { "effect": { "type": "ApAttack", "damage": 60, "attack_ratio": 70 } }\n    ]\n  }\n}',
  },
  {
    id: 'builtin_9',
    title: 'Periodic DOT (Burn / Bleed)',
    desc: 'Combine with any projectile as an applied_effect.',
    pairing: 'Combine with any projectile as an applied_effect.',
    category: 'DOT / Status',
    json: '{\n  "duration": 20,\n  "cooltime": 240,\n  "start_timing": 8,\n  "cancelable": false,\n  "range": 52000,\n  "casting_type": "Targeting",\n  "casting_target": "Enemy",\n  "attack_type": "Skill",\n  "effect": {\n    "type": "AddCasted",\n    "casted_type": "Fire",\n    "period": 30,\n    "duration": 180,\n    "effects": [\n      { "type": "Attack", "damage": 15, "attack_ratio": 0 }\n    ]\n  }\n}',
  },
];

// ── CUSTOM RECIPE BOOK (localStorage) ──────────────────────────

const RECIPE_STORAGE_KEY = 'tfm2_recipe_book';

// Collapsed state for category folders
const collapsedRecipes = new Set();

function loadCustomRecipes() {
  try {
    const raw = localStorage.getItem(RECIPE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCustomRecipes(list) {
  try {
    localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {}
}

function generateRecipeId() {
  return 'custom_' + Date.now() + '_' + Math.floor(Math.random() * 9999);
}

// ── MAIN RECIPE INIT ───────────────────────────────────────────

// ── DYNAMIC CATEGORIES HELPERS ─────────────────────────────────

function getAllCategories() {
  const customList = loadCustomRecipes();
  const cats = new Set();
  BUILTIN_RECIPES.forEach(r => { if (r.category) cats.add(r.category); });
  customList.forEach(r => { if (r.category) cats.add(r.category); });
  return Array.from(cats).sort();
}

function updateCategoryFilters() {
  const filterEl = document.getElementById('recipe-category-filter');
  const pickerFilterEl = document.getElementById('recipe-picker-category-filter');
  if (!filterEl) return;

  const activeVal = filterEl.value;
  const activePickerVal = pickerFilterEl ? pickerFilterEl.value : '';

  const categories = getAllCategories();
  
  const optionsHtml = '<option value="">All Categories</option>' + 
    categories.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');
  
  filterEl.innerHTML = optionsHtml;
  filterEl.value = categories.includes(activeVal) ? activeVal : '';

  if (pickerFilterEl) {
    const customList = loadCustomRecipes();
    let pickerOptionsHtml = '<option value="">All Categories</option>';
    if (customList.length > 0) {
      pickerOptionsHtml += '<option value="⭐ My Recipe Book">&#x2B50; My Recipe Book</option>';
    }
    pickerOptionsHtml += categories.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');

    pickerFilterEl.innerHTML = pickerOptionsHtml;
    pickerFilterEl.value = (categories.includes(activePickerVal) || activePickerVal === '⭐ My Recipe Book') ? activePickerVal : '';
  }
}

// ── MAIN RECIPE INIT ───────────────────────────────────────────

function initRecipes() {
  updateCategoryFilters();
  renderAllRecipes();

  // Search
  const searchEl = document.getElementById('recipe-search');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      renderAllRecipes();
    });
  }

  // Category filter dropdown
  const filterEl = document.getElementById('recipe-category-filter');
  if (filterEl) {
    filterEl.addEventListener('change', () => {
      renderAllRecipes();
    });
  }

  // New Recipe button
  const newBtn = document.getElementById('btn-recipe-new');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      openNewRecipeModal();
    });
  }

  // Template Modal Trigger
  const templateBtn = document.getElementById('btn-recipe-template');
  if (templateBtn) {
    templateBtn.addEventListener('click', () => {
      openTemplateModal();
    });
  }

  // Import JSON
  const importBtn = document.getElementById('btn-recipe-import');
  const importInput = document.getElementById('recipe-import-input');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          const list = Array.isArray(data) ? data : [data];
          const existing = loadCustomRecipes();
          let added = 0;
          list.forEach((r) => {
            if (!r.title || !r.json) return;
            r.id = generateRecipeId();
            r.pairing = r.pairing || '';
            r.desc = r.desc || '';
            r.category = r.category || 'General';
            r.image = r.image || null;

            // Automatically stringify json field if it is imported as a nested object
            if (typeof r.json !== 'string') {
              r.json = JSON.stringify(r.json, null, 2);
            }

            // Validate that it is a valid JSON string
            try {
              JSON.parse(r.json);
            } catch (err) {
              throw new Error(`Recipe "${r.title}" has invalid json field: ${err.message}`);
            }

            existing.push(r);
            added++;
          });
          saveCustomRecipes(existing);
          updateCategoryFilters();
          renderAllRecipes();
          alert(`\u2714 Imported ${added} recipe(s) into your Recipe Book!`);
        } catch (err) {
          alert('Invalid JSON: ' + err.message);
        }
        importInput.value = '';
      };
      reader.readAsText(file);
    });
  }

  // Export Book
  const exportBtn = document.getElementById('btn-recipe-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const list = loadCustomRecipes();
      if (!list.length) {
        alert('Your Recipe Book is empty. Save some recipes first!');
        return;
      }
      const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tfm2_recipe_book.json';
      a.click();
    });
  }

  // Save-as-Recipe modal wiring
  initSaveRecipeModal();

  // Recipe Picker modal wiring
  initRecipePickerModal();

  // JSON Template Modal wiring
  initTemplateModal();
}

// ── RENDER ALL RECIPES ─────────────────────────────────────────

function renderAllRecipes() {
  const searchEl = document.getElementById('recipe-search');
  const filterEl = document.getElementById('recipe-category-filter');
  const q = searchEl ? searchEl.value.trim().toLowerCase() : '';
  const cat = filterEl ? filterEl.value : '';

  // Custom
  renderCustomRecipes(q, cat);

  // Built-in
  renderBuiltinRecipes(q, cat);
}

function renderCustomRecipes(filterText, selectedCategory) {
  renderRecipeList('custom-recipes-list', loadCustomRecipes(), true, filterText, selectedCategory);
  
  const countEl = document.getElementById('custom-recipe-count');
  if (countEl) {
    const all = loadCustomRecipes();
    countEl.textContent = `${all.length} recipe${all.length !== 1 ? 's' : ''}`;
  }
}

function renderBuiltinRecipes(filterText, selectedCategory) {
  renderRecipeList('recipes-list', BUILTIN_RECIPES, false, filterText, selectedCategory);
}

// ── GENERIC GROUPED LIST RENDERER ──────────────────────────────

function renderRecipeList(containerId, list, isCustom, filterText, selectedCategory) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  // 1. Filter the list
  let filtered = list;
  if (filterText) {
    filtered = filtered.filter(r => 
      (r.title + ' ' + (r.desc || '') + ' ' + (r.pairing || '') + ' ' + (r.category || '')).toLowerCase().includes(filterText)
    );
  }
  if (selectedCategory) {
    filtered = filtered.filter(r => r.category === selectedCategory);
  }

  if (!filtered.length) {
    container.innerHTML = `<div class="recipe-empty">${list.length ? 'No recipes match the selected filters.' : 'No recipes yet.'}</div>`;
    return;
  }

  // 2. Group by category
  const groups = {};
  filtered.forEach(r => {
    const cat = r.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  });

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groups).sort();

  sortedCategories.forEach(cat => {
    const collapseKey = `${isCustom ? 'custom' : 'builtin'}_${cat}`;
    const isCollapsed = collapsedRecipes.has(collapseKey);
    const caret = isCollapsed ? '▶' : '▼';

    // Category header
    const groupHeader = document.createElement('div');
    groupHeader.className = 'recipe-group-header';
    groupHeader.innerHTML = `
      <span style="font-size: 9px; min-width: 10px; display: inline-block;">${caret}</span>
      &#x1F4C1; ${escHtml(cat)} 
      <span class="recipe-group-count">(${groups[cat].length})</span>
    `;
    container.appendChild(groupHeader);

    // Group container
    const groupContainer = document.createElement('div');
    groupContainer.className = 'recipe-group-container';
    if (isCollapsed) {
      groupContainer.style.display = 'none';
    }
    
    groups[cat].forEach(recipe => {
      groupContainer.appendChild(makeRecipeCard(recipe, isCustom));
    });

    container.appendChild(groupContainer);

    // Click event to toggle collapse
    groupHeader.addEventListener('click', () => {
      if (collapsedRecipes.has(collapseKey)) {
        collapsedRecipes.delete(collapseKey);
      } else {
        collapsedRecipes.add(collapseKey);
      }
      renderAllRecipes();
    });
  });
}

// ── RECIPE CARD ────────────────────────────────────────────────

function makeRecipeCard(recipe, isCustom) {
  const card = document.createElement('div');
  card.className = 'recipe-card' + (isCustom ? ' recipe-card-custom' : '');
  card.dataset.id = recipe.id;

  const pairing = recipe.pairing ? `<div class="recipe-pairing"><span class="recipe-pairing-label">Pair with:</span> <code>${escHtml(recipe.pairing)}</code></div>` : '';
  const customBadge = isCustom ? '<span class="recipe-badge-custom">\u2B50 My Recipe</span>' : '';
  const categoryBadge = recipe.category ? `<span class="recipe-badge-category">${escHtml(recipe.category)}</span>` : '';

  const imageHtml = recipe.image
    ? `<img class="recipe-card-thumbnail" src="${escHtml(recipe.image)}" onerror="this.style.display='none'" />`
    : '';

  card.innerHTML = `
    <div class="recipe-header">
      <div class="recipe-title">${escHtml(recipe.title)}${categoryBadge}${customBadge}</div>
      <div class="recipe-btns">
        <button class="btn-copy-recipe btn-secondary btn-sm" title="Copy JSON to clipboard">\u2398 Copy JSON</button>
        ${isCustom ? '<button class="btn-edit-recipe btn-secondary btn-sm" title="Edit recipe">\u270F Edit</button>' : ''}
        ${isCustom ? '<button class="btn-delete-recipe btn-danger btn-sm" title="Delete from recipe book">\u2715 Delete</button>' : ''}
      </div>
    </div>
    <div class="recipe-card-body">
      ${imageHtml}
      <div style="flex:1; min-width:0">
        <div class="recipe-desc">${escHtml(recipe.desc || '')}</div>
        ${pairing}
        <pre class="recipe-code"><code>${escHtml(recipe.json)}</code></pre>
      </div>
    </div>
  `;

  // Copy JSON
  card.querySelector('.btn-copy-recipe').addEventListener('click', () => {
    const btn = card.querySelector('.btn-copy-recipe');
    navigator.clipboard.writeText(recipe.json).then(() => {
      btn.textContent = '\u2713 Copied!';
      btn.style.color = '#4ade80';
      setTimeout(() => { btn.innerHTML = '\u2398 Copy JSON'; btn.style.color = ''; }, 1800);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = recipe.json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = '\u2713 Copied!';
      setTimeout(() => { btn.innerHTML = '\u2398 Copy JSON'; }, 1800);
    });
  });

  // Edit (custom only)
  if (isCustom) {
    const editBtn = card.querySelector('.btn-edit-recipe');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        openEditRecipeModal(recipe);
      });
    }

    // Delete
    const delBtn = card.querySelector('.btn-delete-recipe');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (!confirm(`Delete recipe "${recipe.title}"?`)) return;
        const list = loadCustomRecipes().filter((r) => r.id !== recipe.id);
        saveCustomRecipes(list);
        updateCategoryFilters();
        renderAllRecipes();
      });
    }
  }

  return card;
}

// ── NEW / EDIT RECIPE MODAL ────────────────────────────────────

let _saveRecipeCallback = null;

function openNewRecipeModal() {
  openSaveRecipeModal(null, null, {
    title: '',
    desc: '',
    category: 'General',
    pairing: '',
    json: '{\n  "duration": 18,\n  "cooltime": 50,\n  "start_timing": 8,\n  "cancelable": true,\n  "range": 52000,\n  "casting_type": "Targeting",\n  "casting_target": "Enemy",\n  "attack_type": "BaseAttack",\n  "effect": {\n    "type": "Attack",\n    "damage": 50,\n    "attack_ratio": 100\n  }\n}',
  });
}

function openEditRecipeModal(recipe) {
  openSaveRecipeModal(null, null, recipe);
}

// ── SAVE-AS-RECIPE MODAL ───────────────────────────────────────

function initSaveRecipeModal() {
  const modal = document.getElementById('save-recipe-modal');
  if (!modal) return;

  document.getElementById('save-recipe-close')?.addEventListener('click', closeSaveRecipeModal);
  document.getElementById('save-recipe-cancel')?.addEventListener('click', closeSaveRecipeModal);

  // Toggle Custom Category text input
  const toggleBtn = document.getElementById('btn-toggle-custom-category');
  const selEl = document.getElementById('save-recipe-category-sel');
  const customEl = document.getElementById('save-recipe-category-custom');

  if (toggleBtn && selEl && customEl) {
    toggleBtn.addEventListener('click', () => {
      if (customEl.style.display === 'none') {
        customEl.style.display = 'block';
        selEl.style.display = 'none';
        toggleBtn.textContent = '\u2715 Cancel';
        customEl.focus();
      } else {
        customEl.style.display = 'none';
        selEl.style.display = 'block';
        customEl.value = '';
        toggleBtn.textContent = '\u2795 New';
      }
    });
  }

  // Image Upload wiring
  const fileInput = document.getElementById('save-recipe-image-file');
  const fileTrigger = document.getElementById('btn-trigger-recipe-file');
  const fileNameSpan = document.getElementById('save-recipe-file-name');
  const urlInput = document.getElementById('save-recipe-image-url');
  const previewImg = document.getElementById('save-recipe-image-preview');
  const clearImgBtn = document.getElementById('btn-clear-recipe-image');

  if (fileTrigger && fileInput) {
    fileTrigger.addEventListener('click', () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 1.5 * 1024 * 1024) {
        alert('Warning: This image is quite large. To prevent browser localStorage limit issues, please use icons smaller than 1.5MB.');
      }

      fileNameSpan.textContent = file.name;
      if (urlInput) urlInput.value = ''; // clear url input

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (previewImg) {
          previewImg.src = ev.target.result;
          previewImg.style.display = 'block';
        }
        if (clearImgBtn) clearImgBtn.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  if (urlInput) {
    urlInput.addEventListener('input', () => {
      const val = urlInput.value.trim();
      if (fileInput) fileInput.value = ''; // clear file
      if (fileNameSpan) fileNameSpan.textContent = 'No file chosen';

      if (val) {
        if (previewImg) {
          previewImg.src = val;
          previewImg.style.display = 'block';
        }
        if (clearImgBtn) clearImgBtn.style.display = 'block';
      } else {
        if (previewImg) {
          previewImg.src = '';
          previewImg.style.display = 'none';
        }
        if (clearImgBtn) clearImgBtn.style.display = 'none';
      }
    });
  }

  if (clearImgBtn) {
    clearImgBtn.addEventListener('click', () => {
      if (fileInput) fileInput.value = '';
      if (fileNameSpan) fileNameSpan.textContent = 'No file chosen';
      if (urlInput) urlInput.value = '';
      if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = 'none';
      }
      clearImgBtn.style.display = 'none';
    });
  }

  if (previewImg) {
    previewImg.onerror = () => {
      previewImg.style.display = 'none';
    };
    previewImg.onload = () => {
      previewImg.style.display = 'block';
    };
  }

  document.getElementById('save-recipe-confirm')?.addEventListener('click', () => {
    const title = (document.getElementById('save-recipe-title')?.value || '').trim();
    const desc  = (document.getElementById('save-recipe-desc')?.value  || '').trim();
    const pair  = (document.getElementById('save-recipe-pairing')?.value || '').trim();
    const json  = (document.getElementById('save-recipe-json-preview')?.dataset.json || '');

    // Get category
    let category = 'General';
    if (customEl && customEl.style.display !== 'none') {
      category = customEl.value.trim() || 'General';
    } else if (selEl) {
      category = selEl.value || 'General';
    }

    // Get image
    let image = null;
    if (previewImg && previewImg.style.display !== 'none' && previewImg.src) {
      image = previewImg.src;
    }

    if (!title) { alert('Please enter a recipe title.'); return; }
    if (!json)  { alert('No effect JSON to save.'); return; }

    if (_saveRecipeCallback) {
      _saveRecipeCallback({ title, desc, category, pairing: pair, image, json });
    }
    closeSaveRecipeModal();
    updateCategoryFilters();
    renderAllRecipes();
  });

  modal.addEventListener('click', (e) => { if (e.target === modal) closeSaveRecipeModal(); });
}

function openSaveRecipeModal(actionSlot, actionObj, overrideData) {
  const modal = document.getElementById('save-recipe-modal');
  if (!modal) return;

  let jsonStr = '';
  let existingId = null;

  // 1. Populate category dropdown
  const selEl = document.getElementById('save-recipe-category-sel');
  if (selEl) {
    const categories = getAllCategories();
    // make sure General is in it
    if (!categories.includes('General')) {
      categories.unshift('General');
    }
    selEl.innerHTML = categories.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');
  }

  // 2. Reset Toggles
  const customEl = document.getElementById('save-recipe-category-custom');
  const toggleBtn = document.getElementById('btn-toggle-custom-category');
  if (customEl) {
    customEl.style.display = 'none';
    customEl.value = '';
  }
  if (selEl) {
    selEl.style.display = 'block';
  }
  if (toggleBtn) {
    toggleBtn.textContent = '\u2795 New';
  }

  // 3. Reset image inputs
  const fileInput = document.getElementById('save-recipe-image-file');
  const fileNameSpan = document.getElementById('save-recipe-file-name');
  const urlInput = document.getElementById('save-recipe-image-url');
  const previewImg = document.getElementById('save-recipe-image-preview');
  const clearImgBtn = document.getElementById('btn-clear-recipe-image');

  if (fileInput) fileInput.value = '';
  if (fileNameSpan) fileNameSpan.textContent = 'No file chosen';
  if (urlInput) urlInput.value = '';
  if (previewImg) {
    previewImg.src = '';
    previewImg.style.display = 'none';
  }
  if (clearImgBtn) clearImgBtn.style.display = 'none';

  // 4. Fill values
  if (overrideData) {
    jsonStr = overrideData.json || '';
    existingId = overrideData.id || null;
    document.getElementById('save-recipe-title').value = overrideData.title || '';
    document.getElementById('save-recipe-desc').value  = overrideData.desc  || '';
    document.getElementById('save-recipe-pairing').value = overrideData.pairing || '';
    
    if (selEl) {
      selEl.value = overrideData.category || 'General';
    }

    if (overrideData.image) {
      if (urlInput && !overrideData.image.startsWith('data:')) {
        urlInput.value = overrideData.image;
      } else if (fileNameSpan && overrideData.image.startsWith('data:')) {
        fileNameSpan.textContent = 'Base64 Encoded Image';
      }
      if (previewImg) {
        previewImg.src = overrideData.image;
        previewImg.style.display = 'block';
      }
      if (clearImgBtn) clearImgBtn.style.display = 'block';
    }
  } else if (actionObj && actionObj.effect) {
    const cleanAction = { ...actionObj };
    delete cleanAction.action_name;
    delete cleanAction.description;
    jsonStr = JSON.stringify(cleanAction, null, 2);
    document.getElementById('save-recipe-title').value = '';
    document.getElementById('save-recipe-desc').value  = '';
    
    const pairingHint = actionSlot
      ? `casting_type:"${actionObj.casting_type}", casting_target:"${actionObj.casting_target}", attack_type:"${actionObj.attack_type}"`
      : '';
    document.getElementById('save-recipe-pairing').value = pairingHint;

    if (selEl) {
      if (actionSlot === 'basic_attack' || actionSlot === 'attack') {
        selEl.value = 'Basic Attack';
      } else if (actionSlot === 'ult') {
        selEl.value = 'Ultimate / AOE';
      } else {
        selEl.value = 'Skill / Projectile';
      }
    }
  } else {
    alert('No effect configured on this action yet. Set an effect first, then save it as a recipe.');
    return;
  }

  // Show JSON preview
  const previewEl = document.getElementById('save-recipe-json-preview');
  if (previewEl) {
    previewEl.textContent = jsonStr;
    previewEl.dataset.json = jsonStr;
  }

  // Set callback
  _saveRecipeCallback = (data) => {
    const list = loadCustomRecipes();
    if (existingId) {
      // Edit existing
      const idx = list.findIndex((r) => r.id === existingId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...data };
      } else {
        data.id = generateRecipeId();
        list.push(data);
      }
    } else {
      // New
      data.id = generateRecipeId();
      list.push(data);
    }
    saveCustomRecipes(list);
    alert('\u2714 Recipe saved to your Recipe Book!');
  };

  modal.style.display = 'flex';
}

function closeSaveRecipeModal() {
  const modal = document.getElementById('save-recipe-modal');
  if (modal) modal.style.display = 'none';
  _saveRecipeCallback = null;
}

// ── RECIPE PICKER MODAL ────────────────────────────────────────

let _pickerApplyCallback = null;
let _pickerCurrentSlot = null;

function initRecipePickerModal() {
  const modal = document.getElementById('recipe-picker-modal');
  if (!modal) return;

  document.getElementById('recipe-picker-close')?.addEventListener('click', closeRecipePicker);
  document.getElementById('recipe-picker-cancel')?.addEventListener('click', closeRecipePicker);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeRecipePicker(); });

  // Search
  const searchEl = document.getElementById('recipe-picker-search');
  const pickerFilterEl = document.getElementById('recipe-picker-category-filter');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      renderPickerList(searchEl.value.trim().toLowerCase(), pickerFilterEl ? pickerFilterEl.value : '');
    });
  }

  // Category Filter
  if (pickerFilterEl) {
    pickerFilterEl.addEventListener('change', () => {
      renderPickerList(searchEl ? searchEl.value.trim().toLowerCase() : '', pickerFilterEl.value);
    });
  }

  // Paste JSON directly
  const pasteBtn = document.getElementById('recipe-paste-apply-btn');
  if (pasteBtn) {
    pasteBtn.addEventListener('click', () => {
      const raw = (document.getElementById('recipe-paste-json')?.value || '').trim();
      if (!raw) { alert('Paste an action or effect JSON first.'); return; }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.type && !parsed.effect && !parsed.casting_type) {
          alert('JSON must represent an effect (have "type") or a full action (have "effect" or "casting_type").');
          return;
        }
        applyRecipeToAction(parsed);
      } catch (err) {
        alert('Invalid JSON: ' + err.message);
      }
    });
  }
}

function openRecipePicker(actionSlot, actionObj) {
  const modal = document.getElementById('recipe-picker-modal');
  if (!modal) return;

  _pickerCurrentSlot = actionSlot;
  _pickerApplyCallback = (recipeJson) => {
    try {
      const parsed = typeof recipeJson === 'string' ? JSON.parse(recipeJson) : recipeJson;
      if (parsed && (parsed.effect !== undefined || parsed.casting_type !== undefined)) {
        // Full action recipe
        const name = actionObj.action_name;
        const desc = actionObj.description;
        Object.assign(actionObj, parsed);
        actionObj.action_name = name; // preserve original name
        actionObj.description = desc; // preserve original description
      } else {
        // Fallback: effect only
        actionObj.effect = parsed;
      }
      
      // Re-render the entire action panel to reflect updated range, duration, cooldown, casting type, etc.
      if (typeof renderActionPanel === 'function') {
        renderActionPanel(actionSlot);
      }
      closeRecipePicker();
      alert(`\u2714 Recipe applied to "${actionSlot}"!`);
    } catch (err) {
      alert('Failed to apply recipe JSON: ' + err.message);
    }
  };

  const slotEl = document.getElementById('recipe-picker-slot');
  if (slotEl) slotEl.textContent = actionSlot;

  // Clear search
  const searchEl = document.getElementById('recipe-picker-search');
  if (searchEl) searchEl.value = '';

  // Clear paste area
  const pasteEl = document.getElementById('recipe-paste-json');
  if (pasteEl) pasteEl.value = '';

  // Update Category filters
  updateCategoryFilters();
  const pickerFilterEl = document.getElementById('recipe-picker-category-filter');
  if (pickerFilterEl) pickerFilterEl.value = '';

  renderPickerList('', '');
  modal.style.display = 'flex';
}

function applyRecipeToAction(parsed) {
  if (_pickerApplyCallback) _pickerApplyCallback(parsed);
}

function closeRecipePicker() {
  const modal = document.getElementById('recipe-picker-modal');
  if (modal) modal.style.display = 'none';
  _pickerApplyCallback = null;
  _pickerCurrentSlot = null;
}

function renderPickerList(filter, selectedCategory) {
  const container = document.getElementById('recipe-picker-list');
  if (!container) return;
  container.innerHTML = '';

  const customList = loadCustomRecipes();
  const allRecipes = [...customList.map(r => ({ ...r, isCustom: true })), ...BUILTIN_RECIPES.map(r => ({ ...r, isCustom: false }))];

  let filtered = allRecipes;
  if (filter) {
    filtered = filtered.filter((r) => (r.title + ' ' + (r.desc || '') + ' ' + (r.pairing || '') + ' ' + (r.category || '')).toLowerCase().includes(filter));
  }
  if (selectedCategory) {
    if (selectedCategory === '⭐ My Recipe Book') {
      filtered = filtered.filter(r => r.isCustom);
    } else {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }
  }

  if (!filtered.length) {
    container.innerHTML = '<div class="recipe-empty">No recipes match the selected filters.</div>';
    return;
  }

  // Group by category (all custom recipes grouped under '⭐ My Recipe Book')
  const groups = {};
  filtered.forEach(r => {
    const cat = r.isCustom ? '⭐ My Recipe Book' : (r.category || 'General');
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  });

  // Sort categories alphabetically, with '⭐ My Recipe Book' always at the top
  const sortedCategories = Object.keys(groups).sort((a, b) => {
    if (a === '⭐ My Recipe Book') return -1;
    if (b === '⭐ My Recipe Book') return 1;
    return a.localeCompare(b);
  });

  sortedCategories.forEach(cat => {
    const collapseKey = `picker_${cat}`;
    const isCollapsed = collapsedRecipes.has(collapseKey);
    const caret = isCollapsed ? '▶' : '▼';

    const header = document.createElement('div');
    header.className = 'recipe-picker-group-header';
    header.innerHTML = `
      <span style="font-size: 8px; min-width: 8px; display: inline-block; margin-right: 4px;">${caret}</span>
      &#x1F4C1; ${escHtml(cat)}
      <span class="recipe-group-count">(${groups[cat].length})</span>
    `;
    container.appendChild(header);

    const groupContainer = document.createElement('div');
    groupContainer.className = 'recipe-picker-group-container';
    if (isCollapsed) {
      groupContainer.style.display = 'none';
    }

    groups[cat].forEach(recipe => {
      groupContainer.appendChild(makePickerRow(recipe, recipe.isCustom));
    });
    container.appendChild(groupContainer);

    header.addEventListener('click', () => {
      if (collapsedRecipes.has(collapseKey)) {
        collapsedRecipes.delete(collapseKey);
      } else {
        collapsedRecipes.add(collapseKey);
      }
      const currentFilter = document.getElementById('recipe-picker-search')?.value.trim().toLowerCase() || '';
      const currentCat = document.getElementById('recipe-picker-category-filter')?.value || '';
      renderPickerList(currentFilter, currentCat);
    });
  });
}

function makePickerRow(recipe, isCustom) {
  const row = document.createElement('div');
  row.className = 'picker-row';
  row.style.display = 'flex';
  row.style.alignItems = 'center';

  const imageHtml = recipe.image
    ? `<img class="recipe-picker-thumbnail" src="${escHtml(recipe.image)}" onerror="this.style.display='none'" />`
    : '';

  const customBadge = isCustom ? '<span class="recipe-badge-custom">\u2B50 My Recipe</span>' : '';
  const categoryBadge = (isCustom && recipe.category) ? `<span class="recipe-badge-category">${escHtml(recipe.category)}</span>` : '';

  row.innerHTML =
    imageHtml +
    '<div class="picker-row-info">' +
      '<div class="picker-row-title" style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">' +
        '<span>' + escHtml(recipe.title) + '</span>' +
        customBadge +
        categoryBadge +
      '</div>' +
      '<div class="picker-row-desc">' + escHtml(recipe.desc || '') + '</div>' +
    '</div>' +
    '<button class="btn-primary btn-sm picker-apply-btn">\u21B3 Apply</button>';

  row.querySelector('.picker-apply-btn').addEventListener('click', () => {
    if (_pickerApplyCallback) {
      try {
        const parsed = JSON.parse(recipe.json);
        _pickerApplyCallback(parsed);
      } catch (err) {
        alert('Recipe JSON is invalid: ' + err.message);
      }
    }
  });

  return row;
}

// ── JSON IMPORT TEMPLATE MODAL ─────────────────────────────────

const IMPORT_TEMPLATE_DATA = [
  {
    "title": "Stun Blast (Full Action)",
    "desc": "Full action template: deals magic damage and stuns the target. Overwrites range, cooltime, and casting fields.",
    "category": "Crowd Control",
    "pairing": "casting_type: \"Targeting\", attack_type: \"Skill\"",
    "image": "https://example.com/icon.png",
    "json": "{\n  \"duration\": 20,\n  \"cooltime\": 240,\n  \"start_timing\": 10,\n  \"cancelable\": false,\n  \"range\": 52000,\n  \"casting_type\": \"Targeting\",\n  \"casting_target\": \"Enemy\",\n  \"attack_type\": \"Skill\",\n  \"effect\": {\n    \"type\": \"Combine\",\n    \"effects\": [\n      { \"type\": \"ApAttack\", \"damage\": 60, \"attack_ratio\": 80 },\n      { \"type\": \"Stun\", \"duration\": 45 }\n    ]\n  }\n}"
  },
  {
    "title": "Legacy Stun Effect (Effect-Only)",
    "desc": "Effect-only template: stuns the target. Only overwrites the inner effect of the action.",
    "category": "Crowd Control",
    "json": "{\n  \"type\": \"Stun\",\n  \"duration\": 45\n}"
  }
];

function initTemplateModal() {
  const modal = document.getElementById('recipe-template-modal');
  if (!modal) return;

  document.getElementById('recipe-template-close')?.addEventListener('click', closeTemplateModal);
  document.getElementById('recipe-template-cancel')?.addEventListener('click', closeTemplateModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeTemplateModal(); });

  // Populate code content
  const codeEl = document.getElementById('recipe-template-code');
  if (codeEl) {
    codeEl.textContent = JSON.stringify(IMPORT_TEMPLATE_DATA, null, 2);
  }

  // Copy template button
  const copyBtn = document.getElementById('btn-copy-template');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const templateText = JSON.stringify(IMPORT_TEMPLATE_DATA, null, 2);
      navigator.clipboard.writeText(templateText).then(() => {
        copyBtn.textContent = '\u2713 Copied!';
        copyBtn.style.color = '#4ade80';
        setTimeout(() => {
          copyBtn.innerHTML = '\u2398 Copy Template';
          copyBtn.style.color = '';
        }, 1800);
      });
    });
  }
}

function openTemplateModal() {
  const modal = document.getElementById('recipe-template-modal');
  if (modal) modal.style.display = 'flex';
}

function closeTemplateModal() {
  const modal = document.getElementById('recipe-template-modal');
  if (modal) modal.style.display = 'none';
}


// ── HELPERS ────────────────────────────────────────────────────

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────────────────────────
// INDEX PANEL
// ─────────────────────────────────────────────────────────────

function initIndexPanel() {
  var toggleBtn = document.getElementById('index-toggle-btn');
  var panel     = document.getElementById('index-panel');
  var closeBtn  = document.getElementById('index-close-btn');
  var overlay   = document.getElementById('index-overlay');
  if (!toggleBtn || !panel) return;
  toggleBtn.addEventListener('click', function() { openIndex(); });
  if (closeBtn) closeBtn.addEventListener('click', function() { closeIndex(); });
  if (overlay)  overlay.addEventListener('click', function() { closeIndex(); });
  document.querySelectorAll('.index-tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.index-tab-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.index-section').forEach(function(s) { s.classList.remove('active'); });
      var sec = document.getElementById('index-sec-' + btn.dataset.sec);
      if (sec) sec.classList.add('active');
    });
  });
  var searchEl = document.getElementById('index-search');
  if (searchEl) searchEl.addEventListener('input', function() { filterIndex(searchEl.value.trim().toLowerCase()); });
  buildIndexContent();
}

function openIndex()  { var p=document.getElementById('index-panel'),o=document.getElementById('index-overlay'); if(p)p.classList.add('open'); if(o)o.classList.add('show'); }
function closeIndex() { var p=document.getElementById('index-panel'),o=document.getElementById('index-overlay'); if(p)p.classList.remove('open'); if(o)o.classList.remove('show'); }

var INDEX_EFFECTS = [
  {cat:'Damage',type:'Attack',desc:'Physical (AD) damage. Scales with attack_ratio x caster.attack.'},
  {cat:'Damage',type:'ApAttack',desc:'Magic (AP) damage. Scales with attack_ratio x caster.magic_power.'},
  {cat:'Damage',type:'FixedAttack',desc:'Fixed (true) damage, unaffected by resistance.'},
  {cat:'Heal/Shield',type:'Heal',desc:'Restore HP to target. heal_type: Caster / Any / Ally.'},
  {cat:'Heal/Shield',type:'Shield',desc:'Temporary shield that absorbs damage for tick ticks.'},
  {cat:'CC',type:'Stun',desc:'Disables target for duration ticks (hard CC).'},
  {cat:'CC',type:'Airborne',desc:'Knock-up: launch target into air (hard CC).'},
  {cat:'CC',type:'Knockback',desc:'Push target away at speed for tick ticks.'},
  {cat:'CC',type:'Grab',desc:'Pull target toward the caster.'},
  {cat:'CC',type:'Pull',desc:'Pull target toward effect origin for tick ticks.'},
  {cat:'CC',type:'Fear',desc:'Force target to flee for tick ticks.'},
  {cat:'CC',type:'Charm',desc:'Force target to approach caster for tick ticks.'},
  {cat:'CC',type:'Bind',desc:'Root target (no movement, can still attack) for duration ticks.'},
  {cat:'CC',type:'Taunt',desc:'Force target to attack caster for duration ticks.'},
  {cat:'CC',type:'BlockAttack',desc:'Silence basic attacks for tick ticks.'},
  {cat:'CC',type:'BlockSkill',desc:'Silence abilities for tick ticks.'},
  {cat:'CC',type:'BlockMoveSkill',desc:'Prevent movement abilities for tick ticks.'},
  {cat:'CC',type:'Invisible',desc:'Hide target from enemies for tick ticks.'},
  {cat:'CC',type:'Banish',desc:'Remove target temporarily (bubble effect).'},
  {cat:'Movement',type:'Rush',desc:'Dash caster to target, hitting along the way.'},
  {cat:'Movement',type:'RushTime',desc:'Dash caster for a fixed number of ticks.'},
  {cat:'Movement',type:'Teleport',desc:'Instantly move caster to target position.'},
  {cat:'Movement',type:'DirTeleport',desc:'Blink caster forward in input direction.'},
  {cat:'Movement',type:'MoveBack',desc:'Move caster away from target position.'},
  {cat:'Movement',type:'MoveTo',desc:'Move caster toward target, fire end_effects on arrival.'},
  {cat:'Movement',type:'MoveToTarget',desc:'Chase and track an entity target.'},
  {cat:'Movement',type:'RushMoveToBack',desc:'Dash behind the target.'},
  {cat:'Projectile',type:'LinearProjectile',desc:'Straight projectile from caster. penetrate=true pierces.'},
  {cat:'Projectile',type:'BackToCasterLinearProjectile',desc:'Straight projectile back to caster from a position.'},
  {cat:'Projectile',type:'TargetProjectile',desc:'Homing projectile that tracks a specific target.'},
  {cat:'Projectile',type:'TargetProjectileFromProjectile',desc:'Homing projectile spawned from inside another projectile.'},
  {cat:'Projectile',type:'TargetSplashProjectile',desc:'Homing projectile that bounces to nearby targets.'},
  {cat:'Projectile',type:'AutoTargetProjectile',desc:'Auto-aims homing projectile at nearest enemy.'},
  {cat:'Projectile',type:'RangeProjectile',desc:'Delayed AOE at a position (delay then apply ticks).'},
  {cat:'Projectile',type:'LineRangeProjectile',desc:'Delayed AOE in a line from caster.'},
  {cat:'Projectile',type:'RangePeriodProjectile',desc:'Stationary periodic AOE floor (DOT zone).'},
  {cat:'Projectile',type:'ApplyInProjectile',desc:'Invisible delayed area, optionally follows caster.'},
  {cat:'Projectile',type:'ParabolicProjectile',desc:'Arc/mortar projectile, arrives at travel_time ticks.'},
  {cat:'Area',type:'RangeEffect',desc:'Instant AOE: apply effects to all targets in shape.'},
  {cat:'Area',type:'ShrinkingBarrier',desc:'Shrinking circle that follows target and applies edge effects.'},
  {cat:'Buff',type:'AddBuff',desc:'Add a stat/status buff to the selected target.'},
  {cat:'Buff',type:'AddCasterBuff',desc:'Add a stat/status buff to the caster (self).'},
  {cat:'Buff',type:'RemoveCasterBuff',desc:'Remove a buff by name from the caster.'},
  {cat:'Buff',type:'AddCasted',desc:'Add periodic DOT to target (period/duration).'},
  {cat:'Logic',type:'Combine',desc:'Execute multiple effects simultaneously with same input.'},
  {cat:'Logic',type:'Delayed',desc:'Execute child effects after tick ticks.'},
  {cat:'Logic',type:'WithSelf',desc:'Execute child effects with caster as the target context.'},
  {cat:'Logic',type:'SwitchByBuff',desc:'Branch: if caster has buff_name -> effect_buff, else effect_none.'},
  {cat:'Logic',type:'SwitchByLevel3',desc:'Branch: before level 3 -> effect_start, at 3+ -> effect_level3.'},
  {cat:'Logic',type:'RandomTarget',desc:'Pick a random target in range and apply effects.'},
  {cat:'Visual',type:'ViewEffect',desc:'Fire a named visual at the target/input position.'},
  {cat:'Visual',type:'CasterViewEffect',desc:'Fire a named visual at the caster position.'},
  {cat:'Visual',type:'CasterAnimation',desc:'Add animation state to caster for tick ticks.'},
  {cat:'Visual',type:'RemoveCasterAnimation',desc:'Remove an animation state from caster by name.'},
  {cat:'Visual',type:'Sfx',desc:'Play named sound at caster position.'},
  {cat:'Visual',type:'TargetSfx',desc:'Play named sound at target/projectile position.'},
];

var INDEX_STATS = [
  {name:'hp',desc:'Health points. Tanks: 900+, carries: 600-800.'},
  {name:'attack',desc:'Physical attack. Used by Attack/FixedAttack via attack_ratio.'},
  {name:'magic_power',desc:'Magic power. Used by ApAttack via attack_ratio.'},
  {name:'defence',desc:'Physical resistance. Reduces AD damage received.'},
  {name:'magic_resistance',desc:'Magic resistance. Reduces AP damage received.'},
  {name:'move_speed',desc:'Movement speed. Typical range: 900-1200.'},
  {name:'hp_regen',desc:'HP regeneration per tick. Typical: 1-3.'},
  {name:'crit_chance',desc:'Critical hit chance (0-100%).'},
  {name:'stack',desc:'Generic stack counter for custom champion mechanics.'},
];

var INDEX_FIELDS = [
  {name:'damage',type:'number',desc:'Flat base damage before scaling.'},
  {name:'attack_ratio',type:'% number',desc:'% of attack/AP stat added to damage.'},
  {name:'hp_ratio',type:'% number',desc:'% of CASTER max HP added to damage.'},
  {name:'target_hp_ratio',type:'% number',desc:'% of TARGET max HP added to damage.'},
  {name:'amount',type:'number',desc:'Flat heal or shield value.'},
  {name:'ap_ratio',type:'% number',desc:'% of magic_power added to heal/shield.'},
  {name:'heal_type',type:'enum',desc:'Any | Caster | Ally'},
  {name:'duration',type:'ticks',desc:'CC duration (60 = 1 sec).'},
  {name:'tick',type:'ticks',desc:'Duration or wait time in ticks.'},
  {name:'period',type:'ticks',desc:'Interval between periodic effect fires.'},
  {name:'delay',type:'ticks',desc:'Wait before area activates.'},
  {name:'apply',type:'ticks',desc:'Window in which area applies effects.'},
  {name:'speed',type:'units/s',desc:'Projectile or dash speed.'},
  {name:'range',type:'units',desc:'Range (/ 1000 = approx tiles).'},
  {name:'penetrate',type:'bool',desc:'If true projectile pierces through targets.'},
  {name:'name',type:'string',desc:'Must match a visual binding name exactly.'},
  {name:'applied_target',type:'enum',desc:'Who the projectile/area hits (default: Ally!).'},
  {name:'shape',type:'Shape',desc:'Circle {radius} | Rect {width,height} | DirDot.'},
  {name:'buff_state',type:'object',desc:'Buff definition: name, duration, stat modifiers.'},
  {name:'buff_name',type:'string',desc:'Buff name to check (SwitchByBuff).'},
  {name:'casted_type',type:'enum',desc:'Fire | Bleed | Poison | Heal'},
  {name:'opacity',type:'0-1',desc:'Visual opacity.'},
  {name:'apply_type',type:'enum',desc:'AroundCaster | Forward (RangeEffect).'},
  {name:'only_to_enemy',type:'bool',desc:'Buff applied to caster only when target is enemy.'},
  {name:'travel_time',type:'ticks',desc:'How long ParabolicProjectile takes to arrive.'},
  {name:'follow_caster',type:'bool',desc:'Area follows caster (ApplyInProjectile).'},
];

var INDEX_VISUALS = [
  {cat:'view_effects',type:'Animation',desc:'Play once at target. Fields: anim, tag, z, is_follow.'},
  {cat:'view_effects',type:'LoopAnimation',desc:'Loop animation at target. Fields: anim, tag, z, is_follow.'},
  {cat:'view_projectiles',type:'Animated',desc:'Animated projectile (loops in flight). Fields: anim, tag, z, repeat.'},
  {cat:'view_projectiles',type:'Sprite',desc:'Static PNG projectile. Fields: sprite, z.'},
  {cat:'view_projectiles',type:'ThreePhase',desc:'Spawn/loop/remove phases. Fields: anim, pre_tag, loop_tag, remove_tag.'},
  {cat:'view_buffs',type:'Animated',desc:'Looping animation while buff is active. Fields: anim, tag, z.'},
  {cat:'view_buffs',type:'ThreePhase',desc:'Buff with spawn/loop/remove phases. Fields: anim, pre_tag, loop_tag, remove_tag, z.'},
];

function buildIndexContent() {
  buildIndexList(document.getElementById('index-effects-list'), INDEX_EFFECTS, true, false);
  buildIndexList(document.getElementById('index-stats-list'), INDEX_STATS, false, false);
  buildIndexList(document.getElementById('index-fields-list'), INDEX_FIELDS, false, true);
  buildIndexList(document.getElementById('index-visuals-list'), INDEX_VISUALS, true, false);
}

function buildIndexList(container, items, grouped, hasType) {
  if (!container) return;
  container.innerHTML = '';
  if (grouped) {
    var cats = [];
    items.forEach(function(i) { if (cats.indexOf(i.cat) === -1) cats.push(i.cat); });
    cats.forEach(function(cat) {
      var group = document.createElement('div');
      group.className = 'index-group';
      group.innerHTML = '<div class="index-group-label">' + cat + '</div>';
      items.filter(function(i) { return i.cat === cat; }).forEach(function(item) {
        group.appendChild(makeIndexRow(item, hasType));
      });
      container.appendChild(group);
    });
  } else {
    items.forEach(function(item) { container.appendChild(makeIndexRow(item, hasType)); });
  }
}

function makeIndexRow(item, hasType) {
  var row = document.createElement('div');
  row.className = 'index-row';
  var nameKey = item.type || item.name;
  var searchText = (nameKey + ' ' + (item.desc||'') + ' ' + (item.cat||'')).toLowerCase();
  row.dataset.search = searchText;
  row.innerHTML = '<span class="index-type">' + nameKey + '</span>'
    + (hasType ? '<span class="index-type-tag">' + (item.type||'') + '</span>' : '')
    + '<span class="index-desc">' + item.desc + '</span>';
  return row;
}

function filterIndex(q) {
  document.querySelectorAll('#index-panel .index-row').forEach(function(row) {
    row.style.display = (!q || (row.dataset.search||'').includes(q)) ? '' : 'none';
  });
  document.querySelectorAll('#index-panel .index-group').forEach(function(group) {
    var anyVisible = Array.from(group.querySelectorAll('.index-row')).some(function(r) { return r.style.display !== 'none'; });
    group.style.display = anyVisible ? '' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// CHAMPION SHEET
// ─────────────────────────────────────────────────────────────

var sheetAnimRequestId = null;
var sheetAnimImage = null;

function initSheet() {
  var btn = document.querySelector('[data-tab="sheet"]');
  if (btn) {
    btn.addEventListener('click', function() {
      setTimeout(function() {
        renderSheet();
        startSheetAnimations();
      }, 50);
    });
  }

  var refreshBtn = document.getElementById('btn-refresh-sheet');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      renderSheet();
      startSheetAnimations();
    });
  }

  // Stop animation if switching away to other tabs
  document.querySelectorAll('#sidebar .nav-item').forEach(function(b) {
    if (b.dataset.tab !== 'sheet') {
      b.addEventListener('click', stopSheetAnimations);
    }
  });
}

function startSheetAnimations() {
  if (sheetAnimRequestId) {
    cancelAnimationFrame(sheetAnimRequestId);
    sheetAnimRequestId = null;
  }
  if (!spriteImageData) return;

  sheetAnimImage = new Image();
  sheetAnimImage.onload = function() {
    tickSheetAnimations(performance.now());
  };
  sheetAnimImage.src = spriteImageData;
}

function stopSheetAnimations() {
  if (sheetAnimRequestId) {
    cancelAnimationFrame(sheetAnimRequestId);
    sheetAnimRequestId = null;
  }
}

function tickSheetAnimations(timestamp) {
  if (!sheetAnimImage || !sheetAnimImage.complete || !sheetAnimImage.width) {
    sheetAnimRequestId = requestAnimationFrame(tickSheetAnimations);
    return;
  }

  var fw = parseInt(state.sprite.frame_width) || 40;
  var fh = parseInt(state.sprite.frame_height) || 40;
  var layout = state.sprite.layout || 'horizontal';
  var imgW = sheetAnimImage.width;
  var cols = fw > 0 ? Math.floor(imgW / fw) : 1;

  var canvases = document.querySelectorAll('.sheet-anim-canvas');
  if (canvases.length === 0) {
    sheetAnimRequestId = requestAnimationFrame(tickSheetAnimations);
    return;
  }

  canvases.forEach(function(canvas) {
    var tag = canvas.dataset.tag;
    var range = state.sprite.anim_ranges.find(function(r) { return r.tag === tag; });
    if (!range) return;

    var from = parseInt(range.from) || 1;
    var to = parseInt(range.to) || 1;
    var totalFrames = to - from + 1;
    if (totalFrames <= 0) return;

    var duration = (parseFloat(range.duration) || 0.1) * 1000;
    var totalDuration = duration * totalFrames;

    var elapsed = timestamp % totalDuration;
    var currentFrameIdxInRange = Math.floor(elapsed / duration);
    var currentFrame = from + currentFrameIdxInRange;

    var idx = currentFrame - 1;
    var sx = 0;
    var sy = 0;

    if (layout === 'horizontal') {
      sx = idx * fw;
      sy = 0;
    } else if (layout === 'vertical') {
      sx = 0;
      sy = idx * fh;
    } else if (layout === 'grid') {
      var col = idx % cols;
      var row = Math.floor(idx / cols);
      sx = col * fw;
      sy = row * fh;
    }

    if (canvas.width !== fw || canvas.height !== fh) {
      canvas.width = fw;
      canvas.height = fh;
    }

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, fw, fh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sheetAnimImage, sx, sy, fw, fh, 0, 0, fw, fh);
  });

  sheetAnimRequestId = requestAnimationFrame(tickSheetAnimations);
}

function renderSheet() {
  var container = document.getElementById('sheet-content');
  if (!container) return;
  var champId   = getFullChampId() || '(id)';
  var champName = (state.i18n && state.i18n.en && state.i18n.en.name) || state.champion.name || champId;
  var LEVELS = 17;

  function statAt(key, lvl) { return (state.stats[key]||0) + (state.growth[key]||0) * lvl; }
  function fmtTicks(t) { return t ? (t/60).toFixed(1)+'s' : '\u2014'; }
  function fmtRange(r) { return r ? (r/1000).toFixed(1)+' tiles' : '\u2014'; }

  var tags = (state.champion.tags||[]).map(function(t) { return '<span class="sheet-tag">'+t+'</span>'; }).join('');

  var statDefs = [
    {label:'HP',key:'hp'},{label:'Attack',key:'attack'},{label:'Magic Power',key:'magic_power'},
    {label:'Defence',key:'defence'},{label:'Magic Resist',key:'magic_resistance'},
    {label:'Move Speed',key:'move_speed'},{label:'HP Regen',key:'hp_regen'},{label:'Crit Chance',key:'crit_chance'},
  ];
  var statRows = statDefs.map(function(r) {
    var g = state.growth[r.key] || 0;
    return '<tr><td>'+r.label+'</td><td>'+statAt(r.key,0).toFixed(1)+'</td><td>'+statAt(r.key,LEVELS).toFixed(1)+'</td><td class="sheet-growth">'+(g>0?'+'+g:'\u2014')+'/lvl</td></tr>';
  }).join('');

  var maxRange = 1;
  ['attack','skill','skill2','ult'].forEach(function(k) {
    var r = state.actions[k] && state.actions[k].range || 0;
    if (r > maxRange) maxRange = r;
  });

  function describeEffect(eff, depth) {
    depth = depth || 0;
    if (!eff || !eff.type) return '';
    var pad = Array(depth*2+1).join('\u00a0');
    var t = eff.type;
    var lines = [];

    if (t==='Attack') lines.push(pad+'\u2694 Physical: '+(eff.damage||0)+' + '+(eff.attack_ratio||0)+'% AD');
    else if (t==='ApAttack') lines.push(pad+'\u2728 Magic: '+(eff.damage||0)+' + '+(eff.attack_ratio||0)+'% AP');
    else if (t==='FixedAttack') lines.push(pad+'\u{1F4A5} Fixed: '+(eff.damage||0)+' + '+(eff.attack_ratio||0)+'%');
    else if (t==='Heal') lines.push(pad+'\u{1F49A} Heal '+(eff.amount||0)+' + '+(eff.ap_ratio||0)+'% AP ('+(eff.heal_type||'Any')+')');
    else if (t==='Shield') lines.push(pad+'\u{1F6E1} Shield '+(eff.amount||0)+' + '+(eff.ap_ratio||0)+'% AP for '+fmtTicks(eff.tick));
    else if (t==='Stun') lines.push(pad+'\u{1F6AB} Stun '+fmtTicks(eff.duration));
    else if (t==='Airborne') lines.push(pad+'\u{1F6AB} Knock-up '+fmtTicks(eff.duration||eff.tick));
    else if (t==='Knockback') lines.push(pad+'\u{1F4A8} Knockback speed:'+(eff.speed||0)+' for '+fmtTicks(eff.tick));
    else if (t==='Grab'||t==='Pull') lines.push(pad+'\u{1F9F2} '+t+' '+fmtTicks(eff.tick));
    else if (t==='Fear') lines.push(pad+'\u{1F47B} Fear '+fmtTicks(eff.tick));
    else if (t==='Charm') lines.push(pad+'\u{1F497} Charm '+fmtTicks(eff.tick));
    else if (t==='Bind') lines.push(pad+'\u26D3 Root '+fmtTicks(eff.duration));
    else if (t==='Taunt') lines.push(pad+'\u{1F621} Taunt '+fmtTicks(eff.duration));
    else if (t==='Invisible') lines.push(pad+'\u{1F47B} Invisible '+fmtTicks(eff.tick));
    else if (t==='Rush'||t==='RushTime') lines.push(pad+'\u26A1 Dash speed:'+(eff.speed||0)+' range:'+fmtRange(eff.range));
    else if (t==='Teleport'||t==='DirTeleport') lines.push(pad+'\u{1F300} Teleport '+fmtRange(eff.range));
    else if (t==='MoveBack') lines.push(pad+'\u21A9 Move Away speed:'+(eff.speed||0));
    else if (t==='LinearProjectile') lines.push(pad+'\u27A1 Linear Projectile speed:'+(eff.speed||0)+' range:'+fmtRange(eff.range)+(eff.penetrate?' (pierces)':''));
    else if (t==='TargetProjectile') lines.push(pad+'\u{1F3AF} Homing Projectile speed:'+(eff.speed||0));
    else if (t==='TargetSplashProjectile') lines.push(pad+'\u26A1 Chain Projectile speed:'+(eff.speed||0)+' bounce:'+fmtRange(eff.range));
    else if (t==='AutoTargetProjectile') lines.push(pad+'\u{1F3AF} Auto-Aim Projectile speed:'+(eff.speed||0));
    else if (t==='RangeProjectile') lines.push(pad+'\u{1F4A5} Delayed AOE delay:'+fmtTicks(eff.delay)+' apply:'+fmtTicks(eff.apply));
    else if (t==='LineRangeProjectile') lines.push(pad+'\u{1F4A5} Delayed Line AOE delay:'+fmtTicks(eff.delay)+' apply:'+fmtTicks(eff.apply));
    else if (t==='RangePeriodProjectile') lines.push(pad+'\u{1F4A5} Periodic Area every:'+fmtTicks(eff.period)+' for:'+fmtTicks(eff.tick));
    else if (t==='ParabolicProjectile') lines.push(pad+'\u{1F3AF} Arc/Mortar arrives in:'+fmtTicks(eff.travel_time));
    else if (t==='RangeEffect') {
      var r = (eff.shape&&eff.shape.Circle&&eff.shape.Circle.radius)||(eff.shape&&eff.shape.Rect&&eff.shape.Rect.width)||0;
      lines.push(pad+'\u{1F4A5} Instant AOE radius:'+fmtRange(r)+' ('+(eff.apply_type||'AroundCaster')+')');
    }
    else if (t==='AddBuff'||t==='AddCasterBuff') {
      var bs = eff.buff_state || {};
      var dur = bs.duration&&bs.duration.Time ? fmtTicks(bs.duration.Time.tick) : (bs.duration&&bs.duration.Permanent?'permanent':'?');
      lines.push(pad+'\u{1F4E6} Buff: "'+(bs.name||'?')+'" for '+dur);
      ['attack_mult','magic_power_mult','move_speed_mult','attack_speed_mult',
       'skill_cooldown_mult','damaged_reduce','vamp','damage_reflect','cc_immune','undying'].forEach(function(m) {
        if (bs[m]) lines.push(pad+'  \u00b7 '+m+': '+bs[m]);
      });
    }
    else if (t==='AddCasted') lines.push(pad+'\u{1F525} DOT ('+(eff.casted_type||'?')+') every:'+fmtTicks(eff.period)+' for:'+fmtTicks(eff.duration));
    else if (t==='ViewEffect'||t==='CasterViewEffect') lines.push(pad+'\u{1F3A6} Visual: "'+(eff.name||'?')+'"');
    else if (t==='Sfx'||t==='TargetSfx') lines.push(pad+'\u{1F50A} Sound: "'+(eff.name||'?')+'"');
    else if (t==='Combine') {
      lines.push(pad+'\u2795 Combine ('+(eff.effects||[]).length+' effects):');
      (eff.effects||[]).forEach(function(sub) { var d=describeEffect(sub.effect||sub,depth+1); if(d)lines.push(d); });
    }
    else if (t==='Delayed') {
      lines.push(pad+'\u23F3 After '+fmtTicks(eff.tick)+':');
      (eff.effects||[]).forEach(function(sub) { var d=describeEffect(sub.effect||sub,depth+1); if(d)lines.push(d); });
    }
    else if (t==='SwitchByBuff') {
      lines.push(pad+'\u{1F500} If has buff "'+(eff.buff_name||'?')+'": ');
      if (eff.effect_buff) { var d=describeEffect(eff.effect_buff.effect||eff.effect_buff,depth+1); if(d)lines.push(d); }
      lines.push(pad+'  else:');
      if (eff.effect_none) { var d2=describeEffect(eff.effect_none.effect||eff.effect_none,depth+1); if(d2)lines.push(d2); }
    }
    else if (t==='SwitchByLevel3') {
      lines.push(pad+'\u{1F500} If level < 3:');
      if (eff.effect_start) { var d=describeEffect(eff.effect_start.effect||eff.effect_start,depth+1); if(d)lines.push(d); }
      lines.push(pad+'  If level >= 3:');
      if (eff.effect_level3) { var d2=describeEffect(eff.effect_level3.effect||eff.effect_level3,depth+1); if(d2)lines.push(d2); }
    }
    else if (t==='RandomTarget') {
      lines.push(pad+'\u{1F3B2} Random target in '+fmtRange(eff.range)+':');
      (eff.effects||[]).forEach(function(sub) { var d=describeEffect(sub.effect||sub,depth+1); if(d)lines.push(d); });
    }
    else lines.push(pad+t);

    if (eff.applied_effects&&eff.applied_effects.length) {
      lines.push(pad+'  On Hit:');
      eff.applied_effects.forEach(function(sub) { var d=describeEffect(sub.effect||sub,depth+2); if(d)lines.push(d); });
    }
    if (eff.end_effects&&eff.end_effects.length) {
      lines.push(pad+'  On End:');
      eff.end_effects.forEach(function(sub) { var d=describeEffect(sub.effect||sub,depth+2); if(d)lines.push(d); });
    }
    return lines.filter(Boolean).join('\n');
  }

  var actionLabels = {attack:'\u2694\uFE0F Basic Attack',skill:'\u{1F535} Skill 1',skill2:'\u{1F7E3} Skill 2',ult:'\u2B50 Ultimate'};

  function rangeBar(range) {
    var pct = maxRange > 0 ? Math.min(100,(range/maxRange)*100) : 0;
    return '<div class="sheet-range-bar"><div class="sheet-range-fill" style="width:'+pct+'%"></div>'
      +'<span class="sheet-range-label">'+fmtRange(range)+'</span></div>';
  }

  var actionCards = ['attack','skill','skill2','ult'].map(function(slot) {
    var a = state.actions[slot];
    var eff = a.effect;
    var effDesc = describeEffect(eff&&(eff.effect||eff));

    // Check if sprite is loaded
    var avatarHtml = '';
    if (state.sprite && state.sprite.has_sprite && spriteImageData) {
      avatarHtml = '<canvas class="sheet-anim-canvas" data-tag="'+slot+'"></canvas>';
    } else {
      var slotEmojis = { attack: '\u2694\uFE0F', skill: '\u{1F535}', skill2: '\u{1F7E3}', ult: '\u2B50' };
      avatarHtml = '<div class="sheet-action-avatar-placeholder">'+(slotEmojis[slot]||'\u26A1')+'</div>';
    }

    return '<div class="sheet-action-card">'
      +'<div style="display: flex;">'
      +'<div class="sheet-action-avatar-col">'
      +'<div class="sheet-action-avatar">'
      +avatarHtml
      +'</div>'
      +'</div>'
      +'<div style="flex: 1; min-width: 0;">'
      +'<div class="sheet-action-header">'
      +'<span class="sheet-action-label">'+actionLabels[slot]+'</span>'
      +'<span class="sheet-action-name">'+a.action_name+'</span>'
      +'</div>'
      +'<div class="sheet-action-meta">'
      +'<span><b>Duration:</b> '+fmtTicks(a.duration)+'</span>'
      +'<span><b>Cooldown:</b> '+fmtTicks(a.cooltime)+'</span>'
      +'<span><b>Impact:</b> '+fmtTicks(a.start_timing)+'</span>'
      +'<span><b>Target:</b> '+a.casting_target+' ('+a.casting_type+')</span>'
      +'</div>'
      +'<div class="sheet-range-row"><b>Range:</b> '+rangeBar(a.range)+'</div>'
      +'<pre class="sheet-effect-desc">'+(effDesc||'(no effect configured)')+'</pre>'
      +'</div>'
      +'</div>'
      +'</div>';
  }).join('');

  var headerAvatarHtml = '';
  if (state.sprite && state.sprite.has_sprite && spriteImageData) {
    headerAvatarHtml = '<canvas class="sheet-anim-canvas" data-tag="idle"></canvas>';
  } else {
    headerAvatarHtml = '<div class="sheet-avatar-placeholder">\u{1F9EC}</div>';
  }

  var tipBoxHtml = '';
  if (!state.sprite || !state.sprite.has_sprite || !spriteImageData) {
    tipBoxHtml = '<div class="sheet-tip-box">'
      +'<span class="sheet-tip-icon">\u{1F4A1}</span>'
      +'<div class="sheet-tip-text">'
      +'<strong>Dica Visual:</strong> Envie uma spritesheet na aba <strong>Sprite Sheet</strong> para ver seu campe\u00e3o animado ao vivo aqui!'
      +'</div>'
      +'</div>';
  }

  var otherAnimCards = '';
  if (state.sprite && state.sprite.anim_ranges) {
    var excludedTags = ['idle', 'attack', 'skill', 'skill2', 'ult'];
    var otherRanges = state.sprite.anim_ranges.filter(function(r) {
      return excludedTags.indexOf(r.tag) === -1;
    });

    if (otherRanges.length > 0) {
      otherAnimCards = '<div class="sheet-section-title">State & Custom Animations</div>'
        + '<div class="sheet-other-anims-grid">'
        + otherRanges.map(function(r) {
            var avatarHtml = '';
            if (state.sprite && state.sprite.has_sprite && spriteImageData) {
              avatarHtml = '<canvas class="sheet-anim-canvas" data-tag="'+r.tag+'"></canvas>';
            } else {
              avatarHtml = '<div class="sheet-action-avatar-placeholder">\u{1F3AC}</div>';
            }

            return '<div class="sheet-action-card sheet-other-anim-card" style="margin-bottom: 0;">'
              +'<div style="display: flex; align-items: center;">'
              +'<div class="sheet-action-avatar-col">'
              +'<div class="sheet-action-avatar">'
              +avatarHtml
              +'</div>'
              +'</div>'
              +'<div style="flex: 1; min-width: 0; padding-left: 12px;">'
              +'<div class="sheet-action-header" style="margin-bottom: 4px; border-bottom: none; padding-bottom: 0;">'
              +'<span class="sheet-action-label" style="text-transform: capitalize; color: var(--accent); font-size: 13px;">' + r.tag + '</span>'
              +'</div>'
              +'<div class="sheet-action-meta" style="margin-bottom: 0; gap: 12px; display: flex; flex-wrap: wrap;">'
              +'<span><b>Frames:</b> ' + r.from + ' &rarr; ' + r.to + '</span>'
              +'<span><b>Speed:</b> ' + r.duration + 's</span>'
              +'</div>'
              +'</div>'
              +'</div>'
              +'</div>';
          }).join('')
        + '</div>';
    }
  }

  container.innerHTML =
    tipBoxHtml
    +'<div class="sheet-header-card">'
    +'<div class="sheet-header-avatar">'
    +headerAvatarHtml
    +'</div>'
    +'<div class="sheet-header-details">'
    +'<div class="sheet-champ-name">'+champName+'</div>'
    +'<div class="sheet-champ-meta">'+state.champion.category+' '+tags+'</div>'
    +'<div class="sheet-champ-id">'+champId+'</div>'
    +'</div>'
    +'</div>'
    +'<div class="sheet-section-title">Stats (Level 1 &rarr; 18)</div>'
    +'<div class="sheet-stats-card"><table class="sheet-stats-table">'
    +'<thead><tr><th>Stat</th><th>Lv 1</th><th>Lv 18</th><th>Growth</th></tr></thead>'
    +'<tbody>'+statRows+'</tbody></table></div>'
    +'<div class="sheet-section-title">Actions</div>'
    +actionCards
    +otherAnimCards;
}

// ── BOOT ───────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    initRecipes();
    initIndexPanel();
    initSheet();
  }, 60);
});
