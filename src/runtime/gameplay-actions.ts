import {
  createGameplayActionState,
  createResourcePoolState,
  getResourcePool,
  stepGameplayActionState,
  tryStartGameplayAction,
  type ArcadeGameplayActionDefinition,
  type ArcadeGameplayActionEvent,
  type ArcadeGameplayActionState,
} from '@arcade/runtime/gameplay';

export interface RuntimeActionSnapshot {
  ownerId: string;
  resourceId: string;
  resourceValue: number;
  resourceMax: number;
  cooldowns: Readonly<Record<string, number>>;
  queuedActionId?: string | null;
  queueRemaining?: number;
}

export interface RuntimeActionResult {
  state: ArcadeGameplayActionState;
  resourceValue: number;
  cooldowns: Readonly<Record<string, number>>;
  queuedActionId: string | null;
  queueRemaining: number;
  events: readonly ArcadeGameplayActionEvent[];
}

export interface RuntimeActionStartResult extends RuntimeActionResult {
  ok: boolean;
  reason: 'cooldown' | 'resource' | null;
}

function finiteNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number`);
  }
  return value;
}

/**
 * Convert Ethic Brawl's serializable resource/cooldown shape to Runtime 1.12's
 * unified gameplay-action state. Keeping this boundary explicit lets existing
 * fighter state stay stable while Runtime atomically owns cost + cooldown
 * semantics.
 */
export function createRuntimeActionState(
  snapshot: RuntimeActionSnapshot
): ArcadeGameplayActionState {
  const resourceValue = finiteNonNegative(snapshot.resourceValue, 'resource value');
  const resourceMax = finiteNonNegative(snapshot.resourceMax, 'resource max');
  if (resourceValue > resourceMax) {
    throw new Error('resource value cannot exceed resource max');
  }

  const resources = createResourcePoolState(snapshot.ownerId, [
    {
      id: snapshot.resourceId,
      value: resourceValue,
      max: resourceMax,
    },
  ]);
  return createGameplayActionState(snapshot.ownerId, resources, {
    cooldowns: { ...snapshot.cooldowns },
    queuedActionId: snapshot.queuedActionId ?? null,
    queueRemaining: snapshot.queueRemaining ?? 0,
  });
}

function summarizeActionState(
  state: ArcadeGameplayActionState,
  resourceId: string,
  events: readonly ArcadeGameplayActionEvent[]
): RuntimeActionResult {
  const resource = getResourcePool(state.resources, resourceId);
  if (!resource) throw new Error(`Runtime action state lost resource ${resourceId}`);
  return {
    state,
    resourceValue: resource.value,
    cooldowns: state.cooldowns,
    queuedActionId: state.queuedActionId,
    queueRemaining: state.queueRemaining,
    events,
  };
}

export function tryStartRuntimeAction(
  snapshot: RuntimeActionSnapshot,
  action: ArcadeGameplayActionDefinition,
  options: { queueIfBlocked?: boolean; reason?: string } = {}
): RuntimeActionStartResult {
  const state = createRuntimeActionState(snapshot);
  const result = tryStartGameplayAction(state, action, options);
  return {
    ...summarizeActionState(result.state, snapshot.resourceId, result.events),
    ok: result.ok,
    reason: result.reason,
  };
}

export function stepRuntimeAction(
  snapshot: RuntimeActionSnapshot,
  delta = 1
): RuntimeActionResult & { changed: boolean } {
  const state = createRuntimeActionState(snapshot);
  const result = stepGameplayActionState(state, delta);
  return {
    ...summarizeActionState(result.state, snapshot.resourceId, result.events),
    changed: result.changed,
  };
}

export function defineRuntimeSpecialAction(input: {
  id: string;
  energyCost: number;
  cooldown: number;
  queueWindow?: number;
}): ArcadeGameplayActionDefinition {
  return Object.freeze({
    id: input.id,
    cooldown: finiteNonNegative(input.cooldown, 'special cooldown'),
    costs: Object.freeze([
      {
        id: 'energy',
        amount: finiteNonNegative(input.energyCost, 'special energy cost'),
      },
    ]),
    ...(input.queueWindow === undefined
      ? {}
      : { queueWindow: finiteNonNegative(input.queueWindow, 'special queue window') }),
  });
}
