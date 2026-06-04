/* ============================================================
   TFM2 Champion Creator — app.js
   Full application logic
   ============================================================ */

'use strict';

// ── CONSTANTS ────────────────────────────────────────────────

const STAT_FIELDS = [
  { key: 'hp', label: 'HP', baseDef: 650, growthDef: 75 },
  { key: 'attack', label: 'Attack', baseDef: 50, growthDef: 4 },
  { key: 'magic_power', label: 'Magic Power', baseDef: 0, growthDef: 0 },
  { key: 'defence', label: 'Defence', baseDef: 20, growthDef: 3 },
  { key: 'magic_resistance', label: 'Magic Resistance', baseDef: 20, growthDef: 2 },
  { key: 'move_speed', label: 'Move Speed', baseDef: 1050, growthDef: 0 },
  { key: 'hp_regen', label: 'HP Regen', baseDef: 3, growthDef: 1 },
  { key: 'crit_chance', label: 'Crit Chance (%)', baseDef: 0, growthDef: 0 },
  { key: 'stack', label: 'Stack', baseDef: 0, growthDef: 0 },
];

const CASTING_TYPES = ['Targeting', 'Position', 'Direction', 'None'];
const CASTING_TARGETS = [
  'Enemy', 'EnemyWithoutTower', 'EnemyChampion', 'EnemyChampionInCC',
  'EnemyChampionRecentlyAttacked',
  'Ally', 'AllyChampion', 'AllyChampionInCC', 'AllyNotSelf', 'AllyOnlySelf',
  'Both', 'BothWithoutTower', 'BothChampion', 'None'
];
const ATTACK_TYPES = ['BaseAttack', 'Skill', 'Dot', 'DotIgnoreShield', 'Item', 'Well'];
const CATEGORIES = ['Melee', 'Range', 'Magician', 'Util', 'Assassin'];
const TAGS = ['AD', 'AP', 'Heal', 'Shield', 'Dot', 'CC', 'Range', 'Melee', 'Tank', 'Magic'];

// All effect types available to data champions
const EFFECT_TYPES = {
  'Damage & Sustain': [
    'Attack', 'ApAttack', 'FixedAttack', 'Heal', 'Shield'
  ],
  'Crowd Control': [
    'Stun', 'Airborne', 'Knockback', 'Grab', 'Pull', 'Fear', 'Charm',
    'Bind', 'Taunt', 'BlockAttack', 'BlockSkill', 'BlockMoveSkill', 'Invisible', 'Banish'
  ],
  'Movement': [
    'Rush', 'RushTime', 'Teleport', 'DirTeleport', 'MoveBack', 'MoveTo', 'MoveToTarget', 'RushMoveToBack'
  ],
  'Projectiles': [
    'LinearProjectile', 'BackToCasterLinearProjectile', 'TargetProjectile',
    'TargetProjectileFromProjectile', 'TargetSplashProjectile', 'AutoTargetProjectile',
    'RangeProjectile', 'LineRangeProjectile', 'RangePeriodProjectile', 'ApplyInProjectile',
    'ParabolicProjectile'
  ],
  'Area & Barriers': [
    'RangeEffect', 'ShrinkingBarrier'
  ],
  'Buffs': [
    'AddBuff', 'AddCasterBuff', 'RemoveCasterBuff', 'AddCasted'
  ],
  'Composition': [
    'Combine', 'Delayed', 'WithSelf', 'SwitchByBuff', 'SwitchByLevel3', 'RandomTarget'
  ],
  'Visual & Audio': [
    'ViewEffect', 'CasterViewEffect', 'CasterAnimation', 'RemoveCasterAnimation', 'Sfx', 'TargetSfx'
  ],
};

// Default field sets for each effect type
const EFFECT_DEFAULTS = {
  Attack: { damage: 0, attack_ratio: 100, hp_ratio: 0, target_hp_ratio: 0, attack_effect_type: 'Target' },
  ApAttack: { damage: 0, attack_ratio: 100, hp_ratio: 0, attack_effect_type: 'Target' },
  FixedAttack: { damage: 0, attack_ratio: 0, hp_ratio: 0, target_hp_ratio: 0, attack_effect_type: 'Target' },
  Heal: { amount: 0, attack_ratio: 0, ap_ratio: 0, heal_type: 'Any' },
  Shield: { amount: 0, attack_ratio: 0, ap_ratio: 0, tick: 300 },
  Stun: { duration: 60 },
  Airborne: { duration: 45 },
  Knockback: { speed: 2000, tick: 10 },
  Grab: { speed: 3500, tick: 12 },
  Pull: { speed: 2500, tick: 15 },
  Fear: { tick: 90 },
  Charm: { tick: 90 },
  Bind: { duration: 90 },
  Taunt: { duration: 90 },
  BlockAttack: { tick: 90 },
  BlockSkill: { tick: 90 },
  BlockMoveSkill: { tick: 90 },
  Invisible: { tick: 120 },
  Banish: { duration: 120, lock_effect_name: '', end_effect_name: '' },
  Rush: { speed: 3500, range: 50000, move_speed_ratio: 0, casting_target: 'Enemy', penetrate: false },
  RushTime: { speed: 3500, tick: 30, range: 50000, casting_target: 'Enemy', penetrate: false },
  Teleport: {},
  DirTeleport: { moved: 32000 },
  MoveBack: { speed: 2500, tick: 12 },
  MoveTo: { speed: 3500, range: 50000 },
  MoveToTarget: { speed: 3500, range: 50000 },
  RushMoveToBack: { speed: 4500 },
  LinearProjectile: { penetrate: false, speed: 4200, range: 65000, name: '', shape: { Circle: { radius: 8000 } }, applied_target: 'Enemy' },
  BackToCasterLinearProjectile: { penetrate: true, speed: 4200, range: 65000, name: '', shape: { Circle: { radius: 8000 } }, applied_target: 'Enemy' },
  TargetProjectile: { speed: 4500, name: '', y_offset: 0, applied_target: 'Enemy' },
  TargetProjectileFromProjectile: { speed: 4500, name: '', y_offset: 0, applied_target: 'Enemy' },
  TargetSplashProjectile: { speed: 4500, name: '', range: 22000, y_offset: 0, applied_target: 'Enemy' },
  AutoTargetProjectile: { speed: 4500, range: 60000, name: '', y_offset: 0, applied_target: 'Enemy' },
  RangeProjectile: { name: '', delay: 30, apply: 60, shape: { Circle: { radius: 26000 } }, applied_target: 'Enemy' },
  LineRangeProjectile: { width: 8000, length: 70000, delay: 20, apply: 30, name: '', applied_target: 'Enemy' },
  RangePeriodProjectile: { name: '', tick: 180, period: 30, first_delay: 0, shape: { Circle: { radius: 26000 } }, applied_target: 'Enemy' },
  ApplyInProjectile: { name: '', follow_caster: true, tick: 45, shape: { Circle: { radius: 24000 } }, applied_target: 'Enemy' },
  ParabolicProjectile: { name: '', travel_time: 45, range: 70000, range_effect_name: '', shape: { Circle: { radius: 24000 } }, applied_target: 'Enemy' },
  RangeEffect: { shape: { Circle: { radius: 42000 } }, target: 'Enemy', apply_type: 'AroundCaster' },
  ShrinkingBarrier: { name: '', start_radius: 70000, end_radius: 16000, shrink_per_tick: 800, tick: 120, edge_thickness: 6000 },
  AddBuff: { buff_state: { name: '', duration: { Time: { tick: 180 } } } },
  AddCasterBuff: { only_to_enemy: false, buff_state: { name: '', duration: { Time: { tick: 180 } } } },
  RemoveCasterBuff: { name: '' },
  AddCasted: { duration: 180, period: 30, casted_type: 'Fire' },
  Combine: {},
  Delayed: { tick: 30 },
  WithSelf: {},
  SwitchByBuff: { buff_name: '' },
  SwitchByLevel3: {},
  RandomTarget: { range: 65000, casting_target: 'EnemyChampion', from_projectile: false },
  ViewEffect: { name: '' },
  CasterViewEffect: { name: '' },
  CasterAnimation: { name: '', tick: 30 },
  RemoveCasterAnimation: { name: '' },
  Sfx: { name: '' },
  TargetSfx: { name: '' },
};

// Effects that have nested child effects
const HAS_APPLIED_EFFECTS = new Set([
  'Rush', 'RushTime', 'MoveTo', 'MoveToTarget', 'RushMoveToBack',
  'LinearProjectile', 'BackToCasterLinearProjectile', 'TargetProjectile',
  'TargetProjectileFromProjectile', 'TargetSplashProjectile', 'AutoTargetProjectile',
  'RangeProjectile', 'LineRangeProjectile', 'RangePeriodProjectile', 'ApplyInProjectile',
  'ParabolicProjectile', 'ShrinkingBarrier', 'AddCasted',
]);
const HAS_EFFECTS_ARRAY = new Set([
  'Combine', 'Delayed', 'WithSelf', 'RandomTarget', 'RangeEffect',
]);
const HAS_END_EFFECTS = new Set([
  'LinearProjectile', 'BackToCasterLinearProjectile', 'MoveTo', 'MoveToTarget',
  'RangePeriodProjectile', 'ParabolicProjectile',
]);
const HAS_TWO_CHILD_EFFECTS = new Set(['SwitchByBuff', 'SwitchByLevel3']);
const HAS_SHAPE = new Set([
  'LinearProjectile', 'BackToCasterLinearProjectile', 'RangeProjectile',
  'RangePeriodProjectile', 'ApplyInProjectile', 'ParabolicProjectile', 'RangeEffect',
]);
const HAS_BUFF_STATE = new Set(['AddBuff', 'AddCasterBuff']);

// ── STATE ────────────────────────────────────────────────────

let state = buildDefaultState();

function buildDefaultState() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    mod: {
      id: '',
      name: '',
      author: '',
      version: '1.0.0',
      description: '',
      last_updated: today,
      base_version: '>=0.1.0',
    },
    champion: {
      id: '',
      name: '',
      category: 'Melee',
      tags: [],
      anim_prefix: '',
    },
    stats: Object.fromEntries(STAT_FIELDS.map(f => [f.key, f.baseDef])),
    growth: Object.fromEntries(STAT_FIELDS.map(f => [f.key, f.growthDef])),
    actions: {
      attack: buildDefaultAction('attack', 'BaseAttack'),
      skill: buildDefaultAction('skill', 'Skill'),
      skill2: buildDefaultAction('skill2', 'Skill'),
      ult: buildDefaultAction('ult', 'Skill'),
    },
    view_effects: [],
    view_projectiles: [],
    view_buffs: [],
    sprite: {
      has_sprite: false,
      sprite_name: '',
      frame_width: 40,
      frame_height: 40,
      layout: 'horizontal',
      frame_duration: 0.1,
      anim_ranges: [
        { tag: 'idle', from: 1, to: 4, duration: 0.12 },
        { tag: 'run', from: 5, to: 8, duration: 0.08 },
        { tag: 'attack', from: 9, to: 14, duration: 0.06 },
        { tag: 'skill', from: 15, to: 20, duration: 0.06 },
        { tag: 'skill2', from: 21, to: 26, duration: 0.06 },
        { tag: 'ult', from: 27, to: 32, duration: 0.06 },
        { tag: 'dead', from: 33, to: 36, duration: 0.12 },
      ],
      icons_mode: 'separate',
      skill_icon_source: '',
      skill_icon_tags: ['', '', ''],
      skill_icon_paths: ['', '', ''],
      sprite_image_data: null,
      separate_icons_data: [null, null, null],
      sheet_icon_data: null,
      sheet_icon_width: 0,
      sheet_icon_height: 0,
      sheet_icon_fw: 32,
      sheet_icon_fh: 32,
      sheet_icon_layout: 'horizontal',
      sheet_icon_frames: [1, 2, 3],
    },
    i18n: {
      en: { name: '', skill: '', skill2: '', ult: '', attack: '' },
      ko: { name: '', skill: '', skill2: '', ult: '', attack: '' },
    },
    importedI18n: null,  // raw merged i18n from imported file
    champion_view: { face_x: 0, face_y: -30, center_x: 0, center_y: -12 },
  };
}

function buildDefaultAction(name, type) {
  return {
    action_name: name,
    description: '',
    duration: name === 'attack' ? 18 : 24,
    cooltime: name === 'attack' ? 50 : name === 'ult' ? 900 : 240,
    start_timing: 10,
    cancelable: name === 'attack',
    range: name === 'attack' ? 14000 : 52000,
    growth_range: 0,
    casting_type: 'Targeting',
    casting_target: 'Enemy',
    attack_type: type,
    can_use_with_move: false,
    effect: null,
  };
}

// ── CURRENT ACTION TAB ───────────────────────────────────────

let currentAction = 'attack';
let currentLang = 'en';
let currentExportTab = null;
let spriteImageData = null;  // DataURL of loaded sprite

// ── BINDING ANIMATION STATE ─────────────────────────────────
let bindingAnimRAF = null;          // requestAnimationFrame handle
let bindingImages = new Map();      // key → HTMLImageElement cache for bindings
let openedSettings = new Set();     // keys of expanded animation-settings panels

// ── INIT ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initModInfo();
  initChampion();
  initStats();
  initActions();
  initVisuals();
  initSprite();
  initI18n();
  initChampionViewImport();
  initExport();
  initReset();
  initLoadModFolder();
  initStaticTooltips();
  updateModInfoPreview();
  setToday();
  refreshUITranslations();
});

function initStaticTooltips() {
  const map = {
    'mod_id': 'mod_id', 'mod_name': 'mod_name', 'mod_author': 'mod_author',
    'mod_version': 'mod_version', 'mod_description': 'mod_description',
    'mod_last_updated': 'mod_last_updated', 'mod_base_version': 'mod_base_version',
    'champ_id': 'champ_id', 'champ_name': 'champ_name',
    'champ_category': 'champ_category', 'champ_anim_prefix': 'champ_anim_prefix',
    'tag-picker': 'champ_tags', 'frame_width': 'sprite_frame_width',
    'frame_height': 'sprite_frame_height', 'sheet_layout': 'sprite_layout',
    'frame_duration': 'sprite_frame_duration', 'i18n-drop-area': 'i18n_import',
    'i18n-paste-btn': 'i18n_import',
  };
  Object.entries(map).forEach(([id, ttKey]) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('data-tooltip', ttKey);
  });
}

function setToday() {
  const d = document.getElementById('mod_last_updated');
  if (d && !d.value) d.value = state.mod.last_updated;
}

// ── NAVIGATION ───────────────────────────────────────────────

function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
      if (tab === 'export') renderExportList();
      if (tab === 'i18n') renderI18n();
      if (tab === 'visuals') {
        syncVisualBindingsFromActions();
        renderAllVisualBindings();
      }
    });
  });
}

// ── MOD INFO ─────────────────────────────────────────────────

function initModInfo() {
  const fields = ['mod_id', 'mod_name', 'mod_author', 'mod_version', 'mod_description', 'mod_last_updated', 'mod_base_version'];
  const map = {
    mod_id: 'id', mod_name: 'name', mod_author: 'author', mod_version: 'version',
    mod_description: 'description', mod_last_updated: 'last_updated', mod_base_version: 'base_version'
  };
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      state.mod[map[id]] = el.value.trim();
      updateModInfoPreview();
      syncChampAssetPath();
    });
  });
}

function updateModInfoPreview() {
  const p = document.getElementById('mod-info-preview');
  if (!p) return;
  p.textContent = JSON.stringify({
    name: state.mod.name || '(Mod Name)',
    mod_id: state.mod.id || '(mod_id)',
    author: state.mod.author || '(Author)',
    version: state.mod.version || '1.0.0',
    description: state.mod.description || '',
    last_updated: state.mod.last_updated || '',
    dependencies: [{ mod_id: 'base', version: state.mod.base_version || '>=0.1.0' }],
  }, null, 2);
}

// ── CHAMPION ─────────────────────────────────────────────────

function initChampion() {
  ['champ_id', 'champ_name', 'champ_anim_prefix'].forEach(id => {
    const el = document.getElementById(id);
    const key = id === 'champ_id' ? 'id' : id === 'champ_name' ? 'name' : 'anim_prefix';
    el.addEventListener('input', () => {
      state.champion[key] = el.value.trim();
      syncChampAssetPath();
      renderI18n();
    });
  });

  document.getElementById('champ_category').addEventListener('change', e => {
    state.champion.category = e.target.value;
  });

  document.querySelectorAll('#tag-picker .tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      btn.classList.toggle('active');
      state.champion.tags = [...document.querySelectorAll('#tag-picker .tag-btn.active')].map(b => b.dataset.tag);
    });
  });

  // champion_view offsets
  ['cv_face_x', 'cv_face_y', 'cv_center_x', 'cv_center_y'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const key = id.replace('cv_', '');
      state.champion_view[key] = parseInt(el.value) || 0;
    });
  });
}

function syncChampAssetPath() {
  const modId = state.mod.id || 'my_mod';
  const champId = state.champion.id || 'champion_id';
  const el = document.getElementById('champ-asset-path');
  if (el) el.textContent = `asset/${modId}/champion/${champId}`;
}

// ── STATS ─────────────────────────────────────────────────────

function initStats() {
  const tbody = document.getElementById('stats-tbody');
  tbody.innerHTML = '';
  STAT_FIELDS.forEach(f => {
    const tr = document.createElement('tr');
    const ttKey = `stat_${f.key}`;
    tr.innerHTML = `
      <td data-tooltip="${ttKey}" style="cursor:help">${f.label} <i class="help-icon" data-tooltip="${ttKey}">?</i></td>
      <td><input type="number" id="stat_${f.key}" value="${f.baseDef}" min="0" data-tooltip="${ttKey}" /></td>
      <td><input type="number" id="growth_${f.key}" value="${f.growthDef}" min="0" data-tooltip="${ttKey}" /></td>
    `;
    tbody.appendChild(tr);
    tbody.querySelector(`#stat_${f.key}`).addEventListener('input', e => {
      state.stats[f.key] = parseFloat(e.target.value) || 0;
    });
    tbody.querySelector(`#growth_${f.key}`).addEventListener('input', e => {
      state.growth[f.key] = parseFloat(e.target.value) || 0;
    });
  });
}

// ── ACTIONS & SKILLS ──────────────────────────────────────────

function initActions() {
  document.querySelectorAll('.action-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.action-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAction = btn.dataset.action;
      renderActionPanel(currentAction);
    });
  });
  // Render the initial panel
  renderAllActionPanels();
  document.querySelectorAll('.action-tab-btn')[0].click();
}

function renderAllActionPanels() {
  const container = document.getElementById('action-panels');
  container.innerHTML = '';
  ['attack', 'skill', 'skill2', 'ult'].forEach(name => {
    const div = document.createElement('div');
    div.className = 'action-panel';
    div.id = `action-panel-${name}`;
    container.appendChild(div);
  });
}

function renderActionPanel(name) {
  document.querySelectorAll('.action-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`action-panel-${name}`);
  panel.classList.add('active');
  const a = state.actions[name];

  panel.innerHTML = `
    <div class="action-card">
      <div class="action-card-title">Action Settings — ${name}</div>
      <div class="form-grid">
        <div class="form-group">
          <label>${labelWithHelp('Action Name', 'act_action_name')}</label>
          <input type="number" style="display:none" />
          <input type="text" id="act_name_${name}" value="${a.action_name}" placeholder="${name}" data-tooltip="act_action_name" />
          <small>Animation tag. Usually matches slot name.</small>
        </div>
        <div class="form-group">
          <label>${labelWithHelp('Duration (ticks)', 'act_duration')}</label>
          <input type="number" id="act_duration_${name}" value="${a.duration}" min="1" data-tooltip="act_duration" />
        </div>
        <div class="form-group">
          <label>${labelWithHelp('Cooldown (ticks)', 'act_cooltime')}</label>
          <input type="number" id="act_cooltime_${name}" value="${a.cooltime}" min="0" data-tooltip="act_cooltime" />
        </div>
        <div class="form-group">
          <label>${labelWithHelp('Start Timing (ticks)', 'act_start_timing')}</label>
          <input type="number" id="act_start_${name}" value="${a.start_timing}" min="0" data-tooltip="act_start_timing" />
          <small>Tick when effect fires.</small>
        </div>
        <div class="form-group">
          <label>${labelWithHelp('Range', 'act_range')}</label>
          <input type="number" id="act_range_${name}" value="${a.range}" min="0" data-tooltip="act_range" />
        </div>
        <div class="form-group">
          <label>${labelWithHelp('Growth Range (per level)', 'act_growth_range')}</label>
          <input type="number" id="act_growth_range_${name}" value="${a.growth_range}" min="0" data-tooltip="act_growth_range" />
        </div>
        <div class="form-group">
          <label>${labelWithHelp('Casting Type', 'act_casting_type')}</label>
          <select id="act_casting_type_${name}" data-tooltip="act_casting_type">
            ${CASTING_TYPES.map(t => `<option value="${t}" ${a.casting_type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>${labelWithHelp('Casting Target', 'act_casting_target')}</label>
          <select id="act_casting_target_${name}" data-tooltip="act_casting_target">
            ${CASTING_TARGETS.map(t => `<option value="${t}" ${a.casting_target === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>${labelWithHelp('Attack Type', 'act_attack_type')}</label>
          <select id="act_attack_type_${name}" data-tooltip="act_attack_type">
            ${ATTACK_TYPES.map(t => `<option value="${t}" ${a.attack_type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Options</label>
          <div style="display:flex;gap:14px;align-items:center;padding:9px 0">
            <label style="display:flex;align-items:center;gap:5px;text-transform:none;letter-spacing:0;color:var(--text-primary)" data-tooltip="act_cancelable">
              <input type="checkbox" id="act_cancelable_${name}" ${a.cancelable ? 'checked' : ''} style="width:auto;padding:0;border:none;background:none" />
              Cancelable
            </label>
            <label style="display:flex;align-items:center;gap:5px;text-transform:none;letter-spacing:0;color:var(--text-primary)" data-tooltip="act_can_use_with_move">
              <input type="checkbox" id="act_move_${name}" ${a.can_use_with_move ? 'checked' : ''} style="width:auto;padding:0;border:none;background:none" />
              Use while moving
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="action-card">
      <div class="action-card-title" style="display:flex;align-items:center;justify-content:space-between">
        <span>Effect &mdash; fires at start_timing</span>
        <div style="display:flex;gap:6px">
          <button class="btn-secondary btn-sm" id="btn-apply-recipe-${name}">&#x1F4D6; Apply Recipe</button>
          <button class="btn-secondary btn-sm" id="btn-save-recipe-${name}">&#x1F4BE; Save as Recipe</button>
        </div>
      </div>
      <div id="effect-builder-${name}"></div>
    </div>

    <div class="action-card" id="action-warnings-card-${name}" style="display:none; border-left: 4px solid #6be585; transition: border-left-color var(--trans);">
      <div class="action-card-title" style="display:flex;align-items:center;justify-content:space-between">
        <span>🛡️ Relatório de Integridade da Ação</span>
        <span id="action-warnings-badge-count-${name}" style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:var(--accent);color:#fff;display:none">0</span>
      </div>
      <div id="action-warnings-list-${name}" style="display:flex;flex-direction:column;gap:8px"></div>
    </div>
  `;

  // Bind action fields
  bindActionFields(name, a);

  // Render effect builder
  renderEffectBuilder(`effect-builder-${name}`, name, a, 'effect');

  // Recipe buttons
  const _applyBtn = document.getElementById(`btn-apply-recipe-${name}`);
  if (_applyBtn) _applyBtn.addEventListener('click', () => {
    if (typeof openRecipePicker === 'function') openRecipePicker(name, a);
  });
  const _saveBtn = document.getElementById(`btn-save-recipe-${name}`);
  if (_saveBtn) _saveBtn.addEventListener('click', () => {
    if (typeof openSaveRecipeModal === 'function') openSaveRecipeModal(name, a);
  });

  // Real-time Action Warnings check on load
  updateActionWarnings(name);
}

function bindActionFields(name, a) {
  const bind = (id, key, transform) => {
    const el = document.getElementById(`${id}_${name}`);
    if (!el) return;
    const update = () => {
      a[key] = transform ? transform(el.value) : el.value;
      updateActionWarnings(name);
    };
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  };
  bind('act_name', 'action_name');
  bind('act_duration', 'duration', v => parseInt(v) || 0);
  bind('act_cooltime', 'cooltime', v => parseInt(v) || 0);
  bind('act_start', 'start_timing', v => parseInt(v) || 0);
  bind('act_range', 'range', v => parseInt(v) || 0);
  bind('act_growth_range', 'growth_range', v => parseInt(v) || 0);
  bind('act_casting_type', 'casting_type');
  bind('act_casting_target', 'casting_target');
  bind('act_attack_type', 'attack_type');

  const cancelEl = document.getElementById(`act_cancelable_${name}`);
  if (cancelEl) cancelEl.addEventListener('change', () => {
    a.cancelable = cancelEl.checked;
    updateActionWarnings(name);
  });
  const moveEl = document.getElementById(`act_move_${name}`);
  if (moveEl) moveEl.addEventListener('change', () => {
    a.can_use_with_move = moveEl.checked;
    updateActionWarnings(name);
  });
}

// ——— EFFECT BUILDER —————————————————————————————————————————

function renderEffectBuilder(containerId, actionName, obj, fieldKey) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const effect = obj[fieldKey];

  container.innerHTML = '';

  const selectRow = document.createElement('div');
  selectRow.className = 'effect-select-area';

  // Group <select> with optgroups
  const allTypes = Object.entries(EFFECT_TYPES).map(([group, types]) =>
    `<optgroup label="${group}">${types.map(t => `<option value="${t}" ${effect && effect.type === t ? 'selected' : ''} data-tooltip="eff_${t}">${t}</option>`).join('')}</optgroup>`
  ).join('');

  selectRow.innerHTML = `
    <select id="effect-type-sel-${containerId}" style="flex:1" data-tooltip="${effect ? 'eff_' + effect.type : ''}">  
      <option value="">— Select an effect type —</option>
      ${allTypes}
    </select>
    <button class="btn-primary" id="effect-apply-btn-${containerId}" style="white-space:nowrap">Edit Effect</button>
  `;

  container.appendChild(selectRow);

  if (effect) {
    const preview = document.createElement('div');
    preview.className = 'effect-container';
    preview.id = `effect-preview-${containerId}`;
    container.appendChild(preview);
    renderEffectPreview(preview, effect, containerId, actionName, obj, fieldKey);
  }

  document.getElementById(`effect-apply-btn-${containerId}`).addEventListener('click', () => {
    const sel = document.getElementById(`effect-type-sel-${containerId}`);
    const type = sel.value;
    if (!type) return;
    openEffectModal(type, effect && effect.type === type ? effect : null, (newEffect) => {
      obj[fieldKey] = newEffect;
      renderEffectBuilder(containerId, actionName, obj, fieldKey);
      updateActionWarnings(actionName);
    });
  });
}

function renderEffectPreview(container, effect, containerId, actionName, obj, fieldKey) {
  container.innerHTML = '';
  if (!effect) return;

  const header = document.createElement('div');
  header.className = 'effect-header';
  header.innerHTML = `
    <div>
      <span class="effect-type-badge">${effect.type}</span>
      <div class="effect-summary">${getEffectSummary(effect)}</div>
    </div>
    <div class="effect-actions">
      <button class="btn-secondary btn-sm" id="edit-btn-${containerId}">\u{270D}\u{FE0F} Edit</button>
      <button class="btn-danger" id="clear-btn-${containerId}">\u{2716} Clear</button>
    </div>
  `;
  container.appendChild(header);

  const editBtn = header.querySelector(`#edit-btn-${containerId}`);
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      openEffectModal(effect.type, effect, (newEffect) => {
        obj[fieldKey] = newEffect;
        renderEffectBuilder(containerId, actionName, obj, fieldKey);
        updateActionWarnings(actionName);
      });
    });
  }

  const clearBtn = header.querySelector(`#clear-btn-${containerId}`);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      obj[fieldKey] = null;
      renderEffectBuilder(containerId, actionName, obj, fieldKey);
      updateActionWarnings(actionName);
    });
  }

  // Render sub-effects visually
  if (HAS_APPLIED_EFFECTS.has(effect.type) && effect.applied_effects && effect.applied_effects.length) {
    renderNestedEffects(container, 'applied_effects', effect.applied_effects, effect, containerId, actionName);
  }
  if (HAS_EFFECTS_ARRAY.has(effect.type) && effect.effects && effect.effects.length) {
    renderNestedEffects(container, 'effects', effect.effects, effect, containerId, actionName);
  }
  if (HAS_END_EFFECTS.has(effect.type) && effect.end_effects && effect.end_effects.length) {
    renderNestedEffects(container, 'end_effects', effect.end_effects, effect, containerId, actionName);
  }
  if (HAS_TWO_CHILD_EFFECTS.has(effect.type)) {
    renderTwoChildSlots(container, effect, containerId, actionName);
  }
  if (HAS_BUFF_STATE.has(effect.type) && effect.buff_state) {
    const bs = document.createElement('div');
    bs.style.marginTop = '8px';
    bs.innerHTML = `<div style="font-size:11px;color:var(--text-muted)">buff_state: <code>${effect.buff_state.name || '(unnamed)'}</code></div>`;
    container.appendChild(bs);
  }
}

function renderNestedEffects(container, label, list, parentEffect, parentContainerId, actionName) {
  const wrap = document.createElement('div');
  wrap.className = 'child-effects';
  wrap.innerHTML = `<div class="child-label">${label}</div>`;
  list.forEach((item, i) => {
    const eff = item.effect || item; // applied_effects use {effect,casting_type}; effects use raw
    const row = document.createElement('div');
    row.className = 'child-effect-slot';
    row.innerHTML = `<span class="effect-type-badge" style="font-size:10px">${eff.type || '?'}</span>
      <span style="font-size:11px;color:var(--text-muted);margin-left:8px">${getEffectSummary(eff)}</span>`;
    wrap.appendChild(row);
  });
  container.appendChild(wrap);
}

