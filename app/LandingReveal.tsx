"use client";

import { useEffect } from "react";

/** Scroll-triggered .reveal animations from the static landing HTML. */
export default function LandingReveal() {
  useEffect(() => {
    const root = document.getElementById("griptape-landing");
    if (!root) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      root.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }

    const reveal = (target: Element) => {
      target.classList.add("in");
    };

    /** Any intersection is enough: 12% fails for tall sections (ratio stays below threshold). */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 2% 0px" }
    );

    root.querySelectorAll(".reveal").forEach((el) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom > 0 && rect.top < vh) {
        reveal(el);
      } else {
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);

  return null;
}
