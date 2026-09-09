/**
 * The ambient layer behind every in-app page (employee + HR shells).
 *
 * Before this, the space below a page's colored hero was flat, uninterrupted
 * `#FAF7F2` — which is why the app read as "a banner, then a void" no matter
 * how lively the hero itself was. This sits fixed behind the scrolling
 * content: two soft, slow-drifting washes in the exact two colors already
 * used everywhere else in the product — the eucalyptus green of the hero
 * and nav, and the clay used for the one deliberate accent (Request a Demo,
 * pricing badges) — plus a faint dot grid for texture. No third hue, so it
 * never competes with the one consistent palette. `fixed` + negative
 * z-index means it never affects layout, scroll height, or stacking above.
 */
export function AppBackdrop() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(45,106,79,0.16) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="ms-float absolute -top-[10%] -left-[8%] h-[440px] w-[440px] rounded-full opacity-[0.15] blur-3xl"
        style={{ background: 'radial-gradient(circle, #2D6A4F 0%, transparent 70%)' }}
      />
      <div
        className="ms-float-slow absolute top-[38%] -right-[10%] h-[480px] w-[480px] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: 'radial-gradient(circle, #9E6B38 0%, transparent 70%)' }}
      />
      <div
        className="ms-float absolute bottom-[-14%] left-[18%] h-[400px] w-[400px] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: 'radial-gradient(circle, #2D6A4F 0%, transparent 70%)' }}
      />
    </div>
  );
}
