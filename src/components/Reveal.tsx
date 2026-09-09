import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Fades + slides a section up as it enters the viewport (marketing pages
 * only — see .ms-reveal in index.css). Reveals once and stays revealed;
 * a section that has already been read shouldn't re-animate on scroll-back.
 * No-ops visually under prefers-reduced-motion via the CSS media query.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  /** ms, for staggering a row of siblings */
  delay?: number;
  as?: 'div' | 'section' | 'span';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`ms-reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}
