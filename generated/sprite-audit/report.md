# Ethic Brawl Sprite Audit

This report is generated from runtime declarations. File existence alone is not treated as artistic approval.

## Summary

- Declared assets: **298**
- Assets with hard errors: **30**
- Assets requiring visual review: **235**
- Missing source art: **30**
- Wrong dimensions: **0**
- Non-integral grids: **0**

## Hard errors

| Asset | Category | Errors | Prompt job |
|---|---|---|---|
| `assets/sprites/items/bat.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/bat.md` |
| `assets/sprites/items/boulder_carry_heavy.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/boulder_carry_heavy.md` |
| `assets/sprites/items/boulder_throw_body.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/boulder_throw_body.md` |
| `assets/sprites/items/boulder.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/boulder.md` |
| `assets/sprites/items/bow_draw.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/bow_draw.md` |
| `assets/sprites/items/bow.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/bow.md` |
| `assets/sprites/items/civic_mace.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/civic_mace.md` |
| `assets/sprites/items/computer_terminal_hack.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/computer_terminal_hack.md` |
| `assets/sprites/items/computer_terminal_ion_cannon_deploy.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/computer_terminal_ion_cannon_deploy.md` |
| `assets/sprites/items/computer_terminal_smash.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/computer_terminal_smash.md` |
| `assets/sprites/items/computer_terminal.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/computer_terminal.md` |
| `assets/sprites/items/foldable_chair_smash.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/foldable_chair_smash.md` |
| `assets/sprites/items/foldable_chair.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/foldable_chair.md` |
| `assets/sprites/items/grenade.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/grenade.md` |
| `assets/sprites/items/katana_signature_flourish.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/katana_signature_flourish.md` |
| `assets/sprites/items/katana.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/katana.md` |
| `assets/sprites/items/minidrone.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/minidrone.md` |
| `assets/sprites/items/molotov_cocktail.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/molotov_cocktail.md` |
| `assets/sprites/items/neon_duelist_sword.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/neon_duelist_sword.md` |
| `assets/sprites/items/pipe.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/pipe.md` |
| `assets/sprites/items/riot_breaker_mace.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/riot_breaker_mace.md` |
| `assets/sprites/items/rocket_launcher_bracing.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/rocket_launcher_bracing.md` |
| `assets/sprites/items/rocket_launcher_fire.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/rocket_launcher_fire.md` |
| `assets/sprites/items/rocket_launcher.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/rocket_launcher.md` |
| `assets/sprites/items/rusted_short_sword.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/rusted_short_sword.md` |
| `assets/sprites/items/shovel.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/shovel.md` |
| `assets/sprites/items/sniper_rifle_bracing.png` | item-body-pose | missing_source | `docs/prompts/item-sprites/render-jobs/body-poses/sniper_rifle_bracing.md` |
| `assets/sprites/items/sniper_rifle.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/sniper_rifle.md` |
| `assets/sprites/items/street_argument_bat.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/street_argument_bat.md` |
| `assets/sprites/items/uzi.png` | item-overlay | missing_source | `docs/prompts/item-sprites/render-jobs/overlays/uzi.md` |

## Visual-review warnings

Warnings are not automatically rejected because effects, knockdowns, and intentional holds can legitimately touch edges or reuse frames.

