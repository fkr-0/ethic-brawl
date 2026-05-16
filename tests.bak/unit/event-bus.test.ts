import { createEventBus } from '@/core/events/event-bus';
import { describe, expect, it } from 'vitest';

describe('event bus', () => {
  it('supports once subscriptions even when methods are destructured', () => {
    const bus = createEventBus<{ ping: number }>();
    const received: number[] = [];
    const { once, emit, hasListeners } = bus;

    once('ping', (value) => {
      received.push(value);
    });

    emit('ping', 1);
    emit('ping', 2);

    expect(received).toEqual([1]);
    expect(hasListeners('ping')).toBe(false);
  });
});
