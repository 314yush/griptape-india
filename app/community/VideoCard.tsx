"use client";

import { useState } from "react";
import type { Challenger } from "@/lib/community";

const pad = (n: number) => String(n).padStart(2, "0");

export default function VideoCard({
  challenger,
  number,
}: {
  challenger: Challenger;
  number: number;
}) {
  const [playing, setPlaying] = useState(false);
  const { name, driveId, cohort, pursuit, city } = challenger;

  return (
    <article className="vcard">
      <div className="vcard-media">
        <span className="vcard-badge">C{pad(cohort)}</span>
        {playing ? (
          <iframe
            src={`https://drive.google.com/file/d/${driveId}/preview`}
            title={`${name}'s video`}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="vcard-poster"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${name}'s video`}
          >
            <img
              src={`https://drive.google.com/thumbnail?id=${driveId}&sz=w600`}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <span className="vcard-play" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="vcard-body">
        {pursuit && <p className="vcard-pursuit">{pursuit}</p>}
        <h3 className="vcard-name">{name}</h3>
        <div className="vcard-meta">
          <span>{city}</span>
          <span className="vcard-num">No. {number}</span>
        </div>
      </div>
    </article>
  );
}
