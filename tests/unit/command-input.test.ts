import {
  commandSlotToLabel,
  consumeLatestCommand,
  createCommandBuffer,
  pushCommandBuffer,
  resolveCombatCommand,
} from '@/game/fight/command-input';
import { describe, expect, it } from 'vitest';

describe('LF2-style command input', () => {
  it('resolves all eight command slots', () => {
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: true,
        jumpPressed: false,
        horizontalDirection: 1,
      })?.commandSlot
    ).toBe('BFA');
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: true,
        jumpPressed: false,
        horizontalDirection: -1,
      })?.commandSlot
    ).toBe('BBA');
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: true,
        jumpPressed: false,
        horizontalDirection: 0,
        verticalDirection: -1,
      })?.commandSlot
    ).toBe('BUA');
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: true,
        jumpPressed: false,
        horizontalDirection: 0,
        verticalDirection: 1,
      })?.commandSlot
    ).toBe('BDA');
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: false,
        jumpPressed: true,
        horizontalDirection: 1,
      })?.commandSlot
    ).toBe('BFJ');
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: false,
        jumpPressed: true,
        horizontalDirection: -1,
      })?.commandSlot
    ).toBe('BBJ');
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: false,
        jumpPressed: true,
        horizontalDirection: 0,
        verticalDirection: -1,
      })?.commandSlot
    ).toBe('BUJ');
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: false,
        jumpPressed: true,
        horizontalDirection: 0,
        verticalDirection: 1,
      })?.commandSlot
    ).toBe('BDJ');
  });

  it('maps forward and back relative to facing', () => {
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: true,
        jumpPressed: false,
        horizontalDirection: -1,
        facing: 'left',
      })?.commandSlot
    ).toBe('BFA');
    expect(
      resolveCombatCommand({
        block: true,
        attackPressed: true,
        jumpPressed: false,
        horizontalDirection: 1,
        facing: 'left',
      })?.commandSlot
    ).toBe('BBA');
  });

  it('buffers and consumes latest accepted command', () => {
    const first = resolveCombatCommand({
      block: true,
      attackPressed: true,
      jumpPressed: false,
      horizontalDirection: 1,
    });
    const second = resolveCombatCommand({
      block: true,
      attackPressed: false,
      jumpPressed: true,
      horizontalDirection: 0,
      verticalDirection: 1,
    });
    let buffer = createCommandBuffer(10);
    buffer = pushCommandBuffer(buffer, first, 3);
    buffer = pushCommandBuffer(buffer, second, 5);

    const consumed = consumeLatestCommand(buffer, 8, ['BDJ']);

    expect(consumed.command?.commandSlot).toBe('BDJ');
    expect(consumed.buffer.entries).toHaveLength(1);
    expect(commandSlotToLabel('BDJ')).toBe('B + v + J');
  });

  it('expires stale commands through the shared input-forgiveness queue', () => {
    const command = resolveCombatCommand({
      block: true,
      attackPressed: true,
      jumpPressed: false,
      horizontalDirection: 1,
    });
    let buffer = createCommandBuffer(3);
    buffer = pushCommandBuffer(buffer, command, 2);
    const consumed = consumeLatestCommand(buffer, 6);
    expect(consumed.command).toBeNull();
    expect(consumed.buffer.entries).toHaveLength(0);
    expect(consumed.buffer.runtime?.window).toBe(3);
  });
});
