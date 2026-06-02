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
  age?: number;
  build: string;
  cardTone: "a" | "b" | "c";
};

export const STORY_SLIDES: StorySlide[] = [
  {
    id: "shreya",
    imageAlt: "Portrait of Shreya, Learning Challenge learner",
    initials: "S",
    quote:
      "Before Griptape, I didn't know how to run a social project. Now I do them on my own. It gave me compassion, confidence, and a completely new way of seeing my community.",
    name: "Shreya",
    build: "ran a community awareness project",
    cardTone: "a",
  },
  {
    id: "shubhankar",
    imageAlt: "Portrait of Shubhankar, Learning Challenge learner",
    initials: "S",
    quote:
      "Griptape lets you do what you want, without instructions or commands. Before this, I knew very little about technology. It took me deep into AI, game dev, and coding. It changed my mindset completely.",
    name: "Shubhankar",
    build: "went deep into AI, game dev and coding",
    cardTone: "b",
  },
  {
    id: "rehan",
    imageAlt: "Portrait of Rehan, Learning Challenge learner",
    initials: "R",
    quote:
      "I built a drone during my Learning Challenge. I had no idea about electronics, but I kept trying, making mistakes, and fixing them. That process made me confident. It also changed how I communicate.",
    name: "Rehan",
    build: "built a drone from scratch",
    cardTone: "c",
  },
  {
    id: "nikhil",
    imageAlt: "Portrait of Nikhil, Learning Challenge learner",
    initials: "N",
    quote:
      "I had social anxiety before this. I was afraid of talking to people. After Griptape, I built an app and now I can speak confidently in front of a camera. It completely changed my life.",
    name: "Nikhil",
    build: "built his own app",
    cardTone: "b",
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
                    — {story.name}{story.age ? `, ${story.age}` : ""}
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
