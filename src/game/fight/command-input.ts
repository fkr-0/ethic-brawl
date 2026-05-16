import type { Fighter } from './fighter';
import type { Direction } from './fighter-state';

export type CommandDirection = 'left' | 'right' | 'up' | 'down' | 'neutral';
export type RelativeCommandDirection = 'forward' | 'back' | 'up' | 'down' | 'neutral';
export type CommandButton = 'attack' | 'jump';
export type CommandSlot = 'BFA' | 'BBA' | 'BUA' | 'BDA' | 'BFJ' | 'BBJ' | 'BUJ' | 'BDJ';

export type CombatCommand =
  | {
      type: 'block_direction_attack';
      direction: CommandDirection;
      relativeDirection: RelativeCommandDirection;
      commandSlot: Extract<CommandSlot, 'BFA' | 'BBA' | 'BUA' | 'BDA'>;
      slot: Extract<CommandSlot, 'BFA' | 'BBA' | 'BUA' | 'BDA'>;
    }
  | {
      type: 'block_direction_jump';
      direction: CommandDirection;
      relativeDirection: RelativeCommandDirection;
      commandSlot: Extract<CommandSlot, 'BFJ' | 'BBJ' | 'BUJ' | 'BDJ'>;
      slot: Extract<CommandSlot, 'BFJ' | 'BBJ' | 'BUJ' | 'BDJ'>;
    };

export interface CommandInputSnapshot {
  block: boolean;
  attackPressed: boolean;
  jumpPressed: boolean;
  horizontalDirection: -1 | 0 | 1;
  verticalDirection?: -1 | 0 | 1;
  facing?: Direction;
}

export interface CommandBufferEntry {
  command: CombatCommand;
  frame: number;
}

export interface CommandBufferState {
  entries: readonly CommandBufferEntry[];
  memoryFrames: number;
}

const DEFAULT_COMMAND_MEMORY_FRAMES = 10;

export function createCommandBuffer(
  memoryFrames = DEFAULT_COMMAND_MEMORY_FRAMES
): CommandBufferState {
  return { entries: [], memoryFrames };
}

export function resolveCombatCommand(input: CommandInputSnapshot): CombatCommand | null {
  if (!input.block) {
    return null;
  }

  const button: CommandButton | null = input.attackPressed
    ? 'attack'
    : input.jumpPressed
      ? 'jump'
      : null;
  if (!button) {
    return null;
  }

  const direction = resolveAbsoluteDirection(
    input.horizontalDirection,
    input.verticalDirection ?? 0
  );
  if (direction === 'neutral') {
    return null;
  }

  return createCombatCommand(direction, button, input.facing ?? 'right');
}

export function pushCommandBuffer(
  buffer: CommandBufferState,
  command: CombatCommand | null,
  frame: number
): CommandBufferState {
  const freshEntries = buffer.entries.filter((entry) => frame - entry.frame <= buffer.memoryFrames);
  if (!command) {
    return { ...buffer, entries: freshEntries };
  }

  return {
    ...buffer,
    entries: [...freshEntries, { command, frame }],
  };
}

export function consumeLatestCommand(
  buffer: CommandBufferState,
  frame: number,
  acceptedSlots?: readonly CommandSlot[]
): { command: CombatCommand | null; buffer: CommandBufferState } {
  const freshEntries = buffer.entries.filter((entry) => frame - entry.frame <= buffer.memoryFrames);
  const match = [...freshEntries]
    .reverse()
    .find((entry) => !acceptedSlots || acceptedSlots.includes(entry.command.commandSlot));

  return {
    command: match?.command ?? null,
    buffer: {
      ...buffer,
      entries: match ? freshEntries.filter((entry) => entry !== match) : freshEntries,
    },
  };
}

export function commandSlotToLabel(slot: CommandSlot): string {
  const labels: Record<CommandSlot, string> = {
    BFA: 'B + > + A',
    BBA: 'B + < + A',
    BUA: 'B + ^ + A',
    BDA: 'B + v + A',
    BFJ: 'B + > + J',
    BBJ: 'B + < + J',
    BUJ: 'B + ^ + J',
    BDJ: 'B + v + J',
  };
  return labels[slot];
}

export function relativeDirectionToCommandSlot(
  direction: RelativeCommandDirection,
  button: CommandButton
): CommandSlot | null {
  if (direction === 'neutral') {
    return null;
  }

  const suffix = button === 'attack' ? 'A' : 'J';
  const prefixByDirection: Record<
    Exclude<RelativeCommandDirection, 'neutral'>,
    'BF' | 'BB' | 'BU' | 'BD'
  > = {
    forward: 'BF',
    back: 'BB',
    up: 'BU',
    down: 'BD',
  };

  return `${prefixByDirection[direction]}${suffix}` as CommandSlot;
}

export function toRelativeDirection(
  direction: CommandDirection,
  facing: Direction
): RelativeCommandDirection {
  if (direction === 'up' || direction === 'down' || direction === 'neutral') {
    return direction;
  }

  if (facing === 'right') {
    return direction === 'right' ? 'forward' : 'back';
  }

  return direction === 'left' ? 'forward' : 'back';
}

export function shouldUseDirectionalCommand(fighter: Fighter): boolean {
  return fighter.isGrounded && fighter.hitstunFrames === 0 && fighter.blockstunFrames === 0;
}

function resolveAbsoluteDirection(horizontal: -1 | 0 | 1, vertical: -1 | 0 | 1): CommandDirection {
  if (vertical < 0) return 'up';
  if (vertical > 0) return 'down';
  if (horizontal < 0) return 'left';
  if (horizontal > 0) return 'right';
  return 'neutral';
}

function createCombatCommand(
  direction: CommandDirection,
  button: CommandButton,
  facing: Direction
): CombatCommand | null {
  const relativeDirection = toRelativeDirection(direction, facing);
  const commandSlot = relativeDirectionToCommandSlot(relativeDirection, button);
  if (!commandSlot) return null;

  if (button === 'attack') {
    return {
      type: 'block_direction_attack',
      direction,
      relativeDirection,
      commandSlot: commandSlot as Extract<CommandSlot, 'BFA' | 'BBA' | 'BUA' | 'BDA'>,
      slot: commandSlot as Extract<CommandSlot, 'BFA' | 'BBA' | 'BUA' | 'BDA'>,
    };
  }

  return {
    type: 'block_direction_jump',
    direction,
    relativeDirection,
    commandSlot: commandSlot as Extract<CommandSlot, 'BFJ' | 'BBJ' | 'BUJ' | 'BDJ'>,
    slot: commandSlot as Extract<CommandSlot, 'BFJ' | 'BBJ' | 'BUJ' | 'BDJ'>,
  };
}
