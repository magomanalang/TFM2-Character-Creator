/* ============================================================
   TFM2 Champion Creator — tooltips.js
   Bilingual tooltip engine (EN / PT-BR) + UI language switcher
   Creator: RayTatsu
   ============================================================ */

'use strict';

// ── LANGUAGE STATE ────────────────────────────────────────────

let uiLang = localStorage.getItem('tfm2_ui_lang') || 'en';

function setUILang(lang) {
  uiLang = lang;
  localStorage.setItem('tfm2_ui_lang', lang);
  // Update toggle buttons
  document.querySelectorAll('.lang-ui-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  // Refresh any translated content
  if (typeof refreshUITranslations === 'function') refreshUITranslations();
}

function getTooltipData(key) {
  const dict = uiLang === 'pt' ? TOOLTIPS_PT : TOOLTIPS_EN;
  return dict[key] || TOOLTIPS_EN[key] || null;
}

// ── TOOLTIP DATA — ENGLISH ────────────────────────────────────

const TOOLTIPS_EN = {
  // NAV
  nav_info: { title: 'Mod Info', body: 'Configure mod.mod_info — mod name, author, version, and game base dependency.', tag: 'mod.mod_info' },
  nav_champion: { title: 'Champion Identity', body: "Define the champion's unique ID, category (Melee, Range etc.) and classification tags (AP, Tank, CC...).", tag: 'data_champion' },
  nav_stats: { title: 'Stats & Growth', body: 'Base stats at level 1 and growth per level. "Growth" is added on each level up.', tag: 'stat / growth' },
  nav_actions: { title: 'Actions & Skills', body: 'Define the 4 actions: basic attack, skill 1, skill 2 and ultimate. Each action has one effect that fires at start_timing.', tag: 'attack / skill / skill2 / ult' },
  nav_visuals: { title: 'Visual Bindings', body: 'Register named visuals for effects (view_effects), projectiles (view_projectiles) and buffs (view_buffs). Names must match exactly what the effect references.', tag: 'view_effects / view_projectiles / view_buffs' },
  nav_sprite: { title: 'Sprite Sheet', body: 'Upload your character spritesheet. Define frame size and animation ranges (idle, run, attack...). Generates the .fanim file.', tag: '#anim.fanim' },
  nav_i18n: { title: 'Descriptions (i18n)', body: 'Champion name and skill descriptions in each language. You can import an existing .i18n file to keep compatibility with other mods.', tag: 'champion.i18n' },
  nav_export: { title: 'Export Files', body: 'Generate and download all files: mod.mod_info, mod.override_info, .data_champion, champion.i18n and .fanim, already in the correct folders.', tag: 'Download / ZIP' },

  // MOD INFO
  mod_id: { title: 'Mod ID', body: "Mod folder name and asset prefix for all assets. Must be lowercase_snake_case. Never change after publishing \u2014 saves and patches may use this ID.", tag: 'mods/<mod_id>/' },
  mod_name: { title: 'Mod Name', body: 'Name displayed in the in-game Mods menu.' },
  mod_author: { title: 'Author', body: 'Your name or alias. Appears in the mod metadata.' },
  mod_version: { title: 'Version', body: 'Semantic version (major.minor.patch). e.g. 1.0.0. Increment when updating the mod.' },
  mod_description: { title: 'Description', body: 'Short text shown to the player in the Mods menu.' },
  mod_last_updated: { title: 'Last Updated', body: 'Date of the last update. Informational only.' },
  mod_base_version: { title: 'Base Game Version', body: 'Minimum game version required. Use >=0.1.0 to accept any current version. If the game is outdated, the mod is disabled with an error message.', tag: 'dependencies.base' },

  // CHAMPION
  champ_id: { title: 'Champion ID (base)', body: 'Local part of the ID. The final ID will be <mod_id>_<champion_id>. Use lowercase_snake_case. Never change after publishing.', tag: 'asset/<mod>/<id>' },
  champ_name: { title: 'Champion Name', body: 'Display name. Goes into the i18n file under description.<champion_id>.name.' },
  champ_category: { title: 'Category', body: 'Melee: close-range\nRange: ranged attacks\nMagician: AP mage\nUtil: support/utility\nAssassin: mobile assassin\nAffects classification in the game UI.', tag: 'ChampionCategory' },
  champ_anim_prefix: { title: 'Anim Prefix', body: 'Prefix to strip from animation tags. Use "" to keep tags as-is (recommended). Example: "eagle_" turns "eagle_idle" into "idle".', tag: 'anim_prefix' },
  champ_tags: { title: 'Champion Tags', body: 'AD: physical damage | AP: magic damage | Heal: healing | Shield: shield | Dot: damage over time | CC: crowd control | Range: ranged | Melee: melee | Tank: tank | Magic: magic.\nUsed for classification and search in the UI.', tag: 'ChampionTag[]' },

  // STATS
  stat_hp: { title: 'HP (Health Points)', body: 'Health points at level 1. Typical values: 500\u20131200. Tanks at 900+, assassins at 600\u2013750.' },
  stat_attack: { title: 'Attack', body: 'Physical attack damage at level 1. Used by Attack and FixedAttack effects via attack_ratio. Typical ADC: 55\u201375.' },
  stat_magic_power: { title: 'Magic Power', body: 'Base magic power. Used by ApAttack via attack_ratio. Mages typically 50\u201380 at level 1.' },
  stat_defence: { title: 'Defence', body: 'Physical resistance. Reduces AD attack damage. Tanks: 30\u201350, carries: 15\u201325.' },
  stat_magic_resistance: { title: 'Magic Resistance', body: 'Magic resistance. Reduces AP damage. Similar values to defence.' },
  stat_move_speed: { title: 'Move Speed', body: 'Movement speed. Typical values: 900\u20131200. Growth of 0 is normal.' },
  stat_hp_regen: { title: 'HP Regen', body: 'Health regeneration per tick. 1\u20133 is typical. Higher values for supports/tanks.' },
  stat_crit_chance: { title: 'Crit Chance (%)', body: 'Critical chance from 0 to 100. Typical AD champions have 0 base and gain it through items.' },
  stat_stack: { title: 'Stack', body: 'Generic stat used by some champion-specific stacking mechanics. Leave at 0 if not used.' },

  // ACTION FIELDS
  act_action_name: { title: 'Action Name', body: 'Animation tag to play when the action starts. Also the patch type name.\nUse standard names: attack, skill, skill2, ult.\nOnly change if you need a different animation for the action.', tag: 'action_name' },
  act_duration: { title: 'Duration (ticks)', body: 'Total duration of the action animation in simulation ticks. The game runs at ~60 ticks/sec.\nDuring this period the character is "animating". e.g. 18 ticks \u2248 0.3 sec.', tag: '~60 ticks = 1 sec' },
  act_cooltime: { title: 'Cooldown (ticks)', body: 'Recharge time after using the action, in ticks. 60 = ~1 sec, 240 = ~4 sec, 900 = ~15 sec.\nUltimate typically 600\u20132400.', tag: '~60 ticks = 1 sec' },
  act_start_timing: { title: 'Start Timing', body: 'The tick WITHIN the action where the effect fires. e.g. duration=18, start_timing=10 \u2192 damage occurs at frame 10 of the 18-frame animation.', tag: 'impact tick' },
  act_cancelable: { title: 'Cancelable', body: 'If checked, the action can be interrupted before completing (e.g. by stun or a new order).' },
  act_range: { title: 'Range', body: 'Base range of the action. Melee attacks: ~10000\u201316000. Ranged attacks: 40000\u201365000.\nUsed for AI target selection and the range indicator visual.' },
  act_growth_range: { title: 'Growth Range', body: 'Additional range per level. Normally 0. Use for skills that gain range on level up.' },
  act_casting_type: { title: 'Casting Type', body: 'Targeting: entity target | Position: map position | Direction: direction from caster | None: no target (area around, self).', tag: 'CastingType' },
  act_casting_target: { title: 'Casting Target', body: 'Which entities can be targeted by the action. Enemy for damage, Ally for healing, AllyOnlySelf for self-buff, None for area.', tag: 'CastingTarget' },
  act_attack_type: { title: 'Attack Type', body: 'BaseAttack: basic attack | Skill: ability | Dot: damage over time | DotIgnoreShield: Dot ignoring shield | Item: item | Well: turret.\nUse BaseAttack for the attack slot, Skill for skill/skill2/ult.', tag: 'AttackType' },
  act_can_use_with_move: { title: 'Use while moving', body: 'Allows using the action while the character is moving. Useful for dash/rush abilities.' },

  // EFFECT TYPES
  eff_Attack: { title: 'Attack \u2014 Physical Damage', body: 'Applies physical (AD) damage to the target. damage = flat, attack_ratio = % of caster Attack stat added to damage.', tag: 'attack_ratio \xd7 caster.attack' },
  eff_ApAttack: { title: 'ApAttack \u2014 Magic Damage', body: 'Applies magic (AP) damage to the target. attack_ratio here is % of the caster magic_power.', tag: 'attack_ratio \xd7 caster.magic_power' },
  eff_FixedAttack: { title: 'FixedAttack \u2014 Fixed Damage', body: 'Damage that is neither AD nor AP classified. Use for execution effects or true damage.', tag: 'fixed damage path' },
  eff_Heal: { title: 'Heal', body: 'Restores HP. heal_type defines the target: Caster (self), Any (selected target), Ally (nearby ally). Can scale with attack or ap_ratio.', tag: 'heal_type: Caster / Any / Ally' },
  eff_Shield: { title: 'Shield', body: 'Adds a temporary shield that absorbs damage. tick = duration in ticks. Scalable with attack_ratio and ap_ratio.', tag: 'tick = duration' },
  eff_Stun: { title: 'Stun', body: 'Prevents the target from acting for "duration" ticks. Hard CC. e.g. 45 ticks \u2248 0.75 sec.', tag: 'hard CC' },
  eff_Airborne: { title: 'Airborne \u2014 Knock-up', body: 'Launches the target into the air, disabling it. Similar to Stun but visually different (character floats).', tag: 'hard CC' },
  eff_Knockback: { title: 'Knockback', body: 'Pushes the target away from the caster at "speed" for "tick" ticks.', tag: 'speed + tick' },
  eff_Grab: { title: 'Grab', body: 'Pulls the target towards the caster. "tick" is optional.', tag: 'pulls to caster' },
  eff_Pull: { title: 'Pull', body: 'Pulls the target toward the effect point or caster for "tick" ticks.', tag: 'attraction' },
  eff_Fear: { title: 'Fear', body: 'Forces the target to flee for "tick" ticks. The target loses control.', tag: 'CC: flee' },
  eff_Charm: { title: 'Charm', body: 'Forces the target to walk towards the caster for "tick" ticks.', tag: 'CC: forced approach' },
  eff_Bind: { title: 'Bind \u2014 Root', body: 'Prevents the target from moving for "duration" ticks, but it can still attack/use abilities.', tag: 'root / no movement' },
  eff_Taunt: { title: 'Taunt', body: 'Forces the target to attack the caster for "duration" ticks.', tag: 'CC: forced attack on caster' },
  eff_BlockAttack: { title: 'BlockAttack', body: 'Prevents the target from using basic attacks for "tick" ticks.', tag: 'soft CC' },
  eff_BlockSkill: { title: 'BlockSkill', body: 'Prevents the target from using abilities for "tick" ticks.', tag: 'soft CC: silence' },
  eff_BlockMoveSkill: { title: 'BlockMoveSkill', body: 'Prevents the target from using movement abilities for "tick" ticks.', tag: 'soft CC' },
  eff_Invisible: { title: 'Invisible', body: 'Makes the target invisible for "tick" ticks. The character is hidden from enemies.', tag: 'invisible' },
  eff_Banish: { title: 'Banish', body: 'Temporarily removes/locks the target (like a bubble). Can have lock and end visuals.', tag: 'temporarily removed' },
  eff_Rush: { title: 'Rush \u2014 Dash to target', body: 'Moves the caster toward a target/position. During movement, applies applied_effects to collided entities matching casting_target.', tag: 'movement + collision damage' },
  eff_RushTime: { title: 'RushTime \u2014 Timed Dash', body: 'Moves the caster toward input for a fixed "tick" count, instead of going all the way. Good for fixed-distance dashes.', tag: 'movement for fixed tick count' },
  eff_Teleport: { title: 'Teleport', body: 'Instantly moves the caster to the input position/target. No movement animation.', tag: 'instant teleport' },
  eff_DirTeleport: { title: 'DirTeleport \u2014 Directional Blink', body: 'Moves the caster "moved" units in the input direction instantly. Good for short blinks.', tag: 'directional blink' },
  eff_MoveBack: { title: 'MoveBack \u2014 Backpedal', body: 'Moves the caster AWAY from the target position for "tick" ticks at "speed".', tag: 'backpedal' },
  eff_MoveTo: { title: 'MoveTo \u2014 Move to', body: 'Begins movement toward target/position/direction. When finished, fires end_effects.', tag: 'move + end_effects' },
  eff_MoveToTarget: { title: 'MoveToTarget \u2014 Chase', body: 'Similar to MoveTo but tracks the entity target. If target disappears on arrival, end_effects run at original position.', tag: 'chase target' },
  eff_RushMoveToBack: { title: 'RushMoveToBack \u2014 Dash behind', body: 'Dashes BEHIND the target and fires applied_effects after travel. Ideal for assassins and backstab mechanics.', tag: 'dash behind target' },
  eff_LinearProjectile: { title: 'LinearProjectile \u2014 Straight projectile', body: 'Spawns a projectile going straight from the caster in the target/position/direction. penetrate=true crosses multiple enemies. end_effects fire at end of range.', tag: 'linear projectile' },
  eff_BackToCasterLinearProjectile: { title: 'BackToCasterLinearProjectile', body: 'Straight projectile that goes FROM a position BACK to the caster. Useful as end_effect of another projectile (receives position as input).', tag: 'projectile back to caster' },
  eff_TargetProjectile: { title: 'TargetProjectile \u2014 Homing projectile', body: "Projectile that chases and hits the selected target. Can't be dodged by movement. More reliable than linear for basic attacks.", tag: 'homing projectile' },
  eff_TargetProjectileFromProjectile: { title: 'TargetProjectileFromProjectile', body: 'Same as TargetProjectile but spawns FROM the current projectile position. Only works inside applied_effects or end_effects of another projectile.', tag: 'child projectile' },
  eff_TargetSplashProjectile: { title: 'TargetSplashProjectile \u2014 Chain projectile', body: 'Homing projectile that on hit can jump to another target within "range". Good for chain lightning / bounce.', tag: 'chain / bounce' },
  eff_AutoTargetProjectile: { title: 'AutoTargetProjectile \u2014 Auto-aim', body: 'Automatically picks an enemy in range and fires a homing projectile. Prefers recently attacked target. Great for passive basic attacks.', tag: 'auto-aim' },
  eff_RangeProjectile: { title: 'RangeProjectile \u2014 Delayed AOE', body: 'Creates a delayed area at the selected position. After "delay" ticks, applies effects for "apply" ticks. Like an AOE skillshot with cast time.', tag: 'area with delay' },
  eff_LineRangeProjectile: { title: 'LineRangeProjectile \u2014 Delayed line', body: 'Delayed area in a line from the caster toward input. width x length define the collision box.', tag: 'line with delay' },
  eff_RangePeriodProjectile: { title: 'RangePeriodProjectile \u2014 Periodic area', body: 'Stationary area that applies effects every "period" ticks for "tick" total ticks. e.g. fire floor. end_effects fire at end.', tag: 'periodic area / DOT floor' },
  eff_ApplyInProjectile: { title: 'ApplyInProjectile \u2014 Invisible delayed area', body: 'Invisible area that waits "tick" ticks and applies effects. If follow_caster=true, follows the caster until firing. Useful for temporary auras.', tag: 'aura / invisible delay' },
  eff_ParabolicProjectile: { title: 'ParabolicProjectile \u2014 Arc projectile', body: 'Arc projectile that reaches the target in "travel_time" ticks. range_effect_name can show impact preview. Fires end_effects on arrival.', tag: 'arc / mortar' },
  eff_RangeEffect: { title: 'RangeEffect \u2014 Area effect', body: 'Immediately applies effects to all targets within "shape". apply_type: AroundCaster (around) or Forward (ahead with offset). Ideal for ultimate AOE.', tag: 'instant AOE' },
  eff_ShrinkingBarrier: { title: 'ShrinkingBarrier \u2014 Shrinking circle', body: 'Creates a circle around a target that follows it and shrinks. Applies effects at the edge. e.g. barrier that traps enemies.', tag: 'magic circle' },
  eff_AddBuff: { title: 'AddBuff \u2014 Add buff to target', body: 'Adds a stat/status buff to the SELECTED target. buff_state defines name, duration and all stat modifiers.', tag: 'buff on target' },
  eff_AddCasterBuff: { title: 'AddCasterBuff \u2014 Self-buff', body: 'Adds buff to the CASTER. only_to_enemy=true adds it only when target is an enemy. Ideal for lifesteal stacks, personal shield, etc.', tag: 'self-buff' },
  eff_RemoveCasterBuff: { title: 'RemoveCasterBuff \u2014 Remove buff', body: 'Removes a buff by name from the CASTER. Useful to clear a temporary state when activating another ability.', tag: 'remove buff from caster' },
  eff_AddCasted: { title: 'AddCasted \u2014 Periodic DOT', body: 'Adds periodic effect to the target. Every "period" ticks fires effects for "duration" total. casted_type defines icon/category (Fire, Bleed, Poison, Heal).', tag: 'DOT: period / duration' },
  eff_Combine: { title: 'Combine \u2014 Combine effects', body: 'Executes multiple effects simultaneously with the same input. The most versatile effect! Use to combine damage + CC, or damage + self-buff.', tag: 'multiple effects together' },
  eff_Delayed: { title: 'Delayed', body: 'Queues effects to execute after "tick" ticks. Useful for sequences: immediate buff + damage later, or delayed stun.', tag: 'executes after tick ticks' },
  eff_WithSelf: { title: 'WithSelf', body: 'Executes child effects with the CASTER as target context. Use when child effect needs the caster but original input is an enemy.', tag: 'forces caster as target' },
  eff_SwitchByBuff: { title: 'SwitchByBuff \u2014 Buff conditional', body: 'IF caster HAS buff_name \u2192 executes effect_buff. IF NOT \u2192 executes effect_none. Ideal for empowered/stacked abilities.', tag: 'if hasBuff \u2192 effect_buff' },
  eff_SwitchByLevel3: { title: 'SwitchByLevel3 \u2014 Level conditional', body: 'Before level 3 \u2192 effect_start. At level 3+ \u2192 effect_level3. Allows abilities that evolve with team level.', tag: 'if level >= 3 \u2192 effect_level3' },
  eff_RandomTarget: { title: 'RandomTarget \u2014 Random target', body: 'Picks a random target in "range" matching casting_target and applies effects. Great for chaotic/multi-target abilities.', tag: 'random target in range' },
  eff_ViewEffect: { title: 'ViewEffect \u2014 Visual at target', body: 'Fires a named visual at the target/input position. The name must be registered in view_effects. e.g. explosion, flash, particles.', tag: 'visual at target position' },
  eff_CasterViewEffect: { title: 'CasterViewEffect \u2014 Visual at caster', body: 'Fires a named visual AT THE CASTER POSITION. Use for auras, self flashes, activation effects.', tag: 'visual at caster position' },
  eff_CasterAnimation: { title: 'CasterAnimation \u2014 Animation state', body: 'Adds an animation state to the caster for "tick" ticks. Can change appearance without changing the action.', tag: 'animation state' },
  eff_RemoveCasterAnimation: { title: 'RemoveCasterAnimation', body: 'Removes an animation state from the caster by name.', tag: 'remove animation state' },
  eff_Sfx: { title: 'Sfx \u2014 Sound at caster', body: 'Plays a named sound effect at the caster position. The name must match a registered SFX.', tag: 'sound at caster' },
  eff_TargetSfx: { title: 'TargetSfx \u2014 Sound at target', body: 'Plays a sound effect at the target position, input or current projectile position.', tag: 'sound at target' },

  // EFFECT FIELDS
  field_damage: { title: 'Flat Damage', body: 'Fixed base damage before any scaling. If attack_ratio=100, total damage = damage + 1x caster stat.' },
  field_attack_ratio: { title: 'Attack/AP Ratio (%)', body: '% of attack stat (Attack) or magic power (ApAttack) added to damage. e.g. 80 = 80% of caster Attack added to damage.', tag: '% of caster stat' },
  field_hp_ratio: { title: 'HP Ratio (%)', body: '% of the CASTER\'s max HP added to damage. e.g. 10 = 10% of own max HP.', tag: '% caster max HP' },
  field_target_hp_ratio: { title: 'Target HP Ratio (%)', body: '% of the TARGET\'s max HP added to damage. Great for executes and HP-based damage.', tag: '% target max HP' },
  field_amount: { title: 'Flat Amount', body: 'Fixed heal or shield value before scaling.' },
  field_ap_ratio: { title: 'AP Ratio (%)', body: '% of caster magic_power added to heal/shield.', tag: '% magic_power' },
  field_heal_type: { title: 'Heal Type', body: 'Any: heals selected target | Caster: always heals caster | Ally: heals nearby allies', tag: 'DataHealType' },
  field_duration: { title: 'Duration (ticks)', body: 'CC duration in simulation ticks. 60 \u2248 1 sec. 30 = quick stun, 90+ = long stun.', tag: '~60 ticks = 1 sec' },
  field_tick: { title: 'Ticks', body: 'Duration or wait time in ticks. ~60 ticks = 1 second. Context varies by effect.', tag: '~60 ticks = 1 sec' },
  field_speed: { title: 'Speed', body: 'Projectile/movement speed in units per second. Typical projectiles: 3000\u20136000. Dashes: 3500\u20135000.', tag: 'units/sec' },
  field_range: { title: 'Range', body: 'Projectile/effect range in game units. Typically: 40000 = medium, 65000+ = long range.', tag: 'game units' },
  field_penetrate: { title: 'Penetrate', body: 'If true, the projectile continues after hitting, potentially hitting multiple enemies in a line.', tag: 'pierces multiple targets' },
  field_name: { title: 'Name', body: 'Internal name of the projectile/effect/buff. Must be unique and match exactly the visual binding registered in view_projectiles or view_effects.', tag: 'must match visual binding' },
  field_applied_target: { title: 'Applied Target', body: 'Which entities the projectile/area can hit. Default is Ally \u2014 always change to Enemy (or other) in damage projectiles!', tag: 'caution: default = Ally!' },
  field_shape: { title: 'Shape', body: 'Collision/area shape: Circle (radius), Rect (width x height), DirDot (directional cone/dot).', tag: 'ProjectileShape' },
  field_buff_state: { title: 'Buff State', body: 'Defines a buff with name, duration and stat modifiers. The name must be unique and stable \u2014 visuals and removals reference it by name.', tag: 'DataBuffStateDef' },
  field_buff_name: { title: 'Buff Name (for SwitchByBuff)', body: 'Name of buff to check on the caster. If caster HAS this buff active, executes effect_buff. Otherwise executes effect_none.', tag: 'checks buff on caster' },
  field_casted_type: { title: 'Casted Type', body: 'DOT category: Fire/Bleed = normal damage, Poison = ignores shield, Heal = periodic heal. Affects icon and damage type.', tag: 'DataCastedType' },
  field_period: { title: 'Period (ticks)', body: 'Interval in ticks between each application of the periodic effect. Min 1. e.g. 30 = fires every 0.5 sec.', tag: 'application interval' },
  field_delay: { title: 'Delay (ticks)', body: 'Wait time before the area activates. During delay the area may be visible but applies no effects.', tag: 'visual cast time' },
  field_apply: { title: 'Apply (ticks)', body: 'Duration in which the area applies effects after the delay. Targets entering during this period are affected.', tag: 'hit window' },
  field_opacity: { title: 'Opacity (0.0 \u2013 1.0)', body: 'Visual opacity of the effect. 1.0 = fully opaque. 0.5 = semi-transparent. Useful for subtle overlays.', tag: 'visual opacity' },
  field_apply_type: { title: 'Apply Type', body: 'AroundCaster: area around the caster.\nForward: area in front of caster, offset by a given amount.', tag: 'DataRangeApplyType' },
  field_only_to_enemy: { title: 'Only to Enemy', body: "If true, buff is only added to caster when the action's original target is an enemy.", tag: 'conditional' },

  // VISUAL BINDINGS
  binding_name: { title: 'Binding Name', body: 'Name connecting this visual to the effect. MUST be exactly equal to the "name" field of the effect referencing it (ViewEffect, LinearProjectile, etc.).', tag: 'case-sensitive!' },
  binding_anim: { title: 'Animation Asset Path', body: 'Animation asset path without extension. e.g. asset/my_mod/effects/fire_burst\nThe game automatically loads #sheet and #anim suffixes.', tag: 'asset path' },
  binding_tag: { title: 'Animation Tag', body: 'Tag within the animation file to play. Must match a tag in the Aseprite timeline or .fanim entry.', tag: 'animation tag' },
  binding_z: { title: 'Z Depth', body: 'Render order. 0 = default. Higher values appear in front, lower values behind.', tag: 'render depth' },
  binding_is_follow: { title: 'Is Follow', body: 'If true, the animation follows a moving target.', tag: 'follows target' },
  binding_repeat: { title: 'Repeat', body: 'If true, the projectile animation loops while in flight.', tag: 'loop animation' },
  binding_sprite: { title: 'Sprite Asset Path', body: 'Path to the static PNG used as projectile visual. e.g. asset/base/sprite/arrow', tag: 'static sprite' },
  binding_pre_tag: { title: 'Pre Tag (spawn)', body: 'Animation tag played when the projectile/buff first appears.', tag: 'spawn animation' },
  binding_loop_tag: { title: 'Loop Tag', body: 'Tag played in a loop while active.', tag: 'idle/loop animation' },
  binding_remove_tag: { title: 'Remove Tag', body: 'Tag played when the projectile/buff is removed.', tag: 'death animation' },

  // SPRITE SHEET
  sprite_frame_width: { title: 'Frame Width (px)', body: 'Width of each frame in pixels. All frames must be the same size. e.g. 40, 64, 128.', tag: 'pixels per frame' },
  sprite_frame_height: { title: 'Frame Height (px)', body: 'Height of each frame in pixels.', tag: 'pixels per frame' },
  sprite_layout: { title: 'Sheet Layout', body: 'Horizontal: frames left to right in a single row.\nVertical: frames top to bottom.\nGrid: left to right, then down.', tag: 'spritesheet layout' },
  sprite_frame_duration: { title: 'Frame Duration (s)', body: 'Default duration per frame in seconds. Can be overridden per animation. e.g. 0.1 = 10 fps, 0.06 = ~16 fps.', tag: 'seconds per frame' },
  anim_tag: { title: 'Animation Tag', body: 'Animation tag name. Must match the action_name of the action: idle, run, attack, skill, skill2, ult, dead.', tag: 'must match action_name' },
  anim_from: { title: 'Frame From', body: 'Number of the first frame in this animation (1-indexed). Frame 1 = first frame of the image.', tag: '1-indexed' },
  anim_to: { title: 'Frame To', body: 'Number of the last frame in this animation (1-indexed, inclusive).', tag: '1-indexed, inclusive' },
  anim_duration: { title: 'Frame Duration (s)', body: 'Duration of each frame in THIS specific animation in seconds.', tag: 'seconds per frame' },

  // I18N
  cv_import: { title: 'Import existing champion_view (merge)', body: "To maintain compatibility with other mods, you need to merge all champion_view entries into one style override. Import other mods' champion_view.champion_view here to combine them.", tag: 'cross-mod compatibility' },
  i18n_import: { title: 'Import existing i18n (merge)', body: "The game only supports 'override' for text, so to maintain compatibility with other mods, you need to merge all i18n files into one. Import other mods' i18n here and your champion will be added to it.", tag: 'cross-mod compatibility' },
  i18n_name: { title: 'Champion Name', body: 'Display name of the champion. Goes to: description.<id>.name in each language.' },
  i18n_attack: { title: 'Attack Description', body: 'Basic attack description. Referenced as: description.<id>.attack', tag: 'optional' },
  i18n_skill: { title: 'Skill 1 Description', body: 'First skill description. Referenced in action as: #asset/base/text/champion?description.<id>.skill', tag: 'i18n key' },
  i18n_skill2: { title: 'Skill 2 Description', body: 'Second skill description. Referenced in action as: #asset/base/text/champion?description.<id>.skill2', tag: 'i18n key' },
  i18n_ult: { title: 'Ultimate Description', body: 'Ultimate description. Referenced in action as: #asset/base/text/champion?description.<id>.ult', tag: 'i18n key' },

  // BUFF STATE
  buff_name: { title: 'Buff Name', body: 'Unique buff ID. Stable \u2014 visuals (view_buffs) and RemoveCasterBuff reference by this name.', tag: 'stable ID' },
  buff_duration_type: { title: 'Duration Type', body: 'Permanent: never expires | Time: expires after tick ticks | WithShield: expires when associated shield runs out.', tag: 'BuffType' },
  buff_attack_mult: { title: 'attack_mult', body: '% multiplier of Attack. e.g. 20 = +20% Attack for the holder.', tag: '% multiplier' },
  buff_magic_power_mult: { title: 'magic_power_mult', body: '% multiplier of Magic Power.', tag: '% multiplier' },
  buff_move_speed_mult: { title: 'move_speed_mult', body: '% multiplier of movement speed. e.g. 50 = +50% move speed.', tag: '% multiplier' },
  buff_attack_speed_mult: { title: 'attack_speed_mult', body: '% multiplier of attack speed.', tag: '% multiplier' },
  buff_skill_cooldown_mult: { title: 'skill_cooldown_mult', body: 'Modifies skill cooldown in %. Positive = shorter cooldown (faster), negative = slower.', tag: 'CD reduction' },
  buff_damaged_reduce: { title: 'damaged_reduce', body: 'Reduces damage received by % (flat). e.g. 30 = receives 30% less damage.', tag: 'damage reduction' },
  buff_damaged_amplify: { title: 'damaged_amplify', body: 'Amplifies damage received by %. e.g. 115 = receives 115% more damage. Used for debuffs.', tag: 'vulnerability' },
  buff_cc_immune: { title: 'CC Immune', body: 'If true, the holder is immune to all crowd control while the buff is active.', tag: 'full tenacity' },
  buff_undying: { title: 'Undying', body: 'If true, the holder cannot die while the buff is active. HP stays at 1.', tag: 'temporary immortality' },
  buff_ignore_wall: { title: 'Ignore Wall', body: 'If true, the holder can move through walls while the buff is active.', tag: 'phase through walls' },
  buff_vamp: { title: 'vamp', body: 'Vampirism: heals the holder for % of damage dealt.', tag: 'lifesteal' },
  buff_damage_reflect: { title: 'damage_reflect', body: 'Reflects % of damage received back to the attacker.', tag: 'thorns' },
  buff_defence_penetration: { title: 'defence_penetration', body: "Ignores this % of the target's physical defence when dealing damage.", tag: 'armour pen' },
  buff_magic_resistance_penetration: { title: 'magic_resistance_penetration', body: "Ignores this % of the target's magic resistance when dealing damage.", tag: 'MR pen' },
  buff_toughness: { title: 'toughness', body: 'CC resistance. Reduces the duration of crowd control received.', tag: 'CC resistance' },
};

// ── TOOLTIP DATA — PORTUGUESE (PT-BR) ────────────────────────

const TOOLTIPS_PT = {
  // NAV
  nav_info: { title: 'Mod Info', body: 'Configura o mod.mod_info \u2014 nome do mod, autor, vers\u00e3o, depend\u00eancia do jogo base.', tag: 'mod.mod_info' },
  nav_champion: { title: 'Champion Identity', body: 'Define o ID \u00fanico do campe\u00e3o, categoria (Melee, Range etc.) e as tags de classifica\u00e7\u00e3o (AP, Tank, CC...).', tag: 'data_champion' },
  nav_stats: { title: 'Stats & Growth', body: 'Stats base no n\u00edvel 1 e crescimento por n\u00edvel. "Growth" \u00e9 somado a cada level up.', tag: 'stat / growth' },
  nav_actions: { title: 'Actions & Skills', body: 'Define as 4 a\u00e7\u00f5es: ataque b\u00e1sico, skill 1, skill 2 e ultimate. Cada a\u00e7\u00e3o tem um efeito que dispara no start_timing.', tag: 'attack / skill / skill2 / ult' },
  nav_visuals: { title: 'Visual Bindings', body: 'Registra visuais nomeados para efeitos (view_effects), proj\u00e9teis (view_projectiles) e buffs (view_buffs). O nome precisa bater exatamente com o que o effect referencia.', tag: 'view_effects / view_projectiles / view_buffs' },
  nav_sprite: { title: 'Sprite Sheet', body: 'Fa\u00e7a upload da spritesheet do personagem. Defina tamanho dos frames e ranges de anima\u00e7\u00e3o (idle, run, attack...). Gera o arquivo .fanim.', tag: '#anim.fanim' },
  nav_i18n: { title: 'Descriptions (i18n)', body: 'Nome e descri\u00e7\u00f5es das habilidades em cada idioma. Voc\u00ea pode importar um .i18n existente para manter compatibilidade com outros mods.', tag: 'champion.i18n' },
  nav_export: { title: 'Export Files', body: 'Gera e baixa todos os arquivos: mod.mod_info, mod.override_info, .data_champion, champion.i18n e .fanim, j\u00e1 nas pastas certas.', tag: 'Download / ZIP' },

  // MOD INFO
  mod_id: { title: 'Mod ID', body: 'Nome da pasta do mod e prefixo de todos os assets. Deve ser lowercase_snake_case. Nunca mude ap\u00f3s publicar \u2014 saves e patches podem usar esse ID.', tag: 'mods/<mod_id>/' },
  mod_name: { title: 'Mod Name', body: 'Nome exibido no menu de Mods do jogo.' },
  mod_author: { title: 'Author', body: 'Seu nome ou apelido. Aparece nos metadados do mod.' },
  mod_version: { title: 'Version', body: 'Vers\u00e3o sem\u00e2ntica (major.minor.patch). Ex: 1.0.0. Incremente ao atualizar o mod.' },
  mod_description: { title: 'Description', body: 'Texto curto mostrado para o jogador no menu de Mods.' },
  mod_last_updated: { title: 'Last Updated', body: 'Data da \u00faltima atualiza\u00e7\u00e3o. Apenas informativo.' },
  mod_base_version: { title: 'Base Game Version', body: 'Vers\u00e3o m\u00ednima do jogo necess\u00e1ria. Use >=0.1.0 para aceitar qualquer vers\u00e3o atual.', tag: 'dependencies.base' },

  // CHAMPION
  champ_id: { title: 'Champion ID (base)', body: 'Parte local do ID. O ID final ser\u00e1 <mod_id>_<champion_id>. Use lowercase_snake_case. Nunca mude ap\u00f3s publicar.', tag: 'asset/<mod>/<id>' },
  champ_name: { title: 'Champion Name', body: 'Nome de exibi\u00e7\u00e3o. Vai para o arquivo i18n em description.<champion_id>.name.' },
  champ_category: { title: 'Category', body: 'Melee: corpo a corpo\nRange: ataques \u00e0 dist\u00e2ncia\nMagician: mago AP\nUtil: suporte/utilidade\nAssassin: assassino mobile', tag: 'ChampionCategory' },
  champ_anim_prefix: { title: 'Anim Prefix', body: 'Prefixo a remover dos tags de anima\u00e7\u00e3o. Use "" para manter os tags como est\u00e3o (recomendado).', tag: 'anim_prefix' },
  champ_tags: { title: 'Champion Tags', body: 'AD: dano f\u00edsico | AP: dano m\u00e1gico | Heal: cura | Shield: escudo | Dot: dano ao longo do tempo | CC: controle de multid\u00e3o | Range: ranged | Melee: corpo a corpo | Tank: tanque | Magic: magia.', tag: 'ChampionTag[]' },

  // STATS
  stat_hp: { title: 'HP (Pontos de Vida)', body: 'Pontos de vida no n\u00edvel 1. Valores t\u00edpicos: 500\u20131200. Tanques ficam em 900+, assassinos em 600\u2013750.' },
  stat_attack: { title: 'Attack', body: 'Dano de ataque f\u00edsico no n\u00edvel 1. Usado por efeitos Attack e FixedAttack via attack_ratio. ADC t\u00edpico: 55\u201375.' },
  stat_magic_power: { title: 'Magic Power', body: 'Poder m\u00e1gico base. Usado por ApAttack via attack_ratio. Magos tipicamente 50\u201380 no n\u00edvel 1.' },
  stat_defence: { title: 'Defence', body: 'Resist\u00eancia f\u00edsica. Reduz dano de ataques AD. Tanques: 30\u201350, carries: 15\u201325.' },
  stat_magic_resistance: { title: 'Magic Resistance', body: 'Resist\u00eancia m\u00e1gica. Reduz dano AP. Valores similares \u00e0 defence.' },
  stat_move_speed: { title: 'Move Speed', body: 'Velocidade de movimento. Valores t\u00edpicos: 900\u20131200. Growth de 0 \u00e9 normal.' },
  stat_hp_regen: { title: 'HP Regen', body: 'Regenera\u00e7\u00e3o de vida por tick. 1\u20133 \u00e9 normal. Valores maiores para supports/tanks.' },
  stat_crit_chance: { title: 'Crit Chance (%)', body: 'Chance de cr\u00edtico de 0 a 100. Campe\u00f5es AD t\u00edpicos t\u00eam 0 base e ganham via itens.' },
  stat_stack: { title: 'Stack', body: 'Stat gen\u00e9rico usado por algumas mec\u00e2nicas de stacking de campe\u00f5es espec\u00edficos. Deixe 0 se n\u00e3o usar.' },

  // ACTION FIELDS
  act_action_name: { title: 'Action Name', body: 'Tag de anima\u00e7\u00e3o a reproduzir quando a a\u00e7\u00e3o come\u00e7a. Tamb\u00e9m \u00e9 o nome do patch type.\nUse os nomes padr\u00e3o: attack, skill, skill2, ult.', tag: 'action_name' },
  act_duration: { title: 'Dura\u00e7\u00e3o (ticks)', body: 'Dura\u00e7\u00e3o total da anima\u00e7\u00e3o da a\u00e7\u00e3o em ticks de simula\u00e7\u00e3o. O jogo roda a ~60ticks/seg.', tag: '~60 ticks = 1 seg' },
  act_cooltime: { title: 'Cooldown (ticks)', body: 'Tempo de recarga ap\u00f3s usar a a\u00e7\u00e3o, em ticks. 60 = ~1 seg, 240 = ~4 seg, 900 = ~15 seg.', tag: '~60 ticks = 1 seg' },
  act_start_timing: { title: 'Start Timing', body: 'O tick DENTRO da a\u00e7\u00e3o onde o efeito \u00e9 disparado. Ex: duration=18, start_timing=10 \u2192 o dano ocorre no frame 10 da anima\u00e7\u00e3o de 18 frames.', tag: 'tick do impact' },
  act_cancelable: { title: 'Cancelable', body: 'Se marcado, a a\u00e7\u00e3o pode ser interrompida antes de terminar (ex: por stun ou nova ordem).' },
  act_range: { title: 'Range', body: 'Alcance base da a\u00e7\u00e3o. Ataques corpo a corpo: ~10000\u201316000. Ataques ranged: 40000\u201365000.' },
  act_growth_range: { title: 'Growth Range', body: 'Range adicional por n\u00edvel. Normalmente 0. Use para habilidades que ganham alcance ao evoluir.' },
  act_casting_type: { title: 'Casting Type', body: 'Targeting: alvo (entidade) | Position: posi\u00e7\u00e3o no mapa | Direction: dire\u00e7\u00e3o a partir do caster | None: sem alvo (area ao redor, self).', tag: 'CastingType' },
  act_casting_target: { title: 'Casting Target', body: 'Quais entidades podem ser alvos da a\u00e7\u00e3o. Enemy para dano, Ally para cura, AllyOnlySelf para self-buff, None para \u00e1rea.', tag: 'CastingTarget' },
  act_attack_type: { title: 'Attack Type', body: 'BaseAttack: ataque b\u00e1sico | Skill: habilidade | Dot: dano ao longo do tempo | DotIgnoreShield: Dot que ignora escudo | Item: item | Well: torreta.', tag: 'AttackType' },
  act_can_use_with_move: { title: 'Use while moving', body: 'Permite usar a a\u00e7\u00e3o enquanto o personagem est\u00e1 em movimento. \u00datil para habilidades de dash/rush.' },

  // EFFECT TYPES
  eff_Attack: { title: 'Attack \u2014 Dano F\u00edsico', body: 'Aplica dano f\u00edsico (AD) ao alvo. damage = flat, attack_ratio = % do stat Attack do caster somado ao dano.', tag: 'attack_ratio \xd7 caster.attack' },
  eff_ApAttack: { title: 'ApAttack \u2014 Dano M\u00e1gico', body: 'Aplica dano m\u00e1gico (AP) ao alvo. attack_ratio aqui \u00e9 % do magic_power do caster.', tag: 'attack_ratio \xd7 caster.magic_power' },
  eff_FixedAttack: { title: 'FixedAttack \u2014 Dano Fixo', body: 'Dano que n\u00e3o \u00e9 classificado como AD nem AP. Use para efeitos de execu\u00e7\u00e3o ou dano verdadeiro.', tag: 'fixed damage path' },
  eff_Heal: { title: 'Heal \u2014 Cura', body: 'Restaura HP. heal_type define o alvo: Caster (si mesmo), Any (alvo selecionado), Ally (aliado). Pode escalar com attack ou ap_ratio.', tag: 'heal_type: Caster / Any / Ally' },
  eff_Shield: { title: 'Shield \u2014 Escudo', body: 'Adiciona escudo tempor\u00e1rio que absorve dano. tick = dura\u00e7\u00e3o em ticks. Escal\u00e1vel com attack_ratio e ap_ratio.', tag: 'tick = dura\u00e7\u00e3o' },
  eff_Stun: { title: 'Stun \u2014 Atordoamento', body: 'Impede o alvo de agir por "duration" ticks. CC duro. Ex: 45 ticks \u2248 0.75 seg.', tag: 'CC duro' },
  eff_Airborne: { title: 'Airborne \u2014 Knock-up', body: 'Lan\u00e7a o alvo no ar, desabilitando-o. Semelhante ao Stun mas visualmente diferente (personagem flutua).', tag: 'CC duro' },
  eff_Knockback: { title: 'Knockback \u2014 Empur\u00e3o', body: 'Empurra o alvo para longe do caster com "speed" por "tick" ticks.', tag: 'speed + tick' },
  eff_Grab: { title: 'Grab \u2014 Agarre', body: 'Puxa o alvo em dire\u00e7\u00e3o ao caster. "tick" \u00e9 opcional.', tag: 'puxa ao caster' },
  eff_Pull: { title: 'Pull \u2014 Atra\u00e7\u00e3o', body: 'Puxa o alvo em dire\u00e7\u00e3o ao ponto do efeito ou ao caster por "tick" ticks.', tag: 'atra\u00e7\u00e3o' },
  eff_Fear: { title: 'Fear \u2014 Medo', body: 'For\u00e7a o alvo a fugir por "tick" ticks. O alvo perde controle.', tag: 'CC: fuga' },
  eff_Charm: { title: 'Charm \u2014 Encantamento', body: 'For\u00e7a o alvo a andar em dire\u00e7\u00e3o ao caster por "tick" ticks.', tag: 'CC: aproxima\u00e7\u00e3o for\u00e7ada' },
  eff_Bind: { title: 'Bind \u2014 Enraizamento', body: 'Impede o alvo de se mover por "duration" ticks, mas ele ainda pode atacar/usar habilidades.', tag: 'root / sem movimento' },
  eff_Taunt: { title: 'Taunt \u2014 Provoca\u00e7\u00e3o', body: 'For\u00e7a o alvo a atacar o caster por "duration" ticks.', tag: 'CC: ataque for\u00e7ado ao caster' },
  eff_BlockAttack: { title: 'BlockAttack', body: 'Impede o alvo de usar ataques b\u00e1sicos por "tick" ticks.', tag: 'CC suave' },
  eff_BlockSkill: { title: 'BlockSkill', body: 'Impede o alvo de usar habilidades por "tick" ticks.', tag: 'CC suave: silence' },
  eff_BlockMoveSkill: { title: 'BlockMoveSkill', body: 'Impede o alvo de usar habilidades de movimento por "tick" ticks.', tag: 'CC suave' },
  eff_Invisible: { title: 'Invisible \u2014 Invisibilidade', body: 'Torna o alvo invis\u00edvel por "tick" ticks. O personagem fica oculto dos inimigos.', tag: 'invis\u00edvel' },
  eff_Banish: { title: 'Banish \u2014 Banimento', body: 'Remove/trava o alvo temporariamente (como uma bolha). Pode ter visuais de lock e de fim.', tag: 'remove temporariamente' },
  eff_Rush: { title: 'Rush \u2014 Dash ao alvo', body: 'Move o caster em dire\u00e7\u00e3o a um alvo/posi\u00e7\u00e3o. Durante o movimento, aplica applied_effects em entidades colididas que correspondem a casting_target.', tag: 'movimento + dano em colis\u00e3o' },
  eff_RushTime: { title: 'RushTime \u2014 Dash por tempo', body: 'Move o caster em dire\u00e7\u00e3o \u00e0 entrada por "tick" ticks (fixo), ao inv\u00e9s de ir at\u00e9 o destino. Bom para dashes com dist\u00e2ncia fixa.', tag: 'movimento por tick fixo' },
  eff_Teleport: { title: 'Teleport \u2014 Teleporte', body: 'Move o caster instantaneamente para a posi\u00e7\u00e3o/alvo de entrada. Sem anima\u00e7\u00e3o de movimento.', tag: 'teleporte instant\u00e2neo' },
  eff_DirTeleport: { title: 'DirTeleport \u2014 Teleporte direcional', body: 'Move o caster "moved" unidades na dire\u00e7\u00e3o de entrada instantaneamente. Bom para blink curto.', tag: 'blink direcional' },
  eff_MoveBack: { title: 'MoveBack \u2014 Recuo', body: 'Move o caster para LONGE da posi\u00e7\u00e3o do alvo por "tick" ticks a "speed".', tag: 'recuo' },
  eff_MoveTo: { title: 'MoveTo \u2014 Mover at\u00e9', body: 'Come\u00e7a movimento em dire\u00e7\u00e3o a alvo/posi\u00e7\u00e3o/dire\u00e7\u00e3o. Quando termina, dispara end_effects.', tag: 'move + end_effects' },
  eff_MoveToTarget: { title: 'MoveToTarget \u2014 Persegui\u00e7\u00e3o', body: 'Similar ao MoveTo mas rastreia a entidade alvo. Se o alvo sumir ao chegar, end_effects rodam na posi\u00e7\u00e3o original.', tag: 'chase target' },
  eff_RushMoveToBack: { title: 'RushMoveToBack \u2014 Dash por tr\u00e1s', body: 'Faz dash para ATR\u00c1S do alvo e dispara applied_effects ap\u00f3s o travel. Ideal para assassinos e mec\u00e2nicas de backstab.', tag: 'dash para tr\u00e1s' },
  eff_LinearProjectile: { title: 'LinearProjectile \u2014 Proj\u00e9til reto', body: 'Spawna um proj\u00e9til que vai em linha reta do caster na dire\u00e7\u00e3o do alvo/posi\u00e7\u00e3o/dire\u00e7\u00e3o. penetrate=true atravessa m\u00faltiplos inimigos. end_effects disparam ao fim do range.', tag: 'proj\u00e9til linear' },
  eff_BackToCasterLinearProjectile: { title: 'BackToCasterLinearProjectile', body: 'Proj\u00e9til reto que vai DE uma posi\u00e7\u00e3o DE VOLTA ao caster. \u00datil como end_effect de outro proj\u00e9til.', tag: 'proj\u00e9til de volta ao caster' },
  eff_TargetProjectile: { title: 'TargetProjectile \u2014 Proj\u00e9til guiado', body: 'Proj\u00e9til que persegue e acerta o alvo selecionado. N\u00e3o pode ser evadido por movimento. Mais confi\u00e1vel que linear para ataque b\u00e1sico.', tag: 'homing projectile' },
  eff_TargetProjectileFromProjectile: { title: 'TargetProjectileFromProjectile', body: 'Igual ao TargetProjectile mas spawna DA posi\u00e7\u00e3o do proj\u00e9til atual. S\u00f3 funciona dentro de applied_effects ou end_effects de outro proj\u00e9til.', tag: 'proj\u00e9til filho' },
  eff_TargetSplashProjectile: { title: 'TargetSplashProjectile \u2014 Ricochete', body: 'Proj\u00e9til guiado que, ao acertar, pode saltar para outro alvo dentro de "range". Bom para chain lightning / ricochete.', tag: 'chain / ricochete' },
  eff_AutoTargetProjectile: { title: 'AutoTargetProjectile \u2014 Auto-mira', body: 'Escolhe automaticamente um inimigo no range e dispara proj\u00e9til guiado. Prefer\u00eancia pelo alvo recentemente atacado. \u00d3timo para ataques b\u00e1sicos passivos.', tag: 'auto-mira' },
  eff_RangeProjectile: { title: 'RangeProjectile \u2014 \u00c1rea atrasada', body: 'Cria uma \u00e1rea atrasada na posi\u00e7\u00e3o selecionada. Ap\u00f3s "delay" ticks, aplica efeitos por "apply" ticks. Como skillshot de AOE com cast time.', tag: '\u00e1rea com delay' },
  eff_LineRangeProjectile: { title: 'LineRangeProjectile \u2014 Linha atrasada', body: '\u00c1rea atrasada em forma de linha do caster em dire\u00e7\u00e3o ao input. width x length definem a caixa de colis\u00e3o.', tag: 'linha com delay' },
  eff_RangePeriodProjectile: { title: 'RangePeriodProjectile \u2014 \u00c1rea peri\u00f3dica', body: '\u00c1rea estacion\u00e1ria que aplica efeitos a cada "period" ticks por "tick" ticks totais. Ex: ch\u00e3o de fogo. end_effects disparado ao fim.', tag: '\u00e1rea DOT / ch\u00e3o' },
  eff_ApplyInProjectile: { title: 'ApplyInProjectile \u2014 \u00c1rea invis\u00edvel com delay', body: '\u00c1rea invis\u00edvel que espera "tick" ticks e aplica efeitos. Se follow_caster=true, segue o caster at\u00e9 disparar.', tag: 'aura / delay invis\u00edvel' },
  eff_ParabolicProjectile: { title: 'ParabolicProjectile \u2014 Proj\u00e9til parab\u00f3lico', body: 'Proj\u00e9til em arco que vai ao alvo em "travel_time" ticks. range_effect_name pode mostrar preview de impacto. Dispara end_effects ao chegar.', tag: 'arco / mort\u00e9rio' },
  eff_RangeEffect: { title: 'RangeEffect \u2014 Efeito de \u00e1rea', body: 'Aplica efeitos imediatamente a todos os alvos dentro de "shape". apply_type: AroundCaster (ao redor) ou Forward (\u00e0 frente com offset). Ideal para AOE de ult.', tag: 'AOE instant\u00e2neo' },
  eff_ShrinkingBarrier: { title: 'ShrinkingBarrier \u2014 Barreira encolhendo', body: 'Cria um c\u00edrculo ao redor de um alvo que segue esse alvo e encolhe. Aplica efeitos na borda. Ex: barreira que prende inimigos.', tag: 'c\u00edrculo m\u00e1gico' },
  eff_AddBuff: { title: 'AddBuff \u2014 Adicionar buff ao alvo', body: 'Adiciona um buff de stats/status ao alvo SELECIONADO. O buff_state define nome, dura\u00e7\u00e3o e todos os modificadores de stats.', tag: 'buff no alvo' },
  eff_AddCasterBuff: { title: 'AddCasterBuff \u2014 Auto-buff', body: 'Adiciona buff ao CASTER. only_to_enemy=true adiciona s\u00f3 quando o alvo \u00e9 inimigo. Ideal para stacks de vamp, escudo pessoal, etc.', tag: 'self-buff' },
  eff_RemoveCasterBuff: { title: 'RemoveCasterBuff \u2014 Remover buff', body: 'Remove um buff pelo nome do CASTER. \u00datil para limpar um estado tempor\u00e1rio ao ativar outra habilidade.', tag: 'remove buff do caster' },
  eff_AddCasted: { title: 'AddCasted \u2014 DOT peri\u00f3dico', body: 'Adiciona efeito peri\u00f3dico ao alvo. Cada "period" ticks dispara os effects por "duration" total. casted_type define o \u00edcone/categoria (Fire, Bleed, Poison, Heal).', tag: 'DOT: period / duration' },
  eff_Combine: { title: 'Combine \u2014 Combinar efeitos', body: 'Executa m\u00faltiplos efeitos simultaneamente com o mesmo input. O efeito mais vers\u00e1til! Use para combinar dano + CC, ou dano + self-buff.', tag: 'm\u00faltiplos efeitos juntos' },
  eff_Delayed: { title: 'Delayed \u2014 Atraso', body: 'Enfileira efeitos para executar ap\u00f3s "tick" ticks. \u00datil para seq\u00fc\u00eancias: buff imediato + dano depois, ou stun atrasado.', tag: 'executa ap\u00f3s tick ticks' },
  eff_WithSelf: { title: 'WithSelf', body: 'Executa efeitos filhos com o CASTER como contexto de alvo. Use quando o efeito filho precisa do caster mas o input original \u00e9 um inimigo.', tag: 'for\u00e7a caster como alvo' },
  eff_SwitchByBuff: { title: 'SwitchByBuff \u2014 Condicional por buff', body: 'SE o caster TEM o buff_name \u2192 executa effect_buff. SE N\u00c3O tem \u2192 executa effect_none. Ideal para habilidades empoderadas/stacked.', tag: 'if hasBuff \u2192 effect_buff' },
  eff_SwitchByLevel3: { title: 'SwitchByLevel3 \u2014 Condicional por n\u00edvel', body: 'Antes do n\u00edvel 3 \u2192 effect_start. No n\u00edvel 3+ \u2192 effect_level3. Permite habilidades que evoluem com o n\u00edvel do time.', tag: 'if level >= 3 \u2192 effect_level3' },
  eff_RandomTarget: { title: 'RandomTarget \u2014 Alvo aleat\u00f3rio', body: 'Escolhe um alvo aleat\u00f3rio no "range" que corresponda a casting_target e aplica os efeitos. \u00d3timo para habilidades ca\u00f3ticas/multi-target.', tag: 'alvo aleat\u00f3rio no range' },
  eff_ViewEffect: { title: 'ViewEffect \u2014 Efeito visual no alvo', body: 'Dispara um visual nomeado na posi\u00e7\u00e3o do alvo/input. O nome precisa estar registrado em view_effects.', tag: 'visual na posi\u00e7\u00e3o do alvo' },
  eff_CasterViewEffect: { title: 'CasterViewEffect \u2014 Efeito visual no caster', body: 'Dispara um visual nomeado NA POSI\u00c7\u00c3O DO CASTER. Use para auras, flashes self, efeitos de ativa\u00e7\u00e3o.', tag: 'visual na posi\u00e7\u00e3o do caster' },
  eff_CasterAnimation: { title: 'CasterAnimation \u2014 Estado de anima\u00e7\u00e3o', body: 'Adiciona um estado de anima\u00e7\u00e3o ao caster por "tick" ticks. Pode mudar a apar\u00eancia sem mudar a a\u00e7\u00e3o.', tag: 'animation state' },
  eff_RemoveCasterAnimation: { title: 'RemoveCasterAnimation', body: 'Remove um estado de anima\u00e7\u00e3o do caster pelo nome.', tag: 'remove animation state' },
  eff_Sfx: { title: 'Sfx \u2014 Som no caster', body: 'Reproduz um efeito sonoro nomeado na posi\u00e7\u00e3o do caster.', tag: 'som no caster' },
  eff_TargetSfx: { title: 'TargetSfx \u2014 Som no alvo', body: 'Reproduz efeito sonoro na posi\u00e7\u00e3o do alvo, input ou posi\u00e7\u00e3o do proj\u00e9til atual.', tag: 'som no alvo' },

  // EFFECT FIELDS
  field_damage: { title: 'Flat Damage', body: 'Dano fixo base antes de qualquer scaling. Se attack_ratio=100, o dano total = damage + 1x o stat do caster.' },
  field_attack_ratio: { title: 'Attack/AP Ratio (%)', body: '% do stat de ataque (Attack) ou poder m\u00e1gico (ApAttack) somado ao dano. Ex: 80 = 80% do Attack do caster \u00e9 adicionado ao dano.', tag: '% do stat do caster' },
  field_hp_ratio: { title: 'HP Ratio (%)', body: '% do HP m\u00e1ximo do CASTER somado ao dano. Ex: 10 = 10% do HP m\u00e1ximo pr\u00f3prio.', tag: '% HP m\u00e1ximo do caster' },
  field_target_hp_ratio: { title: 'Target HP Ratio (%)', body: '% do HP m\u00e1ximo do ALVO somado ao dano. \u00d3timo para execu\u00e7\u00f5es e dano baseado em HP do inimigo.', tag: '% HP m\u00e1ximo do alvo' },
  field_amount: { title: 'Flat Amount', body: 'Valor fixo de cura ou escudo antes do scaling.' },
  field_ap_ratio: { title: 'AP Ratio (%)', body: '% do magic_power do caster somado \u00e0 cura/escudo.', tag: '% magic_power' },
  field_heal_type: { title: 'Heal Type', body: 'Any: cura o alvo selecionado | Caster: cura sempre o caster | Ally: cura aliados pr\u00f3ximos', tag: 'DataHealType' },
  field_duration: { title: 'Dura\u00e7\u00e3o (ticks)', body: 'Dura\u00e7\u00e3o do CC em ticks de simula\u00e7\u00e3o. 60 \u2248 1 seg. 30 = stun r\u00e1pido, 90+ = stun longo.', tag: '~60 ticks = 1 seg' },
  field_tick: { title: 'Ticks', body: 'Dura\u00e7\u00e3o ou tempo de espera em ticks. ~60 ticks = 1 segundo. Contexto varia por efeito.', tag: '~60 ticks = 1 seg' },
  field_speed: { title: 'Speed', body: 'Velocidade do proj\u00e9til/movimento em unidades por segundo. Proj\u00e9teis t\u00edpicos: 3000\u20136000. Dashes: 3500\u20135000.', tag: 'unidades/seg' },
  field_range: { title: 'Range', body: 'Alcance do proj\u00e9til/efeito. Tipicamente: 40000 = m\u00e9dio, 65000+ = longo alcance.', tag: 'unidades do jogo' },
  field_penetrate: { title: 'Penetrate', body: 'Se true, o proj\u00e9til continua ap\u00f3s acertar, podendo acertar m\u00faltiplos inimigos em linha reta.', tag: 'atravessa m\u00faltiplos' },
  field_name: { title: 'Name', body: 'Nome interno do proj\u00e9til/efeito/buff. Deve ser \u00fanico e corresponder exatamente ao visual binding registrado em view_projectiles ou view_effects.', tag: 'deve bater com visual binding' },
  field_applied_target: { title: 'Applied Target', body: 'Quais entidades o proj\u00e9til/\u00e1rea pode acertar. O default \u00e9 Ally \u2014 sempre mude para Enemy (ou outro) em proj\u00e9teis de dano!', tag: 'cuidado: default = Ally!' },
  field_shape: { title: 'Shape', body: 'Forma de colis\u00e3o/\u00e1rea: Circle (raio), Rect (largura x altura), DirDot (cone/alvo direcional).', tag: 'ProjectileShape' },
  field_buff_state: { title: 'Buff State', body: 'Define um buff com nome, dura\u00e7\u00e3o e modificadores de stat. O nome deve ser \u00fanico e est\u00e1vel.', tag: 'DataBuffStateDef' },
  field_buff_name: { title: 'Buff Name (para SwitchByBuff)', body: 'Nome do buff a verificar no caster. Se o caster TEM esse buff ativo, executa effect_buff. Caso contr\u00e1rio, executa effect_none.', tag: 'verifica buff no caster' },
  field_casted_type: { title: 'Casted Type', body: 'Categoria do DOT: Fire/Bleed = dano normal, Poison = ignora escudo, Heal = cura peri\u00f3dica. Afeta \u00edcone e tipo de dano.', tag: 'DataCastedType' },
  field_period: { title: 'Period (ticks)', body: 'Intervalo em ticks entre cada aplica\u00e7\u00e3o do efeito peri\u00f3dico. M\u00ednimo 1. Ex: 30 = dispara a cada 0.5 seg.', tag: 'intervalo de aplica\u00e7\u00e3o' },
  field_delay: { title: 'Delay (ticks)', body: 'Tempo de espera antes de ativar a \u00e1rea. Durante o delay a \u00e1rea pode ser vis\u00edvel mas n\u00e3o aplica efeitos.', tag: 'cast time visual' },
  field_apply: { title: 'Apply (ticks)', body: 'Dura\u00e7\u00e3o em que a \u00e1rea aplica efeitos ap\u00f3s o delay. Alvo que entrar durante esse per\u00edodo \u00e9 afetado.', tag: 'janela de hit' },
  field_opacity: { title: 'Opacity (0.0 \u2013 1.0)', body: 'Opacidade do efeito visual. 1.0 = totalmente opaco. 0.5 = semi-transparente. \u00datil para sobreposi\u00e7\u00f5es sutis.', tag: 'visual opacity' },
  field_apply_type: { title: 'Apply Type', body: 'AroundCaster: \u00e1rea ao redor do caster.\nForward: \u00e1rea \u00e0 frente do caster, deslocada por um "offset".', tag: 'DataRangeApplyType' },
  field_only_to_enemy: { title: 'Only to Enemy', body: 'Se true, o buff s\u00f3 \u00e9 adicionado ao caster quando o alvo original da a\u00e7\u00e3o for um inimigo.', tag: 'condicional' },

  // VISUAL BINDINGS
  binding_name: { title: 'Binding Name', body: 'Nome que conecta este visual ao efeito. DEVE ser exatamente igual ao "name" do efeito que o referencia (ViewEffect, LinearProjectile, etc.).', tag: 'case-sensitive!' },
  binding_anim: { title: 'Animation Asset Path', body: 'Caminho do asset da anima\u00e7\u00e3o sem extens\u00e3o. Ex: asset/meu_mod/effects/fire_burst', tag: 'asset path' },
  binding_tag: { title: 'Animation Tag', body: 'Tag dentro do arquivo de anima\u00e7\u00e3o a reproduzir. Deve corresponder a um tag na timeline do Aseprite ou entrada no .fanim.', tag: 'animation tag' },
  binding_z: { title: 'Z Depth', body: 'Ordem de renderiza\u00e7\u00e3o. 0 = padr\u00e3o. Valores maiores aparecem na frente, menores atr\u00e1s.', tag: 'render depth' },
  binding_is_follow: { title: 'Is Follow', body: 'Se true, a anima\u00e7\u00e3o segue o alvo em movimento.', tag: 'segue o alvo' },
  binding_repeat: { title: 'Repeat', body: 'Se true, a anima\u00e7\u00e3o de proj\u00e9til fica em loop enquanto est\u00e1 em voo.', tag: 'loop animation' },
  binding_sprite: { title: 'Sprite Asset Path', body: 'Caminho do PNG est\u00e1tico usado como visual do proj\u00e9til. Ex: asset/base/sprite/arrow', tag: 'static sprite' },
  binding_pre_tag: { title: 'Pre Tag (spawn)', body: 'Tag de anima\u00e7\u00e3o reproduzida quando o proj\u00e9til/buff aparece pela primeira vez.', tag: 'spawn animation' },
  binding_loop_tag: { title: 'Loop Tag', body: 'Tag reproduzida em loop enquanto ativo.', tag: 'idle/loop animation' },
  binding_remove_tag: { title: 'Remove Tag', body: 'Tag reproduzida quando o proj\u00e9til/buff \u00e9 removido.', tag: 'death animation' },

  // SPRITE SHEET
  sprite_frame_width: { title: 'Frame Width (px)', body: 'Largura de cada frame em pixels. Todos os frames devem ter o mesmo tamanho. Ex: 40, 64, 128.', tag: 'pixels por frame' },
  sprite_frame_height: { title: 'Frame Height (px)', body: 'Altura de cada frame em pixels.', tag: 'pixels por frame' },
  sprite_layout: { title: 'Sheet Layout', body: 'Horizontal: frames da esquerda para direita em uma \u00fanica linha.\nVertical: frames de cima para baixo.\nGrid: esquerda para direita, depois desce.', tag: 'layout da spritesheet' },
  sprite_frame_duration: { title: 'Frame Duration (s)', body: 'Dura\u00e7\u00e3o padr\u00e3o de cada frame em segundos. Pode ser sobrescrito por anima\u00e7\u00e3o. Ex: 0.1 = 10 fps, 0.06 = ~16 fps.', tag: 'segundos por frame' },
  anim_tag: { title: 'Animation Tag', body: 'Nome do tag de anima\u00e7\u00e3o. Deve corresponder ao action_name da a\u00e7\u00e3o: idle, run, attack, skill, skill2, ult, dead.', tag: 'deve bater com action_name' },
  anim_from: { title: 'Frame From', body: 'N\u00famero do primeiro frame desta anima\u00e7\u00e3o (1-indexed). Frame 1 = primeiro frame da imagem.', tag: '1-indexed' },
  anim_to: { title: 'Frame To', body: 'N\u00famero do \u00faltimo frame desta anima\u00e7\u00e3o (1-indexed, inclusivo).', tag: '1-indexed, inclusivo' },
  anim_duration: { title: 'Frame Duration (s)', body: 'Dura\u00e7\u00e3o de cada frame DESTA anima\u00e7\u00e3o espec\u00edfica em segundos.', tag: 'segundos por frame' },

  // I18N
  cv_import: { title: 'Importar champion_view existente', body: 'Para manter a compatibilidade com outros mods, você precisa juntar todas as coordenadas de champion_view em um único arquivo de override de estilo. Importe o champion_view.champion_view de outros mods aqui para combiná-los.', tag: 'compatibilidade entre mods' },
  i18n_import: { title: 'Importar i18n existente', body: 'O jogo s\u00f3 suporta "override" para texto, ent\u00e3o para ter compatibilidade com outros mods, voc\u00ea precisa juntar todos os i18n em um s\u00f3 arquivo. Importe o i18n de outros mods aqui e seu campe\u00e3o ser\u00e1 adicionado a ele.', tag: 'compatibilidade entre mods' },
  i18n_name: { title: 'Champion Name', body: 'Nome de exibi\u00e7\u00e3o do campe\u00e3o. Vai para: description.<id>.name em cada idioma.' },
  i18n_attack: { title: 'Attack Description', body: 'Descri\u00e7\u00e3o do ataque b\u00e1sico. Referenciada como: description.<id>.attack', tag: 'opcional' },
  i18n_skill: { title: 'Skill 1 Description', body: 'Descri\u00e7\u00e3o da primeira habilidade. Referenciada na a\u00e7\u00e3o como: #asset/base/text/champion?description.<id>.skill', tag: 'i18n key' },
  i18n_skill2: { title: 'Skill 2 Description', body: 'Descri\u00e7\u00e3o da segunda habilidade. Referenciada na a\u00e7\u00e3o como: #asset/base/text/champion?description.<id>.skill2', tag: 'i18n key' },
  i18n_ult: { title: 'Ultimate Description', body: 'Descri\u00e7\u00e3o do ultimate. Referenciada na a\u00e7\u00e3o como: #asset/base/text/champion?description.<id>.ult', tag: 'i18n key' },

  // BUFF STATE
  buff_name: { title: 'Buff Name', body: 'ID \u00fanico do buff. Est\u00e1vel \u2014 visuais (view_buffs) e RemoveCasterBuff referenciam por este nome.', tag: 'ID est\u00e1vel' },
  buff_duration_type: { title: 'Duration Type', body: 'Permanent: nunca expira | Time: expira em tick ticks | WithShield: expira quando o escudo associado acabar.', tag: 'BuffType' },
  buff_attack_mult: { title: 'attack_mult', body: '% multiplicador do Attack. Ex: 20 = +20% no Attack do portador.', tag: '% multiplicador' },
  buff_magic_power_mult: { title: 'magic_power_mult', body: '% multiplicador do Magic Power.', tag: '% multiplicador' },
  buff_move_speed_mult: { title: 'move_speed_mult', body: '% multiplicador da velocidade de movimento. Ex: 50 = +50% move speed.', tag: '% multiplicador' },
  buff_attack_speed_mult: { title: 'attack_speed_mult', body: '% multiplicador da velocidade de ataque.', tag: '% multiplicador' },
  buff_skill_cooldown_mult: { title: 'skill_cooldown_mult', body: 'Modifica o cooldown das skills em %. Positivo = cooldown menor (mais r\u00e1pido), negativo = mais lento.', tag: 'CD reduction' },
  buff_damaged_reduce: { title: 'damaged_reduce', body: 'Reduz o dano recebido em % (flat). Ex: 30 = recebe 30% menos dano.', tag: 'damage reduction' },
  buff_damaged_amplify: { title: 'damaged_amplify', body: 'Amplifica o dano recebido em %. Ex: 115 = recebe 115% mais dano. Usado para debuffs.', tag: 'vulnerability' },
  buff_cc_immune: { title: 'CC Immune', body: 'Se true, o portador \u00e9 imune a todos os controles de multid\u00e3o enquanto o buff est\u00e1 ativo.', tag: 'tenacidade total' },
  buff_undying: { title: 'Undying', body: 'Se true, o portador n\u00e3o pode morrer enquanto o buff est\u00e1 ativo. HP fica em 1.', tag: 'imortalidade tempor\u00e1ria' },
  buff_ignore_wall: { title: 'Ignore Wall', body: 'Se true, o portador pode se mover atrav\u00e9s de paredes enquanto o buff est\u00e1 ativo.', tag: 'atravessa paredes' },
  buff_vamp: { title: 'vamp', body: 'Vampirismo: cura o portador em % do dano causado.', tag: 'lifesteal' },
  buff_damage_reflect: { title: 'damage_reflect', body: 'Reflete % do dano recebido de volta ao atacante.', tag: 'thorns' },
  buff_defence_penetration: { title: 'defence_penetration', body: 'Ignora esse % da defesa f\u00edsica do alvo ao causar dano.', tag: 'armour pen' },
  buff_magic_resistance_penetration: { title: 'magic_resistance_penetration', body: 'Ignora esse % da resist\u00eancia m\u00e1gica do alvo ao causar dano.', tag: 'MR pen' },
  buff_toughness: { title: 'toughness', body: 'Resist\u00eancia a CC. Reduz dura\u00e7\u00e3o de controles de multid\u00e3o recebidos.', tag: 'CC resistance' },
};

// ── TOOLTIP ENGINE ────────────────────────────────────────────

(function initTooltipEngine() {
  const box    = document.getElementById('tooltip-box');
  if (!box) return;
  const ttTitle = document.getElementById('tt-title');
  const ttBody  = document.getElementById('tt-body');
  const ttTag   = document.getElementById('tt-tag');

  let hideTimer = null;
  let currentEl = null;

  function showTooltip(el, key) {
    const data = getTooltipData(key);
    if (!data) return;
    clearTimeout(hideTimer);
    currentEl = el;
    ttTitle.textContent = data.title || key;
    ttBody.textContent  = data.body  || '';
    if (data.tag) { ttTag.textContent = data.tag; ttTag.style.display = 'inline-block'; }
    else           { ttTag.style.display = 'none'; }
    positionTooltip(el);
    box.classList.add('visible');
  }

  function positionTooltip(el) {
    const rect = el.getBoundingClientRect();
    const boxW = 300;
    const boxH = 90;
    let left = rect.left + rect.width / 2 - boxW / 2;
    let top  = rect.top - boxH - 10;
    if (left < 8) left = 8;
    if (left + boxW > window.innerWidth - 8) left = window.innerWidth - boxW - 8;
    const arrow = box.querySelector('.tooltip-arrow');
    if (top < 8) {
      top = rect.bottom + 10;
      if (arrow) arrow.style.display = 'none';
    } else {
      if (arrow) arrow.style.display = '';
    }
    box.style.left  = left + 'px';
    box.style.top   = top  + 'px';
    box.style.width = boxW + 'px';
  }

  function hideTooltip() {
    hideTimer = setTimeout(() => { box.classList.remove('visible'); currentEl = null; }, 80);
  }

  document.addEventListener('mouseover', e => {
    const target = e.target.closest('[data-tooltip]');
    if (target && target !== currentEl) showTooltip(target, target.dataset.tooltip);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-tooltip]')) hideTooltip();
  });
  document.addEventListener('mousemove', () => {
    if (currentEl && box.classList.contains('visible')) positionTooltip(currentEl);
  });
})();

// ── HELPERS ───────────────────────────────────────────────────

function tt(el, key) {
  if (el && key) el.setAttribute('data-tooltip', key);
  return el;
}

function labelWithHelp(text, tooltipKey, isRequired) {
  const reqSpan = isRequired ? ' <span class="req">*</span>' : '';
  const icon = tooltipKey
    ? ` <i class="help-icon" data-tooltip="${tooltipKey}">?</i>`
    : '';
  return `${text}${reqSpan}${icon}`;
}

// ── LANGUAGE TOGGLE UI ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Apply saved language
  document.querySelectorAll('.lang-ui-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === uiLang);
    b.addEventListener('click', () => setUILang(b.dataset.lang));
  });
});
