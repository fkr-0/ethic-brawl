import type { FighterCombatState } from '@/game/fight/combat';

export type AbilityTrigger = 'onHit' | 'onBlock' | 'onUpdate' | 'onSpecial';

export interface AbilityContext {
  self: FighterCombatState;
  opponent: FighterCombatState;
  frame: number;
}

export interface Ability {
  id: string;
  trigger: AbilityTrigger;
  execute(ctx: AbilityContext): void;
}

const ABILITIES: Record<string, Ability> = {
  elenchus_reflect: {
    id: 'elenchus_reflect',
    trigger: 'onHit',
    execute({ opponent }) {
      const reflect = Math.floor(opponent.stats.intelligence * 0.5);
      opponent.health = Math.max(0, opponent.health - reflect);
    },
  },

  dialectic_build: {
    id: 'dialectic_build',
    trigger: 'onUpdate',
    execute({ self }) {
      self.combo.count += 0.01;
    },
  },
};

export function runAbilities(
  abilities: string[],
  trigger: AbilityTrigger,
  ctx: AbilityContext
): void {
  for (const id of abilities) {
    const ability = ABILITIES[id];
    if (!ability) continue;
    if (ability.trigger === trigger) {
      ability.execute(ctx);
    }
  }
}
