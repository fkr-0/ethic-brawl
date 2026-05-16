import type {
  CharacterId,
  CharacterSpecial,
  SpecialType,
} from '@/content/characters/character-data';
import { spendSpecialEnergy } from '@/game/specials/runtime-state';
import { resolveCommandSpecial, specialMoveToAttackData } from '@/game/specials/special-resolver';
import type { CombatCommand } from './command-input';
import type { Fighter } from './fighter';
import type { AttackData } from './fighter-state';

export interface CombatIntentInput {
  attackPressed: boolean;
  block: boolean;
  specialPressed: boolean;
  jumpPressed: boolean;
  command: CombatCommand | null;
  currentFrame: number;
}

const SPECIAL_TIMINGS: Record<
  SpecialType,
  Pick<AttackData, 'startup' | 'active' | 'recovery' | 'hitstun' | 'knockbackX' | 'knockbackY'>
> = {
  projectile: {
    startup: 10,
    active: 8,
    recovery: 18,
    hitstun: 18,
    knockbackX: 5,
    knockbackY: 1,
  },
  aoe: {
    startup: 12,
    active: 10,
    recovery: 20,
    hitstun: 16,
    knockbackX: 4,
    knockbackY: 0,
  },
  counter: {
    startup: 6,
    active: 6,
    recovery: 16,
    hitstun: 22,
    knockbackX: 7,
    knockbackY: 2,
  },
  buff: {
    startup: 8,
    active: 12,
    recovery: 14,
    hitstun: 10,
    knockbackX: 3,
    knockbackY: 0,
  },
};

function canStartGroundedAction(fighter: Fighter): boolean {
  return (
    fighter.isGrounded &&
    fighter.hitstunFrames === 0 &&
    fighter.blockstunFrames === 0 &&
    fighter.currentAttack === null &&
    fighter.state !== 'special'
  );
}

export function canStartBlock(fighter: Fighter): boolean {
  return canStartGroundedAction(fighter) && !fighter.isBlocking;
}

export function canStartAttack(fighter: Fighter): boolean {
  return canStartGroundedAction(fighter) && !fighter.isBlocking;
}

export function canStartSpecial(fighter: Fighter): boolean {
  return canStartGroundedAction(fighter) && !fighter.isBlocking && fighter.specialCooldown === 0;
}

function applyCommandSpecial(
  fighter: Fighter,
  command: CombatCommand,
  currentFrame: number
): boolean {
  if (!canStartSpecial(fighter)) {
    return false;
  }

  const resolved = resolveCommandSpecial(
    {
      characterId: fighter.characterId as CharacterId,
      energy: fighter.specialState.currentEnergy,
      unlockedNodeIds: fighter.specialState.unlockedNodeIds,
      cooldowns: {
        ...fighter.specialState.cooldowns,
        ...(fighter.specialCooldown > 0 ? { global: fighter.specialCooldown } : {}),
      },
    },
    command.slot
  );

  if (!resolved.ok) {
    return false;
  }

  const attack = specialMoveToAttackData(resolved.special, fighter.stats);
  fighter.specialMaxCooldown = resolved.special.cooldownFrames;
  const started = fighter.startSpecialAttack(attack, currentFrame);
  if (!started) {
    return false;
  }
  fighter.queueSpecialSpawn(resolved.special);
  fighter.specialState = {
    currentEnergy: spendSpecialEnergy(fighter.specialState, resolved.special.energyCost)
      .currentEnergy,
    maxEnergy: fighter.specialState.maxEnergy,
    unlockedNodeIds: [...fighter.specialState.unlockedNodeIds],
    cooldowns: resolved.next.cooldowns,
  };
  return true;
}

export function createSpecialAttack(characterId: string, special: CharacterSpecial): AttackData {
  const timings = SPECIAL_TIMINGS[special.type];
  const width = Math.max(70, Math.round(special.range));

  return {
    id: `special_${characterId}`,
    name: special.name,
    damage: special.damage,
    hitstun: timings.hitstun,
    knockbackX: timings.knockbackX,
    knockbackY: timings.knockbackY,
    range: special.range,
    startup: timings.startup,
    active: timings.active,
    recovery: timings.recovery,
    type: 'special',
    ...(special.hitPolicyPreset ? { hitPolicyPreset: special.hitPolicyPreset } : {}),
    ...(special.moveClassPreset ? { moveClassPreset: special.moveClassPreset } : {}),
    ...(special.presentationPreset ? { presentationPreset: special.presentationPreset } : {}),
    hitbox: {
      offsetX: special.type === 'aoe' ? -Math.round(width * 0.25) : 30,
      offsetY: -70,
      width,
      height: special.type === 'projectile' ? 32 : 70,
    },
  };
}

export function applyCombatIntent(fighter: Fighter, input: CombatIntentInput): void {
  if (fighter.blockstunFrames > 0) {
    return;
  }

  if (input.command) {
    if (applyCommandSpecial(fighter, input.command, input.currentFrame)) {
      return;
    }
  }

  if (input.block) {
    if (canStartBlock(fighter)) {
      fighter.startBlocking(input.currentFrame);
    }
  } else {
    fighter.stopBlocking();
  }

  if (input.specialPressed && canStartSpecial(fighter)) {
    fighter.startSpecial(input.currentFrame);
    return;
  }

  if (input.attackPressed && canStartAttack(fighter)) {
    fighter.startAttack(undefined, input.currentFrame);
  }
}
