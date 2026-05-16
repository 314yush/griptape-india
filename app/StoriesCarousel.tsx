"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type StorySlide = {
  id: string;
  /** Add files under `public/stories/` (e.g. `/stories/aarav.jpg`). Omit for a placeholder. */
  imageSrc?: string;
  imageAlt: string;
  initials: string;
  quote: string;
  name: string;
  age: number;
  build: string;
  cardTone: "a" | "b" | "c";
};

export const STORY_SLIDES: StorySlide[] = [
  {
    id: "aarav",
    imageAlt: "Portrait of Aarav, Learning Challenge learner",
    initials: "A",
    quote:
      "I came in thinking I was bad at everything. I left having built a thing nobody asked me to build.",
    name: "Aarav",
    age: 16,
    build: "cohort 01 · self-taught a synth from scratch",
    cardTone: "a",
  },
  {
    id: "saanvi",
    imageAlt: "Portrait of Saanvi, Learning Challenge learner",
    initials: "S",
    quote:
      "The Champion never told me what to do. That was the scariest part. And the best part.",
    name: "Saanvi",
    age: 17,
    build: "cohort 02 · made a short film about her neighbourhood",
    cardTone: "b",
  },
  {
    id: "rishaan",
    imageAlt: "Portrait of Rishaan, Learning Challenge learner",
    initials: "R",
    quote:
      "I asked for help from a stranger online. They said yes. I haven't been the same since.",
    name: "Rishaan",
    age: 15,
    build: "cohort 02 · built a low-cost air sensor",
    cardTone: "c",
  },
];

function StoryPhoto({
  imageSrc,
  imageAlt,
  initials,
}: Pick<StorySlide, "imageSrc" | "imageAlt" | "initials">) {
  const [usePlaceholder, setUsePlaceholder] = useState(!imageSrc);

  if (usePlaceholder) {
    return (
      <div className="stories-photo-placeholder" aria-hidden>
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc!}
      alt={imageAlt}
      fill
      className="stories-photo"
      sizes="(max-width: 600px) 90vw, 420px"
      onError={() => setUsePlaceholder(true)}
    />
  );
}

export default function StoriesCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const syncActive = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const mid = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    syncActive();
    viewport.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("resize", syncActive);
    return () => {
      viewport.removeEventListener("scroll", syncActive);
      window.removeEventListener("resize", syncActive);
    };
  }, [syncActive]);

  const scrollToIndex = useCallback((index: number) => {
    const smooth = !(
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    slideRefs.current[index]?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      inline: "center",
      block: "nearest",
    });
  }, []);

  const goPrev = useCallback(() => {
    scrollToIndex(Math.max(0, active - 1));
  }, [active, scrollToIndex]);

  const goNext = useCallback(() => {
    scrollToIndex(Math.min(STORY_SLIDES.length - 1, active + 1));
  }, [active, scrollToIndex]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    },
    [goPrev, goNext]
  );

  return (
    <div
      className="stories-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Learner stories from the cohort"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div className="stories-carousel-frame">
        <div
          className="stories-carousel-viewport"
          ref={viewportRef}
          tabIndex={-1}
        >
          <div className="stories-carousel-track" role="list">
            {STORY_SLIDES.map((story, index) => (
              <div
                key={story.id}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                className={`stories-slide stories-slide-${story.cardTone}`}
                role="listitem"
                aria-label={`${index + 1} of ${STORY_SLIDES.length}`}
              >
                <div className="stories-photo-shell">
                  <StoryPhoto
                    imageSrc={story.imageSrc}
                    imageAlt={story.imageAlt}
                    initials={story.initials}
                  />
                </div>
                <div className={`proof-card ${story.cardTone}`}>
                  <div className="quote-mark">&ldquo;</div>
                  <blockquote>{story.quote}</blockquote>
                  <div className="who">
                    — {story.name}, {story.age}
                    <br />
                    <span className="stories-build-line">{story.build}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="stories-carousel-controls">
          <button
            type="button"
            className="stories-carousel-btn"
            onClick={goPrev}
            disabled={active === 0}
            aria-label="Previous story"
          >
            ←
          </button>
          <div className="stories-carousel-dots" role="group" aria-label="Choose story">
            {STORY_SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-current={i === active ? "true" : undefined}
                aria-label={`Story ${i + 1}: ${s.name}`}
                className={`stories-carousel-dot${i === active ? " is-active" : ""}`}
                onClick={() => scrollToIndex(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="stories-carousel-btn"
            onClick={goNext}
            disabled={active === STORY_SLIDES.length - 1}
            aria-label="Next story"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