| Asset | Warnings |
|---|---|
| `assets/sprites/items/icons-1.png` | duplicate_cells |
| `assets/sprites/roster/anselm/source/animation-v2/anselm_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/anselm/source/animation-v2/anselm_damage_recovery_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/anselm/source/animation-v2/anselm_idle_turn_4x4.png` | edge_contact |
| `assets/sprites/roster/anselm/source/animation-v2/anselm_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/anselm/source/animation-v2/anselm_jump_land_recovery_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/anselm/source/animation-v2/anselm_run_start_loop_stop_4x4.png` | edge_contact |
| `assets/sprites/roster/anselm/source/animation-v2/anselm_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/anselm/source/anselm_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/anselm/source/anselm_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/aquinas/source/animation-v2/aquinas_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/aquinas/source/animation-v2/aquinas_damage_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/aquinas/source/animation-v2/aquinas_idle_turn_4x4.png` | duplicate_cells |
| `assets/sprites/roster/aquinas/source/animation-v2/aquinas_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/aquinas/source/animation-v2/aquinas_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/aquinas/source/animation-v2/aquinas_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/aquinas/source/animation-v2/aquinas_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/aquinas/source/animation-v2/aquinas_special_effects_4x4.png` | edge_contact |
| `assets/sprites/roster/aquinas/source/animation-v2/aquinas_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/aquinas/source/aquinas_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/aquinas/source/aquinas_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_advanced_guard_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_damage_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_idle_turn_4x4.png` | duplicate_cells |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_jump_land_recovery_4x4.png` | duplicate_cells |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_run_start_loop_stop_4x4.png` | duplicate_cells |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_special_effects_4x4.png` | edge_contact |
| `assets/sprites/roster/aristotle/source/animation-v2/aristotle_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/aristotle/source/aristotle_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/aristotle/source/aristotle_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_damage_recovery_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_idle_turn_4x4.png` | edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_jump_land_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_lane_guard_crouch_4x4.png` | edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_mobility_throw_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_normal_attacks_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_run_start_loop_stop_4x4.png` | edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_special_effects_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_specials_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/bakunin/source/animation-v2/bakunin_walk_forward_backward_4x4.png` | edge_contact |
| `assets/sprites/roster/bakunin/source/bakunin_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/bakunin/source/bakunin_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/camus/source/animation-v2/camus_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/camus/source/animation-v2/camus_damage_recovery_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/camus/source/animation-v2/camus_intro_taunt_victory_defeat_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/camus/source/animation-v2/camus_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/camus/source/animation-v2/camus_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/camus/source/animation-v2/camus_normal_attacks_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/camus/source/animation-v2/camus_special_effects_4x4.png` | edge_contact |
| `assets/sprites/roster/camus/source/animation-v2/camus_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/camus/source/camus_core_4x4.png` | partial_alpha |
| `assets/sprites/roster/camus/source/camus_extended_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_damage_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_idle_turn_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_item_interactions_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_jump_land_recovery_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_lane_guard_crouch_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_mobility_throw_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_run_start_loop_stop_4x4.png` | edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_special_effects_4x4.png` | edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_specials_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_walk_forward_backward_4x4.png` | edge_contact |
| `assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_core_4x4.png` | partial_alpha, duplicate_cells |
| `assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_extended_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_damage_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_idle_turn_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_item_interactions_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_jump_land_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_lane_guard_crouch_4x4.png` | edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_run_start_loop_stop_4x4.png` | edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_special_effects_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/diogenes/source/animation-v2/diogenes_walk_forward_backward_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/diogenes/source/diogenes_core_4x4.png` | partial_alpha |
| `assets/sprites/roster/diogenes/source/diogenes_extended_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/foucault/source/animation-v2/foucault_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/foucault/source/animation-v2/foucault_damage_recovery_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/foucault/source/animation-v2/foucault_intro_taunt_victory_defeat_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/foucault/source/animation-v2/foucault_item_interactions_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/foucault/source/animation-v2/foucault_mobility_throw_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/foucault/source/animation-v2/foucault_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/foucault/source/animation-v2/foucault_specials_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/foucault/source/animation-v2/foucault_walk_forward_backward_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/foucault/source/foucault_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/foucault/source/foucault_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_advanced_guard_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_damage_recovery_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_idle_turn_4x4.png` | edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_item_interactions_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_jump_land_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_lane_guard_crouch_4x4.png` | edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_normal_attacks_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_run_start_loop_stop_4x4.png` | edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_special_effects_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_specials_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/hegel/source/animation-v2/hegel_walk_forward_backward_4x4.png` | edge_contact |
| `assets/sprites/roster/hegel/source/hegel_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/hegel/source/hegel_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/kant/source/animation-v2/kant_advanced_guard_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/kant/source/animation-v2/kant_damage_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/kant/source/animation-v2/kant_idle_turn_4x4.png` | duplicate_cells |
| `assets/sprites/roster/kant/source/animation-v2/kant_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/kant/source/animation-v2/kant_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/kant/source/animation-v2/kant_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/kant/source/animation-v2/kant_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/kant/source/animation-v2/kant_special_effects_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/kant/source/animation-v2/kant_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/kant/source/animation-v2/kant_walk_forward_backward_4x4.png` | duplicate_cells |
| `assets/sprites/roster/kant/source/kant_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/kant/source/kant_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_advanced_guard_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_damage_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_jump_land_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_lane_guard_crouch_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_run_start_loop_stop_4x4.png` | edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_special_effects_4x4.png` | edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_walk_forward_backward_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png` | partial_alpha, duplicate_cells |
| `assets/sprites/roster/kierkegaard/source/kierkegaard_extended_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_advanced_guard_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_damage_recovery_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_idle_turn_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_intro_taunt_victory_defeat_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_item_interactions_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_jump_land_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_lane_guard_crouch_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_mobility_throw_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_normal_attacks_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_run_start_loop_stop_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_special_effects_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_specials_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/leibniz/source/animation-v2/leibniz_walk_forward_backward_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_advanced_guard_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_damage_recovery_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_idle_turn_4x4.png` | duplicate_cells |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_item_interactions_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_jump_land_recovery_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_run_start_loop_stop_4x4.png` | edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_special_effects_4x4.png` | edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_walk_forward_backward_4x4.png` | edge_contact |
| `assets/sprites/roster/machiavelli/source/machiavelli_core_4x4.png` | partial_alpha |
| `assets/sprites/roster/machiavelli/source/machiavelli_extended_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/marx/source/animation-v2/marx_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/marx/source/animation-v2/marx_damage_recovery_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/marx/source/animation-v2/marx_idle_turn_4x4.png` | duplicate_cells |
| `assets/sprites/roster/marx/source/animation-v2/marx_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/marx/source/animation-v2/marx_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/marx/source/animation-v2/marx_lane_guard_crouch_4x4.png` | partial_alpha |
| `assets/sprites/roster/marx/source/animation-v2/marx_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/marx/source/animation-v2/marx_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/marx/source/animation-v2/marx_run_start_loop_stop_4x4.png` | partial_alpha, duplicate_cells |
| `assets/sprites/roster/marx/source/animation-v2/marx_special_effects_4x4.png` | edge_contact |
| `assets/sprites/roster/marx/source/animation-v2/marx_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/marx/source/marx_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/marx/source/marx_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_damage_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_idle_turn_4x4.png` | duplicate_cells |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_jump_land_recovery_4x4.png` | duplicate_cells |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_special_effects_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_walk_forward_backward_4x4.png` | duplicate_cells |
| `assets/sprites/roster/nietzsche/source/nietzsche_core_4x4.png` | partial_alpha, duplicate_cells |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_damage_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_idle_turn_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_jump_land_recovery_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_lane_guard_crouch_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_normal_attacks_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_run_start_loop_stop_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_specials_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/schmitt/source/animation-v2/schmitt_walk_forward_backward_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/schmitt/source/schmitt_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/schmitt/source/schmitt_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_advanced_guard_4x4.png` | edge_contact |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_damage_recovery_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_idle_turn_4x4.png` | duplicate_cells |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_item_interactions_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_jump_land_recovery_4x4.png` | duplicate_cells |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_lane_guard_crouch_4x4.png` | edge_contact |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_run_start_loop_stop_4x4.png` | duplicate_cells |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/socrates/source/animation-v2/socrates_walk_forward_backward_4x4.png` | duplicate_cells |
| `assets/sprites/roster/socrates/source/socrates_core_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/socrates/source/socrates_extended_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_advanced_guard_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_damage_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_idle_turn_4x4.png` | duplicate_cells |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_intro_taunt_victory_defeat_4x4.png` | edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_item_interactions_4x4.png` | edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_jump_land_recovery_4x4.png` | edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_lane_guard_crouch_4x4.png` | partial_alpha, edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_mobility_throw_4x4.png` | edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_normal_attacks_4x4.png` | edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_run_start_loop_stop_4x4.png` | edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_special_effects_4x4.png` | partial_alpha, duplicate_cells, edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_specials_4x4.png` | edge_contact |
| `assets/sprites/roster/stirner/source/animation-v2/stirner_walk_forward_backward_4x4.png` | edge_contact |
| `assets/sprites/roster/stirner/source/stirner_core_4x4.png` | partial_alpha, duplicate_cells |
| `assets/sprites/roster/stirner/source/stirner_extended_4x4.png` | partial_alpha, edge_contact |
