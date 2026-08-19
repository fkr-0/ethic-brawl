import {
  createEncounterPlan,
  createStageGraph,
  type ArcadeEncounterPlan,
  type ArcadeStageGraph,
} from '@arcade/runtime/stages';
import {
  STORY_STAGE_ORDER,
  STORY_STAGES,
  type StoryStageDefinition,
  type StoryStageId,
} from './story-stage-data';

function stageActorIds(stage: StoryStageDefinition): string[] {
  return [...new Set(stage.waves.flatMap((wave) => wave.enemies))];
}

function stageEncounterPlan(stage: StoryStageDefinition): ArcadeEncounterPlan {
  return createEncounterPlan({
    id: `${stage.id}:encounters`,
    encounters: stage.waves.map((wave) => ({
      id: `${stage.id}:wave-${wave.wave}`,
      kind: 'combat-wave',
      actorIds: wave.enemies,
      spawnTableIds: [`${stage.id}:wave-${wave.wave}`],
      metadata: {
        wave: wave.wave,
        note: wave.note,
      },
    })),
    metadata: {
      stageId: stage.id,
      stageName: stage.name,
    },
  });
}

export const ETHIC_STORY_ENCOUNTER_PLANS: Readonly<Record<StoryStageId, ArcadeEncounterPlan>> =
  Object.freeze(
    Object.fromEntries(
      STORY_STAGE_ORDER.map((stageId) => [stageId, stageEncounterPlan(STORY_STAGES[stageId])])
    ) as Record<StoryStageId, ArcadeEncounterPlan>
  );

const ETHIC_STORY_START_STAGE = STORY_STAGE_ORDER.at(0);
if (!ETHIC_STORY_START_STAGE) {
  throw new Error('Ethic story stage order must contain a starting stage');
}

export const ETHIC_STORY_STAGE_GRAPH: ArcadeStageGraph = createStageGraph({
  id: 'ethic-brawl-story-campaign',
  startNodeId: ETHIC_STORY_START_STAGE,
  nodes: STORY_STAGE_ORDER.map((stageId) => {
    const stage = STORY_STAGES[stageId];
    return {
      id: stage.id,
      kind: 'story-stage',
      terminal: stage.unlocksAfterClear.length === 0,
      actorIds: stageActorIds(stage),
      encounterPlanIds: [`${stage.id}:encounters`],
      objectiveIds: [`${stage.id}:clear`],
      transitions: stage.unlocksAfterClear.map((nextStageId, index) => ({
        id: `${stage.id}:clear:${nextStageId}`,
        to: nextStageId,
        signal: 'clear',
        priority: stage.unlocksAfterClear.length - index,
      })),
      metadata: {
        name: stage.name,
        act: stage.act,
        order: stage.order,
        hazards: stage.hazards,
        rewardItemIds: stage.rewardItemIds,
      },
    };
  }),
});
