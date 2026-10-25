/**
 * Tests for the fixed-window rate limiter, using a fake clock.
 * Depends on: vitest, @/lib/security/rate-limit.
 */
import { describe, expect, it } from "vitest";
import { createRateLimiter } from "@/lib/security/rate-limit";

function setup(limit = 3, maxKeys?: number) {
  let time = 0;
  const limiter = createRateLimiter({
    limit,
    windowMs: 60_000,
    now: () => time,
    ...(maxKeys === undefined ? {} : { maxKeys }),
  });
  return { limiter, advance: (ms: number) => (time += ms) };
}

describe("createRateLimiter", () => {
  it("allows requests up to the limit, then blocks", () => {
    const { limiter } = setup(3);
    expect(limiter.check("1.1.1.1")).toMatchObject({ allowed: true, remaining: 2 });
    expect(limiter.check("1.1.1.1")).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.check("1.1.1.1")).toMatchObject({ allowed: true, remaining: 0 });
    expect(limiter.check("1.1.1.1")).toMatchObject({ allowed: false, remaining: 0 });
  });

  it("tracks each IP separately", () => {
    const { limiter } = setup(1);
    expect(limiter.check("1.1.1.1").allowed).toBe(true);
    expect(limiter.check("1.1.1.1").allowed).toBe(false);
    expect(limiter.check("2.2.2.2").allowed).toBe(true);
  });

  it("reports how long to wait", () => {
    const { limiter, advance } = setup(1);
    limiter.check("ip");
    advance(45_000);
    expect(limiter.check("ip")).toMatchObject({ allowed: false, retryAfterSeconds: 15 });
  });

  it("resets when the window ends", () => {
    const { limiter, advance } = setup(1);
    limiter.check("ip");
    expect(limiter.check("ip").allowed).toBe(false);
    advance(60_000);
    expect(limiter.check("ip").allowed).toBe(true);
  });

  it("caps memory when many different IPs appear", () => {
    const { limiter } = setup(5, 100);
    for (let i = 0; i < 1_000; i += 1) limiter.check(`10.0.${Math.floor(i / 256)}.${i % 256}`);
    expect(limiter.trackedKeys).toBeLessThanOrEqual(100);
  });
});