function renderTwoChildSlots(container, effect, containerId, actionName) {
  const isBuff = effect.type === 'SwitchByBuff';
  const labels = isBuff
    ? [['effect_none', 'When NO buff'], ['effect_buff', 'When HAS buff']]
    : [['effect_start', 'Before Level 3'], ['effect_level3', 'Level 3+']];

  const wrap = document.createElement('div');
  wrap.className = 'child-effects';
  labels.forEach(([key, title]) => {
    const child = effect[key];
    const slot = document.createElement('div');
    slot.className = 'child-effect-slot';
    slot.innerHTML = `<div class="child-label">${title}</div>
      <span class="effect-type-badge" style="font-size:10px">${child ? child.type : 'none'}</span>
      ${child ? `<span style="font-size:11px;color:var(--text-muted);margin-left:8px">${getEffectSummary(child)}</span>` : ''}`;
    wrap.appendChild(slot);
  });
  container.appendChild(wrap);
}

function getEffectSummary(effect) {
  if (!effect) return '';
  const e = effect;
  switch (e.type) {
    case 'Attack':
    case 'ApAttack':
    case 'FixedAttack': return `dmg=${e.damage || 0} ratio=${e.attack_ratio || 0}%`;
    case 'Heal': return `amount=${e.amount || 0} ap=${e.ap_ratio || 0}%`;
    case 'Shield': return `amount=${e.amount || 0} tick=${e.tick || 300}`;
    case 'Stun': case 'Airborne': case 'Bind': case 'Taunt': return `duration=${e.duration || 0}`;
    case 'Knockback': case 'Grab': case 'Pull': return `speed=${e.speed || 0} tick=${e.tick || 0}`;
    case 'Fear': case 'Charm': case 'Invisible': case 'BlockAttack': case 'BlockSkill': case 'BlockMoveSkill': return `tick=${e.tick || 0}`;
    case 'Rush': case 'RushTime': return `speed=${e.speed || 0} range=${e.range || 0}`;
    case 'DirTeleport': return `moved=${e.moved || 0}`;
    case 'MoveBack': return `speed=${e.speed || 0} tick=${e.tick || 0}`;
    case 'LinearProjectile': case 'BackToCasterLinearProjectile': return `"${e.name || ''}" speed=${e.speed || 0}`;
    case 'TargetProjectile': case 'AutoTargetProjectile': return `"${e.name || ''}" speed=${e.speed || 0}`;
    case 'RangeEffect': return `shape=${JSON.stringify(e.shape || {})} target=${e.target || '?'}`;
    case 'AddBuff': case 'AddCasterBuff': return e.buff_state ? `"${e.buff_state.name || ''}"` : '';
    case 'RemoveCasterBuff': return `"${e.name || ''}"`;
    case 'Combine': return `${(e.effects || []).length} effects`;
    case 'Delayed': return `tick=${e.tick || 0}`;
    case 'SwitchByBuff': return `buff="${e.buff_name || ''}"`;
    case 'ViewEffect': case 'CasterViewEffect': return `"${e.name || ''}"`;
    case 'Sfx': case 'TargetSfx': return `"${e.name || ''}"`;
    case 'AddCasted': return `${e.casted_type || 'Fire'} dur=${e.duration || 0} p=${e.period || 0}`;
    default: return '';
  }
}

// ── EFFECT MODAL ─────────────────────────────────────────────

let activeModalType = null;
let activeModalCurrent = null;
let activeModalCallback = null;
let modalStack = [];

function handleModalCloseOrCancel() {
  const modal = document.getElementById('effect-modal');
  if (modalStack.length > 0) {
    const parentSession = modalStack.pop();
    activeModalType = parentSession.type;
    activeModalCurrent = parentSession.current;
    activeModalCallback = parentSession.callback;
    
    document.getElementById('modal-title').textContent = `Edit Effect: ${activeModalType}`;
    renderModalBody(activeModalType, activeModalCurrent);
    setupModalSaveHandler();
  } else {
    modal.style.display = 'none';
    activeModalType = null;
    activeModalCurrent = null;
    activeModalCallback = null;
    modalStack = [];
  }
}

function setupModalSaveHandler() {
  document.getElementById('modal-save').onclick = () => {
    const result = collectModalValues(activeModalType, activeModalCurrent);
    
    // Validation: check for empty name field if name property exists
    if (result.hasOwnProperty('name') && typeof result.name === 'string' && result.name.trim() === '') {
      alert('Nome do Projétil/Efeito é obrigatório! / Projectile/Effect Name is required!');
      return;
    }
    
    // Validation: check for empty buff name
    if (result.buff_state && (!result.buff_state.name || result.buff_state.name.trim() === '')) {
      alert('Nome do Buff é obrigatório! / Buff Name is required!');
      return;
    }

    if (activeModalCallback) {
      activeModalCallback(result);
    }
    
    if (modalStack.length > 0) {
      const parentSession = modalStack.pop();
      activeModalType = parentSession.type;
      activeModalCurrent = parentSession.current;
      activeModalCallback = parentSession.callback;
      
      document.getElementById('modal-title').textContent = `Edit Effect: ${activeModalType}`;
      renderModalBody(activeModalType, activeModalCurrent);
      setupModalSaveHandler();
    } else {
      document.getElementById('effect-modal').style.display = 'none';
      activeModalType = null;
      activeModalCurrent = null;
      activeModalCallback = null;
      modalStack = [];
    }
  };
}

function openEffectModal(type, existing, callback) {
  const modal = document.getElementById('effect-modal');
  
  if (modal.style.display === 'flex' && activeModalType) {
    activeModalCurrent = collectModalValues(activeModalType, activeModalCurrent);
    modalStack.push({
      type: activeModalType,
      current: activeModalCurrent,
      callback: activeModalCallback
    });
  }

  activeModalType = type;
  activeModalCallback = callback;
  
  const defaults = EFFECT_DEFAULTS[type] || {};
  activeModalCurrent = existing && existing.type === type ? existing : { type, ...JSON.parse(JSON.stringify(defaults)) };

  document.getElementById('modal-title').textContent = `Edit Effect: ${type}`;
  modal.style.display = 'flex';
  renderModalBody(type, activeModalCurrent);
  setupModalSaveHandler();
}

document.getElementById('modal-close-btn').addEventListener('click', () => {
  handleModalCloseOrCancel();
});
document.getElementById('modal-cancel').addEventListener('click', () => {
  handleModalCloseOrCancel();
});
document.getElementById('effect-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) handleModalCloseOrCancel();
});

function renderModalBody(type, current) {
  const body = document.getElementById('modal-body');
  body.innerHTML = '';

  const fields = getEffectFields(type, current);
  if (fields.length === 0 && !HAS_APPLIED_EFFECTS.has(type) && !HAS_EFFECTS_ARRAY.has(type) && !HAS_TWO_CHILD_EFFECTS.has(type) && !HAS_BUFF_STATE.has(type)) {
    body.innerHTML = '<p style="color:var(--text-muted)">This effect has no configurable fields.</p>';
    return;
  }

  // Render fields
  if (fields.length) {
    const grid = document.createElement('div');
    grid.className = 'form-grid';
    fields.forEach(f => {
      const grp = buildModalField(f, current);
      grid.appendChild(grp);
    });
    body.appendChild(grid);
  }

  // Opacity (for effects that trigger visuals)
  if (['ViewEffect', 'CasterViewEffect'].includes(type)) {
    const grp = document.createElement('div');
    grp.className = 'form-group';
    grp.innerHTML = `<label>Opacity (0.0 – 1.0)</label>
      <input type="number" id="modal_opacity" step="0.05" min="0" max="1" value="${current.opacity !== undefined ? current.opacity : 1}" />
      <small>Visual opacity of the effect. 1.0 = fully opaque.</small>`;
    body.appendChild(grp);
  }

  // Shape
  if (HAS_SHAPE.has(type)) {
    body.appendChild(buildShapeEditor(current));
  }

  // buff_state
  if (HAS_BUFF_STATE.has(type)) {
    body.appendChild(buildBuffStateEditor(current.buff_state || {}));
  }

  // applied_effects / effects / end_effects list editors
  if (HAS_APPLIED_EFFECTS.has(type)) {
    body.appendChild(buildEffectListEditor('applied_effects', current, 'Applied Effects', true));
  }
  if (HAS_EFFECTS_ARRAY.has(type)) {
    body.appendChild(buildEffectListEditor('effects', current, 'Effects', false));
  }
  if (HAS_END_EFFECTS.has(type)) {
    body.appendChild(buildEffectListEditor('end_effects', current, 'End Effects', type === 'RangePeriodProjectile'));
  }

  // SwitchByBuff / SwitchByLevel3 child slots
  if (HAS_TWO_CHILD_EFFECTS.has(type)) {
    body.appendChild(buildTwoChildEditor(type, current));
  }
}

function getEffectFields(type, current) {
  switch (type) {
    case 'Attack':
      return [
        { key: 'damage', label: 'Flat Damage', type: 'number' },
        { key: 'attack_ratio', label: 'Attack Ratio (%)', type: 'number' },
        { key: 'hp_ratio', label: 'HP Ratio (%)', type: 'number' },
        { key: 'target_hp_ratio', label: 'Target HP Ratio (%)', type: 'number' },
        { key: 'attack_effect_type', label: 'Effect Type', type: 'select', opts: ['Target', 'EnemyTarget'] },
      ];
    case 'ApAttack':
      return [
        { key: 'damage', label: 'Flat Damage', type: 'number' },
        { key: 'attack_ratio', label: 'AP Ratio (%)', type: 'number' },
        { key: 'hp_ratio', label: 'HP Ratio (%)', type: 'number' },
        { key: 'attack_effect_type', label: 'Effect Type', type: 'select', opts: ['Target', 'EnemyTarget'] },
      ];
    case 'FixedAttack':
      return [
        { key: 'damage', label: 'Flat Damage', type: 'number' },
        { key: 'attack_ratio', label: 'Attack Ratio (%)', type: 'number' },
        { key: 'hp_ratio', label: 'HP Ratio (%)', type: 'number' },
        { key: 'target_hp_ratio', label: 'Target HP Ratio (%)', type: 'number' },
        { key: 'attack_effect_type', label: 'Effect Type', type: 'select', opts: ['Target', 'EnemyTarget'] },
      ];
    case 'Heal':
      return [
        { key: 'amount', label: 'Flat Heal', type: 'number' },
        { key: 'attack_ratio', label: 'Attack Ratio (%)', type: 'number' },
        { key: 'ap_ratio', label: 'AP Ratio (%)', type: 'number' },
        { key: 'heal_type', label: 'Heal Type', type: 'select', opts: ['Any', 'Caster', 'Ally'] },
      ];
    case 'Shield':
      return [
        { key: 'amount', label: 'Flat Shield', type: 'number' },
        { key: 'attack_ratio', label: 'Attack Ratio (%)', type: 'number' },
        { key: 'ap_ratio', label: 'AP Ratio (%)', type: 'number' },
        { key: 'tick', label: 'Duration (ticks)', type: 'number' },
      ];
    case 'Stun': case 'Airborne': case 'Bind': case 'Taunt':
      return [{ key: 'duration', label: 'Duration (ticks)', type: 'number' }];
    case 'Knockback': case 'Grab': case 'Pull':
      return [{ key: 'speed', label: 'Speed', type: 'number' }, { key: 'tick', label: 'Ticks', type: 'number' }];
    case 'Fear': case 'Charm': case 'Invisible':
    case 'BlockAttack': case 'BlockSkill': case 'BlockMoveSkill':
      return [{ key: 'tick', label: 'Duration (ticks)', type: 'number' }];
    case 'Banish':
      return [
        { key: 'duration', label: 'Duration (ticks)', type: 'number' },
        { key: 'lock_effect_name', label: 'Lock Effect Name', type: 'text' },
        { key: 'end_effect_name', label: 'End Effect Name', type: 'text' },
      ];
    case 'Rush':
      return [
        { key: 'speed', label: 'Speed', type: 'number' },
        { key: 'range', label: 'Range', type: 'number' },
        { key: 'move_speed_ratio', label: 'Move Speed Ratio (%)', type: 'number' },
        { key: 'casting_target', label: 'Casting Target', type: 'select', opts: CASTING_TARGETS },
        { key: 'penetrate', label: 'Penetrate', type: 'bool' },
      ];
    case 'RushTime':
      return [
        { key: 'speed', label: 'Speed', type: 'number' },
        { key: 'tick', label: 'Duration (ticks)', type: 'number' },
        { key: 'range', label: 'Range', type: 'number' },
        { key: 'casting_target', label: 'Casting Target', type: 'select', opts: CASTING_TARGETS },
        { key: 'penetrate', label: 'Penetrate', type: 'bool' },
      ];
    case 'DirTeleport':
      return [{ key: 'moved', label: 'Distance (moved)', type: 'number' }];
    case 'MoveBack':
      return [{ key: 'speed', label: 'Speed', type: 'number' }, { key: 'tick', label: 'Ticks', type: 'number' }];
    case 'MoveTo': case 'MoveToTarget':
      return [{ key: 'speed', label: 'Speed', type: 'number' }, { key: 'range', label: 'Range', type: 'number' }];
    case 'RushMoveToBack':
      return [{ key: 'speed', label: 'Speed', type: 'number' }];
    case 'LinearProjectile': case 'BackToCasterLinearProjectile':
      return [
        { key: 'name', label: 'Projectile Name', type: 'text' },
        { key: 'speed', label: 'Speed', type: 'number' },
        { key: 'range', label: 'Range', type: 'number' },
        { key: 'applied_target', label: 'Applied Target', type: 'select', opts: CASTING_TARGETS },
        { key: 'penetrate', label: 'Penetrate', type: 'bool' },
      ];
    case 'TargetProjectile': case 'TargetProjectileFromProjectile':
      return [
        { key: 'name', label: 'Projectile Name', type: 'text' },
        { key: 'speed', label: 'Speed', type: 'number' },
        { key: 'y_offset', label: 'Y Offset', type: 'number' },
        { key: 'applied_target', label: 'Applied Target', type: 'select', opts: CASTING_TARGETS },
      ];
    case 'TargetSplashProjectile':
      return [
        { key: 'name', label: 'Projectile Name', type: 'text' },
        { key: 'speed', label: 'Speed', type: 'number' },
        { key: 'range', label: 'Splash Range', type: 'number' },
        { key: 'y_offset', label: 'Y Offset', type: 'number' },
        { key: 'applied_target', label: 'Applied Target', type: 'select', opts: CASTING_TARGETS },
      ];
    case 'AutoTargetProjectile':
      return [
        { key: 'name', label: 'Projectile Name', type: 'text' },
        { key: 'speed', label: 'Speed', type: 'number' },
        { key: 'range', label: 'Target Range', type: 'number' },
        { key: 'y_offset', label: 'Y Offset', type: 'number' },
        { key: 'applied_target', label: 'Applied Target', type: 'select', opts: CASTING_TARGETS },
      ];
    case 'RangeProjectile':
      return [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'delay', label: 'Delay (ticks)', type: 'number' },
        { key: 'apply', label: 'Apply Duration (ticks)', type: 'number' },
        { key: 'applied_target', label: 'Applied Target', type: 'select', opts: CASTING_TARGETS },
      ];
    case 'LineRangeProjectile':
      return [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'width', label: 'Width', type: 'number' },
        { key: 'length', label: 'Length', type: 'number' },
        { key: 'delay', label: 'Delay (ticks)', type: 'number' },
        { key: 'apply', label: 'Apply Duration (ticks)', type: 'number' },
        { key: 'applied_target', label: 'Applied Target', type: 'select', opts: CASTING_TARGETS },
      ];
    case 'RangePeriodProjectile':
      return [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'tick', label: 'Total Duration (ticks)', type: 'number' },
        { key: 'period', label: 'Period (ticks)', type: 'number' },
        { key: 'first_delay', label: 'First Delay', type: 'number' },
        { key: 'applied_target', label: 'Applied Target', type: 'select', opts: CASTING_TARGETS },
      ];
    case 'ApplyInProjectile':
      return [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'tick', label: 'Delay (ticks)', type: 'number' },
        { key: 'follow_caster', label: 'Follow Caster', type: 'bool' },
        { key: 'applied_target', label: 'Applied Target', type: 'select', opts: CASTING_TARGETS },
      ];
    case 'ParabolicProjectile':
      return [
        { key: 'name', label: 'Projectile Name', type: 'text' },
        { key: 'travel_time', label: 'Travel Time (ticks)', type: 'number' },
        { key: 'range', label: 'Range', type: 'number' },
        { key: 'range_effect_name', label: 'Range Effect Name', type: 'text' },
        { key: 'applied_target', label: 'Applied Target', type: 'select', opts: CASTING_TARGETS },
      ];
    case 'RangeEffect':
      return [
        { key: 'target', label: 'Target', type: 'select', opts: CASTING_TARGETS },
        { key: 'apply_type', label: 'Apply Type', type: 'select', opts: ['AroundCaster', 'Forward'] },
        { key: 'apply_type_offset', label: 'Forward Offset (if Forward)', type: 'number' },
      ];
    case 'ShrinkingBarrier':
      return [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'start_radius', label: 'Start Radius', type: 'number' },
        { key: 'end_radius', label: 'End Radius', type: 'number' },
        { key: 'shrink_per_tick', label: 'Shrink Per Tick', type: 'number' },
        { key: 'tick', label: 'Duration (ticks)', type: 'number' },
        { key: 'edge_thickness', label: 'Edge Thickness', type: 'number' },
      ];
    case 'AddCasted':
      return [
        { key: 'duration', label: 'Duration (ticks)', type: 'number' },
        { key: 'period', label: 'Period (ticks)', type: 'number' },
        { key: 'casted_type', label: 'Casted Type', type: 'select', opts: ['Fire', 'Bleed', 'Poison', 'Heal'] },
      ];
    case 'Delayed':
      return [{ key: 'tick', label: 'Delay (ticks)', type: 'number' }];
    case 'CasterAnimation':
      return [{ key: 'name', label: 'Animation Name', type: 'text' }, { key: 'tick', label: 'Duration (ticks)', type: 'number' }];
    case 'RemoveCasterAnimation': case 'RemoveCasterBuff':
      return [{ key: 'name', label: 'Name', type: 'text' }];
    case 'ViewEffect': case 'CasterViewEffect': case 'Sfx': case 'TargetSfx':
      return [{ key: 'name', label: 'Name', type: 'text' }];
    case 'SwitchByBuff':
      return [{ key: 'buff_name', label: 'Buff Name', type: 'text' }];
    case 'RandomTarget':
      return [
        { key: 'range', label: 'Range', type: 'number' },
        { key: 'casting_target', label: 'Casting Target', type: 'select', opts: CASTING_TARGETS },
        { key: 'from_projectile', label: 'From Projectile', type: 'bool' },
      ];
    case 'AddBuff':
    case 'AddCasterBuff':
      if (type === 'AddCasterBuff') {
        return [{ key: 'only_to_enemy', label: 'Only to Enemy', type: 'bool' }];
      }
      return [];
    default: return [];
  }
}

function buildModalField(f, current) {
  const grp = document.createElement('div');
  grp.className = 'form-group';
  const val = current[f.key] !== undefined ? current[f.key] : '';
  // Map field key to tooltip key
  const ttKey = `field_${f.key}` in (window.TOOLTIPS || {}) ? `field_${f.key}` : '';
  const labelHtml = ttKey ? labelWithHelp(f.label, ttKey) : f.label;

  if (f.type === 'bool') {
    grp.innerHTML = `<label>${labelHtml}</label>
      <label style="display:flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0;color:var(--text-primary);padding:8px 0" data-tooltip="${ttKey}">
        <input type="checkbox" id="modal_${f.key}" ${val ? 'checked' : ''} style="width:auto;padding:0;border:none;background:none" />
        ${f.label}
      </label>`;
  } else if (f.type === 'select') {
    grp.innerHTML = `<label>${labelHtml}</label>
      <select id="modal_${f.key}" data-tooltip="${ttKey}">
        ${f.opts.map(o => `<option value="${o}" ${String(val) === String(o) ? 'selected' : ''}>${o}</option>`).join('')}
      </select>`;
  } else {
    grp.innerHTML = `<label>${labelHtml}</label>
      <input type="${f.type === 'number' ? 'number' : 'text'}" id="modal_${f.key}" value="${val}" data-tooltip="${ttKey}" />`;
  }
  return grp;
}

function buildShapeEditor(current) {
  const wrap = document.createElement('div');
  wrap.style.marginTop = '14px';
  const shape = current.shape || { Circle: { radius: 10000 } };
  const shapeType = Object.keys(shape)[0] || 'Circle';
  const shapeVal = shape[shapeType] || {};

  wrap.innerHTML = `
    <div class="separator"></div>
    <label style="font-size:12px;font-weight:700;color:var(--text-sec);text-transform:uppercase;letter-spacing:.5px">Shape</label>
    <div class="form-grid" style="margin-top:8px">
      <div class="form-group">
        <label>Shape Type</label>
        <select id="modal_shape_type">
          <option value="Circle" ${shapeType === 'Circle' ? 'selected' : ''}>Circle</option>
          <option value="Rect" ${shapeType === 'Rect' ? 'selected' : ''}>Rect</option>
          <option value="DirDot" ${shapeType === 'DirDot' ? 'selected' : ''}>DirDot</option>
        </select>
      </div>
      <div id="shape-fields">
        ${renderShapeFields(shapeType, shapeVal)}
      </div>
    </div>
  `;

  setTimeout(() => {
    const sel = wrap.querySelector('#modal_shape_type');
    if (sel) sel.addEventListener('change', () => {
      const sf = wrap.querySelector('#shape-fields');
      if (sf) sf.innerHTML = renderShapeFields(sel.value, {});
    });
  }, 0);

  return wrap;
}

function renderShapeFields(type, val) {
  if (type === 'Circle') return `<div class="form-group"><label>Radius</label><input type="number" id="modal_shape_radius" value="${val.radius || 10000}" /></div>`;
  if (type === 'Rect') return `<div class="form-group"><label>Width</label><input type="number" id="modal_shape_width" value="${val.width || 12000}" /></div>
    <div class="form-group"><label>Height</label><input type="number" id="modal_shape_height" value="${val.height || 8000}" /></div>`;
  if (type === 'DirDot') return `<div class="form-group"><label>Radius</label><input type="number" id="modal_shape_radius" value="${val.radius || 8000}" /></div>
    <div class="form-group"><label>Range</label><input type="number" id="modal_shape_range" value="${val.range || 700}" /></div>`;
  return '';
}

function buildBuffStateEditor(bs) {
  const BUFF_STATS = [
    'attack', 'attack_mult', 'magic_power', 'magic_power_mult',
    'defence', 'defence_mult', 'hp', 'hp_mult', 'hp_regen',
    'magic_resistance', 'magic_resistance_mult', 'move_speed_mult',
    'attack_speed_mult', 'skill_cooldown_mult', 'ult_cooldown_mult',
    'damaged_amplify', 'damaged_reduce', 'dot_amplify',
    'base_attack_enemy_max_hp_damage', 'skill_enemy_max_hp_damage',
    'self_max_hp_damage', 'base_attack_damaged_reduce', 'skill_damaged_reduce',
    'defence_penetration', 'magic_resistance_penetration',
    'range', 'heal_reduce', 'toughness', 'crit_chance', 'radius_mult', 'vamp', 'damage_reflect',
  ];

  const wrap = document.createElement('div');
  wrap.style.marginTop = '14px';
  wrap.innerHTML = `
    <div class="separator"></div>
    <label style="font-size:12px;font-weight:700;color:var(--text-sec);text-transform:uppercase;letter-spacing:.5px">Buff State</label>
    <div class="form-grid" style="margin-top:8px">
      <div class="form-group">
        <label>Buff Name <span class="req">*</span></label>
        <input type="text" id="modal_bs_name" value="${bs.name || ''}" placeholder="my_buff" />
      </div>
      <div class="form-group">
        <label>Duration Type</label>
        <select id="modal_bs_duration_type">
          <option value="Permanent" ${!bs.duration || bs.duration === 'Permanent' ? 'selected' : ''}>Permanent</option>
          <option value="Time" ${bs.duration && bs.duration.Time ? 'selected' : ''}>Time (ticks)</option>
          <option value="WithShield" ${bs.duration === 'WithShield' ? 'selected' : ''}>WithShield</option>
        </select>
      </div>
      <div class="form-group" id="modal_bs_tick_grp" style="${bs.duration && bs.duration.Time ? '' : 'display:none'}">
        <label>Duration (ticks)</label>
        <input type="number" id="modal_bs_tick" value="${bs.duration && bs.duration.Time ? bs.duration.Time.tick : 180}" />
      </div>
    </div>
    <div style="columns:2;column-gap:14px;margin-top:10px">
      ${BUFF_STATS.map(s => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);break-inside:avoid">
          <label style="font-size:11px;text-transform:none;letter-spacing:0;color:var(--text-sec)">${s}</label>
          <input type="number" id="modal_bs_${s}" value="${bs[s] || 0}" style="width:80px;text-align:right" />
        </div>
      `).join('')}
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);break-inside:avoid">
        <label style="font-size:11px;text-transform:none;letter-spacing:0;color:var(--text-sec)">cc_immune</label>
        <input type="checkbox" id="modal_bs_cc_immune" ${bs.cc_immune ? 'checked' : ''} style="width:auto;padding:0;border:none;background:none" />
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);break-inside:avoid">
        <label style="font-size:11px;text-transform:none;letter-spacing:0;color:var(--text-sec)">undying</label>
        <input type="checkbox" id="modal_bs_undying" ${bs.undying ? 'checked' : ''} style="width:auto;padding:0;border:none;background:none" />
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);break-inside:avoid">
        <label style="font-size:11px;text-transform:none;letter-spacing:0;color:var(--text-sec)">ignore_wall</label>
        <input type="checkbox" id="modal_bs_ignore_wall" ${bs.ignore_wall ? 'checked' : ''} style="width:auto;padding:0;border:none;background:none" />
      </div>
    </div>
  `;

  setTimeout(() => {
    const dtype = wrap.querySelector('#modal_bs_duration_type');
    const tgrp = wrap.querySelector('#modal_bs_tick_grp');
    if (dtype && tgrp) dtype.addEventListener('change', () => {
      tgrp.style.display = dtype.value === 'Time' ? '' : 'none';
    });
  }, 0);

  return wrap;
}

function buildEffectListEditor(listKey, current, title, useAppliedFormat) {
  if (!current[listKey]) current[listKey] = [];
  const list = current[listKey];

  const wrap = document.createElement('div');
  wrap.style.marginTop = '14px';
  const id = `elist-${listKey}-${Date.now()}`;
  wrap.innerHTML = `
    <div class="separator"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <label style="font-size:12px;font-weight:700;color:var(--text-sec);text-transform:uppercase;letter-spacing:.5px">${title}</label>
      <button class="btn-add" id="${id}-add">+ Add Effect</button>
    </div>
    <div id="${id}-list" style="display:flex;flex-direction:column;gap:6px"></div>
  `;

  const renderList = () => {
    const ul = wrap.querySelector(`#${id}-list`);
    ul.innerHTML = '';
    list.forEach((item, i) => {
      const eff = useAppliedFormat ? (item.effect || item) : item;
      const div = document.createElement('div');
      div.style.cssText = 'background:var(--bg-hover);border:1px solid var(--border);border-radius:6px;padding:10px;display:flex;align-items:center;gap:10px';
      div.innerHTML = `
        <span class="effect-type-badge" style="font-size:11px">${eff.type || '?'}</span>
        <span style="flex:1;font-size:11px;color:var(--text-muted)">${getEffectSummary(eff)}</span>
        ${useAppliedFormat ? `
        <label style="font-size:11px;color:var(--text-sec);text-transform:none;display:flex;align-items:center;gap:4px">
          <select id="${id}-ct-${i}" style="font-size:11px;padding:4px">
            ${CASTING_TYPES.map(t => `<option value="${t}" ${(item.casting_type || 'Targeting') === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </label>` : ''}
        <button class="btn-secondary btn-sm" id="${id}-edit-${i}">Edit</button>
        <button class="btn-danger" id="${id}-rm-${i}">\u{2716}</button>
      `;
      ul.appendChild(div);

      if (useAppliedFormat) {
        div.querySelector(`#${id}-ct-${i}`).addEventListener('change', e => {
          list[i].casting_type = e.target.value;
        });
      }

      div.querySelector(`#${id}-edit-${i}`).addEventListener('click', () => {
        openEffectModal(eff.type, eff, newEff => {
          if (useAppliedFormat) {
            list[i] = { effect: newEff, casting_type: list[i].casting_type || 'Targeting' };
          } else {
            list[i] = newEff;
          }
          renderList();
        });
      });
      div.querySelector(`#${id}-rm-${i}`).addEventListener('click', () => {
        list.splice(i, 1);
        renderList();
      });
    });
  };

  renderList();

  setTimeout(() => {
    const addBtn = wrap.querySelector(`#${id}-add`);
    if (addBtn) addBtn.addEventListener('click', () => {
      // Quick type picker
      const type = prompt('Effect type (e.g. Attack, Stun, Combine):', 'Attack');
      if (!type || !EFFECT_DEFAULTS[type]) { alert('Unknown type: ' + type); return; }
      openEffectModal(type, null, newEff => {
        if (useAppliedFormat) {
          list.push({ effect: newEff, casting_type: 'Targeting' });
        } else {
          list.push(newEff);
        }
        renderList();
      });
    });
  }, 0);

  return wrap;
}

