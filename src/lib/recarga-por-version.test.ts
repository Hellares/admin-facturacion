// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { instalarRecargaPorVersion } from './recarga-por-version';

function ventanaFalsa() {
  const target = new EventTarget();
  const reload = vi.fn();
  const win = {
    addEventListener: target.addEventListener.bind(target),
    sessionStorage: window.sessionStorage,
    location: { reload },
    setTimeout: (fn: () => void, ms: number) => window.setTimeout(fn, ms),
  } as unknown as Window;
  const fallaDeCarga = () => {
    const e = new Event('vite:preloadError', { cancelable: true });
    target.dispatchEvent(e);
    return e;
  };
  return { win, reload, fallaDeCarga };
}

beforeEach(() => {
  window.sessionStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('instalarRecargaPorVersion', () => {
  it('recarga una sola vez y deja ver el error si vuelve a fallar', () => {
    const { win, reload, fallaDeCarga } = ventanaFalsa();
    instalarRecargaPorVersion(win);

    expect(fallaDeCarga().defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);

    expect(fallaDeCarga().defaultPrevented).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('si la página cargó bien, el siguiente deploy vuelve a recargar', () => {
    const { win, reload, fallaDeCarga } = ventanaFalsa();
    window.sessionStorage.setItem('recarga-por-version', '1');
    instalarRecargaPorVersion(win);

    vi.advanceTimersByTime(10_000);
    fallaDeCarga();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
