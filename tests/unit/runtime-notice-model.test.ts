import { createEthicNoticeModel } from '@/runtime/notices';
import { describe, expect, it } from 'vitest';

describe('Runtime notice model', () => {
  it('deduplicates repeated topic status and refreshes its lifetime', () => {
    const notices = createEthicNoticeModel({ defaultDuration: 10 });
    const first = notices.push({ topic: 'sprites', message: 'SPRITES ON' });
    notices.step(6);
    const updated = notices.push({ topic: 'sprites', message: 'SPRITES OFF', kind: 'warning' });

    expect(updated.id).toBe(first.id);
    expect(notices.snapshot().count).toBe(1);
    expect(notices.current()?.message).toBe('SPRITES OFF');
    expect(notices.current()?.remaining).toBe(10);
    expect(notices.current()?.kind).toBe('warning');
  });

  it('honors Runtime priority and expiry ordering', () => {
    const notices = createEthicNoticeModel({ defaultDuration: 4 });
    notices.push({ topic: 'settings', message: 'SETTINGS SAVED', kind: 'success' });
    notices.push({ topic: 'renderer', message: 'CANVAS FALLBACK', kind: 'danger' });

    expect(notices.current()?.message).toBe('CANVAS FALLBACK');
    notices.step(4);
    expect(notices.current()?.message).toBe('SETTINGS SAVED');
    notices.step(4);
    expect(notices.current()).toBeNull();
  });

  it('supports explicit dismissal without affecting deterministic gameplay state', () => {
    const notices = createEthicNoticeModel();
    notices.push({ topic: 'debug', message: 'FRAME BOUNDS ON' });

    expect(notices.dismissCurrent('operator')).toBe(true);
    expect(notices.snapshot()).toMatchObject({ current: null, count: 0 });
    expect(notices.dismissCurrent('operator')).toBe(false);
  });

  it('caps the queue while retaining higher-priority feedback', () => {
    const notices = createEthicNoticeModel({ capacity: 2 });
    notices.push({ topic: 'debug', message: 'DEBUG', kind: 'info' });
    notices.push({ topic: 'settings', message: 'SAVED', kind: 'success' });
    notices.push({ topic: 'renderer', message: 'FALLBACK', kind: 'danger' });

    expect(notices.snapshot().count).toBe(2);
    expect(notices.snapshot().notices.map(({ message }) => message)).toEqual(['FALLBACK', 'SAVED']);
  });
});