function buildTwoChildEditor(type, current) {
  const isBuff = type === 'SwitchByBuff';
  const pairs = isBuff
    ? [['effect_none', 'When NO buff (effect_none)'], ['effect_buff', 'When HAS buff (effect_buff)']]
    : [['effect_start', 'Before Level 3 (effect_start)'], ['effect_level3', 'Level 3+ (effect_level3)']];

  const wrap = document.createElement('div');
  wrap.style.marginTop = '14px';
  wrap.innerHTML = `<div class="separator"></div>
    <label style="font-size:12px;font-weight:700;color:var(--text-sec);text-transform:uppercase;letter-spacing:.5px">Branch Effects</label>`;

  pairs.forEach(([key, label]) => {
    const child = current[key];
    const id = `two-child-${key}-${Date.now()}`;
    const slot = document.createElement('div');
    slot.style.marginTop = '10px';
    slot.innerHTML = `
      <div style="font-size:12px;color:var(--text-sec);margin-bottom:6px;font-weight:600">${label}</div>
      <div style="display:flex;align-items:center;gap:8px" id="${id}-row">
        <span class="effect-type-badge" style="font-size:11px" id="${id}-badge">${child ? child.type : 'none'}</span>
        <span style="flex:1;font-size:11px;color:var(--text-muted)" id="${id}-sum">${child ? getEffectSummary(child) : ''}</span>
        <button class="btn-secondary btn-sm" id="${id}-set">Set Effect</button>
        ${child ? `<button class="btn-danger" id="${id}-clr">\u{2716}</button>` : ''}
      </div>
    `;
    wrap.appendChild(slot);

    setTimeout(() => {
      const setBtn = document.getElementById(`${id}-set`);
      if (setBtn) setBtn.addEventListener('click', () => {
        const t = prompt('Effect type:', child ? child.type : 'Attack');
        if (!t || !EFFECT_DEFAULTS[t]) { alert('Unknown type'); return; }
        openEffectModal(t, child && child.type === t ? child : null, newEff => {
          current[key] = newEff;
          document.getElementById(`${id}-badge`).textContent = newEff.type;
          document.getElementById(`${id}-sum`).textContent = getEffectSummary(newEff);
        });
      });
      const clrBtn = document.getElementById(`${id}-clr`);
      if (clrBtn) clrBtn.addEventListener('click', () => {
        current[key] = null;
        document.getElementById(`${id}-badge`).textContent = 'none';
        document.getElementById(`${id}-sum`).textContent = '';
      });
    }, 0);
  });

  return wrap;
}

function collectModalValues(type, current) {
  const result = { type };
  const fields = getEffectFields(type, current);

  fields.forEach(f => {
    const el = document.getElementById(`modal_${f.key}`);
    if (!el) return;
    if (f.type === 'bool') result[f.key] = el.checked;
    else if (f.type === 'number') result[f.key] = parseFloat(el.value) || 0;
    else result[f.key] = el.value;
  });

  // Opacity
  const opEl = document.getElementById('modal_opacity');
  if (opEl) result.opacity = parseFloat(opEl.value) || 1.0;

  // Shape
  if (HAS_SHAPE.has(type)) {
    const stEl = document.getElementById('modal_shape_type');
    if (stEl) {
      const st = stEl.value;
      if (st === 'Circle') {
        const r = parseInt(document.getElementById('modal_shape_radius')?.value) || 10000;
        result.shape = { Circle: { radius: r } };
      } else if (st === 'Rect') {
        result.shape = {
          Rect: {
            width: parseInt(document.getElementById('modal_shape_width')?.value) || 12000,
            height: parseInt(document.getElementById('modal_shape_height')?.value) || 8000,
          }
        };
      } else if (st === 'DirDot') {
        result.shape = {
          DirDot: {
            radius: parseInt(document.getElementById('modal_shape_radius')?.value) || 8000,
            range: parseInt(document.getElementById('modal_shape_range')?.value) || 700,
          }
        };
      }
    }
  }

  // buff_state
  if (HAS_BUFF_STATE.has(type)) {
    const bs = collectBuffState();
    result.buff_state = bs;
    // preserve applied_effects etc from current
    if (type === 'AddCasterBuff') {
      const oe = document.getElementById('modal_only_to_enemy');
      result.only_to_enemy = oe ? oe.checked : false;
    }
  }

  // Preserve lists from current
  if (HAS_APPLIED_EFFECTS.has(type) && current.applied_effects) result.applied_effects = current.applied_effects;
  if (HAS_EFFECTS_ARRAY.has(type) && current.effects) result.effects = current.effects;
  if (HAS_END_EFFECTS.has(type) && current.end_effects) result.end_effects = current.end_effects;
  if (HAS_TWO_CHILD_EFFECTS.has(type)) {
    if (type === 'SwitchByBuff') { result.effect_none = current.effect_none; result.effect_buff = current.effect_buff; }
    else { result.effect_start = current.effect_start; result.effect_level3 = current.effect_level3; }
  }

  return result;
}

function collectBuffState() {
  const BUFF_STATS = [
    'attack', 'attack_mult', 'magic_power', 'magic_power_mult',
    'defence', 'defence_mult', 'hp', 'hp_mult', 'hp_regen',
    'magic_resistance', 'magic_resistance_mult', 'move_speed_mult',
    'attack_speed_mult', 'skill_cooldown_mult', 'ult_cooldown_mult',
    'damaged_amplify', 'damaged_reduce', 'dot_amplify',
    'base_attack_enemy_max_hp_damage', 'skill_enemy_max_hp_damage',
    'self_max_hp_damage', 'base_attack_damaged_reduce', 'skill_damaged_reduce',
    'defence_penetration', 'magic_resistance_penetration',
    'range', 'heal_reduce', 'toughness', 'crit_chance', 'radius_mult', 'vamp', 'damage_reflect',
  ];
  const bs = {};
  const nameEl = document.getElementById('modal_bs_name');
  if (nameEl) bs.name = nameEl.value.trim();
  const dtype = document.getElementById('modal_bs_duration_type');
  if (dtype) {
    if (dtype.value === 'Permanent') bs.duration = 'Permanent';
    else if (dtype.value === 'WithShield') bs.duration = 'WithShield';
    else {
      const t = parseInt(document.getElementById('modal_bs_tick')?.value) || 180;
      bs.duration = { Time: { tick: t } };
    }
  }
  BUFF_STATS.forEach(s => {
    const el = document.getElementById(`modal_bs_${s}`);
    if (el) { const v = parseFloat(el.value) || 0; if (v !== 0) bs[s] = v; }
  });
  ['cc_immune', 'undying', 'ignore_wall'].forEach(s => {
    const el = document.getElementById(`modal_bs_${s}`);
    if (el && el.checked) bs[s] = true;
  });
  return bs;
}

function cleanAssetPath(path) {
  if (!path) return '';
  return path.replace(/(#sheet|#anim)?(\.png|\.webp|\.fanim)?$/, '');
}

// Helper to extract relative path
function getRelativeAssetPath(assetPath) {
  if (!assetPath) return null;
  const cleaned = cleanAssetPath(assetPath);
  const match = cleaned.match(/^asset\/[^/]+\/(.+)$/);
  if (match) {
    return match[1];
  }
  return cleaned;
}

function syncVisualBindingsFromActions() {
  const projectiles = new Set();
  const effects = new Set();
  const buffs = new Set();

  const scan = (eff) => {
    if (!eff) return;
    const type = eff.type;
    
    // Projectiles
    if ([
      'LinearProjectile', 'BackToCasterLinearProjectile', 'TargetProjectile',
      'TargetProjectileFromProjectile', 'TargetSplashProjectile', 'AutoTargetProjectile',
      'RangeProjectile', 'LineRangeProjectile', 'RangePeriodProjectile', 'ApplyInProjectile',
      'ParabolicProjectile'
    ].includes(type)) {
      if (eff.name) projectiles.add(eff.name.trim());
      if (type === 'ParabolicProjectile' && eff.range_effect_name) {
        effects.add(eff.range_effect_name.trim());
      }
    }
    
    // ShrinkingBarrier
    if (type === 'ShrinkingBarrier') {
      if (eff.name) projectiles.add(eff.name.trim());
    }

    // Buffs
    if (['AddBuff', 'AddCasterBuff'].includes(type) && eff.buff_state && eff.buff_state.name) {
      buffs.add(eff.buff_state.name.trim());
    }

    // View Effects
    if (['ViewEffect', 'CasterViewEffect'].includes(type)) {
      if (eff.name) effects.add(eff.name.trim());
    }
    if (type === 'Banish') {
      if (eff.lock_effect_name) effects.add(eff.lock_effect_name.trim());
      if (eff.end_effect_name) effects.add(eff.end_effect_name.trim());
    }

    // Recurse
    if (eff.effect_none) scan(eff.effect_none);
    if (eff.effect_buff) scan(eff.effect_buff);
    if (eff.effect_start) scan(eff.effect_start);
    if (eff.effect_level3) scan(eff.effect_level3);
    if (eff.applied_effects) {
      eff.applied_effects.forEach(e => {
        if (e) {
          if (e.effect) scan(e.effect);
          else scan(e);
        }
      });
    }
    if (eff.effects) {
      eff.effects.forEach(e => {
        if (e) scan(e);
      });
    }
    if (eff.end_effects) {
      eff.end_effects.forEach(e => {
        if (e) {
          if (e.effect) scan(e.effect);
          else scan(e);
        }
      });
    }
  };

  // Scan all actions
  if (state.actions) {
    Object.values(state.actions).forEach(action => {
      if (action && action.effect) {
        scan(action.effect);
      }
    });
  }

  const modId = getModId() || 'my_mod';

  // Ensure arrays exist
  if (!state.view_projectiles) state.view_projectiles = [];
  if (!state.view_effects) state.view_effects = [];
  if (!state.view_buffs) state.view_buffs = [];

  // Sync projectiles
  projectiles.forEach(name => {
    if (!name) return;
    const exists = state.view_projectiles.some(item => item.name === name);
    if (!exists) {
      state.view_projectiles.push({
        type: 'Animated',
        name: name,
        anim: `asset/${modId}/aseprite_resources/effects/${name}`,
        tag: 'play',
        z: 1,
        repeat: true
      });
    }
  });

  // Sync effects
  effects.forEach(name => {
    if (!name) return;
    const exists = state.view_effects.some(item => item.name === name);
    if (!exists) {
      state.view_effects.push({
        type: 'Animation',
        name: name,
        anim: `asset/${modId}/aseprite_resources/effects/${name}`,
        tag: 'play',
        z: 1,
        is_follow: false
      });
    }
  });

  // Sync buffs
  buffs.forEach(name => {
    if (!name) return;
    const exists = state.view_buffs.some(item => item.name === name);
    if (!exists) {
      state.view_buffs.push({
        type: 'Animated',
        name: name,
        anim: `asset/${modId}/aseprite_resources/effects/${name}`,
        tag: 'idle',
        z: 1
      });
    }
  });
}

function renderAllVisualBindings() {
  renderVisualBinding('view-effects-list', state.view_effects, 'effect');
  renderVisualBinding('view-projectiles-list', state.view_projectiles, 'projectile');
  renderVisualBinding('view-buffs-list', state.view_buffs, 'buff');
}

// ── VISUAL BINDINGS ───────────────────────────────────────────

// ── Binding animation loop ────────────────────────────────────

function startBindingAnimations() {
  if (bindingAnimRAF) cancelAnimationFrame(bindingAnimRAF);
  bindingAnimRAF = requestAnimationFrame(tickBindingAnimations);
}

function stopBindingAnimations() {
  if (bindingAnimRAF) { cancelAnimationFrame(bindingAnimRAF); bindingAnimRAF = null; }
}

function tickBindingAnimations(ts) {
  const canvases = document.querySelectorAll('.binding-anim-canvas');
  canvases.forEach(canvas => {
    const category = canvas.dataset.category;
    const idx      = parseInt(canvas.dataset.index);
    const list = category === 'effect' ? state.view_effects
               : category === 'projectile' ? state.view_projectiles
               : state.view_buffs;
    if (!list) return;
    const item = list[idx];
    if (!item || !item.image_data) return;

    // Dimensions and layout
    const fw = parseInt(item.frame_width)  || item.image_width  || 40;
    const fh = parseInt(item.frame_height) || item.image_height || 40;
    const layout = item.layout || 'horizontal';
    const dur    = parseFloat(item.frame_duration) || 0.1;

    // Which tag to preview?
    let from = 1, to = 1;
    if (item.type === 'ThreePhase') {
      from = parseInt(item.loop_from) || 1;
      to   = parseInt(item.loop_to)   || 1;
    } else {
      from = parseInt(item.range_from) || 1;
      to   = parseInt(item.range_to)   || 1;
    }
    if (to < from) to = from;
    const totalFrames = to - from + 1;
    const totalDur = dur * 1000 * totalFrames;
    const frameIdx = Math.floor((ts % totalDur) / (dur * 1000));
    const f = from + frameIdx;   // 1-based

    // Image object
    const key = item.anim || item.sprite || item.name;
    let img = bindingImages.get(key);
    if (!img) {
      img = new Image();
      img.src = item.image_data;
      bindingImages.set(key, img);
    }
    if (!img.complete || !img.naturalWidth) return;

    // Compute total sheet cols (for grid layout)
    const sheetW = img.naturalWidth;
    const cols = fw > 0 ? Math.max(1, Math.floor(sheetW / fw)) : 1;

    // Sprite coordinates
    let sx = 0, sy = 0;
    const zeroIdx = f - 1;
    if (layout === 'horizontal')     { sx = zeroIdx * fw; sy = 0; }
    else if (layout === 'vertical')  { sx = 0; sy = zeroIdx * fh; }
    else /* grid */                  { sx = (zeroIdx % cols) * fw; sy = Math.floor(zeroIdx / cols) * fh; }

    if (canvas.width !== fw || canvas.height !== fh) {
      canvas.width  = fw;
      canvas.height = fh;
    }
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, fw, fh);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, fw, fh, 0, 0, fw, fh);
  });

  bindingAnimRAF = requestAnimationFrame(tickBindingAnimations);
}

function initVisuals() {
  startBindingAnimations();

  // Stop when leaving Visuals tab, restart when entering
  document.querySelectorAll('#sidebar .nav-item').forEach(b => {
    if (b.dataset.tab === 'visuals') {
      b.addEventListener('click', startBindingAnimations);
    } else {
      // Don't stop — the loop is cheap and keeps working even if tab is hidden
    }
  });

  document.getElementById('add-view-effect').addEventListener('click', () => {
    openBindingModal('effect', null, -1, data => {
      state.view_effects.push(data);
      renderVisualBinding('view-effects-list', state.view_effects, 'effect');
    });
  });
  document.getElementById('add-view-projectile').addEventListener('click', () => {
    openBindingModal('projectile', null, -1, data => {
      state.view_projectiles.push(data);
      renderVisualBinding('view-projectiles-list', state.view_projectiles, 'projectile');
    });
  });
  document.getElementById('add-view-buff').addEventListener('click', () => {
    openBindingModal('buff', null, -1, data => {
      state.view_buffs.push(data);
      renderVisualBinding('view-buffs-list', state.view_buffs, 'buff');
    });
  });
}

function redrawBindingSpriteGrid(item, settingsKey) {
  const canvas = document.getElementById(`ba-sheet-canvas-${settingsKey}`);
  if (!canvas || !item.image_data) return;

  const fw = item.frame_width  || item.image_width  || 0;
  const fh = item.frame_height || item.image_height || 0;
  if (fw <= 0 || fh <= 0) return;

  const img = new Image();
  img.onload = () => {
    let scale = 1;
    if (fw > 0) {
      scale = Math.max(1, Math.min(8, Math.round(80 / fw)));
    }

    const cols = Math.floor(img.width / fw) || 1;
    const rows = Math.floor(img.height / fh) || 1;
    const layout = item.layout || 'horizontal';

    let totalFramesCount = cols * rows;
    if (layout === 'horizontal') totalFramesCount = cols;
    else if (layout === 'vertical') totalFramesCount = rows;

    const headerHeight = 20;
    let canvasCols = cols;
    let canvasRows = rows;
    if (layout === 'horizontal') {
      canvasCols = totalFramesCount;
      canvasRows = 1;
    } else if (layout === 'vertical') {
      canvasCols = 1;
      canvasRows = totalFramesCount;
    }

    canvas.width = canvasCols * fw * scale;
    canvas.height = canvasRows * (fh * scale + headerHeight);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Fill background
    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < totalFramesCount; i++) {
      let col = 0, row = 0;
      let srcX = 0, srcY = 0;

      if (layout === 'horizontal') {
        col = i;
        row = 0;
        srcX = i * fw;
        srcY = 0;
      } else if (layout === 'vertical') {
        col = 0;
        row = i;
        srcX = 0;
        srcY = i * fh;
      } else { // grid
        col = i % cols;
        row = Math.floor(i / cols);
        srcX = col * fw;
        srcY = row * fh;
      }

      const destX = col * fw * scale;
      const destY = row * (fh * scale + headerHeight);

      // 1. Draw a dark background for the number header area
      ctx.fillStyle = '#13161e';
      ctx.fillRect(destX, destY, fw * scale, headerHeight);

      // 2. Draw frame number text centered in the header
      ctx.fillStyle = '#a5a1ff';
      ctx.font = `bold 10px monospace`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), destX + (fw * scale) / 2, destY + headerHeight / 2);

      // 3. Draw sliced frame image below the header
      ctx.drawImage(img, srcX, srcY, fw, fh, destX, destY + headerHeight, fw * scale, fh * scale);

      // 4. Draw border around the frame image itself
      ctx.strokeStyle = 'rgba(108, 99, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(destX, destY + headerHeight, fw * scale, fh * scale);
      
      // 5. Draw border around the header area itself
      ctx.strokeStyle = '#252a3a';
      ctx.strokeRect(destX, destY, fw * scale, headerHeight);
    }
  };
  img.src = item.image_data;
}

