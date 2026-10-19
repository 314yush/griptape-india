import Link from "next/link";
import Badge from "./Badge";
import { OUTCOMES } from "@/lib/portfolio/outcomes";

export default function PortfolioLanding() {
  return (
    <div className="gtp-landing">
      <section className="gtp-hero">
        <p className="gtp-kicker">For Griptape learners</p>
        <h1>
          Show what you <span className="gtp-hl">made</span>.<br />
          Show <em>how</em> you made it.
        </h1>
        <p className="gtp-lede">
          Log every step of your pursuit: what you did, how you did it, the hours you put in. Each entry grows your
          badges, and one button turns it all into a portfolio PDF you can send to anyone.
        </p>
        <div className="gtp-hero-cta">
          <Link href="/portfolio/login" className="gtp-btn gtp-btn-orange">
            Sign in
          </Link>
          <Link href="/portfolio/demo" className="gtp-btn gtp-btn-yellow">
            See a demo
          </Link>
        </div>
      </section>

      <section className="gtp-steps">
        {[
          ["01", "Sign in", "Pick your cohort and type your name. First time, use your cohort code and choose your own password."],
          ["02", "Log your work", "What you did, how you did it, hours, proof. Your summary updates itself."],
          ["03", "Earn badges", "Badges arrive on their own, based on the skills your work shows."],
          ["04", "Download", "One click gives you a PDF portfolio with your name, projects and badges."],
        ].map(([n, t, d]) => (
          <div key={n} className="gtp-step">
            <span>{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </section>

      <section className="gtp-outcomes">
        <h2>Five GripTape skills. Each badge grows as you use it.</h2>
        <div className="gtp-outcome-grid">
          {OUTCOMES.map((o, i) => (
            <div key={o.key} className="gtp-outcome" style={{ transform: `rotate(${[-2, 1.5, -1][i % 3]}deg)` }}>
              <Badge glyph={o.key} color={o.color} tier={5} size={104} title={o.name} />
              <h3>{o.name}</h3>
              <b>“{o.short}”</b>
              <p>{o.prompt}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
