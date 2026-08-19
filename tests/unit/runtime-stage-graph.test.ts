import { describe, expect, it } from 'vitest';
import {
  advanceEncounter,
  advanceStageGraph,
  createEncounterState,
  createStageGraphState,
} from '@arcade/runtime/stages';
import {
  ETHIC_STORY_ENCOUNTER_PLANS,
  ETHIC_STORY_STAGE_GRAPH,
} from '../../src/content/stages/runtime-stage-graph';
import { STORY_STAGE_ORDER } from '../../src/content/stages/story-stage-data';

describe('shared runtime story composition', () => {
  it('normalizes the authored story catalogue into the production stage graph', () => {
    expect(ETHIC_STORY_STAGE_GRAPH.id).toBe('ethic-brawl-story-campaign');
    expect(ETHIC_STORY_STAGE_GRAPH.nodes.map((node) => node.id)).toEqual(STORY_STAGE_ORDER);
    expect(ETHIC_STORY_STAGE_GRAPH.nodes.at(-1)?.terminal).toBe(true);
  });

  it('advances the first story stage through the shared transition contract', () => {
    const state = createStageGraphState(ETHIC_STORY_STAGE_GRAPH);
    const result = advanceStageGraph(ETHIC_STORY_STAGE_GRAPH, state, 'clear');
    expect(result.changed).toBe(true);
    expect(result.state.currentNodeId).toBe(STORY_STAGE_ORDER[1]);
    expect(result.state.completedNodeIds).toEqual([STORY_STAGE_ORDER[0]]);
  });

  it('runs authored waves through a shared encounter plan', () => {
    const plan = ETHIC_STORY_ENCOUNTER_PLANS.babylon;
    const initial = createEncounterState(plan);
    const advanced = advanceEncounter(plan, initial);
    expect(advanced.encounter?.id).toBe('babylon:wave-1');
    expect(advanced.state.completedEncounterIds).toEqual(['babylon:wave-1']);
  });
});