function renderVisualBinding(containerId, list, category) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:12px;padding:8px">None yet.</p>';
    return;
  }
  list.forEach((item, i) => {
    const settingsKey = `${category}-${i}`;
    const hasImage    = !!item.image_data;
    const isSprite    = item.type === 'Sprite';
    const isThreePhase = item.type === 'ThreePhase';
    const isSettingsOpen = openedSettings.has(settingsKey);
    const path = item.sprite || item.anim || '';

    const animatedTypes = category === 'effect'     ? ['Animation', 'LoopAnimation']
                        : category === 'projectile' ? ['Animated', 'ThreePhase']
                        :                             ['Animated', 'ThreePhase'];
    const allTypes = ['Sprite', ...animatedTypes];
    if (item.type && !allTypes.includes(item.type)) {
      allTypes.push(item.type);
    }

    const card = document.createElement('div');
    card.className = 'binding-card';
    card.style.cssText = `
      display:flex; flex-direction:column; gap:8px; align-items:stretch;
      padding:12px 16px; border-radius:var(--radius-sm);
      background:var(--bg-panel); transition:border-color var(--trans), background var(--trans);
      border:${hasImage ? '1px solid var(--border-light)' : '1px dashed var(--accent2)'};
      ${!hasImage ? 'background:rgba(255,101,132,0.02)' : ''};
    `;

    // ── Canvas or placeholder thumbnail ──
    const previewHtml = hasImage && !isSprite
      ? `<canvas class="binding-anim-canvas" data-category="${category}" data-index="${i}"
           style="width:48px;height:48px;object-fit:contain;border:1px solid var(--border-light);
                  border-radius:var(--radius-sm);background:#06060c;
                  image-rendering:pixelated;image-rendering:crisp-edges;flex-shrink:0;"></canvas>`
      : hasImage && isSprite
        ? `<img src="${item.image_data}" style="width:48px;height:48px;object-fit:contain;
             border:1px solid var(--border-light);border-radius:var(--radius-sm);
             background:#06060c;image-rendering:pixelated;flex-shrink:0;" />`
        : `<div style="width:48px;height:48px;border:1px dashed var(--accent2);border-radius:var(--radius-sm);
             background:#1a0f12;display:flex;align-items:center;justify-content:center;
             color:var(--accent2);font-size:18px;flex-shrink:0;">!</div>`;

    // ── Animation settings panel (only for animated types) ──
    let settingsHtml = '';
    if (!isSprite && hasImage) {
      const fw  = item.frame_width   || item.image_width  || '';
      const fh  = item.frame_height  || item.image_height || '';
      const dur = item.frame_duration !== undefined ? item.frame_duration : 0.1;
      const lay = item.layout || 'horizontal';

      let rangesHtml = '';
      if (isThreePhase) {
        rangesHtml = `
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <div style="flex:1;min-width:120px;">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Pre-Tag Range</div>
              <div style="display:flex;gap:4px;align-items:center;">
                <input type="number" class="ba-input" id="ba-pre-from-${settingsKey}" value="${item.pre_from||1}" min="1" style="width:52px;padding:4px 6px;font-size:11px;" placeholder="from" />
                <span style="color:var(--text-muted);font-size:10px;">→</span>
                <input type="number" class="ba-input" id="ba-pre-to-${settingsKey}" value="${item.pre_to||1}" min="1" style="width:52px;padding:4px 6px;font-size:11px;" placeholder="to" />
              </div>
            </div>
            <div style="flex:1;min-width:120px;">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Loop-Tag Range</div>
              <div style="display:flex;gap:4px;align-items:center;">
                <input type="number" class="ba-input" id="ba-loop-from-${settingsKey}" value="${item.loop_from||1}" min="1" style="width:52px;padding:4px 6px;font-size:11px;" placeholder="from" />
                <span style="color:var(--text-muted);font-size:10px;">→</span>
                <input type="number" class="ba-input" id="ba-loop-to-${settingsKey}" value="${item.loop_to||1}" min="1" style="width:52px;padding:4px 6px;font-size:11px;" placeholder="to" />
              </div>
            </div>
            <div style="flex:1;min-width:120px;">
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Remove-Tag Range</div>
              <div style="display:flex;gap:4px;align-items:center;">
                <input type="number" class="ba-input" id="ba-remove-from-${settingsKey}" value="${item.remove_from||1}" min="1" style="width:52px;padding:4px 6px;font-size:11px;" placeholder="from" />
                <span style="color:var(--text-muted);font-size:10px;">→</span>
                <input type="number" class="ba-input" id="ba-remove-to-${settingsKey}" value="${item.remove_to||1}" min="1" style="width:52px;padding:4px 6px;font-size:11px;" placeholder="to" />
              </div>
            </div>
          </div>`;
      } else {
        rangesHtml = `
          <div>
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Frame Range (1-indexed)</div>
            <div style="display:flex;gap:4px;align-items:center;">
              <input type="number" class="ba-input" id="ba-from-${settingsKey}" value="${item.range_from||1}" min="1" style="width:60px;padding:4px 6px;font-size:11px;" placeholder="from" />
              <span style="color:var(--text-muted);font-size:11px;">→</span>
              <input type="number" class="ba-input" id="ba-to-${settingsKey}" value="${item.range_to||1}" min="1" style="width:60px;padding:4px 6px;font-size:11px;" placeholder="to" />
            </div>
          </div>`;
      }

      settingsHtml = `
        <div class="binding-settings-panel" id="bsp-${settingsKey}" style="border-top:1px solid var(--border);margin-top:2px;padding-top:8px;${isSettingsOpen ? '' : 'display:none;'}">
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
            <div>
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Frame Width (px)</div>
              <input type="number" class="ba-input" id="ba-fw-${settingsKey}" value="${fw}" min="1" style="width:72px;padding:4px 6px;font-size:11px;" placeholder="auto" />
            </div>
            <div>
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Frame Height (px)</div>
              <input type="number" class="ba-input" id="ba-fh-${settingsKey}" value="${fh}" min="1" style="width:72px;padding:4px 6px;font-size:11px;" placeholder="auto" />
            </div>
            <div>
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Frame Duration (s)</div>
              <input type="number" class="ba-input" id="ba-dur-${settingsKey}" value="${dur}" min="0.01" step="0.01" style="width:72px;padding:4px 6px;font-size:11px;" />
            </div>
            <div>
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Sheet Layout</div>
              <select class="ba-input" id="ba-lay-${settingsKey}" style="padding:4px 6px;font-size:11px;width:102px;">
                <option value="horizontal" ${lay==='horizontal'?'selected':''}>Horizontal →</option>
                <option value="vertical"   ${lay==='vertical'?'selected':''}>Vertical ↓</option>
                <option value="grid"       ${lay==='grid'?'selected':''}>Grid ⊞</option>
              </select>
            </div>
          </div>
          ${rangesHtml}
          <!-- Frame-by-frame sheet canvas preview with scrollbar -->
          <div style="margin-top:8px;width:100%;max-height:220px;overflow:auto;border:1px solid var(--border);border-radius:var(--radius-sm);background:#06060c;">
            <canvas id="ba-sheet-canvas-${settingsKey}" style="display:block;image-rendering:pixelated;image-rendering:crisp-edges;"></canvas>
          </div>
        </div>`;
    }

    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        ${previewHtml}
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:13px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:3px;flex-wrap:wrap;">
            <span style="font-size:10px;color:var(--text-muted);font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.05em;">Type:</span>
            <select class="ba-type-select" data-category="${category}" data-index="${i}" style="padding:1px 4px;font-size:11px;background:var(--bg-deep);border:1px solid var(--border);border-radius:var(--radius-xs);color:var(--text-primary);width:auto;height:auto;line-height:normal;cursor:pointer;font-family:var(--font-mono);outline:none;border-color:rgba(108,99,255,0.25);">
              ${allTypes.map(t => `<option value="${t}" ${item.type === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
            <span style="color:var(--text-sec);font-size:10px;font-family:var(--font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;" title="${path}">&mdash; ${path}</span>
          </div>
          <div style="margin-top:3px;">
            ${isSprite
              ? `<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(255,183,77,0.12);color:#ffb74d;border:1px solid rgba(255,183,77,0.3);font-family:var(--font-mono);">🖼️ {name}.png</span>`
              : `<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:rgba(108,99,255,0.10);color:var(--accent);border:1px solid rgba(108,99,255,0.3);font-family:var(--font-mono);">🎬 {name}#sheet.png + #anim.fanim</span>`}
          </div>
          ${hasImage ? `<div style="font-size:11px;color:var(--accent3);margin-top:2px;">✓ PNG Loaded (${item.image_width||0}×${item.image_height||0})</div>` : `<div style="font-size:11px;color:var(--accent2);font-weight:500;margin-top:2px;">⚠️ Missing visual asset PNG file</div>`}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
          <div style="display:flex;gap:4px;">
            <button class="btn-secondary btn-sm" id="binding-edit-${category}-${i}">✍️ Edit</button>
            <button class="btn-danger" id="binding-rm-${category}-${i}" style="padding:4px 8px;">✖</button>
          </div>
          ${hasImage && !isSprite
            ? `<button class="btn-secondary btn-sm" id="bsp-toggle-${settingsKey}" style="font-size:10px;padding:3px 8px;">⚙️ Anim Settings ${isSettingsOpen ? '▲' : '▼'}</button>`
            : ''}
          <div style="display:flex;gap:4px;">
            <button class="btn-secondary btn-sm" id="binding-upload-btn-${category}-${i}" style="font-size:10px;padding:3px 8px;${!hasImage?'border-color:var(--accent2);color:var(--accent2)':''}">📁 ${hasImage ? 'Change' : 'Upload PNG'}</button>
            ${hasImage ? `<button class="btn-danger btn-sm" id="binding-clear-image-${category}-${i}" style="font-size:10px;padding:3px 8px;">✖ PNG</button>` : ''}
          </div>
        </div>
      </div>
      ${settingsHtml}
      <input type="file" id="binding-file-input-${category}-${i}" accept="image/png,image/webp" style="display:none;" />
    `;
    container.appendChild(card);

    // Draw the initial frame-by-frame sheet canvas preview if open
    if (isSettingsOpen && hasImage && !isSprite) {
      redrawBindingSpriteGrid(item, settingsKey);
    }

    // ── Inline Type Selector Event Listener ───────────────────
    const typeSelect = card.querySelector('.ba-type-select');
    if (typeSelect) {
      typeSelect.addEventListener('change', e => {
        const newType = e.target.value;
        if (newType === 'Sprite') {
          if (item.anim && !item.sprite) item.sprite = item.anim;
          delete item.anim;
        } else {
          if (item.sprite && !item.anim) item.anim = item.sprite;
          delete item.sprite;
          if (newType === 'ThreePhase') {
            item.pre_tag = item.pre_tag || 'spawn';
            item.loop_tag = item.loop_tag || 'loop';
            item.remove_tag = item.remove_tag || 'remove';
          } else {
            item.tag = item.tag || 'play';
          }
        }
        item.type = newType;
        renderVisualBinding(containerId, list, category);
      });
    }

    // ── Edit / Remove ──────────────────────────────────────────
    document.getElementById(`binding-edit-${category}-${i}`).addEventListener('click', () => {
      openBindingModal(category, item, i, data => {
        if (item.image_data) {
          data.image_data = item.image_data; data.image_width = item.image_width; data.image_height = item.image_height;
        }
        // preserve anim settings
        ['frame_width','frame_height','frame_duration','layout',
         'range_from','range_to','pre_from','pre_to','loop_from','loop_to','remove_from','remove_to']
          .forEach(k => { if (item[k] !== undefined) data[k] = item[k]; });
        list[i] = data;
        renderVisualBinding(containerId, list, category);
      });
    });
    document.getElementById(`binding-rm-${category}-${i}`).addEventListener('click', () => {
      openedSettings.delete(settingsKey);
      list.splice(i, 1);
      renderVisualBinding(containerId, list, category);
    });

    // ── PNG Upload / Remove ────────────────────────────────────
    const fileInput = document.getElementById(`binding-file-input-${category}-${i}`);
    document.getElementById(`binding-upload-btn-${category}-${i}`).addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) loadBindingImageFile(file, item, () => {
        bindingImages.delete(item.anim || item.sprite || item.name);
        renderVisualBinding(containerId, list, category);
      });
    });
    if (hasImage) {
      document.getElementById(`binding-clear-image-${category}-${i}`)?.addEventListener('click', () => {
        bindingImages.delete(item.anim || item.sprite || item.name);
        delete item.image_data; delete item.image_width; delete item.image_height;
        renderVisualBinding(containerId, list, category);
      });
    }

    // ── Anim Settings Toggle ───────────────────────────────────
    if (hasImage && !isSprite) {
      document.getElementById(`bsp-toggle-${settingsKey}`)?.addEventListener('click', () => {
        if (openedSettings.has(settingsKey)) { openedSettings.delete(settingsKey); }
        else { openedSettings.add(settingsKey); }
        renderVisualBinding(containerId, list, category);
      });

      // Auto-save on every input change
      const patchItem = () => {
        const v = id => { const el = document.getElementById(id); return el ? el.value : null; };
        const fw = parseInt(v(`ba-fw-${settingsKey}`)); if (!isNaN(fw) && fw > 0) item.frame_width = fw;
        const fh = parseInt(v(`ba-fh-${settingsKey}`)); if (!isNaN(fh) && fh > 0) item.frame_height = fh;
        const dur = parseFloat(v(`ba-dur-${settingsKey}`)); if (!isNaN(dur) && dur > 0) item.frame_duration = dur;
        const lay = v(`ba-lay-${settingsKey}`); if (lay) item.layout = lay;
        if (isThreePhase) {
          item.pre_from    = parseInt(v(`ba-pre-from-${settingsKey}`))    || 1;
          item.pre_to      = parseInt(v(`ba-pre-to-${settingsKey}`))      || 1;
          item.loop_from   = parseInt(v(`ba-loop-from-${settingsKey}`))   || 1;
          item.loop_to     = parseInt(v(`ba-loop-to-${settingsKey}`))     || 1;
          item.remove_from = parseInt(v(`ba-remove-from-${settingsKey}`)) || 1;
          item.remove_to   = parseInt(v(`ba-remove-to-${settingsKey}`))   || 1;
        } else {
          item.range_from = parseInt(v(`ba-from-${settingsKey}`)) || 1;
          item.range_to   = parseInt(v(`ba-to-${settingsKey}`))   || 1;
        }
        redrawBindingSpriteGrid(item, settingsKey);
      };
      card.querySelectorAll('.ba-input').forEach(el => el.addEventListener('input', patchItem));
    }

    // ── Drag-and-drop ──────────────────────────────────────────
    card.addEventListener('dragover', e => { e.preventDefault(); card.style.borderColor = 'var(--accent)'; card.style.background = 'var(--bg-hover)'; });
    card.addEventListener('dragleave', () => {
      card.style.borderColor = hasImage ? 'var(--border-light)' : 'var(--accent2)';
      card.style.background  = hasImage ? 'var(--bg-panel)' : 'rgba(255,101,132,0.02)';
    });
    card.addEventListener('drop', e => {
      e.preventDefault();
      card.style.borderColor = hasImage ? 'var(--border-light)' : 'var(--accent2)';
      card.style.background  = hasImage ? 'var(--bg-panel)' : 'rgba(255,101,132,0.02)';
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { alert('Please upload a PNG/WebP file.'); return; }
      loadBindingImageFile(file, item, () => {
        bindingImages.delete(item.anim || item.sprite || item.name);
        renderVisualBinding(containerId, list, category);
      });
    });
  });
}

function loadBindingImageFile(file, item, onComplete) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      item.image_data = ev.target.result;
      item.image_width = img.width;
      item.image_height = img.height;
      if (onComplete) onComplete();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

let bindingCallback = null;

function openBindingModal(category, existing, index, callback) {
  bindingCallback = callback;
  const modal = document.getElementById('binding-modal');
  document.getElementById('binding-modal-title').textContent =
    index < 0 ? `Add ${category} visual` : `Edit ${category} visual`;
  modal.style.display = 'flex';

  const body = document.getElementById('binding-modal-body');
  const current = existing || {};

  // All categories support both static PNG and animated spritesheet
  const animatedTypes = category === 'effect'     ? ['Animation', 'LoopAnimation']
                      : category === 'projectile' ? ['Animated', 'ThreePhase']
                      :                             ['Animated', 'ThreePhase'];

  const typeVal  = current.type || animatedTypes[0];
  const isStatic = typeVal === 'Sprite';

  body.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>Name <span class="req">*</span></label>
        <input type="text" id="bm_name" value="${current.name || ''}" placeholder="my_effect" />
        <small>Must match exactly what effect/projectile/buff references.</small>
      </div>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <button type="button" id="bm_mode_static"
        class="bm-mode-btn ${isStatic ? 'bm-mode-active' : ''}"
        style="flex:1;padding:10px 12px;border-radius:var(--radius-sm);border:1.5px solid ${isStatic ? 'var(--accent)' : 'var(--border)'};background:${isStatic ? 'rgba(108,99,255,0.12)' : 'var(--bg-deep)'};color:${isStatic ? 'var(--accent)' : 'var(--text-muted)'};cursor:pointer;font-size:12px;font-weight:600;transition:all .15s;">
        🖼️ Static PNG<br><span style="font-size:10px;font-weight:400;opacity:.8;">{name}.png</span>
      </button>
      <button type="button" id="bm_mode_anim"
        class="bm-mode-btn ${!isStatic ? 'bm-mode-active' : ''}"
        style="flex:1;padding:10px 12px;border-radius:var(--radius-sm);border:1.5px solid ${!isStatic ? 'var(--accent)' : 'var(--border)'};background:${!isStatic ? 'rgba(108,99,255,0.12)' : 'var(--bg-deep)'};color:${!isStatic ? 'var(--accent)' : 'var(--text-muted)'};cursor:pointer;font-size:12px;font-weight:600;transition:all .15s;">
        🎬 Animated Sheet<br><span style="font-size:10px;font-weight:400;opacity:.8;">{name}#sheet.png + #anim.fanim</span>
      </button>
    </div>

    <div id="bm-subtype-row" style="margin-bottom:12px;${isStatic ? 'display:none' : ''}">
      <label style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;">Animation Type</label>
      <select id="bm_type" style="margin-top:4px;width:100%;">
        ${animatedTypes.map(t => `<option value="${t}" ${typeVal === t ? 'selected' : ''}>${t}</option>`).join('')}
      </select>
      <small style="margin-top:4px;display:block;">
        <b>Animation</b> — plays once &nbsp;|&nbsp; <b>LoopAnimation</b> — loops forever &nbsp;|&nbsp;
        <b>Animated</b> — projectile animation &nbsp;|&nbsp; <b>ThreePhase</b> — spawn / loop / remove phases
      </small>
    </div>

    <input type="hidden" id="bm_type_static" value="Sprite" />
    <div id="bm-dynamic"></div>
  `;

  // Determine which mode is active
  let currentMode = isStatic ? 'static' : 'anim';

  const setMode = (mode) => {
    currentMode = mode;
    const staticBtn = document.getElementById('bm_mode_static');
    const animBtn   = document.getElementById('bm_mode_anim');
    const subtypeRow = document.getElementById('bm-subtype-row');
    if (!staticBtn || !animBtn) return;
    staticBtn.style.border     = mode === 'static' ? '1.5px solid var(--accent)' : '1.5px solid var(--border)';
    staticBtn.style.background  = mode === 'static' ? 'rgba(108,99,255,0.12)' : 'var(--bg-deep)';
    staticBtn.style.color       = mode === 'static' ? 'var(--accent)' : 'var(--text-muted)';
    animBtn.style.border       = mode === 'anim' ? '1.5px solid var(--accent)' : '1.5px solid var(--border)';
    animBtn.style.background    = mode === 'anim' ? 'rgba(108,99,255,0.12)' : 'var(--bg-deep)';
    animBtn.style.color         = mode === 'anim' ? 'var(--accent)' : 'var(--text-muted)';
    subtypeRow.style.display    = mode === 'anim' ? '' : 'none';
    renderDynamic();
  };

  const renderDynamic = () => {
    const isStaticMode = currentMode === 'static';
    const t = isStaticMode ? 'Sprite' : (document.getElementById('bm_type') ? document.getElementById('bm_type').value : animatedTypes[0]);
    const dyn = document.getElementById('bm-dynamic');
    dyn.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'form-grid';

    const modId = getModId() || 'my_mod';
    const effectsBase = `asset/${modId}/aseprite_resources/effects`;
    // Use the current name field value to suggest a path
    const currentName = (document.getElementById('bm_name') ? document.getElementById('bm_name').value.trim() : '') || current.name || '';
    const suggestedAnimPath   = current.anim   || (currentName ? `${effectsBase}/${currentName}` : '');
    const suggestedSpritePath = current.sprite || (currentName ? `${effectsBase}/${currentName}` : '');

    if (isStaticMode) {
      // ── Static PNG ─────────────────────────────────────────
      grid.innerHTML = `
        <div class="form-group full-width">
          <label>Sprite Asset Path</label>
          <input type="text" id="bm_sprite" value="${suggestedSpritePath}" placeholder="${effectsBase}/my_effect" />
          <small>Exports as <code>aseprite_resources/effects/{name}.png</code> (single static image, no animation)</small>
        </div>
        <div class="form-group">
          <label>Z Depth</label>
          <input type="number" id="bm_z" value="${current.z || 0}" />
        </div>
      `;
    } else if (t === 'ThreePhase') {
      // ── ThreePhase animated ────────────────────────────────
      grid.innerHTML = `
        <div class="form-group full-width">
          <label>Animation Asset Path</label>
          <input type="text" id="bm_anim" value="${suggestedAnimPath}" placeholder="${effectsBase}/orb" />
          <small>Exports as <code>aseprite_resources/effects/{name}#sheet.png</code> + <code>#anim.fanim</code></small>
        </div>
        <div class="form-group">
          <label>Pre Tag (spawn)</label>
          <input type="text" id="bm_pre_tag" value="${current.pre_tag || 'spawn'}" />
        </div>
        <div class="form-group">
          <label>Loop Tag</label>
          <input type="text" id="bm_loop_tag" value="${current.loop_tag || 'loop'}" />
        </div>
        <div class="form-group">
          <label>Remove Tag</label>
          <input type="text" id="bm_remove_tag" value="${current.remove_tag || 'remove'}" />
        </div>
        <div class="form-group">
          <label>Z Depth</label>
          <input type="number" id="bm_z" value="${current.z || 0}" />
        </div>
      `;
    } else {
      // ── Animation / LoopAnimation / Animated ───────────────
      grid.innerHTML = `
        <div class="form-group full-width">
          <label>Animation Asset Path</label>
          <input type="text" id="bm_anim" value="${suggestedAnimPath}" placeholder="${effectsBase}/fire_burst" />
          <small>Exports as <code>aseprite_resources/effects/{name}#sheet.png</code> + <code>#anim.fanim</code></small>
        </div>
        <div class="form-group">
          <label>Tag</label>
          <input type="text" id="bm_tag" value="${current.tag || 'play'}" placeholder="play" />
        </div>
        <div class="form-group">
          <label>Z Depth</label>
          <input type="number" id="bm_z" value="${current.z || 0}" />
        </div>
        ${category === 'effect' ? `<div class="form-group"><label>Is Follow</label>
          <label style="display:flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0;padding:8px 0"><input type="checkbox" id="bm_follow" ${current.is_follow ? 'checked' : ''} style="width:auto;padding:0;border:none;background:none" />Follow target</label>
        </div>` : ''}
        ${category === 'projectile' ? `<div class="form-group"><label>Repeat</label>
          <label style="display:flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0;padding:8px 0"><input type="checkbox" id="bm_repeat" ${current.repeat !== false ? 'checked' : ''} style="width:auto;padding:0;border:none;background:none" />Loop animation</label>
        </div>` : ''}
      `;
    }
    dyn.appendChild(grid);
  };

  renderDynamic();
  // Wire animated sub-type change (guard: bm_type may not be in DOM during static mode)
  document.getElementById('bm-subtype-row').addEventListener('change', e => {
    if (e.target.id === 'bm_type') renderDynamic();
  });
  // Wire mode buttons
  document.getElementById('bm_mode_static').addEventListener('click', () => setMode('static'));
  document.getElementById('bm_mode_anim').addEventListener('click',   () => setMode('anim'));

  // Auto-fill path when name changes (only if path hasn't been manually customised)
  document.getElementById('bm_name').addEventListener('input', () => {
    const modId = getModId() || 'my_mod';
    const base = `asset/${modId}/aseprite_resources/effects`;
    const name = document.getElementById('bm_name').value.trim();
    const animEl   = document.getElementById('bm_anim');
    const spriteEl = document.getElementById('bm_sprite');
    const expected = existing ? (existing.anim || existing.sprite || '') : '';
    if (animEl) {
      // Only auto-update if the field still has the previous auto-suggested value
      const prev = existing ? expected : (name ? '' : '');
      if (!animEl.value || animEl.dataset.userEdited !== 'true') {
        animEl.value = name ? `${base}/${name}` : '';
      }
    }
    if (spriteEl && spriteEl.dataset.userEdited !== 'true') {
      spriteEl.value = name ? `${base}/${name}` : '';
    }
  });

  // Mark path fields as user-edited so auto-fill stops overwriting
  document.getElementById('bm-dynamic').addEventListener('input', e => {
    if (e.target.id === 'bm_anim' || e.target.id === 'bm_sprite') {
      e.target.dataset.userEdited = 'true';
    }
  }, true);

  document.getElementById('binding-modal-save').onclick = () => {
    // Resolve type from mode: static → 'Sprite', animated → dropdown value
    const t = currentMode === 'static'
      ? 'Sprite'
      : (document.getElementById('bm_type') ? document.getElementById('bm_type').value : animatedTypes[0]);
    const name = document.getElementById('bm_name').value.trim();
    if (!name) { alert('Name is required'); return; }
    const obj = { type: t, name };
    const g  = v => { const el = document.getElementById(v); return el ? el.value : ''; };
    const gi = v => { const el = document.getElementById(v); return el ? (parseInt(el.value) || 0) : 0; };
    const gb = v => { const el = document.getElementById(v); return el ? el.checked : false; };

    if (t === 'Sprite') {
      obj.sprite = g('bm_sprite');
      obj.z = gi('bm_z');
    } else if (t === 'ThreePhase') {
      obj.anim = g('bm_anim');
      obj.pre_tag    = g('bm_pre_tag');
      obj.loop_tag   = g('bm_loop_tag');
      obj.remove_tag = g('bm_remove_tag');
      obj.z = gi('bm_z');
    } else {
      // Animation / LoopAnimation / Animated
      obj.anim = g('bm_anim');
      obj.tag  = g('bm_tag');
      obj.z    = gi('bm_z');
      if (category === 'effect')     obj.is_follow = gb('bm_follow');
      if (category === 'projectile') obj.repeat    = gb('bm_repeat');
    }

    modal.style.display = 'none';
    if (bindingCallback) bindingCallback(obj);
  };
}

document.getElementById('binding-modal-close').addEventListener('click', () => {
  document.getElementById('binding-modal').style.display = 'none';
});
document.getElementById('binding-modal-cancel').addEventListener('click', () => {
  document.getElementById('binding-modal').style.display = 'none';
});
document.getElementById('binding-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
});

// ── SPRITE SHEET ───────────────────────────────────────────────

function initSprite() {
  const dropZone = document.getElementById('sprite-drop-zone');
  const fileInput = document.getElementById('sprite-file-input');
  const browseBtn = document.getElementById('sprite-browse-btn');

  browseBtn.addEventListener('click', e => { e.preventDefault(); fileInput.click(); });
  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => {
    if (e.target.files[0]) loadSpriteFile(e.target.files[0]);
  });
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) loadSpriteFile(e.dataTransfer.files[0]);
  });

  ['frame_width', 'frame_height', 'sheet_layout', 'frame_duration'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const s = state.sprite;
      if (id === 'frame_width') s.frame_width = parseInt(el.value) || 40;
      else if (id === 'frame_height') s.frame_height = parseInt(el.value) || 40;
      else if (id === 'sheet_layout') s.layout = el.value;
      else if (id === 'frame_duration') s.frame_duration = parseFloat(el.value) || 0.1;
      redrawSpriteGrid();
    });
  });

  renderAnimRanges();
  initSkillIconsConfig();

  document.getElementById('add-anim-range').addEventListener('click', () => {
    state.sprite.anim_ranges.push({ tag: 'custom', from: 1, to: 4, duration: 0.1 });
    renderAnimRanges();
  });
}

function loadSpriteFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    spriteImageData = e.target.result;
    state.sprite.sprite_image_data = e.target.result;

    // Extract base name from uploaded file
    let cleanName = file.name.split('.').slice(0, -1).join('.')
                           .replace('#sheet', '');
    state.sprite.sprite_name = cleanName;

    const img = new Image();
    img.onload = () => {
      state.sprite.has_sprite = true;
      const previewSec = document.getElementById('sprite-preview-section');
      if (previewSec) previewSec.style.display = '';
      const dimsEl = document.getElementById('sprite-dims');
      if (dimsEl) dimsEl.textContent = `Image: ${img.width}×${img.height}px`;
      redrawSpriteGrid();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function redrawSpriteGrid() {
  const canvas = document.getElementById('sprite-canvas');
  if (!canvas || !spriteImageData) return;
  const fw = state.sprite.frame_width;
  const fh = state.sprite.frame_height;
  const img = new Image();
  img.onload = () => {
    // Target each individual frame preview to be around 80px wide for a compact, readable preview layout
    let scale = 1;
    if (fw > 0) {
      scale = Math.max(1, Math.min(8, Math.round(80 / fw)));
    }

    const cols = Math.floor(img.width / fw) || 1;
    const rows = Math.floor(img.height / fh) || 1;
    const layout = state.sprite.layout || 'horizontal';
    
    let totalFramesCount = cols * rows;
    if (layout === 'horizontal') totalFramesCount = cols;
    else if (layout === 'vertical') totalFramesCount = rows;

    // Calculate canvas size including header area for numbers
    const headerHeight = 24;
    let canvasCols = cols;
    let canvasRows = rows;
    if (layout === 'horizontal') {
      canvasCols = totalFramesCount;
      canvasRows = 1;
    } else if (layout === 'vertical') {
      canvasCols = 1;
      canvasRows = totalFramesCount;
    }

    canvas.width = canvasCols * fw * scale;
    canvas.height = canvasRows * (fh * scale + headerHeight);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Fill background
    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (fw > 0 && fh > 0) {
      for (let i = 0; i < totalFramesCount; i++) {
        let col = 0;
        let row = 0;
        let srcX = 0;
        let srcY = 0;

        if (layout === 'horizontal') {
          col = i;
          row = 0;
          srcX = i * fw;
          srcY = 0;
        } else if (layout === 'vertical') {
          col = 0;
          row = i;
          srcX = 0;
          srcY = i * fh;
        } else { // grid
          col = i % cols;
          row = Math.floor(i / cols);
          srcX = col * fw;
          srcY = row * fh;
        }

        const destX = col * fw * scale;
        const destY = row * (fh * scale + headerHeight);

        // 1. Draw a dark background for the number header area
        ctx.fillStyle = '#13161e'; // Match app panel background
        ctx.fillRect(destX, destY, fw * scale, headerHeight);

        // 2. Draw frame number text centered in the header
        ctx.fillStyle = '#a5a1ff';
        ctx.font = `bold 11px monospace`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText((i + 1).toString(), destX + (fw * scale) / 2, destY + headerHeight / 2);

        // 3. Draw sliced frame image below the header
        ctx.drawImage(img, srcX, srcY, fw, fh, destX, destY + headerHeight, fw * scale, fh * scale);

        // 4. Draw border ONLY around the frame image itself, NOT enclosing the number, so it stays strictly above it
        ctx.strokeStyle = 'rgba(108, 99, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(destX, destY + headerHeight, fw * scale, fh * scale);
        
        // 5. Draw border around the header area itself to cleanly box the number
        ctx.strokeStyle = '#252a3a'; // Subtle border color
        ctx.strokeRect(destX, destY, fw * scale, headerHeight);
      }
    } else {
      // Fallback: draw full image if sizes are invalid
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    const totalFrames = fw > 0 && fh > 0
      ? Math.floor(img.width / fw) * Math.floor(img.height / fh)
      : '?';
    document.getElementById('sprite-frame-info').textContent =
      `Frame size: ${fw}×${fh} | Total frames: ${totalFrames}`;
  };
  img.src = spriteImageData;
}

function renderAnimRanges() {
  const container = document.getElementById('anim-range-list');
  container.innerHTML = '';
  state.sprite.anim_ranges.forEach((range, i) => {
    const row = document.createElement('div');
    row.className = 'anim-range-row';
    row.innerHTML = `
      <div class="form-group">
        <label>Tag Name</label>
        <input type="text" id="ar_tag_${i}" value="${range.tag}" placeholder="idle" />
      </div>
      <div class="form-group">
        <label>From</label>
        <input type="number" id="ar_from_${i}" value="${range.from}" min="1" />
      </div>
      <div class="form-group">
        <label>To</label>
        <input type="number" id="ar_to_${i}" value="${range.to}" min="1" />
      </div>
      <div class="form-group">
        <label>Duration(s)</label>
        <input type="number" id="ar_duration_${i}" value="${range.duration}" step="0.01" min="0.01" />
      </div>
      <div class="form-group" style="align-self:flex-end">
        <button class="btn-danger" id="ar_rm_${i}">\u{2716}</button>
      </div>
    `;
    container.appendChild(row);

    ['tag', 'from', 'to', 'duration'].forEach(key => {
      const el = document.getElementById(`ar_${key === 'tag' ? 'tag' : key}_${i}`);
      if (!el) return;
      el.addEventListener('input', () => {
        if (key === 'tag') range.tag = el.value;
        else if (key === 'duration') range.duration = parseFloat(el.value) || 0.1;
        else range[key] = parseInt(el.value) || 1;
      });
    });
    document.getElementById(`ar_rm_${i}`).addEventListener('click', () => {
      state.sprite.anim_ranges.splice(i, 1);
      renderAnimRanges();
    });
  });
}

function initSkillIconsConfig() {
  const modeEl = document.getElementById('skill_icons_mode');
  modeEl.addEventListener('change', () => {
    state.sprite.icons_mode = modeEl.value;
    renderSkillIconsConfig();
  });
  state.sprite.icons_mode = modeEl.value;
  renderSkillIconsConfig();
}

function redrawIconsSpriteGrid() {
  const canvas = document.getElementById('icons-sheet-canvas');
  const s = state.sprite;
  if (!canvas || !s.sheet_icon_data) return;

  const fw = s.sheet_icon_fw || 32;
  const fh = s.sheet_icon_fh || 32;
  if (fw <= 0 || fh <= 0) return;

  const img = new Image();
  img.onload = () => {
    let scale = 1;
    if (fw > 0) {
      scale = Math.max(1, Math.min(8, Math.round(80 / fw)));
    }

    const cols = Math.floor(img.width / fw) || 1;
    const rows = Math.floor(img.height / fh) || 1;
    const layout = s.sheet_icon_layout || 'horizontal';

    let totalFramesCount = cols * rows;
    if (layout === 'horizontal') totalFramesCount = cols;
    else if (layout === 'vertical') totalFramesCount = rows;

    const headerHeight = 20;
    let canvasCols = cols;
    let canvasRows = rows;
    if (layout === 'horizontal') {
      canvasCols = totalFramesCount;
      canvasRows = 1;
    } else if (layout === 'vertical') {
      canvasCols = 1;
      canvasRows = totalFramesCount;
    }

    canvas.width = canvasCols * fw * scale;
    canvas.height = canvasRows * (fh * scale + headerHeight);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Fill background
    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < totalFramesCount; i++) {
      let col = 0, row = 0;
      let srcX = 0, srcY = 0;

      if (layout === 'horizontal') {
        col = i;
        row = 0;
        srcX = i * fw;
        srcY = 0;
      } else if (layout === 'vertical') {
        col = 0;
        row = i;
        srcX = 0;
        srcY = i * fh;
      } else { // grid
        col = i % cols;
        row = Math.floor(i / cols);
        srcX = col * fw;
        srcY = row * fh;
      }

      const destX = col * fw * scale;
      const destY = row * (fh * scale + headerHeight);

      // 1. Draw a dark background for the number header area
      ctx.fillStyle = '#13161e';
      ctx.fillRect(destX, destY, fw * scale, headerHeight);

      // 2. Draw frame number text centered in the header
      ctx.fillStyle = '#a5a1ff';
      ctx.font = `bold 10px monospace`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), destX + (fw * scale) / 2, destY + headerHeight / 2);

      // 3. Draw sliced frame image below the header
      ctx.drawImage(img, srcX, srcY, fw, fh, destX, destY + headerHeight, fw * scale, fh * scale);

      // 4. Draw border around the frame image itself
      ctx.strokeStyle = 'rgba(108, 99, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(destX, destY + headerHeight, fw * scale, fh * scale);
      
      // 5. Draw border around the header area itself
      ctx.strokeStyle = '#252a3a';
      ctx.strokeRect(destX, destY, fw * scale, headerHeight);
    }
  };
  img.src = s.sheet_icon_data;
}

function renderSkillIconsConfig() {
  const container = document.getElementById('skill-icons-config');
  const mode = state.sprite.icons_mode;
  if (!container) return;
  container.innerHTML = '';

  // Initialize defaults if not present
  if (!state.sprite.separate_icons_data) state.sprite.separate_icons_data = [null, null, null];
  if (state.sprite.sheet_icon_fw === undefined) state.sprite.sheet_icon_fw = 32;
  if (state.sprite.sheet_icon_fh === undefined) state.sprite.sheet_icon_fh = 32;
  if (state.sprite.sheet_icon_layout === undefined) state.sprite.sheet_icon_layout = 'horizontal';
  if (!state.sprite.sheet_icon_frames) state.sprite.sheet_icon_frames = [1, 2, 3];
  if (!state.sprite.skill_icon_paths) state.sprite.skill_icon_paths = ['', '', ''];
  if (!state.sprite.skill_icon_tags) state.sprite.skill_icon_tags = ['', '', ''];

  const modId = getModId() || 'my_mod';
  const champBase = getChampBase() || 'champion';

  if (mode === 'separate') {
    const grid = document.createElement('div');
    grid.className = 'form-grid';
    grid.style.gridColumn = 'span 2';

    ['Skill 1', 'Skill 2', 'Ultimate'].forEach((label, i) => {
      const defaultPath = `asset/${modId}/icons/${champBase}_skill${i + 1}`;
      const pathVal = state.sprite.skill_icon_paths[i] || '';
      const hasImg = !!state.sprite.separate_icons_data[i];
      const imgData = state.sprite.separate_icons_data[i];

      const itemGrp = document.createElement('div');
      itemGrp.className = 'binding-card';
      itemGrp.style.cssText = `
        display:flex; flex-direction:column; gap:8px; align-items:stretch;
        padding:12px; border-radius:var(--radius-sm); background:var(--bg-panel);
        border:${hasImg ? '1px solid var(--border-light)' : '1px dashed var(--accent2)'};
        ${!hasImg ? 'background:rgba(255,101,132,0.02)' : ''};
        margin-bottom: 8px;
      `;

      const previewHtml = hasImg
        ? `<img src="${imgData}" style="width:40px;height:40px;object-fit:contain;
             border:1px solid var(--border-light);border-radius:var(--radius-sm);
             background:#06060c;image-rendering:pixelated;flex-shrink:0;" />`
        : `<div style="width:40px;height:40px;border:1px dashed var(--accent2);border-radius:var(--radius-sm);
             background:#1a0f12;display:flex;align-items:center;justify-content:center;
             color:var(--accent2);font-size:14px;flex-shrink:0;">!</div>`;

      itemGrp.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
          ${previewHtml}
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:12px;color:var(--text-primary);">${label} Icon</div>
            <input type="text" id="skill_icon_path_${i}" value="${pathVal}" placeholder="${defaultPath}" style="font-size:11px;padding:4px 6px;margin-top:2px;width:100%;" />
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
            <button type="button" class="btn-secondary btn-sm" id="si-upload-${i}" style="font-size:10px;padding:3px 6px;">📁 Upload</button>
            ${hasImg ? `<button type="button" class="btn-danger btn-sm" id="si-clear-${i}" style="font-size:10px;padding:3px 6px;">✖ Clear</button>` : ''}
          </div>
        </div>
        <input type="file" id="si-file-input-${i}" accept="image/png,image/webp" style="display:none;" />
      `;

      grid.appendChild(itemGrp);
    });

    container.appendChild(grid);

    // Event listeners
    ['Skill 1', 'Skill 2', 'Ultimate'].forEach((label, i) => {
      document.getElementById(`skill_icon_path_${i}`).addEventListener('input', e => {
        state.sprite.skill_icon_paths[i] = e.target.value;
      });

      const fileInput = document.getElementById(`si-file-input-${i}`);
      document.getElementById(`si-upload-${i}`).addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => {
            state.sprite.separate_icons_data[i] = ev.target.result;
            renderSkillIconsConfig();
          };
          reader.readAsDataURL(file);
        }
      });

      if (state.sprite.separate_icons_data[i]) {
        document.getElementById(`si-clear-${i}`).addEventListener('click', () => {
          state.sprite.separate_icons_data[i] = null;
          renderSkillIconsConfig();
        });
      }
    });

  } else if (mode === 'sheet') {
    const hasImg = !!state.sprite.sheet_icon_data;
    const imgData = state.sprite.sheet_icon_data;

    const grp = document.createElement('div');
    grp.className = 'form-grid';
    grp.style.gridColumn = 'span 2';

    const defaultSource = `asset/${modId}/icons/${champBase}_skill_icons`;
    const sourceVal = state.sprite.skill_icon_source || '';

    const uploadCard = document.createElement('div');
    uploadCard.className = 'binding-card';
    uploadCard.style.cssText = `
      display:flex; flex-direction:column; gap:8px; align-items:stretch;
      padding:12px; border-radius:var(--radius-sm); background:var(--bg-panel);
      border:${hasImg ? '1px solid var(--border-light)' : '1px dashed var(--accent2)'};
      ${!hasImg ? 'background:rgba(255,101,132,0.02)' : ''};
      grid-column: span 2;
    `;

    const previewHtml = hasImg
      ? `<img src="${imgData}" style="width:48px;height:48px;object-fit:contain;
           border:1px solid var(--border-light);border-radius:var(--radius-sm);
           background:#06060c;image-rendering:pixelated;flex-shrink:0;" />`
      : `<div style="width:48px;height:48px;border:1px dashed var(--accent2);border-radius:var(--radius-sm);
           background:#1a0f12;display:flex;align-items:center;justify-content:center;
           color:var(--accent2);font-size:16px;flex-shrink:0;">!</div>`;

    uploadCard.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        ${previewHtml}
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:13px;color:var(--text-primary);">Shared Icons Spritesheet</div>
          <input type="text" id="skill_icon_source" value="${sourceVal}" placeholder="${defaultSource}" style="font-size:11px;padding:4px 6px;margin-top:2px;width:100%;" />
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
          <button type="button" class="btn-secondary btn-sm" id="si-sheet-upload" style="font-size:11px;padding:4px 8px;">📁 Upload Sheet</button>
          ${hasImg ? `<button type="button" class="btn-danger btn-sm" id="si-sheet-clear" style="font-size:11px;padding:4px 8px;">✖ Clear</button>` : ''}
        </div>
      </div>
      <input type="file" id="si-sheet-file-input" accept="image/png,image/webp" style="display:none;" />
    `;

    grp.appendChild(uploadCard);

    if (hasImg) {
      const configPanel = document.createElement('div');
      configPanel.className = 'form-grid';
      configPanel.style.cssText = `
        grid-column: span 2; border-top: 1px solid var(--border);
        padding-top: 12px; margin-top: 4px; display: flex; flex-direction: column; gap: 8px;
      `;

      configPanel.innerHTML = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <div>
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Frame Width (px)</div>
            <input type="number" class="si-sheet-input" id="si-sheet-fw" value="${state.sprite.sheet_icon_fw}" min="1" style="width:72px;padding:4px 6px;font-size:11px;" />
          </div>
          <div>
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Frame Height (px)</div>
            <input type="number" class="si-sheet-input" id="si-sheet-fh" value="${state.sprite.sheet_icon_fh}" min="1" style="width:72px;padding:4px 6px;font-size:11px;" />
          </div>
          <div style="flex:1;">
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:2px;">Sheet Layout</div>
            <select class="si-sheet-input" id="si-sheet-lay" style="padding:4px 6px;font-size:11px;width:100%;">
              <option value="horizontal" ${state.sprite.sheet_icon_layout==='horizontal'?'selected':''}>Horizontal →</option>
              <option value="vertical"   ${state.sprite.sheet_icon_layout==='vertical'?'selected':''}>Vertical ↓</option>
              <option value="grid"       ${state.sprite.sheet_icon_layout==='grid'?'selected':''}>Grid ⊞</option>
            </select>
          </div>
        </div>
      `;

      const iconsContainer = document.createElement('div');
      iconsContainer.style.cssText = `
        display: flex; gap: 6px; flex-direction: column; margin-top: 4px;
      `;

      ['Skill 1', 'Skill 2', 'Ultimate'].forEach((label, i) => {
        const defaultTag = `${champBase}_skill${i + 1}`;
        const tagVal = state.sprite.skill_icon_tags[i] || '';
        const frameIdx = state.sprite.sheet_icon_frames[i] || (i + 1);

        const row = document.createElement('div');
        row.style.cssText = `
          display: flex; gap: 8px; align-items: center; background: var(--bg-deep);
          padding: 6px 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-light);
        `;

        row.innerHTML = `
          <div style="font-weight:600;font-size:11px;color:var(--text-sec);min-width:60px;">${label}</div>
          <div style="flex:1;display:flex;gap:4px;align-items:center;">
            <span style="font-size:9px;color:var(--text-muted);">Tag:</span>
            <input type="text" class="si-sheet-input" id="si-tag-${i}" value="${tagVal}" placeholder="${defaultTag}" style="font-size:11px;padding:3px 6px;flex:1;" />
          </div>
          <div style="width:80px;display:flex;gap:4px;align-items:center;">
            <span style="font-size:9px;color:var(--text-muted);">Frame:</span>
            <input type="number" class="si-sheet-input" id="si-frame-${i}" value="${frameIdx}" min="1" style="font-size:11px;padding:3px 6px;width:40px;" />
          </div>
        `;

        iconsContainer.appendChild(row);
      });

      configPanel.appendChild(iconsContainer);

      const previewWrapper = document.createElement('div');
      previewWrapper.style.cssText = `
        margin-top: 4px; width: 100%; max-height: 180px;
        overflow: auto; border: 1px solid var(--border); border-radius: var(--radius-sm);
        background: #06060c;
      `;
      previewWrapper.innerHTML = `<canvas id="icons-sheet-canvas" style="display:block;image-rendering:pixelated;image-rendering:crisp-edges;"></canvas>`;

      configPanel.appendChild(previewWrapper);
      grp.appendChild(configPanel);
    }

    container.appendChild(grp);

    // Event listeners
    document.getElementById('skill_icon_source').addEventListener('input', e => {
      state.sprite.skill_icon_source = e.target.value;
    });

    const fileInput = document.getElementById('si-sheet-file-input');
    document.getElementById('si-sheet-upload').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => {
          const img = new Image();
          img.onload = () => {
            state.sprite.sheet_icon_data = ev.target.result;
            state.sprite.sheet_icon_width = img.width;
            state.sprite.sheet_icon_height = img.height;
            renderSkillIconsConfig();
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    if (hasImg) {
      document.getElementById('si-sheet-clear').addEventListener('click', () => {
        state.sprite.sheet_icon_data = null;
        renderSkillIconsConfig();
      });

      const patchSheet = () => {
        const v = id => { const el = document.getElementById(id); return el ? el.value : null; };
        const fw = parseInt(v('si-sheet-fw')); if (!isNaN(fw) && fw > 0) state.sprite.sheet_icon_fw = fw;
        const fh = parseInt(v('si-sheet-fh')); if (!isNaN(fh) && fh > 0) state.sprite.sheet_icon_fh = fh;
        const lay = v('si-sheet-lay'); if (lay) state.sprite.sheet_icon_layout = lay;

        for (let i = 0; i < 3; i++) {
          state.sprite.skill_icon_tags[i] = v(`si-tag-${i}`) || '';
          state.sprite.sheet_icon_frames[i] = parseInt(v(`si-frame-${i}`)) || (i + 1);
        }
        redrawIconsSpriteGrid();
      };

      container.querySelectorAll('.si-sheet-input').forEach(el => el.addEventListener('input', patchSheet));
      redrawIconsSpriteGrid();
    }
  }
}

// ── I18N ──────────────────────────────────────────────────────

// ── I18N LANGUAGES ────────────────────────────────────────────

// All known TFM2 languages + common extras
const ALL_LANGS = [
  { code: 'en', flag: '\u{1F1FA}\u{1F1F8}', label: 'English' },
  { code: 'ko', flag: '\u{1F1F0}\u{1F1F7}', label: 'Korean' },
  { code: 'zh', flag: '\u{1F1E8}\u{1F1F3}', label: 'Chinese (Simplified)' },
  { code: 'zh_tw', flag: '\u{1F1F9}\u{1F1FC}', label: 'Chinese (Traditional)' },
  { code: 'ja', flag: '\u{1F1EF}\u{1F1F5}', label: 'Japanese' },
  { code: 'pt', flag: '\u{1F1E7}\u{1F1F7}', label: 'Portuguese' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', label: 'Spanish' },
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', label: 'French' },
  { code: 'de', flag: '\u{1F1E9}\u{1F1EA}', label: 'German' },
  { code: 'ru', flag: '\u{1F1F7}\u{1F1FA}', label: 'Russian' },
];

// Returns the set of language codes that should appear in the editor
// = base (en+ko) + any extra from importedI18n
function getActiveLangs() {
  const base = ['en', 'ko'];
  const imported = state.importedI18n;
  if (!imported) return base;
  const extra = Object.keys(imported).filter(k => !base.includes(k));
  return [...base, ...extra];
}

function initI18n() {
  // Import via file
  const browseBtn = document.getElementById('i18n-browse-btn');
  const fileInput = document.getElementById('i18n-file-input');
  const dropArea = document.getElementById('i18n-drop-area');
  const clearBtn = document.getElementById('i18n-clear-btn');
  const pasteBtn = document.getElementById('i18n-paste-btn');

  if (browseBtn) browseBtn.addEventListener('click', e => { e.preventDefault(); fileInput.click(); });
  if (dropArea) dropArea.addEventListener('click', () => fileInput.click());
  if (fileInput) fileInput.addEventListener('change', e => {
    if (e.target.files[0]) loadI18nFile(e.target.files[0]);
  });
  if (dropArea) {
    dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
    dropArea.addEventListener('drop', e => {
      e.preventDefault();
      dropArea.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) loadI18nFile(e.dataTransfer.files[0]);
    });
  }
  if (clearBtn) clearBtn.addEventListener('click', () => {
    state.importedI18n = null;
    updateI18nImportStatus();
    renderI18nLangTabs();
    renderI18n();
  });
  if (pasteBtn) pasteBtn.addEventListener('click', () => {
    const json = prompt('Cole o conteúdo do arquivo .i18n aqui (JSON):');
    if (!json) return;
    try {
      const parsed = JSON.parse(json);
      applyImportedI18n(parsed);
    } catch (e) {
      alert('JSON inválido: ' + e.message);
    }
  });

  const copyAllBtn = document.getElementById('i18n-copy-all-btn');
  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      const langs = getActiveLangs();
      const source = state.i18n[currentLang];
      if (!source || (!source.name && !source.attack && !source.skill && !source.skill2 && !source.ult)) {
        alert('Por favor, preencha pelo menos um campo no idioma atual antes de copiar.');
        return;
      }
      if (confirm(`Copiar todos os textos de "${currentLang.toUpperCase()}" para todos os outros idiomas (${langs.filter(l => l !== currentLang).map(l => l.toUpperCase()).join(', ')})?`)) {
        langs.forEach(l => {
          if (l !== currentLang) {
            state.i18n[l] = { ...source };
          }
        });
        alert('Copiado com sucesso para todos os idiomas!');
        renderI18n();
      }
    });
  }

  renderI18nLangTabs();
  renderI18n();
}

function loadI18nFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      applyImportedI18n(parsed);
    } catch (e) {
      alert('JSON invÃ¡lido: ' + e.message);
    }
  };
  reader.readAsText(file);
}

function applyImportedI18n(parsed) {
  // Validate: should be { lang: { description: { ... } } }
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    alert('Formato invÃ¡lido. O i18n deve ser um objeto { lang: { description: {...} } }');
    return;
  }
  state.importedI18n = parsed;
  updateI18nImportStatus();
  renderI18nLangTabs();
  renderI18n();
}

function initChampionViewImport() {
  const fileInput = document.getElementById('cv-file-input');
  const dropArea  = document.getElementById('cv-drop-area');
  const clearBtn  = document.getElementById('cv-clear-btn');
  const pasteBtn  = document.getElementById('cv-paste-btn');

  if (dropArea) dropArea.addEventListener('click', () => fileInput.click());
  if (fileInput) fileInput.addEventListener('change', e => {
    if (e.target.files[0]) loadChampionViewFile(e.target.files[0]);
  });
  if (dropArea) {
    dropArea.addEventListener('dragover', e => { e.preventDefault(); dropArea.classList.add('drag-over'); });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('drag-over'));
    dropArea.addEventListener('drop', e => {
      e.preventDefault();
      dropArea.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) loadChampionViewFile(e.dataTransfer.files[0]);
    });
  }
  if (clearBtn) clearBtn.addEventListener('click', () => {
    state.importedChampionView = null;
    updateChampionViewImportStatus();
  });
  if (pasteBtn) pasteBtn.addEventListener('click', () => {
    const json = prompt('Cole o conte\u00fado do arquivo champion_view.champion_view aqui (JSON):');
    if (!json) return;
    try {
      const parsed = JSON.parse(json);
      applyImportedChampionView(parsed);
    } catch (e) {
      alert('JSON inv\u00e1lido: ' + e.message);
    }
  });

  updateChampionViewImportStatus();
}

function loadChampionViewFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      applyImportedChampionView(parsed);
    } catch (e) {
      alert('JSON inv\u00e1lido: ' + e.message);
    }
  };
  reader.readAsText(file);
}

function applyImportedChampionView(parsed) {
  if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
    alert('Formato inv\u00e1lido. O arquivo de visualiza\u00e7\u00e3o deve ser um JSON v\u00e1lido.');
    return;
  }
  let entries = parsed.entries || parsed;
  if (typeof entries !== 'object' || Array.isArray(entries) || entries === null) {
    alert('Formato inv\u00e1lido. Esperado um objeto contendo "entries".');
    return;
  }

  const customEntries = {};
  for (const [champId, data] of Object.entries(entries)) {
    const base = BASE_CHAMPION_VIEW_ENTRIES[champId];
    if (!base) {
      customEntries[champId] = data;
    } else {
      const dataFaceX = data?.face?.x ?? 0;
      const dataFaceY = data?.face?.y ?? 0;
      const dataCenterX = data?.center?.x ?? 0;
      const dataCenterY = data?.center?.y ?? 0;

      if (dataFaceX !== base.face.x || dataFaceY !== base.face.y ||
          dataCenterX !== base.center.x || dataCenterY !== base.center.y) {
        customEntries[champId] = data;
      }
    }
  }

  state.importedChampionView = customEntries;
  updateChampionViewImportStatus();
}

function updateChampionViewImportStatus() {
  const statusEl = document.getElementById('cv-import-status');
  const clearBtn = document.getElementById('cv-clear-btn');
  const listEl = document.getElementById('cv-import-list');
  if (!statusEl) return;

  if (state.importedChampionView && Object.keys(state.importedChampionView).length > 0) {
    const champIds = Object.keys(state.importedChampionView);
    statusEl.className = 'cv-status-badge loaded';
    statusEl.textContent = `\u{2713} ${champIds.length} offsets importado(s)`;
    if (clearBtn) clearBtn.style.display = '';
    if (listEl) {
      listEl.innerHTML = champIds.map(id => `<span class="lang-badge">${id}</span>`).join('');
    }
  } else {
    statusEl.className = 'cv-status-badge empty';
    statusEl.textContent = 'No file loaded';
    if (clearBtn) clearBtn.style.display = 'none';
    if (listEl) listEl.innerHTML = '';
  }
}


function updateI18nImportStatus() {
  const statusEl = document.getElementById('i18n-import-status');
  const clearBtn = document.getElementById('i18n-clear-btn');
  const langList = document.getElementById('i18n-lang-list');
  if (!statusEl) return;

  if (state.importedI18n) {
    const langs = Object.keys(state.importedI18n);
    statusEl.className = 'i18n-status-badge loaded';
    statusEl.textContent = `\u{2713} ${langs.length} idioma(s) carregado(s)`;
    if (clearBtn) clearBtn.style.display = '';
    if (langList) {
      langList.innerHTML = langs.map(l => {
        const info = ALL_LANGS.find(x => x.code === l);
        return `<span class="lang-badge">${info ? info.flag + ' ' + info.label : l}</span>`;
      }).join('');
    }
  } else {
    statusEl.className = 'i18n-status-badge empty';
    statusEl.textContent = 'No file loaded';
    if (clearBtn) clearBtn.style.display = 'none';
    if (langList) langList.innerHTML = '';
  }
}

function renderI18nLangTabs() {
  const container = document.getElementById('lang-tabs-container');
  if (!container) return;
  const langs = getActiveLangs();
  container.innerHTML = '';
  langs.forEach((code, i) => {
    const info = ALL_LANGS.find(x => x.code === code);
    const btn = document.createElement('button');
    btn.className = 'lang-tab' + (code === currentLang ? ' active' : '');
    btn.dataset.lang = code;
    btn.textContent = info ? `${info.flag} ${info.label}` : code;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = code;
      renderI18n();
    });
    container.appendChild(btn);
  });
  // If currentLang is gone, reset to first
  if (!langs.includes(currentLang)) {
    currentLang = langs[0];
    container.querySelector('.lang-tab')?.classList.add('active');
  }
}

function renderI18n() {
  const container = document.getElementById('i18n-form');
  if (!container) return;
  const lang = currentLang;
  const champId = getFullChampId();
  const actions = [
    { key: 'name', label: 'Champion Name', ttKey: 'i18n_name' },
    { key: 'attack', label: 'Basic Attack Description', ttKey: 'i18n_attack' },
    { key: 'skill', label: 'Skill 1 Description', ttKey: 'i18n_skill' },
    { key: 'skill2', label: 'Skill 2 Description', ttKey: 'i18n_skill2' },
    { key: 'ult', label: 'Ultimate Description', ttKey: 'i18n_ult' },
  ];
  container.innerHTML = '';
  actions.forEach(a => {
    const grp = document.createElement('div');
    grp.className = 'i18n-field';
    const keyNote = `description.${champId}.${a.key}`;
    grp.innerHTML = `
      <label>${labelWithHelp(a.label, a.ttKey)}</label>
      <small style="margin-bottom:4px">Key: <code>${keyNote}</code></small>
      <textarea id="i18n_${lang}_${a.key}" rows="${a.key === 'name' ? 1 : 3}" placeholder="${a.key === 'name' ? 'Champion display name' : 'Skill description...'}">${(state.i18n[lang] || {})[a.key] || ''}</textarea>
    `;
    container.appendChild(grp);
    grp.querySelector(`#i18n_${lang}_${a.key}`).addEventListener('input', e => {
      if (!state.i18n[lang]) state.i18n[lang] = {};
      state.i18n[lang][a.key] = e.target.value;
    });
  });
}

// ── HELPERS ────────────────────────────────────────────────────

function getModId() { return (state.mod.id || 'my_mod').toLowerCase().replace(/\s+/g, '_'); }
function getChampBase() {
  const raw = state.champion.id || state.champion.name || 'champion';
  return raw.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}
function getFullChampId() { return `${getModId()}_${getChampBase()}`; }
function getSpriteName() {
  return state.sprite.sprite_name || getChampBase();
}

// ── JSON GENERATION ────────────────────────────────────────────

function generateDataChampion() {
  const modId = getModId();
  const champId = getFullChampId();

  const obj = {
    id: champId,
    category: state.champion.category,
    tags: [...state.champion.tags],
  };

  // Sprite
  const animPrefix = state.champion.anim_prefix;
  if (animPrefix !== null && animPrefix !== undefined) {
    obj.sprite = `asset/${modId}/aseprite_resources/champions/${getSpriteName()}`;
    obj.anim_prefix = animPrefix;
  }

  // skill_icons or skill_icon
  const iconsMode = state.sprite.icons_mode;
  if (iconsMode === 'separate') {
    const paths = state.sprite.skill_icon_paths;
    if (paths.some(p => p.trim())) {
      obj.skill_icons = paths.map((p, i) => p.trim() || `asset/${modId}/icons/${getChampBase()}_skill${i + 1}`);
    }
  } else if (iconsMode === 'sheet') {
    if (state.sprite.skill_icon_source.trim()) {
      obj.skill_icon = {
        source: state.sprite.skill_icon_source.trim(),
        tags: state.sprite.skill_icon_tags.map((t, i) => t.trim() || `${getChampBase()}_skill${i + 1}`),
      };
    }
  }

  // Stats
  obj.stat = {};
  obj.growth = {};
  STAT_FIELDS.forEach(f => {
    obj.stat[f.key] = state.stats[f.key];
    obj.growth[f.key] = state.growth[f.key];
  });

  // Actions
  ['attack', 'skill', 'skill2', 'ult'].forEach(name => {
    const a = state.actions[name];
    const action = {
      action_name: a.action_name || name,
      duration: a.duration,
      cooltime: a.cooltime,
      start_timing: a.start_timing,
      cancelable: a.cancelable,
      range: a.range,
      casting_type: a.casting_type,
      casting_target: a.casting_target,
      attack_type: a.attack_type,
    };
    if (a.growth_range) action.growth_range = a.growth_range;
    if (a.can_use_with_move) action.can_use_with_move = true;

    // description i18n key
    if (name !== 'attack') {
      action.description = `#asset/base/text/champion?description.${champId}.${name}`;
    }

    if (a.effect) action.effect = cleanEffect(a.effect);
    obj[name] = action;
  });

  // View bindings — strip runtime-only / creator-only fields
  const BINDING_RUNTIME_FIELDS = [
    'image_data','image_width','image_height',
    'frame_width','frame_height','frame_duration','layout',
    'range_from','range_to',
    'pre_from','pre_to','loop_from','loop_to','remove_from','remove_to'
  ];
  const cleanBinding = list => list.map(item => {
    const out = { ...item };
    if (out.anim) out.anim = cleanAssetPath(out.anim);
    if (out.sprite) out.sprite = cleanAssetPath(out.sprite);
    BINDING_RUNTIME_FIELDS.forEach(k => delete out[k]);
    return out;
  });
  if (state.view_effects.length)     obj.view_effects     = cleanBinding(state.view_effects);
  if (state.view_projectiles.length) obj.view_projectiles = cleanBinding(state.view_projectiles);
  if (state.view_buffs.length)       obj.view_buffs       = cleanBinding(state.view_buffs);

  return JSON.stringify(obj, null, 2);
}

function cleanEffect(effect) {
  if (!effect) return null;
  const out = { ...effect };
  // Remove opacity if default
  if (out.opacity === 1) delete out.opacity;
  // Special: RangeEffect apply_type Forward serialization
  if (out.type === 'RangeEffect') {
    if (out.apply_type === 'Forward') {
      const offset = out.apply_type_offset || 24000;
      out.apply_type = { Forward: { offset } };
    }
    delete out.apply_type_offset;
  }
  // Clean arrays
  if (out.applied_effects) out.applied_effects = out.applied_effects.filter(e => e && (e.effect || e).type);
  if (out.effects) out.effects = out.effects.filter(e => e && e.type);
  if (out.end_effects) out.end_effects = out.end_effects.filter(e => e && e.type);
  // Recurse
  if (out.effect_none) out.effect_none = cleanEffect(out.effect_none);
  if (out.effect_buff) out.effect_buff = cleanEffect(out.effect_buff);
  if (out.effect_start) out.effect_start = cleanEffect(out.effect_start);
  if (out.effect_level3) out.effect_level3 = cleanEffect(out.effect_level3);

  // Process and flatten applied_effects
  if (out.applied_effects) {
    const newApplied = [];
    out.applied_effects.forEach(e => {
      const item = e.effect ? e : { effect: e, casting_type: 'Targeting' };
      const cleanedChild = cleanEffect(item.effect);
      if (cleanedChild) {
        if (cleanedChild.type === 'Combine' && cleanedChild.effects) {
          cleanedChild.effects.forEach(child => {
            if (child) newApplied.push({ effect: cleanEffect(child), casting_type: item.casting_type || 'Targeting' });
          });
        } else {
          newApplied.push({ effect: cleanedChild, casting_type: item.casting_type || 'Targeting' });
        }
      }
    });
    out.applied_effects = newApplied;
  }

  // Process and flatten effects
  if (out.effects) {
    const newEffects = [];
    out.effects.forEach(e => {
      const cleanedChild = cleanEffect(e);
      if (cleanedChild) {
        if (cleanedChild.type === 'Combine' && cleanedChild.effects) {
          cleanedChild.effects.forEach(child => {
            if (child) newEffects.push(cleanEffect(child));
          });
        } else {
          newEffects.push(cleanedChild);
        }
      }
    });
    out.effects = newEffects;
  }

  // Process and flatten end_effects
  if (out.end_effects) {
    const newEnd = [];
    out.end_effects.forEach(e => {
      const item = e.effect ? e : { effect: e, casting_type: 'Targeting' };
      const cleanedChild = cleanEffect(item.effect);
      if (cleanedChild) {
        if (cleanedChild.type === 'Combine' && cleanedChild.effects) {
          cleanedChild.effects.forEach(child => {
            if (child) {
              if (out.type === 'RangePeriodProjectile') {
                newEnd.push({ effect: cleanEffect(child), casting_type: item.casting_type || 'Targeting' });
              } else {
                newEnd.push(cleanEffect(child));
              }
            }
          });
        } else {
          if (out.type === 'RangePeriodProjectile') {
            newEnd.push({ effect: cleanedChild, casting_type: item.casting_type || 'Targeting' });
          } else {
            newEnd.push(cleanedChild);
          }
        }
      }
    });
    out.end_effects = newEnd;
  }
  return out;
}

function generateModInfo() {
  const obj = {
    name: state.mod.name || '(Mod Name)',
    mod_id: getModId(),
    author: state.mod.author || '(Author)',
    version: state.mod.version || '1.0.0',
    description: state.mod.description || '',
    last_updated: state.mod.last_updated || new Date().toISOString().slice(0, 10),
    dependencies: [{ mod_id: 'base', version: state.mod.base_version || '>=0.1.0' }],
  };
  return JSON.stringify(obj, null, 2);
}

function generateOverrideInfo() {
  const modId = getModId();
  const obj = {
    [`asset/base/text/champion`]: {
      remapping: `asset/${modId}/text/champion`,
      type: 'override',  // override needed — merge doesn't work cross-mod
    },
    [`asset/base/style/champion_view`]: {
      remapping: `asset/${modId}/style/champion_view`,
      type: 'override',
    },
  };
  return JSON.stringify(obj, null, 2);
}

// Full base-game champion_view entries (sourced from dio_mod champion_view)
const BASE_CHAMPION_VIEW_ENTRIES = { "swordman": { "face": { "x": -1, "y": -34 }, "center": { "x": 0, "y": -11 } }, "monk": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "pythoness": { "face": { "x": 0, "y": -28 }, "center": { "x": 0, "y": -9 } }, "priest": { "face": { "x": 0, "y": -30 }, "center": { "x": 0, "y": -12 } }, "pyromancer": { "face": { "x": 0, "y": -35 }, "center": { "x": 0, "y": -14 } }, "ninja": { "face": { "x": 1, "y": -26 }, "center": { "x": 0, "y": -8 } }, "fighter": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "knight": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "archer": { "face": { "x": 0, "y": -26 }, "center": { "x": 0, "y": -10 } }, "berserker": { "face": { "x": 3, "y": -38 }, "center": { "x": 0, "y": -12 } }, "boomerang_hunter": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "dual_blader": { "face": { "x": 2, "y": -32 }, "center": { "x": 0, "y": -12 } }, "gambler": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "ice_mage": { "face": { "x": 0, "y": -37 }, "center": { "x": 0, "y": -12 } }, "jiangshi": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "lancer": { "face": { "x": 3, "y": -32 }, "center": { "x": 0, "y": -12 } }, "soldier": { "face": { "x": 0, "y": -24 }, "center": { "x": 0, "y": -9 } }, "shield_bearer": { "face": { "x": 4, "y": -30 }, "center": { "x": 0, "y": -12 } }, "werewolf": { "face": { "x": 26, "y": -42 }, "center": { "x": 0, "y": -12 } }, "executioner": { "face": { "x": 5, "y": -37 }, "center": { "x": 0, "y": -12 } }, "ogre": { "face": { "x": 7, "y": -54 }, "center": { "x": 0, "y": -12 } }, "magic_knight": { "face": { "x": 0, "y": -33 }, "center": { "x": 0, "y": -12 } }, "bard": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "barrier_magician": { "face": { "x": 0, "y": -32 }, "center": { "x": 0, "y": -12 } }, "chef": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "clown": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "dancer": { "face": { "x": 2, "y": -32 }, "center": { "x": 0, "y": -12 } }, "dark_mage": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "demon": { "face": { "x": 4, "y": -26 }, "center": { "x": 0, "y": -10 } }, "exorcist": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "ghost": { "face": { "x": 0, "y": -26 }, "center": { "x": 0, "y": -12 } }, "gunner": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "illusionist": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "lightning_mage": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "necromancer": { "face": { "x": 0, "y": -44 }, "center": { "x": 0, "y": -12 } }, "plague_doctor": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "poison_dart_hunter": { "face": { "x": 0, "y": -32 }, "center": { "x": 0, "y": -12 } }, "shadowmancer": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "taoist": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "vampire": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "hammerer": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "inquisitor": { "face": { "x": 0, "y": -32 }, "center": { "x": 0, "y": -12 } }, "dokkaebi": { "face": { "x": 2, "y": -34 }, "center": { "x": 0, "y": -12 } }, "pole_warrior": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "whip_master": { "face": { "x": 1, "y": -34 }, "center": { "x": 0, "y": -12 } }, "cavalry_knight": { "face": { "x": 1, "y": -44 }, "center": { "x": 0, "y": -12 } }, "siege_breaker": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "android": { "face": { "x": 0, "y": -30 }, "center": { "x": 0, "y": -12 } }, "druid": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "prisoner": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "spirit_caller": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "bomber": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "voodoo_shaman": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "white_mage": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "wind_mage": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "enchanter": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "hitman": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "hunter": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "circus_blade": { "face": { "x": 0, "y": -34 }, "center": { "x": 0, "y": -12 } }, "guardian_spirit": { "face": { "x": 0, "y": -36 }, "center": { "x": 0, "y": -12 } }, "garen": { "face": { "x": 7, "y": -34 }, "center": { "x": 0, "y": -15 } } };

function generateChampionView() {
  const champId = getFullChampId();
  const cv = state.champion_view;
  const entries = Object.assign({}, BASE_CHAMPION_VIEW_ENTRIES, state.importedChampionView || {}, {
    [champId]: {
      face: { x: cv.face_x, y: cv.face_y },
      center: { x: cv.center_x, y: cv.center_y },
    },
  });
  return JSON.stringify({ entries }, null, 2);
}

function generateI18n() {
  const champId = getFullChampId();

  // Start from imported i18n (deep clone) or empty object
  const out = state.importedI18n
    ? JSON.parse(JSON.stringify(state.importedI18n))
    : {};

  // Collect all languages: base (en,ko) + any from imported + any from state.i18n
  const allLangCodes = new Set(['en', 'ko']);
  if (state.importedI18n) Object.keys(state.importedI18n).forEach(k => allLangCodes.add(k));
  Object.keys(state.i18n).forEach(k => allLangCodes.add(k));

  allLangCodes.forEach(lang => {
    // Ensure structure exists
    if (!out[lang]) out[lang] = {};
    if (!out[lang].description) out[lang].description = {};

    const d = state.i18n[lang] || {};
    // Merge/overwrite this champion's keys
    out[lang].description[champId] = {
      name: d.name || '',
      attack: d.attack || '',
      skill: d.skill || '',
      skill2: d.skill2 || '',
      ult: d.ult || '',
    };
  });

  return JSON.stringify(out, null, 2);
}

function generateFanim() {
  const s = state.sprite;
  const fw = s.frame_width;
  const fh = s.frame_height;

  // We don't know the actual sheet size at this point (unless img was loaded)
  // Build from anim_ranges assuming horizontal strip
  const anims = {};
  s.anim_ranges.forEach(range => {
    const frames = [];
    for (let f = range.from; f <= range.to; f++) {
      let x, y;
      if (s.layout === 'horizontal') {
        x = (f - 1) * fw; y = 0;
      } else if (s.layout === 'vertical') {
        x = 0; y = (f - 1) * fh;
      } else {
        // Grid — need sheet width, use placeholder comment
        x = (f - 1) * fw; y = 0;
      }
      frames.push({ duration: range.duration || s.frame_duration, data: { x, y, w: fw, h: fh } });
    }
    anims[range.tag] = { frames };
  });

  return JSON.stringify({ anims }, null, 2);
}

// ── EXPORT ─────────────────────────────────────────────────────

function initExport() {
  document.getElementById('btn-download-all').addEventListener('click', downloadAllFiles);
  document.getElementById('btn-preview-toggle').addEventListener('click', () => {
    const area = document.getElementById('export-preview');
    area.style.display = area.style.display === 'none' ? '' : 'none';
  });
}

function generateBindingFanim(item) {
  const fw     = item.frame_width  || item.image_width  || 40;
  const fh     = item.frame_height || item.image_height || 40;
  const dur    = parseFloat(item.frame_duration) || 0.1;
  const layout = item.layout || 'horizontal';
  const sheetW = item.image_width || fw;
  const cols   = fw > 0 ? Math.max(1, Math.floor(sheetW / fw)) : 1;

  /**
   * Build an array of frame objects for a contiguous 1-indexed range [from, to].
   */
  function buildFrames(from, to, frameDur) {
    const frames = [];
    for (let f = from; f <= to; f++) {
      const z = f - 1;
      let x = 0, y = 0;
      if (layout === 'horizontal')     { x = z * fw; y = 0; }
      else if (layout === 'vertical')  { x = 0; y = z * fh; }
      else /* grid */                  { x = (z % cols) * fw; y = Math.floor(z / cols) * fh; }
      frames.push({ duration: frameDur, data: { x, y, w: fw, h: fh } });
    }
    return frames;
  }

  const anims = {};

  if (item.type === 'ThreePhase') {
    const preTag    = item.pre_tag    || 'spawn';
    const loopTag   = item.loop_tag   || 'loop';
    const removeTag = item.remove_tag || 'remove';
    anims[preTag]    = { frames: buildFrames(item.pre_from    || 1, item.pre_to    || 1, dur) };
    anims[loopTag]   = { frames: buildFrames(item.loop_from   || 1, item.loop_to   || 1, dur) };
    anims[removeTag] = { frames: buildFrames(item.remove_from || 1, item.remove_to || 1, dur) };
  } else {
    // Animation / LoopAnimation share a single tag
    const tag = item.tag || (item.type === 'Animation' ? 'play' : 'idle');
    anims[tag] = { frames: buildFrames(item.range_from || 1, item.range_to || 1, dur) };
  }

  return JSON.stringify({ anims }, null, 2);
}

function generateIconsFanim() {
  const s = state.sprite;
  const fw = s.sheet_icon_fw || 32;
  const fh = s.sheet_icon_fh || 32;
  const layout = s.sheet_icon_layout || 'horizontal';
  const sheetW = s.sheet_icon_width || (fw * 3);
  const cols = fw > 0 ? Math.max(1, Math.floor(sheetW / fw)) : 1;

  const anims = {};
  ['skill1', 'skill2', 'ult'].forEach((tagKey, i) => {
    const champBase = getChampBase() || 'champion';
    const tag = s.skill_icon_tags[i] || `${champBase}_skill${i + 1}`;
    const frameIdx = s.sheet_icon_frames[i] || (i + 1); // 1-indexed
    const z = frameIdx - 1;

    let x = 0, y = 0;
    if (layout === 'horizontal')     { x = z * fw; y = 0; }
    else if (layout === 'vertical')  { x = 0; y = z * fh; }
    else /* grid */                  { x = (z % cols) * fw; y = Math.floor(z / cols) * fh; }

    anims[tag] = {
      frames: [
        { duration: 1, data: { x, y, w: fw, h: fh } }
      ]
    };
  });

  return JSON.stringify({ anims }, null, 2);
}

function buildExportFiles() {
  const modId = getModId();
  const champBase = getChampBase();
  const spriteName = getSpriteName();

  const exportFiles = [
    {
      icon: '\u{1F4CB}',
      name: 'mod.mod_info',
      path: `mods/${modId}/`,
      fullPath: `mods/${modId}/mod.mod_info`,
      content: generateModInfo(),
    },
    {
      icon: '\u{1F504}',
      name: 'mod.override_info',
      path: `mods/${modId}/`,
      fullPath: `mods/${modId}/mod.override_info`,
      content: generateOverrideInfo(),
    },
    {
      icon: '\u{1F9EC}',
      name: `${champBase}.data_champion`,
      path: `mods/${modId}/champion/`,
      fullPath: `mods/${modId}/champion/${champBase}.data_champion`,
      content: generateDataChampion(),
    },
    {
      icon: '\u{1F310}',
      name: 'champion.i18n',
      path: `mods/${modId}/text/`,
      fullPath: `mods/${modId}/text/champion.i18n`,
      content: generateI18n(),
    },
    {
      icon: '\u{1F5BC}\u{FE0F}',
      name: `${spriteName}#anim.fanim`,
      path: `mods/${modId}/aseprite_resources/champions/`,
      fullPath: `mods/${modId}/aseprite_resources/champions/${spriteName}#anim.fanim`,
      content: generateFanim(),
    },
    {
      icon: '\u{1F465}',
      name: 'champion_view.champion_view',
      path: `mods/${modId}/style/`,
      fullPath: `mods/${modId}/style/champion_view.champion_view`,
      content: generateChampionView(),
    },
  ];

  if (state.sprite && state.sprite.has_sprite && spriteImageData) {
    exportFiles.push({
      icon: '\u{1F5BC}\u{FE0F}',
      name: `${spriteName}#sheet.png`,
      path: `mods/${modId}/aseprite_resources/champions/`,
      fullPath: `mods/${modId}/aseprite_resources/champions/${spriteName}#sheet.png`,
      content: spriteImageData,
      isBinary: true
    });
  }

  // Export custom images from visual bindings
  const addedPaths = new Set();
  const addBindingFiles = (list) => {
    if (!list) return;
    list.forEach(item => {
      if (!item.image_data) return;
      const assetPath = item.sprite || item.anim;
      if (!assetPath) return;

      const relPath = getRelativeAssetPath(assetPath);
      if (!relPath) return;

      const parts = relPath.split('/');
      const filenameBase = parts.pop();
      const dirPath = parts.join('/');
      const subDir = dirPath ? dirPath + '/' : '';

      if (item.type === 'Sprite') {
        const fullPath = `mods/${modId}/${subDir}${filenameBase}.png`;
        if (addedPaths.has(fullPath)) return;
        addedPaths.add(fullPath);

        exportFiles.push({
          icon: '\u{1F5BC}\u{FE0F}',
          name: `${filenameBase}.png`,
          path: `mods/${modId}/${subDir}`,
          fullPath: fullPath,
          content: item.image_data,
          isBinary: true
        });
      } else {
        const pngFullPath = `mods/${modId}/${subDir}${filenameBase}#sheet.png`;
        const fanimFullPath = `mods/${modId}/${subDir}${filenameBase}#anim.fanim`;

        if (!addedPaths.has(pngFullPath)) {
          addedPaths.add(pngFullPath);
          exportFiles.push({
            icon: '\u{1F5BC}\u{FE0F}',
            name: `${filenameBase}#sheet.png`,
            path: `mods/${modId}/${subDir}`,
            fullPath: pngFullPath,
            content: item.image_data,
            isBinary: true
          });
        }

        if (!addedPaths.has(fanimFullPath)) {
          addedPaths.add(fanimFullPath);
          exportFiles.push({
            icon: '\u{1F4CB}',
            name: `${filenameBase}#anim.fanim`,
            path: `mods/${modId}/${subDir}`,
            fullPath: fanimFullPath,
            content: generateBindingFanim(item),
            isBinary: false
          });
        }
      }
    });
  };

  addBindingFiles(state.view_projectiles);
  addBindingFiles(state.view_effects);
  addBindingFiles(state.view_buffs);

  // Export skill icons (separate or sheet)
  if (state.sprite.icons_mode === 'separate' && state.sprite.separate_icons_data) {
    state.sprite.separate_icons_data.forEach((data, i) => {
      if (!data) return;
      const assetPath = state.sprite.skill_icon_paths[i] || `asset/${modId}/icons/${champBase}_skill${i + 1}`;
      const relPath = getRelativeAssetPath(assetPath);
      if (!relPath) return;

      const parts = relPath.split('/');
      const filenameBase = parts.pop();
      const dirPath = parts.join('/');
      const subDir = dirPath ? dirPath + '/' : '';

      exportFiles.push({
        icon: '\u{1F5BC}\u{FE0F}',
        name: `${filenameBase}.png`,
        path: `mods/${modId}/${subDir}`,
        fullPath: `mods/${modId}/${subDir}${filenameBase}.png`,
        content: data,
        isBinary: true
      });
    });
  } else if (state.sprite.icons_mode === 'sheet' && state.sprite.sheet_icon_data) {
    const assetPath = state.sprite.skill_icon_source || `asset/${modId}/icons/${champBase}_skill_icons`;
    const relPath = getRelativeAssetPath(assetPath);
    if (relPath) {
      const parts = relPath.split('/');
      const filenameBase = parts.pop();
      const dirPath = parts.join('/');
      const subDir = dirPath ? dirPath + '/' : '';

      exportFiles.push({
        icon: '\u{1F5BC}\u{FE0F}',
        name: `${filenameBase}#sheet.png`,
        path: `mods/${modId}/${subDir}`,
        fullPath: `mods/${modId}/${subDir}${filenameBase}#sheet.png`,
        content: state.sprite.sheet_icon_data,
        isBinary: true
      });

      exportFiles.push({
        icon: '\u{1F4CB}',
        name: `${filenameBase}#anim.fanim`,
        path: `mods/${modId}/${subDir}`,
        fullPath: `mods/${modId}/${subDir}${filenameBase}#anim.fanim`,
        content: generateIconsFanim(),
        isBinary: false
      });
    }
  }

  return exportFiles;
}

function validateAction(name, a) {
  const issues = [];
  if (!a) return issues;

  if (a.duration <= 0) {
    issues.push({
      type: 'error',
      message: `A duração da animação deve ser maior que 0 ticks.`
    });
  }

  if (a.cooltime < 0) {
    issues.push({
      type: 'error',
      message: `O tempo de recarga (Cooldown) não pode ser negativo.`
    });
  }

  if (a.cooltime > 0 && a.cooltime < a.duration) {
    issues.push({
      type: 'warning',
      message: `O tempo de recarga (Cooldown) de <code>${a.cooltime}</code> ticks é menor do que a duração da animação (<code>${a.duration}</code> ticks). O campeão poderá tentar re-conjurar a habilidade antes de terminar a animação atual.`
    });
  }

  if (a.start_timing > a.duration) {
    issues.push({
      type: 'error',
      message: `A animação dura <code>${a.duration}</code> ticks, mas o efeito inicia em <code>${a.start_timing}</code> ticks. O efeito nunca será disparado!`
    });
  }

  if (['Targeting', 'Position', 'Direction'].includes(a.casting_type) && a.range <= 0) {
    issues.push({
      type: 'warning',
      message: `O tipo de conjuração é <code>${a.casting_type}</code>, mas o alcance (Range) está em <code>0</code>. O campeão não conseguirá usar a habilidade à distância.`
    });
  }

  if (a.casting_type === 'None' && a.range > 0) {
    issues.push({
      type: 'warning',
      message: `O alcance está em <code>${a.range}</code>, mas a conjuração é <code>None</code>. O alcance será ignorado pelo jogo.`
    });
  }

  if (a.casting_target === 'None' && ['Targeting', 'Position', 'Direction'].includes(a.casting_type)) {
    issues.push({
      type: 'warning',
      message: `A conjuração é <code>${a.casting_type}</code>, mas o alvo de conjuração é <code>None</code>. A habilidade pode falhar ao ser conjurada.`
    });
  }

  if (name === 'attack') {
    if (['Ally', 'AllyChampion', 'AllyChampionInCC', 'AllyNotSelf', 'AllyOnlySelf'].includes(a.casting_target)) {
      issues.push({
        type: 'warning',
        message: `Ataques básicos normalmente devem visar inimigos. O alvo atual é <code>${a.casting_target}</code>.`
      });
    }
    if (a.attack_type !== 'BaseAttack') {
      issues.push({
        type: 'info',
        message: `O ataque básico está configurado com Attack Type <code>${a.attack_type}</code> ao invés de <code>BaseAttack</code>. Isso pode afetar passivas e comportamentos no jogo.`
      });
    }
  }

  if (!a.effect) {
    issues.push({
      type: 'warning',
      message: `Nenhum efeito foi definido para esta ação. Ela apenas reproduzirá a animação sem causar impacto no jogo.`
    });
  } else {
    const getInitialAlignment = () => {
      if (['Ally', 'AllyChampion', 'AllyChampionInCC', 'AllyNotSelf', 'AllyOnlySelf'].includes(a.casting_target)) {
        return 'Ally';
      }
      if (['Enemy', 'EnemyChampion', 'EnemyChampionInCC', 'EnemyNotSelf'].includes(a.casting_target)) {
        return 'Enemy';
      }
      return 'Neutral';
    };

    const getNextAlignment = (targetStr, current) => {
      if (!targetStr) return current;
      if (['Ally', 'AllyChampion', 'AllyChampionInCC', 'AllyNotSelf', 'AllyOnlySelf'].includes(targetStr)) return 'Ally';
      if (['Enemy', 'EnemyChampion', 'EnemyChampionInCC', 'EnemyNotSelf'].includes(targetStr)) return 'Enemy';
      return current;
    };

    const getBuffNature = (buffState) => {
      if (!buffState) return 'neutral';
      const positiveKeys = [
        'attack', 'attack_mult', 'magic_power', 'magic_power_mult',
        'defence', 'defence_mult', 'hp', 'hp_mult', 'hp_regen',
        'magic_resistance', 'magic_resistance_mult', 'move_speed_mult',
        'attack_speed_mult', 'crit_chance', 'vamp', 'damage_reflect',
        'defence_penetration', 'magic_resistance_penetration', 'toughness'
      ];
      const beneficialFlags = ['cc_immune', 'undying', 'ignore_wall'];

      let positiveCount = 0;
      let negativeCount = 0;

      positiveKeys.forEach(k => {
        if (buffState[k] > 0) positiveCount++;
        if (buffState[k] < 0) negativeCount++;
      });
      beneficialFlags.forEach(f => {
        if (buffState[f] === true) positiveCount++;
      });

      if (buffState.damaged_reduce > 0) positiveCount++;
      if (buffState.damaged_reduce < 0) negativeCount++;
      if (buffState.damaged_amplify > 0) negativeCount++;
      if (buffState.damaged_amplify < 0) positiveCount++;
      if (buffState.heal_reduce > 0) negativeCount++;
      if (buffState.heal_reduce < 0) positiveCount++;

      if (positiveCount > 0 && negativeCount === 0) return 'beneficial';
      if (negativeCount > 0 && positiveCount === 0) return 'harmful';
      if (positiveCount > 0 && negativeCount > 0) return 'mixed';
      return 'neutral';
    };

    const scanActionEffect = (eff, contextPath, targetAlignment = getInitialAlignment(), parentProjectileName = null) => {
      if (!eff) return;
      const type = eff.type;

      if (eff.hasOwnProperty('name') || eff.name !== undefined) {
        if (typeof eff.name !== 'string' || eff.name.trim() === '') {
          const isCritical = !['Sfx', 'TargetSfx'].includes(type);
          issues.push({
            type: isCritical ? 'error' : 'warning',
            message: `O efeito <code>${type}</code> (${contextPath}) está com o nome <code>name</code> vazio.`
          });
        }
      }

      if (type === 'RemoveCasterBuff' && (!eff.name || eff.name.trim() === '')) {
        issues.push({
          type: 'error',
          message: `O efeito <code>RemoveCasterBuff</code> (${contextPath}) está com o nome do buff <code>name</code> vazio.`
        });
      }

      // Check for infinite projectile loops
      if ([
        'LinearProjectile', 'BackToCasterLinearProjectile', 'TargetProjectile',
        'TargetProjectileFromProjectile', 'TargetSplashProjectile', 'AutoTargetProjectile',
        'RangeProjectile', 'LineRangeProjectile', 'RangePeriodProjectile', 'ApplyInProjectile',
        'ParabolicProjectile'
      ].includes(type)) {
        if (eff.name && eff.name.trim() && eff.name.trim() === parentProjectileName) {
          issues.push({
            type: 'error',
            message: `O projétil/efeito <code>${eff.name}</code> (${contextPath}) está fazendo referência a si mesmo ou ao projétil pai, criando um potencial loop infinito de spawns que travará o jogo.`
          });
        }
      }

      // Check target alignment mismatches (healing enemies or damaging allies)
      const IS_HARMFUL = ['Attack', 'ApAttack', 'FixedAttack', 'Stun', 'Airborne', 'Knockback', 'Grab', 'Pull', 'Fear', 'Charm', 'Bind', 'Taunt', 'BlockAttack', 'BlockSkill', 'BlockMoveSkill', 'Banish'];
      const IS_BENEFICIAL = ['Heal', 'Shield'];

      if (targetAlignment === 'Ally' || targetAlignment === 'Self') {
        if (IS_HARMFUL.includes(type)) {
          issues.push({
            type: 'warning',
            message: `O efeito prejudicial/dano <code>${type}</code> (${contextPath}) está configurado em um fluxo voltado para ALIANÇA ou CASTER. Isso aplicará dano ou CC nos seus próprios aliados!`
          });
        }
        if ((type === 'AddBuff' || type === 'AddCasterBuff') && eff.buff_state) {
          const nature = getBuffNature(eff.buff_state);
          if (nature === 'harmful') {
            issues.push({
              type: 'warning',
              message: `O buff <code>${eff.buff_state.name}</code> (${contextPath}) reduz atributos (debuff) mas está sendo aplicado a si mesmo ou a um aliado.`
            });
          }
        }
      } else if (targetAlignment === 'Enemy') {
        if (IS_BENEFICIAL.includes(type)) {
          issues.push({
            type: 'warning',
            message: `O efeito benéfico <code>${type}</code> (${contextPath}) está configurado em um fluxo voltado para INIMIGOS. Isso curará ou dará escudo aos adversários!`
          });
        }
        if (type === 'AddBuff' && eff.buff_state) {
          const nature = getBuffNature(eff.buff_state);
          if (nature === 'beneficial') {
            issues.push({
              type: 'warning',
              message: `O efeito <code>AddBuff</code> com atributos positivos (${eff.buff_state.name}) está sendo aplicado a um INIMIGO. Se o objetivo era conceder buffs a si mesmo, use <code>AddCasterBuff</code>.`
            });
          } else {
            issues.push({
              type: 'warning',
              message: `O efeito <code>AddBuff</code> (${contextPath}) aplica um buff no inimigo. Se você queria bufar a si mesmo ao atingir um inimigo, use <code>AddCasterBuff</code>.`
            });
          }
        }
      }

      if (type === 'AddCasterBuff' && eff.only_to_enemy && targetAlignment === 'Ally') {
        issues.push({
          type: 'error',
          message: `O efeito <code>AddCasterBuff</code> (${contextPath}) possui <code>only_to_enemy: true</code>, mas a habilidade está configurada para atingir ALIANÇAS. O buff nunca será ativado.`
        });
      }

      // Check projectile/movement travel times and distances
      if (type === 'LinearProjectile' || type === 'BackToCasterLinearProjectile') {
        if (eff.speed > 0 && eff.range > 0) {
          const travelTime = eff.range / eff.speed;
          if (travelTime > 15) {
            issues.push({
              type: 'warning',
              message: `O projétil linear (${contextPath}) viaja muito devagar e levará <code>${travelTime.toFixed(1)}</code> segundos para atingir o alcance máximo. Aumente a velocidade (<code>${eff.speed}</code>) ou reduza o alcance (<code>${eff.range}</code>).`
            });
          } else if (travelTime < 0.05) {
            issues.push({
              type: 'warning',
              message: `O projétil linear (${contextPath}) viaja extremamente rápido (menos de 1 tick). Considere usar um efeito de área instantâneo ou reduzir a velocidade.`
            });
          }
        }
      }

      if (['Knockback', 'Grab', 'Pull', 'MoveBack'].includes(type)) {
        if (eff.speed > 0 && eff.tick > 0) {
          const distance = (eff.speed * eff.tick) / 60;
          if (distance > 100000) {
            issues.push({
              type: 'warning',
              message: `A distância de empurrão/atração do efeito <code>${type}</code> (${contextPath}) é estimada em <code>${Math.round(distance)}</code> unidades. Isso arremessará o alvo para fora da tela de combate!`
            });
          } else if (distance < 2000) {
            issues.push({
              type: 'info',
              message: `A distância de empurrão/atração do efeito <code>${type}</code> (${contextPath}) é de apenas <code>${Math.round(distance)}</code> unidades. O movimento será quase imperceptível.`
            });
          }
        }
      }

      // Check for Rush / RushTime movement settings recommendation
      if (['Rush', 'RushTime', 'MoveTo', 'MoveToTarget', 'RushMoveToBack', 'DirTeleport', 'Teleport', 'MoveBack'].includes(type)) {
        if (a.can_use_with_move === false) {
          issues.push({
            type: 'info',
            message: `A ação contém o efeito de movimento/dash <code>${type}</code> (${contextPath}), mas "Use while moving" está desativado nas configurações da ação. Recomenda-se ativar "Use while moving" para evitar travamentos de movimentação.`
          });
        }
      }

      if (['Rush', 'RushTime'].includes(type)) {
        if (!eff.applied_effects || eff.applied_effects.length === 0) {
          issues.push({
            type: 'warning',
            message: `O avanço <code>${type}</code> (${contextPath}) não possui efeitos em <code>applied_effects</code>. Ele moverá o campeão sem causar impacto aos colididos.`
          });
        }
      }

      // Check ratio/scaling stats compatibility
      if (['Attack', 'FixedAttack'].includes(type)) {
        if (eff.attack_ratio > 0 && state.stats.attack === 0) {
          issues.push({
            type: 'warning',
            message: `O efeito <code>${type}</code> (${contextPath}) possui escalamento de ataque físico (<code>attack_ratio: ${eff.attack_ratio}%</code>), mas o atributo base <strong>Attack</strong> do campeão é 0.`
          });
        }
      }
      if (type === 'ApAttack') {
        if (eff.attack_ratio > 0 && state.stats.magic_power === 0) {
          issues.push({
            type: 'warning',
            message: `O efeito <code>ApAttack</code> (${contextPath}) possui escalamento mágico (<code>AP Ratio: ${eff.attack_ratio}%</code>), mas o atributo base <strong>Magic Power</strong> do campeão é 0.`
          });
        }
      }
      if (type === 'Heal') {
        if (eff.ap_ratio > 0 && state.stats.magic_power === 0) {
          issues.push({
            type: 'warning',
            message: `A cura (${contextPath}) possui escalamento de AP (<code>ap_ratio: ${eff.ap_ratio}%</code>), mas o atributo base <strong>Magic Power</strong> do campeão é 0.`
          });
        }
        if (eff.attack_ratio > 0 && state.stats.attack === 0) {
          issues.push({
            type: 'warning',
            message: `A cura (${contextPath}) possui escalamento de ataque (<code>attack_ratio: ${eff.attack_ratio}%</code>), mas o atributo base <strong>Attack</strong> do campeão é 0.`
          });
        }
      }
      if (type === 'Shield') {
        if (eff.ap_ratio > 0 && state.stats.magic_power === 0) {
          issues.push({
            type: 'warning',
            message: `O escudo (${contextPath}) possui escalamento de AP (<code>ap_ratio: ${eff.ap_ratio}%</code>), mas o atributo base <strong>Magic Power</strong> do campeão é 0.`
          });
        }
        if (eff.attack_ratio > 0 && state.stats.attack === 0) {
          issues.push({
            type: 'warning',
            message: `O escudo (${contextPath}) possui escalamento de ataque (<code>attack_ratio: ${eff.attack_ratio}%</code>), mas o atributo base <strong>Attack</strong> do campeão é 0.`
          });
        }
      }

      // Check periodic effect period divisor match
      if (['AddCasted', 'RangePeriodProjectile'].includes(type)) {
        if (eff.period > 0 && eff.duration > 0) {
          if (eff.duration % eff.period !== 0) {
            issues.push({
              type: 'info',
              message: `O período de repetição (<code>${eff.period}</code> ticks) não divide igualmente a duração (<code>${eff.duration}</code> ticks) no efeito periódico <code>${type}</code> (${contextPath}). O ciclo final será cortado antes de completar.`
            });
          }
        }
      }

      // Check projectile bindings
      if ([
        'LinearProjectile', 'BackToCasterLinearProjectile', 'TargetProjectile',
        'TargetProjectileFromProjectile', 'TargetSplashProjectile', 'AutoTargetProjectile',
        'RangeProjectile', 'LineRangeProjectile', 'RangePeriodProjectile', 'ApplyInProjectile',
        'ParabolicProjectile', 'ShrinkingBarrier'
      ].includes(type)) {
        if (eff.name && eff.name.trim()) {
          const binding = state.view_projectiles.find(p => p.name === eff.name.trim());
          if (!binding) {
            issues.push({
              type: 'error',
              message: `O projétil/barreira <code>${eff.name}</code> (${contextPath}) não possui vinculação visual em <strong>view_projectiles</strong>. O jogo irá travar ao carregar o mod!`
            });
          } else if (!binding.image_data) {
            issues.push({
              type: 'warning',
              message: `O projétil/barreira <code>${eff.name}</code> (${contextPath}) possui vinculação visual, mas você ainda não fez o upload da imagem PNG dele.`
            });
          }
        }
      }

      // Check view effect bindings
      if (type === 'ViewEffect' || type === 'CasterViewEffect') {
        if (eff.name && eff.name.trim()) {
          const binding = state.view_effects.find(e => e.name === eff.name.trim());
          if (!binding) {
            issues.push({
              type: 'error',
              message: `O efeito visual <code>${eff.name}</code> (${contextPath}) não possui vinculação visual em <strong>view_effects</strong>. O jogo irá travar!`
            });
          } else if (!binding.image_data) {
            issues.push({
              type: 'warning',
              message: `O efeito visual <code>${eff.name}</code> (${contextPath}) possui vinculação visual, mas sem imagem PNG.`
            });
          }
        }
      }

      if (type === 'Banish') {
        if (eff.lock_effect_name && eff.lock_effect_name.trim()) {
          const binding = state.view_effects.find(e => e.name === eff.lock_effect_name.trim());
          if (!binding) {
            issues.push({
              type: 'error',
              message: `O efeito de banimento <code>${eff.lock_effect_name}</code> (${contextPath}) não está em <strong>view_effects</strong>. O jogo irá travar!`
            });
          }
        }
        if (eff.end_effect_name && eff.end_effect_name.trim()) {
          const binding = state.view_effects.find(e => e.name === eff.end_effect_name.trim());
          if (!binding) {
            issues.push({
              type: 'error',
              message: `O efeito de fim de banimento <code>${eff.end_effect_name}</code> (${contextPath}) não está em <strong>view_effects</strong>. O jogo irá travar!`
            });
          }
        }
      }

      if (type === 'ParabolicProjectile' && eff.range_effect_name && eff.range_effect_name.trim()) {
        const binding = state.view_effects.find(e => e.name === eff.range_effect_name.trim());
        if (!binding) {
          issues.push({
            type: 'error',
            message: `O efeito de área <code>${eff.range_effect_name}</code> (${contextPath}) do projétil parabólico não está em <strong>view_effects</strong>. O jogo irá travar!`
          });
        }
      }

      // Check buff state bindings
      if (type === 'AddBuff' || type === 'AddCasterBuff') {
        if (eff.buff_state) {
          if (!eff.buff_state.name || eff.buff_state.name.trim() === '') {
            issues.push({
              type: 'error',
              message: `O buff (${contextPath}) possui um Buff sem nome! Buffs precisam de um nome.`
            });
          } else {
            const binding = state.view_buffs.find(b => b.name === eff.buff_state.name.trim());
            if (!binding) {
              issues.push({
                type: 'error',
                message: `O buff <code>${eff.buff_state.name}</code> (${contextPath}) não possui vinculação visual em <strong>view_buffs</strong>. O jogo irá travar!`
              });
            } else if (!binding.image_data) {
              issues.push({
                type: 'warning',
                message: `O buff <code>${eff.buff_state.name}</code> (${contextPath}) possui vinculação visual, mas sem imagem PNG.`
              });
            }
          }
        }
      }

      // CC Durations
      if (['Stun', 'Airborne', 'Bind', 'Taunt'].includes(type)) {
        if (eff.duration <= 0) {
          issues.push({
            type: 'error',
            message: `O efeito <code>${type}</code> (${contextPath}) possui duração de <code>${eff.duration}</code> ticks. O controle de grupo não terá efeito.`
          });
        }
      }

      // CC Ticks
      if (['Fear', 'Charm', 'Invisible', 'BlockAttack', 'BlockSkill', 'BlockMoveSkill'].includes(type)) {
        if (eff.tick <= 0) {
          issues.push({
            type: 'error',
            message: `O efeito <code>${type}</code> (${contextPath}) possui duração (tick) de <code>${eff.tick}</code>. O efeito não será aplicado.`
          });
        }
      }

      // Shield
      if (type === 'Shield') {
        if (eff.tick <= 0) {
          issues.push({
            type: 'error',
            message: `O escudo (${contextPath}) possui tempo de duração (tick) de <code>${eff.tick}</code>. O escudo expirará instantaneamente.`
          });
        }
        if (eff.amount <= 0 && eff.attack_ratio <= 0 && eff.ap_ratio <= 0) {
          issues.push({
            type: 'warning',
            message: `O escudo (${contextPath}) possui valor 0 (sem valor base ou escalamento).`
          });
        }
      }

      // Heal
      if (type === 'Heal') {
        if (eff.amount <= 0 && eff.attack_ratio <= 0 && eff.ap_ratio <= 0) {
          issues.push({
            type: 'warning',
            message: `A cura (${contextPath}) possui valor de cura de 0.`
          });
        }
      }

      // Damage
      if (['Attack', 'ApAttack', 'FixedAttack'].includes(type)) {
        const hasHpRatio = eff.hasOwnProperty('hp_ratio') && eff.hp_ratio > 0;
        const hasTargetHpRatio = eff.hasOwnProperty('target_hp_ratio') && eff.target_hp_ratio > 0;
        if (eff.damage <= 0 && eff.attack_ratio <= 0 && !hasHpRatio && !hasTargetHpRatio) {
          issues.push({
            type: 'warning',
            message: `O efeito de dano <code>${type}</code> (${contextPath}) causa 0 de dano.`
          });
        }
      }

      // CC Movement Speed/Ticks
      if (['Knockback', 'Grab', 'Pull', 'MoveBack'].includes(type)) {
        if (eff.speed <= 0) {
          issues.push({
            type: 'error',
            message: `A velocidade de movimento do efeito <code>${type}</code> (${contextPath}) está em <code>${eff.speed}</code>. O alvo não se moverá.`
          });
        }
        if (eff.tick <= 0) {
          issues.push({
            type: 'error',
            message: `A duração de movimento do efeito <code>${type}</code> (${contextPath}) está em <code>${eff.tick}</code>.`
          });
        }
      }

      // Caster Dash Speed/Ranges
      if (['Rush', 'RushTime', 'MoveTo', 'MoveToTarget'].includes(type)) {
        if (eff.speed <= 0) {
          issues.push({
            type: 'error',
            message: `A velocidade do avanço <code>${type}</code> (${contextPath}) está em <code>${eff.speed}</code>. O campeão ficará paralisado durante o avanço.`
          });
        }
        if (eff.range <= 0) {
          issues.push({
            type: 'error',
            message: `O alcance do avanço <code>${type}</code> (${contextPath}) está em <code>${eff.range}</code>.`
          });
        }
        if (type === 'RushTime' && eff.tick <= 0) {
          issues.push({
            type: 'error',
            message: `A duração (tick) do avanço <code>RushTime</code> (${contextPath}) está em <code>${eff.tick}</code>.`
          });
        }
      }

      if (type === 'DirTeleport') {
        if (eff.moved <= 0) {
          issues.push({
            type: 'error',
            message: `A distância de teleporte <code>moved</code> (${contextPath}) está em <code>${eff.moved}</code>.`
          });
        }
      }

      if (type === 'RushMoveToBack') {
        if (eff.speed <= 0) {
          issues.push({
            type: 'error',
            message: `A velocidade do avanço <code>RushMoveToBack</code> (${contextPath}) está em <code>${eff.speed}</code>.`
          });
        }
      }

      // Delayed
      if (type === 'Delayed') {
        if (eff.tick <= 0) {
          issues.push({
            type: 'error',
            message: `O tempo de atraso (tick) do efeito Delayed (${contextPath}) está em <code>${eff.tick}</code>. Deve ser maior que 0.`
          });
        }
        if (!eff.effects || eff.effects.length === 0) {
          issues.push({
            type: 'warning',
            message: `O efeito Delayed (${contextPath}) não possui nenhum efeito filho.`
          });
        }
      }

      // AddCasted
      if (type === 'AddCasted') {
        if (eff.duration <= 0) {
          issues.push({
            type: 'error',
            message: `A duração total do AddCasted (${contextPath}) está em <code>${eff.duration}</code>. Deve ser maior que 0.`
          });
        }
        if (eff.period <= 0) {
          issues.push({
            type: 'error',
            message: `O período de repetição do AddCasted (${contextPath}) está em <code>${eff.period}</code>. Deve ser maior que 0.`
          });
        }
        if (eff.period >= eff.duration) {
          issues.push({
            type: 'error',
            message: `O período de repetição (<code>${eff.period}</code>) é maior ou igual à duração (<code>${eff.duration}</code>) no AddCasted (${contextPath}). O efeito nunca se repetirá.`
          });
        }
        if (!eff.applied_effects || eff.applied_effects.length === 0) {
          issues.push({
            type: 'warning',
            message: `O efeito AddCasted (${contextPath}) não possui efeito para disparar periodicamente.`
          });
        }
      }

      // RangePeriodProjectile
      if (type === 'RangePeriodProjectile') {
        if (eff.duration <= 0) {
          issues.push({
            type: 'error',
            message: `A duração total do projétil de área periódica (${contextPath}) está em <code>${eff.duration}</code> ticks. Deve ser maior que 0.`
          });
        }
        if (eff.period <= 0) {
          issues.push({
            type: 'error',
            message: `O período de repetição do projétil de área periódica (${contextPath}) está em <code>${eff.period}</code> ticks. Deve ser maior que 0.`
          });
        }
        if (eff.period >= eff.duration) {
          issues.push({
            type: 'error',
            message: `O período de repetição (<code>${eff.period}</code>) é maior ou igual à duração (<code>${eff.duration}</code>) no projétil de área periódica (${contextPath}).`
          });
        }
        if (!eff.applied_effects || eff.applied_effects.length === 0) {
          issues.push({
            type: 'warning',
            message: `O projétil de área periódica <code>RangePeriodProjectile</code> (${contextPath}) não possui nenhum efeito associado em sua lista.`
          });
        }
      }

      // Projectile Range & Speeds
      if ([
        'LinearProjectile', 'BackToCasterLinearProjectile', 'TargetProjectile',
        'TargetProjectileFromProjectile', 'TargetSplashProjectile', 'AutoTargetProjectile',
        'RangeProjectile', 'LineRangeProjectile', 'RangePeriodProjectile', 'ApplyInProjectile',
        'ParabolicProjectile'
      ].includes(type)) {
        if (['LinearProjectile', 'BackToCasterLinearProjectile', 'TargetProjectile', 'TargetProjectileFromProjectile', 'TargetSplashProjectile', 'AutoTargetProjectile', 'ParabolicProjectile'].includes(type)) {
          if (eff.speed <= 0) {
            issues.push({
              type: 'error',
              message: `A velocidade do projétil <code>${type}</code> (${contextPath}) está em <code>${eff.speed}</code>. O projétil ficará imóvel.`
            });
          }
        }
        if (['LinearProjectile', 'BackToCasterLinearProjectile', 'ParabolicProjectile'].includes(type)) {
          if (eff.range <= 0) {
            issues.push({
              type: 'error',
              message: `O alcance do projétil <code>${type}</code> (${contextPath}) está em <code>${eff.range}</code>.`
            });
          }
        }
        if (['RangeProjectile', 'LineRangeProjectile'].includes(type)) {
          if (eff.apply <= 0) {
            issues.push({
              type: 'error',
              message: `O tempo de aplicação (apply) do projétil de área <code>${type}</code> (${contextPath}) está em <code>${eff.apply}</code>.`
            });
          }
        }

        // Projectile empty effects check
        if (!eff.applied_effects || eff.applied_effects.length === 0) {
          issues.push({
            type: 'warning',
            message: `O projétil <code>${type}</code> (${contextPath}) não possui nenhum efeito em <code>applied_effects</code> (não causará dano ou efeito ao atingir).`
          });
        }
      }

      // Area Projectile CastingType Check
      if (['RangePeriodProjectile', 'RangeProjectile', 'LineRangeProjectile', 'ApplyInProjectile', 'ParabolicProjectile'].includes(type)) {
        if (a.casting_type === 'None') {
          issues.push({
            type: 'warning',
            message: `Esta habilidade usa o projétil de área <code>${type}</code>, mas a conjuração é <code>None</code>. Ele spawnará no pé do campeão. Altere a conjuração para <code>Position</code> ou <code>Targeting</code> para mirar nos inimigos.`
          });
        }
      }

      // Target Projectiles CastingType Check
      if (['TargetProjectile', 'TargetProjectileFromProjectile', 'TargetSplashProjectile', 'AutoTargetProjectile'].includes(type)) {
        if (a.casting_type === 'None' || a.casting_type === 'Direction') {
          issues.push({
            type: 'warning',
            message: `O projétil guiado <code>${type}</code> (${contextPath}) precisa de um alvo. O tipo de conjuração <code>${a.casting_type}</code> pode fazer a habilidade falhar.`
          });
        }
        if (type === 'TargetProjectileFromProjectile' && contextPath === 'Efeito Raiz') {
          issues.push({
            type: 'warning',
            message: `O projétil <code>TargetProjectileFromProjectile</code> é o efeito raiz da habilidade. Ele geralmente deve ser disparado por outro projétil no hit/end.`
          });
        }
      }

      // Combine
      if (type === 'Combine') {
        if (!eff.effects || eff.effects.length === 0) {
          issues.push({
            type: 'warning',
            message: `O bloco Combine (${contextPath}) não possui efeitos em sua lista.`
          });
        } else {
          eff.effects.forEach(child => {
            if (child && child.type === 'Combine') {
              issues.push({
                type: 'info',
                message: `O bloco Combine (${contextPath}) contém outro Combine aninhado. Eles serão achatados no export, mas mantenha-os planos se possível.`
              });
            }
          });
        }
      }

      // WithSelf
      if (type === 'WithSelf') {
        if (!eff.effects || eff.effects.length === 0) {
          issues.push({
            type: 'warning',
            message: `O efeito WithSelf (${contextPath}) não possui efeito associado.`
          });
        }
      }

      // SwitchByBuff
      if (type === 'SwitchByBuff') {
        if (!eff.buff_name || eff.buff_name.trim() === '') {
          issues.push({
            type: 'error',
            message: `O efeito SwitchByBuff (${contextPath}) está com o nome do buff <code>buff_name</code> vazio.`
          });
        }
        if (!eff.effect_none && !eff.effect_buff) {
          issues.push({
            type: 'warning',
            message: `Ambos os caminhos (Com/Sem Buff) de SwitchByBuff (${contextPath}) estão vazios.`
          });
        }
      }

      // SwitchByLevel3
      if (type === 'SwitchByLevel3') {
        if (!eff.effect_start && !eff.effect_level3) {
          issues.push({
            type: 'warning',
            message: `Ambos os caminhos (Antes/Depois do Lvl 3) de SwitchByLevel3 (${contextPath}) estão vazios.`
          });
        }
      }

      // RandomTarget
      if (type === 'RandomTarget') {
        if (eff.range <= 0) {
          issues.push({
            type: 'error',
            message: `O alcance (range) do RandomTarget (${contextPath}) está em <code>${eff.range}</code>.`
          });
        }
        if (!eff.effects || eff.effects.length === 0) {
          issues.push({
            type: 'warning',
            message: `O efeito RandomTarget (${contextPath}) não possui efeito associado.`
          });
        }
      }

      // Banish
      if (type === 'Banish') {
        if (eff.duration <= 0) {
          issues.push({
            type: 'error',
            message: `A duração do banimento Banish (${contextPath}) está em <code>${eff.duration}</code>. Deve ser maior que 0.`
          });
        }
      }

      // RangeEffect
      if (type === 'RangeEffect') {
        if (!eff.effects || eff.effects.length === 0) {
          issues.push({
            type: 'warning',
            message: `O efeito RangeEffect (${contextPath}) não possui efeitos em sua lista.`
          });
        }
      }

      // ShrinkingBarrier
      if (type === 'ShrinkingBarrier') {
        if (eff.duration <= 0) {
          issues.push({
            type: 'error',
            message: `A duração da barreira encolhedora (${contextPath}) está em <code>${eff.duration}</code>.`
          });
        }
        if (eff.start_radius <= 0) {
          issues.push({
            type: 'error',
            message: `O raio inicial da barreira encolhedora (${contextPath}) está em <code>${eff.start_radius}</code>.`
          });
        }
      }

      // CasterAnimation
      if (type === 'CasterAnimation') {
        if (!eff.name || eff.name.trim() === '') {
          issues.push({
            type: 'error',
            message: `O efeito CasterAnimation (${contextPath}) está sem o nome da animação.`
          });
        } else {
          const currentTags = (state.sprite.anim_ranges || []).map(r => r.tag);
          if (!currentTags.includes(eff.name.trim())) {
            issues.push({
              type: 'warning',
              message: `A animação <code>${eff.name}</code> (${contextPath}) não está definida nas faixas de animação da Sprite Sheet.`
            });
          }
        }
        if (eff.tick <= 0) {
          issues.push({
            type: 'error',
            message: `A duração (tick) da animação CasterAnimation (${contextPath}) está em <code>${eff.tick}</code> ticks. Deve ser maior que 0.`
          });
        }
      }

      if (type === 'RemoveCasterAnimation') {
        if (!eff.name || eff.name.trim() === '') {
          issues.push({
            type: 'error',
            message: `O efeito RemoveCasterAnimation (${contextPath}) está sem o nome da animação a ser removida.`
          });
        }
      }

      // Shape Radii
      if (HAS_SHAPE.has(type) && eff.shape) {
        if (eff.shape.Circle) {
          const r = eff.shape.Circle.radius;
          if (r <= 0) {
            issues.push({
              type: 'error',
              message: `O raio da área circular do efeito (${contextPath}) está em <code>${r}</code>.`
            });
          } else if (r < 2000) {
            issues.push({
              type: 'warning',
              message: `O raio da colisão circular (${contextPath}) é muito pequeno (<code>${r}</code>). Será muito difícil atingir os alvos.`
            });
          }
        } else if (eff.shape.Rect) {
          const w = eff.shape.Rect.width;
          const h = eff.shape.Rect.height;
          if (w <= 0 || h <= 0) {
            issues.push({
              type: 'error',
              message: `A largura/altura da área retangular (${contextPath}) está em <code>${w}x${h}</code>.`
            });
          } else if (w < 2000 || h < 2000) {
            issues.push({
              type: 'warning',
              message: `As dimensões da colisão retangular (${contextPath}) são muito pequenas (<code>${w}x${h}</code>).`
            });
          }
        } else if (eff.shape.DirDot) {
          const r = eff.shape.DirDot.radius;
          const rg = eff.shape.DirDot.range;
          if (r <= 0 || rg <= 0) {
            issues.push({
              type: 'error',
              message: `O raio/alcance da área em cone DirDot (${contextPath}) está em <code>r:${r}, range:${rg}</code>.`
            });
          } else if (r < 2000 || rg < 2000) {
            issues.push({
              type: 'warning',
              message: `O cone de colisão DirDot (${contextPath}) é muito pequeno (<code>r:${r}, range:${rg}</code>).`
            });
          }
        }
      }

      // Buff State checks
      if ((type === 'AddBuff' || type === 'AddCasterBuff') && eff.buff_state) {
        if (eff.buff_state.duration && typeof eff.buff_state.duration === 'object' && eff.buff_state.duration.Time) {
          const t = eff.buff_state.duration.Time.tick;
          if (t <= 0) {
            issues.push({
              type: 'error',
              message: `A duração do Buff <code>${eff.buff_state.name}</code> (${contextPath}) é de <code>${t}</code> ticks. O buff expirará instantaneamente.`
            });
          }
        }

        const BUFF_STATS = [
          'attack', 'attack_mult', 'magic_power', 'magic_power_mult',
          'defence', 'defence_mult', 'hp', 'hp_mult', 'hp_regen',
          'magic_resistance', 'magic_resistance_mult', 'move_speed_mult',
          'attack_speed_mult', 'skill_cooldown_mult', 'ult_cooldown_mult',
          'damaged_amplify', 'damaged_reduce', 'dot_amplify',
          'base_attack_enemy_max_hp_damage', 'skill_enemy_max_hp_damage',
          'self_max_hp_damage', 'base_attack_damaged_reduce', 'skill_damaged_reduce',
          'defence_penetration', 'magic_resistance_penetration',
          'range', 'heal_reduce', 'toughness', 'crit_chance', 'radius_mult', 'vamp', 'damage_reflect',
        ];
        let hasStat = false;
        BUFF_STATS.forEach(s => {
          if (eff.buff_state[s] && eff.buff_state[s] !== 0) hasStat = true;
        });
        const hasFlag = eff.buff_state.cc_immune || eff.buff_state.undying || eff.buff_state.ignore_wall;
        if (!hasStat && !hasFlag) {
          issues.push({
            type: 'warning',
            message: `O buff <code>${eff.buff_state.name}</code> (${contextPath}) não altera nenhum atributo nem ativa nenhum efeito especial (undying, cc_immune, ignore_wall). Ele não fará nada.`
          });
        }

        // Permanent undying or cc_immune checks
        const isPermanent = eff.buff_state.duration && eff.buff_state.duration.Permanent;
        if (isPermanent && (eff.buff_state.undying || eff.buff_state.cc_immune)) {
          issues.push({
            type: 'warning',
            message: `O buff <code>${eff.buff_state.name}</code> (${contextPath}) é permanente e concede <code>undying</code> ou <code>cc_immune</code>. O campeão ficará imortal ou imune a CC permanentemente após o primeiro uso!`
          });
        }
      }

      // Recursively scan sub-effects
      if (eff.applied_effects) {
        eff.applied_effects.forEach((child, i) => {
          const item = child.effect || child;
          scanActionEffect(item, `${contextPath} > Efeito Aplicado #${i+1}`, getNextAlignment(eff.applied_target, targetAlignment), eff.name || parentProjectileName);
        });
      }
      if (eff.effects) {
        eff.effects.forEach((child, i) => {
          scanActionEffect(child, `${contextPath} > Subefeito #${i+1}`, targetAlignment, parentProjectileName);
        });
      }
      if (eff.end_effects) {
        eff.end_effects.forEach((child, i) => {
          const item = child.effect || child;
          scanActionEffect(item, `${contextPath} > Efeito de Fim #${i+1}`, targetAlignment, parentProjectileName);
        });
      }
      if (eff.effect_none) scanActionEffect(eff.effect_none, `${contextPath} > Ramo Sem Buff`, targetAlignment, parentProjectileName);
      if (eff.effect_buff) scanActionEffect(eff.effect_buff, `${contextPath} > Ramo Com Buff`, targetAlignment, parentProjectileName);
      if (eff.effect_start) scanActionEffect(eff.effect_start, `${contextPath} > Ramo Antes do Lvl 3`, targetAlignment, parentProjectileName);
      if (eff.effect_level3) scanActionEffect(eff.effect_level3, `${contextPath} > Ramo Lvl 3+`, targetAlignment, parentProjectileName);
      if (eff.effect) scanActionEffect(eff.effect, `${contextPath} > Efeito Filho`, targetAlignment, parentProjectileName);
    };

    scanActionEffect(a.effect, 'Efeito Raiz');
  }

  return issues;
}

function updateActionWarnings(name) {
  const card = document.getElementById(`action-warnings-card-${name}`);
  const list = document.getElementById(`action-warnings-list-${name}`);
  const badge = document.getElementById(`action-warnings-badge-count-${name}`);
  if (!card || !list || !badge) return;

  const a = state.actions[name];
  if (!a) return;

  const issues = validateAction(name, a);
  list.innerHTML = '';

  if (issues.length > 0) {
    card.style.display = 'block';
    badge.textContent = issues.length;
    badge.style.display = 'inline-block';
    badge.style.background = issues.some(i => i.type === 'error') ? '#ff5672' : '#ffb837';

    if (issues.some(i => i.type === 'error')) {
      card.style.borderLeftColor = '#ff5672';
    } else if (issues.some(i => i.type === 'warning')) {
      card.style.borderLeftColor = '#ffb837';
    } else {
      card.style.borderLeftColor = '#37b8ff';
    }

    issues.forEach(issue => {
      const div = document.createElement('div');
      div.className = `validator-issue issue-${issue.type}`;
      
      let prefix = '🔴 ERRO';
      if (issue.type === 'warning') prefix = '🟡 AVISO';
      else if (issue.type === 'info') prefix = '🔵 INFO';
      
      div.innerHTML = `
        <span class="validator-issue-badge">${prefix}</span>
        <span style="flex:1;">${issue.message}</span>
      `;
      list.appendChild(div);
    });
  } else {
    card.style.display = 'block';
    badge.style.display = 'none';
    card.style.borderLeftColor = '#6be585';
    list.innerHTML = `
      <div class="validator-issue" style="background: rgba(107, 229, 133, 0.04); border: 1px solid var(--border-light); border-left: 4px solid #6be585; color: var(--text-primary);">
        <span style="font-size: 18px; margin-right: 8px; line-height:1">✅</span>
        <span>Nenhum erro de integridade encontrado nesta habilidade! Tudo parece pronto para funcionar corretamente no jogo.</span>
      </div>
    `;
  }
}

function validateMod() {
  const issues = [];

  const modId = getModId();
  const champBase = getChampBase();
  const fullChampId = getFullChampId();

  // Run action-specific validations
  ['attack', 'skill', 'skill2', 'ult'].forEach(name => {
    const a = state.actions[name];
    if (!a) return;

    const actionIssues = validateAction(name, a);
    actionIssues.forEach(issue => {
      issues.push({
        type: issue.type,
        message: `Ação <strong>${name.toUpperCase()}</strong>: ${issue.message}`
      });
    });
  });

  if (!state.sprite || !state.sprite.has_sprite) {
    issues.push({
      type: 'warning',
      message: 'Sprite Sheet: Nenhum spritesheet de campeão foi carregado. O campeão usará o sprite padrão.'
    });
  } else {
    const standardTags = ['idle', 'run', 'attack', 'skill', 'skill2', 'ult', 'dead'];
    const currentTags = (state.sprite.anim_ranges || []).map(r => r.tag);
    standardTags.forEach(tag => {
      if (!currentTags.includes(tag)) {
        issues.push({
          type: 'info',
          message: `Sprite Sheet: O spritesheet está sem a animação padrão <code>${tag}</code>.`
        });
      }
    });
  }

  const langs = getActiveLangs();
  langs.forEach(lang => {
    const data = state.i18n[lang] || {};
    if (!data.name || data.name.trim() === '') {
      issues.push({
        type: 'warning',
        message: `Localização (${lang.toUpperCase()}): Nome de exibição do campeão está em branco.`
      });
    }
    ['skill', 'skill2', 'ult'].forEach(s => {
      if (!data[s] || data[s].trim() === '') {
        issues.push({
          type: 'info',
          message: `Localização (${lang.toUpperCase()}): Descrição da habilidade <code>${s}</code> está em branco.`
        });
      }
    });
  });

  return issues;
}


function renderExportList() {
  const list = document.getElementById('export-file-list');
  const files = buildExportFiles();
  list.innerHTML = '';

  // ── Mod Integrity Check ──
  const valPanel = document.getElementById('validator-panel');
  const valBadge = document.getElementById('validator-badge-count');
  const valList = document.getElementById('validator-issues-list');
  
  if (valPanel && valList) {
    const issues = validateMod();
    valList.innerHTML = '';
    if (issues.length > 0) {
      valPanel.style.display = 'block';
      if (valBadge) {
        valBadge.textContent = issues.length;
        valBadge.style.display = 'inline-block';
        valBadge.style.background = issues.some(i => i.type === 'error') ? '#ff5672' : '#ffb837';
      }
      issues.forEach(issue => {
        const div = document.createElement('div');
        div.className = `validator-issue issue-${issue.type}`;
        
        let prefix = '🔴 ERRO';
        if (issue.type === 'warning') prefix = '🟡 AVISO';
        else if (issue.type === 'info') prefix = '🔵 INFO';
        
        div.innerHTML = `
          <span class="validator-issue-badge">${prefix}</span>
          <span style="flex:1;">${issue.message}</span>
        `;
        valList.appendChild(div);
      });
    } else {
      valPanel.style.display = 'block';
      if (valBadge) valBadge.style.display = 'none';
      valList.innerHTML = `
        <div class="validator-issue" style="background: rgba(107, 229, 133, 0.04); border: 1px solid var(--border-light); border-left: 4px solid #6be585; color: var(--text-primary);">
          <span style="font-size: 18px; margin-right: 8px; line-height:1">✅</span>
          <span>Nenhum erro de integridade encontrado! O mod está pronto para ser exportado e testado.</span>
        </div>
      `;
    }
  }

  files.forEach((file, i) => {
    const item = document.createElement('div');
    item.className = 'export-file-item';
    item.dataset.index = i;
    item.innerHTML = `
      <div class="export-file-icon">${file.icon}</div>
      <div class="export-file-info">
        <div class="export-file-name">${file.name}</div>
        <div class="export-file-path">${file.fullPath}</div>
      </div>
      <button class="btn-secondary btn-sm" id="dl-btn-${i}">\u{2B07} Download</button>
    `;
    list.appendChild(item);

    item.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') return;
      showExportPreview(files, i);
    });

    document.getElementById(`dl-btn-${i}`).addEventListener('click', e => {
      e.stopPropagation();
      downloadFile(file);
    });
  });

  // Render tabs
  renderExportTabs(files);
}

function renderExportTabs(files) {
  const tabs = document.getElementById('export-tabs');
  tabs.innerHTML = '';
  files.forEach((f, i) => {
    const btn = document.createElement('button');
    btn.className = 'export-tab-btn' + (i === 0 ? ' active' : '');
    btn.textContent = f.name;
    btn.addEventListener('click', () => showExportPreview(files, i));
    tabs.appendChild(btn);
  });
  if (files.length > 0) showExportPreview(files, 0);
}

function showExportPreview(files, index) {
  const area = document.getElementById('export-preview');
  area.style.display = '';
  document.querySelectorAll('.export-tab-btn').forEach((b, i) => b.classList.toggle('active', i === index));
  document.querySelectorAll('.export-file-item').forEach((el, i) => el.classList.toggle('selected', i === index));
  const code = document.querySelector('#export-code-preview code');
  const file = files[index];

  if (file.isBinary) {
    code.innerHTML = `<div style="padding:20px;text-align:center"><img src="${file.content}" style="max-width:100%;max-height:300px;border:1px dashed var(--border);border-radius:4px;background:#1e1e1e;image-rendering:pixelated;image-rendering:crisp-edges"/></div>`;
  } else {
    code.textContent = file.content;
    code.innerHTML = syntaxHighlight(file.content);
  }
}

function syntaxHighlight(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let cls = 'json-num';
      if (/^"/.test(match)) { cls = /:$/.test(match) ? 'json-key' : 'json-str'; }
      else if (/true|false/.test(match)) cls = 'json-bool';
      else if (/null/.test(match)) cls = 'json-null';
      return `<span class="${cls}">${match}</span>`;
    });
}

async function fetchAssetAsDataURL(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`Failed to fetch asset from ${url}:`, err);
    return null;
  }
}

async function downloadAllFiles() {
  const modal = document.getElementById('export-loading-modal');
  const bar = document.getElementById('export-loading-bar');
  const text = document.getElementById('export-loading-text');
  const percent = document.getElementById('export-loading-percent');

  if (modal) {
    modal.style.display = 'flex';
  }
  if (bar) bar.style.width = '0%';
  if (percent) percent.textContent = '0%';

  // 1. Gather all load tasks
  const tasks = [];
  const modId = getModId();
  const champBase = getChampBase();

  // Task for Champion Spritesheet
  if (state.sprite && state.sprite.has_sprite && !spriteImageData) {
    tasks.push({
      label: 'Champion spritesheet',
      action: async () => {
        const spriteName = getSpriteName();
        const url = `asset/${modId}/aseprite_resources/champions/${spriteName}#sheet.png`;
        const dataUrl = await fetchAssetAsDataURL(url) || await fetchAssetAsDataURL(`asset/${modId}/aseprite_resources/champions/${spriteName}.png`);
        if (dataUrl) {
          spriteImageData = dataUrl;
          state.sprite.sprite_image_data = dataUrl;
        }
      }
    });
  }

  // Tasks for Visual Bindings
  const addBindingTasks = (list, categoryName) => {
    if (!list) return;
    list.forEach((item, idx) => {
      if (!item.image_data) {
        const assetPath = item.sprite || item.anim;
        if (assetPath) {
          tasks.push({
            label: `${categoryName} visual: ${item.name}`,
            action: async () => {
              if (item.type === 'Sprite') {
                const url = `${assetPath}.png`;
                let dataUrl = await fetchAssetAsDataURL(url);
                if (!dataUrl) dataUrl = await fetchAssetAsDataURL(`${assetPath}.webp`);
                if (dataUrl) {
                  item.image_data = dataUrl;
                }
              } else {
                const url = `${assetPath}#sheet.png`;
                let dataUrl = await fetchAssetAsDataURL(url);
                if (!dataUrl) dataUrl = await fetchAssetAsDataURL(`${assetPath}#sheet.webp`);
                if (!dataUrl) dataUrl = await fetchAssetAsDataURL(`${assetPath}.png`);
                if (dataUrl) {
                  item.image_data = dataUrl;
                }
              }
            }
          });
        }
      }
    });
  };

  addBindingTasks(state.view_projectiles, 'Projectile');
  addBindingTasks(state.view_effects, 'Effect');
  addBindingTasks(state.view_buffs, 'Buff');

  // Tasks for Separate Skill Icons
  if (state.sprite.icons_mode === 'separate' && state.sprite.separate_icons_data) {
    state.sprite.separate_icons_data.forEach((data, i) => {
      if (!data) {
        const assetPath = state.sprite.skill_icon_paths[i] || `asset/${modId}/icons/${champBase}_skill${i + 1}`;
        tasks.push({
          label: `Skill ${i + 1} Icon`,
          action: async () => {
            let dataUrl = await fetchAssetAsDataURL(`${assetPath}.png`);
            if (!dataUrl) dataUrl = await fetchAssetAsDataURL(`${assetPath}.webp`);
            if (dataUrl) {
              state.sprite.separate_icons_data[i] = dataUrl;
            }
          }
        });
      }
    });
  }

  // Task for Shared Skill Icon Sheet
  if (state.sprite.icons_mode === 'sheet' && !state.sprite.sheet_icon_data) {
    const assetPath = state.sprite.skill_icon_source || `asset/${modId}/icons/${champBase}_skill_icons`;
    tasks.push({
      label: 'Shared skill icons sheet',
      action: async () => {
        let dataUrl = await fetchAssetAsDataURL(`${assetPath}#sheet.png`);
        if (!dataUrl) dataUrl = await fetchAssetAsDataURL(`${assetPath}#sheet.webp`);
        if (!dataUrl) dataUrl = await fetchAssetAsDataURL(`${assetPath}.png`);
        if (dataUrl) {
          state.sprite.sheet_icon_data = dataUrl;
        }
      }
    });
  }

  // If there are no tasks, let's create a few dummy steps to show a quick loading animation
  if (tasks.length === 0) {
    tasks.push({ label: 'Analyzing files...', action: async () => {} });
    tasks.push({ label: 'Validating data...', action: async () => {} });
    tasks.push({ label: 'Generating JSON files...', action: async () => {} });
  }

  // Execute all tasks sequentially with a progress animation
  const total = tasks.length;
  for (let i = 0; i < total; i++) {
    const task = tasks[i];
    if (text) text.textContent = `Loading ${task.label}...`;
    
    // Execute task
    await task.action();
    
    // Smooth progress update
    const percentVal = Math.round(((i + 1) / total) * 100);
    if (bar) bar.style.width = `${percentVal}%`;
    if (percent) percent.textContent = `${percentVal}%`;
    
    // Small delay to show smooth filling animation
    await new Promise(res => setTimeout(res, 150));
  }

  if (text) text.textContent = 'Generating ZIP archive...';
  await new Promise(res => setTimeout(res, 200));

  // 2. Build and generate the ZIP
  const files = buildExportFiles();
  if (window.JSZip) {
    const zip = new JSZip();
    files.forEach(f => {
      try {
        if (f.isBinary) {
          if (f.content && f.content.includes(',')) {
            const base64Data = f.content.split(',')[1];
            zip.file(f.fullPath, base64Data, { base64: true });
          } else {
            console.error('Binary file content is not a valid DataURL:', f.fullPath);
          }
        } else {
          zip.file(f.fullPath, f.content || '');
        }
      } catch (err) {
        console.error('Failed to add file to ZIP:', f.fullPath, err);
      }
    });
    
    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${getModId()}_mod.zip`;
      a.click();
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      alert('Erro ao gerar o arquivo ZIP. Tentando download individual como fallback...');
      for (const f of files) {
        await new Promise(res => setTimeout(res, 100));
        downloadFile(f);
      }
    }
  } else {
    // Sequential download fallback
    for (const f of files) {
      await new Promise(res => setTimeout(res, 150));
      downloadFile(f);
    }
    alert(`Downloaded ${files.length} files. Check your Downloads folder.`);
  }

  // 3. Hide loading modal
  if (text) text.textContent = 'Mod exported successfully!';
  if (bar) bar.style.width = '100%';
  if (percent) percent.textContent = '100%';
  await new Promise(res => setTimeout(res, 400));
  if (modal) {
    modal.style.display = 'none';
  }
}

function downloadFile(file) {
  const a = document.createElement('a');
  if (file.isBinary) {
    a.href = file.content;
  } else {
    const blob = new Blob([file.content], { type: 'application/json' });
    a.href = URL.createObjectURL(blob);
  }
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── RESET ──────────────────────────────────────────────────────

function initReset() {
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Reset all data?')) return;
    try {
      localStorage.removeItem('tfm2_creator_state');
    } catch (e) { }
    location.reload();
  });

  document.getElementById('btn-save-json')?.addEventListener('click', () => {
    const champBase = getChampBase() || 'champion';
    const filename = `${champBase}_project.json`;
    downloadFile({ name: filename, content: JSON.stringify(state, null, 2) });
  });

  document.getElementById('btn-load-json').addEventListener('click', () => {
    document.getElementById('file-load-input').click();
  });

  document.getElementById('file-load-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported = JSON.parse(ev.target.result);

        // Use a clean state base to overwrite, but merge imported properties
        const cleanState = buildDefaultState();

        if (imported.mod) Object.assign(cleanState.mod, imported.mod);
        if (imported.champion) Object.assign(cleanState.champion, imported.champion);
        if (imported.stats) Object.assign(cleanState.stats, imported.stats);
        if (imported.growth) Object.assign(cleanState.growth, imported.growth);
        if (imported.actions) Object.assign(cleanState.actions, imported.actions);
        if (imported.view_effects) cleanState.view_effects = imported.view_effects;
        if (imported.view_projectiles) cleanState.view_projectiles = imported.view_projectiles;
        if (imported.view_buffs) cleanState.view_buffs = imported.view_buffs;
        if (imported.sprite) Object.assign(cleanState.sprite, imported.sprite);
        if (imported.i18n) Object.assign(cleanState.i18n, imported.i18n);
        if (imported.importedI18n !== undefined) cleanState.importedI18n = imported.importedI18n;
        if (imported.importedChampionView !== undefined) cleanState.importedChampionView = imported.importedChampionView;
        if (imported.champion_view) Object.assign(cleanState.champion_view, imported.champion_view);

        state = cleanState;

        // Persist to localStorage immediately so it will be loaded on reload!
        localStorage.setItem('tfm2_creator_state', JSON.stringify(state));

        alert('Loaded! Refreshing...');
        location.reload();
      } catch (err) {
        alert('Invalid JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  });
}

function initLoadModFolder() {
  const modFolderBtn = document.getElementById('btn-load-mod');
  const modFolderInput = document.getElementById('mod-folder-input');

  if (modFolderBtn && modFolderInput) {
    modFolderBtn.addEventListener('click', e => {
      e.preventDefault();
      modFolderInput.click();
    });

    modFolderInput.addEventListener('change', e => {
      if (e.target.files && e.target.files.length > 0) {
        loadModFolder(e.target.files);
      }
    });
  }
}

async function loadModFolder(files) {
  let fileMap = {};
  for (let i = 0; i < files.length; i++) {
    let f = files[i];
    let path = f.webkitRelativePath || f.name;
    fileMap[path] = f;
  }

  let paths = Object.keys(fileMap);

  // Find files by suffix
  let modInfoPath = paths.find(p => p.endsWith('mod.mod_info'));
  let dataChampPaths = paths.filter(p => p.endsWith('.data_champion'));
  let i18nPath = paths.find(p => p.endsWith('champion.i18n'));
  let cvPath = paths.find(p => p.endsWith('champion_view.champion_view'));

  if (dataChampPaths.length === 0) {
    alert('Nenhum arquivo de campe\u00e3o (.data_champion) encontrado na pasta do mod.');
    return;
  }

  let selectedDataChampPath = dataChampPaths[0];
  if (dataChampPaths.length > 1) {
    let names = dataChampPaths.map(p => p.split('/').pop().replace('.data_champion', ''));
    let promptMsg = 'V\u00e1rios campe\u00f5es encontrados na pasta:\n' +
      names.map((n, i) => `${i + 1}. ${n}`).join('\n') +
      '\nDigite o n\u00famero do campe\u00e3o que deseja editar:';
    let ans = prompt(promptMsg, '1');
    if (!ans) return;
    let idx = parseInt(ans) - 1;
    if (isNaN(idx) || idx < 0 || idx >= dataChampPaths.length) {
      alert('Op\u00e7\u00e3o inv\u00e1lida. Carregando o primeiro campe\u00e3o.');
    } else {
      selectedDataChampPath = dataChampPaths[idx];
    }
  }

  let champBase = selectedDataChampPath.split('/').pop().replace('.data_champion', '');

  // Parse data_champion first to extract potential custom sprite name
  let dataChampParsed = null;
  if (selectedDataChampPath) {
    let txt = await readFileAsText(fileMap[selectedDataChampPath]);
    try { dataChampParsed = JSON.parse(txt); } catch (e) {}
  }

  let spriteName = champBase;
  if (dataChampParsed && dataChampParsed.sprite) {
    let parts = dataChampParsed.sprite.split('/');
    spriteName = parts.pop();
  }

  let fanimPath = paths.find(p => p.endsWith(`${spriteName}#anim.fanim`) || p.endsWith(`${champBase}#anim.fanim`));
  let pngPath = paths.find(p => 
    p.endsWith(`${spriteName}#sheet.png`) || 
    p.endsWith(`${spriteName}.png`) || 
    p.endsWith(`${spriteName}.webp`) ||
    p.endsWith(`${champBase}#sheet.png`) ||
    p.endsWith(`${champBase}.png`) || 
    p.endsWith(`${champBase}.webp`)
  );

  let modInfoParsed = null;
  if (modInfoPath) {
    let txt = await readFileAsText(fileMap[modInfoPath]);
    try { modInfoParsed = JSON.parse(txt); } catch (e) {}
  }

  let i18nParsed = null;
  if (i18nPath) {
    let txt = await readFileAsText(fileMap[i18nPath]);
    try { i18nParsed = JSON.parse(txt); } catch (e) {}
  }

  let cvParsed = null;
  if (cvPath) {
    let txt = await readFileAsText(fileMap[cvPath]);
    try { cvParsed = JSON.parse(txt); } catch (e) {}
  }

  let spriteDataUrl = null;
  if (pngPath) {
    spriteDataUrl = await readFileAsDataURL(fileMap[pngPath]);
  }

  let fanimParsed = null;
  if (fanimPath) {
    let txt = await readFileAsText(fileMap[fanimPath]);
    try { fanimParsed = JSON.parse(txt); } catch (e) {}
  }

  await loadBindingImagesFromFolder(dataChampParsed, fileMap);
  await loadSkillIconsFromFolder(dataChampParsed, fileMap);
  applyLoadedMod(modInfoParsed, dataChampParsed, i18nParsed, cvParsed, spriteDataUrl, fanimParsed, champBase);
}

async function loadSkillIconsFromFolder(dataChamp, fileMap) {
  if (!dataChamp) return;
  const paths = Object.keys(fileMap);

  let mode = 'none';
  if (dataChamp.skill_icons) mode = 'separate';
  else if (dataChamp.skill_icon) mode = 'sheet';

  dataChamp.separate_icons_data = [null, null, null];
  dataChamp.sheet_icon_fw = 32;
  dataChamp.sheet_icon_fh = 32;
  dataChamp.sheet_icon_layout = 'horizontal';
  dataChamp.sheet_icon_frames = [1, 2, 3];
  dataChamp.sheet_icon_data = null;
  dataChamp.sheet_icon_width = 0;
  dataChamp.sheet_icon_height = 0;

  if (mode === 'separate') {
    for (let i = 0; i < 3; i++) {
      const assetPath = dataChamp.skill_icons[i];
      if (!assetPath) continue;
      const relPath = getRelativeAssetPath(assetPath);
      if (!relPath) continue;

      const imgMatch = paths.find(p => p.endsWith(relPath + '.png') || p.endsWith(relPath + '.webp'));
      if (imgMatch) {
        try {
          dataChamp.separate_icons_data[i] = await readFileAsDataURL(fileMap[imgMatch]);
        } catch (e) {
          console.error('Failed to load separate skill icon:', i, e);
        }
      }
    }
  } else if (mode === 'sheet') {
    const assetPath = dataChamp.skill_icon.source;
    if (assetPath) {
      const relPath = getRelativeAssetPath(assetPath);
      if (relPath) {
        const imgMatch = paths.find(p =>
          p.endsWith(relPath + '#sheet.png') ||
          p.endsWith(relPath + '#sheet.webp') ||
          p.endsWith(relPath + '.png') ||
          p.endsWith(relPath + '.webp')
        );
        if (imgMatch) {
          try {
            const dataUrl = await readFileAsDataURL(fileMap[imgMatch]);
            dataChamp.sheet_icon_data = dataUrl;

            // Load dimensions
            await new Promise(res => {
              const img = new Image();
              img.onload = () => { dataChamp.sheet_icon_width = img.width; dataChamp.sheet_icon_height = img.height; res(); };
              img.onerror = () => res();
              img.src = dataUrl;
            });
          } catch (e) {
            console.error('Failed to load shared skill icons sheet:', e);
          }
        }

        // Try load fanim
        const fanimMatch = paths.find(p => p.endsWith(relPath + '#anim.fanim'));
        if (fanimMatch) {
          try {
            const txt = await readFileAsText(fileMap[fanimMatch]);
            const fanimData = JSON.parse(txt);
            if (fanimData && fanimData.anims) {
              const tags = Object.keys(fanimData.anims);
              tags.forEach((tag, idx) => {
                if (idx < 3) {
                  const tagData = fanimData.anims[tag];
                  if (tagData && tagData.frames && tagData.frames[0] && tagData.frames[0].data) {
                    const d = tagData.frames[0].data;
                    dataChamp.sheet_icon_fw = d.w || 32;
                    dataChamp.sheet_icon_fh = d.h || 32;
                    const x = d.x || 0;
                    const y = d.y || 0;
                    if (x > 0 && y === 0) {
                      dataChamp.sheet_icon_layout = 'horizontal';
                      dataChamp.sheet_icon_frames[idx] = Math.round(x / dataChamp.sheet_icon_fw) + 1;
                    } else if (y > 0 && x === 0) {
                      dataChamp.sheet_icon_layout = 'vertical';
                      dataChamp.sheet_icon_frames[idx] = Math.round(y / dataChamp.sheet_icon_fh) + 1;
                    } else {
                      dataChamp.sheet_icon_frames[idx] = 1;
                    }
                  }
                }
              });
            }
          } catch (e) {
            console.error('Failed to parse skill icons fanim:', e);
          }
        }
      }
    }
  }
}

async function loadBindingImagesFromFolder(dataChamp, fileMap) {
  if (!dataChamp) return;
  const paths = Object.keys(fileMap);

  const loadList = async (list) => {
    if (!list) return;
    for (const item of list) {
      const assetPath = item.sprite || item.anim;
      if (!assetPath) continue;

      const relPath = getRelativeAssetPath(assetPath);
      if (!relPath) continue;

      // Find matching PNG or WebP in the uploaded folder files
      const imgMatch = paths.find(p =>
        p.endsWith(relPath + '.png') ||
        p.endsWith(relPath + '.webp') ||
        p.endsWith(relPath + '#sheet.png') ||
        p.endsWith(relPath + '#sheet.webp')
      );

      if (imgMatch) {
        try {
          const dataUrl = await readFileAsDataURL(fileMap[imgMatch]);
          item.image_data = dataUrl;
          // Get image dimensions
          await new Promise(res => {
            const img = new Image();
            img.onload = () => { item.image_width = img.width; item.image_height = img.height; res(); };
            img.onerror = () => res();
            img.src = dataUrl;
          });
        } catch (err) {
          console.error('Failed to load image for visual binding:', item.name, err);
        }
      }

      // Also try to load the companion .fanim file (only for animated types)
      if (item.type !== 'Sprite') {
        const fanimMatch = paths.find(p => p.endsWith(relPath + '#anim.fanim'));
        if (fanimMatch) {
          try {
            const txt  = await readFileAsText(fileMap[fanimMatch]);
            const data = JSON.parse(txt);
            if (data && data.anims) {
              const tags = Object.keys(data.anims);
              if (item.type === 'ThreePhase' && tags.length >= 2) {
                // pre / loop / remove tags
                const preTag    = item.pre_tag    || tags[0];
                const loopTag   = item.loop_tag   || tags[1] || tags[0];
                const removeTag = item.remove_tag || tags[2] || tags[0];
                const applyRange = (tagName, fromKey, toKey) => {
                  const tagData = data.anims[tagName];
                  if (!tagData || !tagData.frames || !tagData.frames.length) return;
                  item[fromKey] = 1;
                  item[toKey]   = tagData.frames.length;
                  if (tagData.frames[0].duration) item.frame_duration = tagData.frames[0].duration;
                };
                applyRange(preTag,    'pre_from',    'pre_to');
                applyRange(loopTag,   'loop_from',   'loop_to');
                applyRange(removeTag, 'remove_from', 'remove_to');
              } else if (tags.length >= 1) {
                const tagData = data.anims[tags[0]];
                if (tagData && tagData.frames && tagData.frames.length) {
                  item.range_from = 1;
                  item.range_to   = tagData.frames.length;
                  if (tagData.frames[0].duration) item.frame_duration = tagData.frames[0].duration;
                  // Infer layout: if first frame has y>0 and x===0, assume vertical
                  if (tagData.frames.length >= 2) {
                    const f0 = tagData.frames[0].data;
                    const f1 = tagData.frames[1].data;
                    if (f0 && f1) {
                      if (f1.y > f0.y && f1.x === f0.x) item.layout = 'vertical';
                      else item.layout = 'horizontal';
                    }
                  }
                }
              }
              // Infer frame size from first frame data if not already set
              const firstTag = data.anims[tags[0]];
              if (firstTag && firstTag.frames && firstTag.frames[0] && firstTag.frames[0].data) {
                const d = firstTag.frames[0].data;
                if (!item.frame_width  && d.w) item.frame_width  = d.w;
                if (!item.frame_height && d.h) item.frame_height = d.h;
              }
            }
          } catch (e) {
            // fanim parse error — skip silently
          }
        }
      }
    }
  };

  await loadList(dataChamp.view_projectiles);
  await loadList(dataChamp.view_effects);
  await loadList(dataChamp.view_buffs);
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = ev => resolve(ev.target.result);
    reader.onerror = err => reject(err);
    reader.readAsText(file);
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = ev => resolve(ev.target.result);
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

function applyLoadedMod(modInfo, dataChamp, i18n, cv, spriteDataUrl, fanim, champBase) {
  const cleanState = buildDefaultState();

  if (modInfo) {
    cleanState.mod.id = modInfo.id || '';
    cleanState.mod.name = modInfo.name || '';
    cleanState.mod.author = modInfo.author || '';
    cleanState.mod.version = modInfo.version || '1.0.0';
    cleanState.mod.description = modInfo.description || '';
    cleanState.mod.last_updated = modInfo.last_updated || new Date().toISOString().slice(0, 10);
    cleanState.mod.base_version = modInfo.base_version || '>=0.1.0';
  } else {
    if (dataChamp && dataChamp.id) {
      let idx = dataChamp.id.indexOf('_');
      if (idx !== -1) {
        cleanState.mod.id = dataChamp.id.substring(0, idx);
      }
    }
  }

  cleanState.champion.id = champBase;
  if (dataChamp) {
    cleanState.champion.category = dataChamp.category || 'Melee';
    cleanState.champion.tags = dataChamp.tags || [];
    cleanState.champion.anim_prefix = dataChamp.anim_prefix || '';

    if (dataChamp.sprite) {
      let parts = dataChamp.sprite.split('/');
      let spriteName = parts.pop();
      cleanState.sprite.sprite_name = spriteName;
    }

    if (dataChamp.stat) {
      STAT_FIELDS.forEach(f => {
        if (dataChamp.stat[f.key] !== undefined) cleanState.stats[f.key] = dataChamp.stat[f.key];
      });
    }
    if (dataChamp.growth) {
      STAT_FIELDS.forEach(f => {
        if (dataChamp.growth[f.key] !== undefined) cleanState.growth[f.key] = dataChamp.growth[f.key];
      });
    }

    ['attack', 'skill', 'skill2', 'ult'].forEach(slot => {
      let a = dataChamp[slot];
      if (a) {
        cleanState.actions[slot].action_name = a.action_name || slot;
        cleanState.actions[slot].duration = a.duration || 0;
        cleanState.actions[slot].cooltime = a.cooltime || 0;
        cleanState.actions[slot].start_timing = a.start_timing || 0;
        cleanState.actions[slot].cancelable = a.cancelable === true || a.cancelable === 'true';
        cleanState.actions[slot].range = a.range || 0;
        cleanState.actions[slot].casting_type = a.casting_type || 'Targeting';
        cleanState.actions[slot].casting_target = a.casting_target || 'Enemy';
        cleanState.actions[slot].attack_type = a.attack_type || (slot === 'attack' ? 'BaseAttack' : 'Skill');
        cleanState.actions[slot].growth_range = a.growth_range || 0;
        cleanState.actions[slot].can_use_with_move = a.can_use_with_move === true || a.can_use_with_move === 'true';
        cleanState.actions[slot].effect = a.effect || null;
      }
    });

    cleanState.view_effects = dataChamp.view_effects || [];
    cleanState.view_projectiles = dataChamp.view_projectiles || [];
    cleanState.view_buffs = dataChamp.view_buffs || [];

    if (dataChamp.skill_icons) {
      cleanState.sprite.icons_mode = 'separate';
      cleanState.sprite.skill_icon_paths = dataChamp.skill_icons;
      cleanState.sprite.separate_icons_data = dataChamp.separate_icons_data || [null, null, null];
    } else if (dataChamp.skill_icon) {
      cleanState.sprite.icons_mode = 'sheet';
      cleanState.sprite.skill_icon_source = dataChamp.skill_icon.source || '';
      cleanState.sprite.skill_icon_tags = dataChamp.skill_icon.tags || ['', '', ''];
      cleanState.sprite.sheet_icon_fw       = dataChamp.sheet_icon_fw || 32;
      cleanState.sprite.sheet_icon_fh       = dataChamp.sheet_icon_fh || 32;
      cleanState.sprite.sheet_icon_layout   = dataChamp.sheet_icon_layout || 'horizontal';
      cleanState.sprite.sheet_icon_frames   = dataChamp.sheet_icon_frames || [1, 2, 3];
      cleanState.sprite.sheet_icon_data     = dataChamp.sheet_icon_data || null;
      cleanState.sprite.sheet_icon_width    = dataChamp.sheet_icon_width || 0;
      cleanState.sprite.sheet_icon_height   = dataChamp.sheet_icon_height || 0;
    } else {
      cleanState.sprite.icons_mode = 'none';
    }
  }

  const champId = (cleanState.mod.id ? cleanState.mod.id + '_' : '') + champBase;
  if (i18n) {
    cleanState.importedI18n = {};
    Object.entries(i18n).forEach(([lang, content]) => {
      cleanState.importedI18n[lang] = JSON.parse(JSON.stringify(content));
      if (content.description && content.description[champId]) {
        cleanState.i18n[lang] = {
          name: content.description[champId].name || '',
          attack: content.description[champId].attack || '',
          skill: content.description[champId].skill || '',
          skill2: content.description[champId].skill2 || '',
          ult: content.description[champId].ult || '',
        };
        delete cleanState.importedI18n[lang].description[champId];
      }
    });
  }

  if (cv && cv.entries) {
    cleanState.importedChampionView = {};
    Object.entries(cv.entries).forEach(([cid, data]) => {
      if (cid === champId) {
        cleanState.champion_view.face_x = data.face?.x ?? 0;
        cleanState.champion_view.face_y = data.face?.y ?? -30;
        cleanState.champion_view.center_x = data.center?.x ?? 0;
        cleanState.champion_view.center_y = data.center?.y ?? -12;
      } else {
        if (!BASE_CHAMPION_VIEW_ENTRIES[cid]) {
          cleanState.importedChampionView[cid] = data;
        }
      }
    });
  }

  if (spriteDataUrl) {
    cleanState.sprite.has_sprite = true;
    cleanState.sprite.sprite_image_data = spriteDataUrl;
    spriteImageData = spriteDataUrl;
  }

  if (fanim && fanim.anims) {
    let allY0 = true;
    let allX0 = true;
    let fw = 40;
    let fh = 40;
    let defaultDuration = 0.1;

    Object.entries(fanim.anims).forEach(([tag, anim]) => {
      if (anim.frames && anim.frames.length > 0) {
        anim.frames.forEach(f => {
          if (f.data) {
            fw = f.data.w || fw;
            fh = f.data.h || fh;
            if (f.data.y !== 0) allY0 = false;
            if (f.data.x !== 0) allX0 = false;
          }
          if (f.duration) defaultDuration = f.duration;
        });
      }
    });

    let detectedLayout = 'horizontal';
    if (allX0 && !allY0) {
      detectedLayout = 'vertical';
    } else if (!allX0 && !allY0) {
      detectedLayout = 'grid';
    }

    cleanState.sprite.frame_width = fw;
    cleanState.sprite.frame_height = fh;
    cleanState.sprite.layout = detectedLayout;
    cleanState.sprite.frame_duration = defaultDuration;

    const animRanges = [];
    if (spriteDataUrl && detectedLayout === 'grid') {
      const img = new Image();
      img.onload = () => {
        const cols = Math.floor(img.width / fw) || 1;
        Object.entries(fanim.anims).forEach(([tag, anim]) => {
          if (anim.frames && anim.frames.length > 0) {
            const firstFrame = anim.frames[0];
            const lastFrame = anim.frames[anim.frames.length - 1];
            
            const firstIdx = Math.round(firstFrame.data.y / fh) * cols + Math.round(firstFrame.data.x / fw) + 1;
            const lastIdx = Math.round(lastFrame.data.y / fh) * cols + Math.round(lastFrame.data.x / fw) + 1;
            const dur = firstFrame.duration || defaultDuration;

            animRanges.push({ tag, from: firstIdx, to: lastIdx, duration: dur });
          }
        });
        cleanState.sprite.anim_ranges = animRanges;

        state = cleanState;
        localStorage.setItem('tfm2_creator_state', JSON.stringify(state));
        alert('Mod carregado com sucesso!');
        location.reload();
      };
      img.src = spriteDataUrl;
      return;
    } else {
      Object.entries(fanim.anims).forEach(([tag, anim]) => {
        if (anim.frames && anim.frames.length > 0) {
          const firstFrame = anim.frames[0];
          const lastFrame = anim.frames[anim.frames.length - 1];
          let firstIdx = 1;
          let lastIdx = 1;

          if (detectedLayout === 'horizontal') {
            firstIdx = Math.round(firstFrame.data.x / fw) + 1;
            lastIdx = Math.round(lastFrame.data.x / fw) + 1;
          } else {
            firstIdx = Math.round(firstFrame.data.y / fh) + 1;
            lastIdx = Math.round(lastFrame.data.y / fh) + 1;
          }

          animRanges.push({ tag, from: firstIdx, to: lastIdx, duration: firstFrame.duration || defaultDuration });
        }
      });
      cleanState.sprite.anim_ranges = animRanges;
    }
  }

  state = cleanState;
  localStorage.setItem('tfm2_creator_state', JSON.stringify(state));
  alert('Mod carregado com sucesso!');
  location.reload();
}

// ── Auto-save to localStorage (optional) ──────────────────────
setInterval(() => {
  try {
    localStorage.setItem('tfm2_creator_state', JSON.stringify(state));
  } catch (e) { }
}, 5000);

// Restore on load
try {
  const saved = localStorage.getItem('tfm2_creator_state');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(state, parsed);
    if (state.sprite && state.sprite.sprite_image_data) {
      spriteImageData = state.sprite.sprite_image_data;
    }
    // Restore form values after DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(restoreFormValues, 100);
    });
  }
} catch (e) { }

function restoreFormValues() {
  // Mod info
  const modFields = {
    mod_id: state.mod.id,
    mod_name: state.mod.name,
    mod_author: state.mod.author,
    mod_version: state.mod.version,
    mod_description: state.mod.description,
    mod_last_updated: state.mod.last_updated,
    mod_base_version: state.mod.base_version,
  };
  Object.entries(modFields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  });

  // Champion
  if (state.champion.id) { const el = document.getElementById('champ_id'); if (el) el.value = state.champion.id; }
  if (state.champion.name) { const el = document.getElementById('champ_name'); if (el) el.value = state.champion.name; }
  if (state.champion.category) { const el = document.getElementById('champ_category'); if (el) el.value = state.champion.category; }
  const apEl = document.getElementById('champ_anim_prefix');
  if (apEl) apEl.value = state.champion.anim_prefix || '';

  // Tags
  document.querySelectorAll('#tag-picker .tag-btn').forEach(btn => {
    btn.classList.toggle('active', state.champion.tags.includes(btn.dataset.tag));
  });

  // Stats
  STAT_FIELDS.forEach(f => {
    const el = document.getElementById(`stat_${f.key}`);
    if (el) el.value = state.stats[f.key];
    const gel = document.getElementById(`growth_${f.key}`);
    if (gel) gel.value = state.growth[f.key];
  });

  // Sprite frame info
  ['frame_width', 'frame_height', 'frame_duration'].forEach(id => {
    const el = document.getElementById(id);
    const key = id === 'frame_width' ? 'frame_width' : id === 'frame_height' ? 'frame_height' : 'frame_duration';
    if (el) el.value = state.sprite[key];
  });

  updateModInfoPreview();
  syncChampAssetPath();
  renderAnimRanges();
  renderVisualBinding('view-effects-list', state.view_effects, 'effect');
  renderVisualBinding('view-projectiles-list', state.view_projectiles, 'projectile');
  renderVisualBinding('view-buffs-list', state.view_buffs, 'buff');

  // Restore Champion View Offsets inputs
  if (state.champion_view) {
    ['face_x', 'face_y', 'center_x', 'center_y'].forEach(key => {
      const el = document.getElementById(`cv_${key}`);
      if (el) el.value = state.champion_view[key];
    });
  }

  // Update import status badges
  updateI18nImportStatus();
  updateChampionViewImportStatus();

  // Restore Sprite Preview Canvas
  restoreSpritePreview();
}

function restoreSpritePreview() {
  if (state.sprite && state.sprite.has_sprite && spriteImageData) {
    const img = new Image();
    img.onload = () => {
      const previewSec = document.getElementById('sprite-preview-section');
      if (previewSec) previewSec.style.display = '';
      const dimsEl = document.getElementById('sprite-dims');
      if (dimsEl) dimsEl.textContent = `Image: ${img.width}×${img.height}px`;
      redrawSpriteGrid();
    };
    img.src = spriteImageData;
  }
}

function refreshUITranslations() {
  const isPt = (typeof uiLang !== 'undefined' && uiLang === 'pt');
  document.querySelectorAll('.lang-en').forEach(el => {
    el.style.display = isPt ? 'none' : '';
  });
  document.querySelectorAll('.lang-pt').forEach(el => {
    el.style.display = isPt ? '' : 'none';
  });
}
window.refreshUITranslations = refreshUITranslations;







