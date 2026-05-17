import type { Metadata } from "next";
import Link from "next/link";
import LandingReveal from "./LandingReveal";
import StoriesCarousel from "./StoriesCarousel";
import "./griptape-landing.css";

export const metadata: Metadata = {
  title:
    "Apply — Griptape India Learning Challenge | India non-profit for ages 14–19",
  description:
    "Apply to the free Learning Challenge: 10 weeks, one pursuit you choose, a Champion mentor, peer tribe, and proof you can build it. Griptape India began in Bangalore and works with young people across India, inspired by GripTape, USA.",
};

function MarqueeSegment() {
  return (
    <span>
      YOU CHOOSE THE THING{" "}
      <span className="mascot-img icon-inline" aria-hidden="true" /> WE CHOOSE
      TO TRUST YOU{" "}
      <span className="mascot-img icon-inline" aria-hidden="true" /> 10 WEEKS{" "}
      <span className="mascot-img icon-inline" aria-hidden="true" /> ONE PURSUIT{" "}
      <span className="mascot-img icon-inline" aria-hidden="true" /> A REAL THING
      YOU MADE{" "}
      <span className="mascot-img icon-inline" aria-hidden="true" />
    </span>
  );
}

export default function HomePage() {
  const year = new Date().getFullYear();

  return (
    <>
      <LandingReveal />
      <div id="griptape-landing">
        <nav className="top">
          <Link href="/" className="brand">
            <span className="mascot-img" aria-hidden="true" />
            Griptape{" "}
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                opacity: 0.6,
                fontSize: 16,
                marginLeft: 2,
              }}
            >
              India
            </em>
          </Link>
          <ul className="nav-links-desktop">
            <li>
              <Link href="/apply">Apply</Link>
            </li>
            <li>
              <a href="#about-ngo">About</a>
            </li>
            <li>
              <a href="#learning-challenge">The Challenge</a>
            </li>
            <li>
              <a href="#stories">Stories</a>
            </li>
            <li>
              <a href="#fund">Support</a>
            </li>
          </ul>
          <details className="nav-mobile-menu">
            <summary className="nav-mobile-toggle">
              <span className="nav-mobile-burger" aria-hidden="true" />
              Menu
            </summary>
            <div className="nav-mobile-panel">
              <ul className="nav-mobile-list">
                <li>
                  <Link href="/apply">Apply</Link>
                </li>
                <li>
                  <a href="#about-ngo">About</a>
                </li>
                <li>
                  <a href="#learning-challenge">The Challenge</a>
                </li>
                <li>
                  <a href="#stories">Stories</a>
                </li>
                <li>
                  <a href="#fund">Support</a>
                </li>
              </ul>
            </div>
          </details>
          <div className="nav-cta-group">
            <Link href="/apply" className="apply-btn">
              Apply →
            </Link>
          </div>
        </nav>

        <header className="hero">
          <span className="mascot-img mascot-float m1" aria-hidden="true" />
          <span className="mascot-img mascot-float m2" aria-hidden="true" />

          <div className="sticker s1" style={{ top: 70, left: "18%" }}>
            first-gen learners welcome ✿
          </div>
          <div className="sticker s2">14 – 19 yrs ★</div>
          <div className="sticker s3">India · began in Bangalore</div>
          <div className="sticker s4" style={{ bottom: 200, right: "4%" }}>
            no curriculum. no exam.
          </div>

          <p className="kicker">⤿ an NGO trusting young people in India</p>
          <h1>
            Pick <span className="y">one thing</span> you care about.
            <br />
            <span className="underline">Prove you can do it.</span>
          </h1>
          <p className="sub">
            We began in Bangalore; today Griptape India works with young people
            (14–19) across the country. We exist to give them the time, the
            tribe, and the support to find a calling worth chasing — and the
            proof that they can. We run programs. We back learners. We&apos;re
            just getting started.
          </p>
          <div className="ctas">
            <Link href="/apply" className="btn btn-primary">
              Apply for the Learning Challenge →
            </Link>
            <a href="#learning-challenge" className="btn btn-secondary">
              See how it works
            </a>
          </div>
          <p className="hero-support-hint">
            <a href="#fund">Support our work</a> — help keep the program free for
            learners.
          </p>
        </header>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            <MarqueeSegment />
            <MarqueeSegment />
          </div>
        </div>

        <section className="about-ngo reveal" id="about-ngo">
          <div className="container">
            <span className="eyebrow">⌁ about griptape india</span>
            <h2 className="section-title">
              A <em className="serif">non-profit</em> for young people in India
              who want to build something real.
            </h2>
            <div className="about-ngo-grid">
              <div className="about-ngo-panel">
                <h3>What we are</h3>
                <p>
                  Griptape India is an independent non-profit organisation. We
                  run in-person programs for teens and young adults, with a
                  flagship 10-week experience called the Learning Challenge.
                  There is no fee for learners — philanthropy and partners cover
                  the cost so money is never the barrier.
                </p>
              </div>
              <div className="about-ngo-panel">
                <h3>Why we exist</h3>
                <p>
                  Most education optimises for exams and compliance. We optimise
                  for agency: picking a pursuit, sticking with it, and proving
                  you can ship something you care about — with adults who trust
                  you instead of directing every step.
                </p>
              </div>
              <div className="about-ngo-panel about-ngo-wide">
                <h3>Inspired by GripTape, USA</h3>
                <p>
                  Our method draws from{" "}
                  <strong>The GripTape Challenge</strong> in the United States.
                  Griptape India is its own entity, born in Bangalore and open to
                  young people across India — with the same DNA: real choice,
                  real resources, real proof.{" "}
                  <a
                    href="https://research.griptape.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-ngo-read-more"
                  >
                    Read more →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="what-it-is reveal" id="believe">
          <div className="container">
            <div className="heading-row">
              <div>
                <span className="eyebrow">⌁ what we believe</span>
                <h2>Three things, plainly.</h2>
              </div>
              <p>
                Griptape India isn&apos;t a curriculum. It&apos;s a worldview about
                what young people are capable of, and what they need from the
                adults around them.
              </p>
            </div>

            <div className="explainer-grid">
              <div className="explainer">
                <div className="step">⤿ 01</div>
                <h3>Young people don&apos;t need more instruction.</h3>
                <p>
                  In a world where every answer is a click away, what matters is
                  the muscle to <strong>figure things out.</strong> That muscle is
                  built by doing — not by being taught.
                </p>
              </div>
              <div className="explainer">
                <div className="step">⤿ 02</div>
                <h3>Trust is the curriculum.</h3>
                <p>
                  When a young person is given{" "}
                  <strong>
                    real choice, real resources, and a real adult who believes in
                    them
                  </strong>{" "}
                  — the rest takes care of itself. Most adults don&apos;t know how
                  to give that. We train people who can.
                </p>
              </div>
              <div className="explainer">
                <div className="step">⤿ 03</div>
                <h3>Calling is found by chasing.</h3>
                <p>
                  You don&apos;t think your way into knowing what you care about.
                  You <strong>chase something</strong> — and the chasing teaches
                  you who you are. Every young person deserves at least one real
                  attempt.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="stages for-students reveal" id="for-students">
          <div className="container">
            <span className="eyebrow">⌁ for students</span>
            <h2 className="section-title">
              If you&apos;re <em className="serif">14–19</em> in India,
              this could be yours.
            </h2>
            <p
              className="lede for-students-lede"
              style={{
                maxWidth: 720,
                marginTop: 22,
                fontSize: 18,
                lineHeight: 1.55,
              }}
            >
              First-gen learners and young people from government schools are
              especially welcome. You bring curiosity and commitment; we bring
              structure, people, and a bit of budget for the thing you choose.
            </p>

            <div className="stage-grid for-students-three">
              <div className="stage">
                <div className="num">01</div>
                <h3>What you get</h3>
                <p className="quote">Not lessons. A real shot.</p>
                <p>
                  A <strong>Champion</strong> (trained mentor) who won&apos;t
                  boss your project. A small <strong>resource budget</strong> for
                  materials or tools you need. A <strong>tribe of peers</strong>{" "}
                  chasing their own pursuits alongside you. Four milestone
                  moments over ten weeks, ending in a <strong>Showcase</strong>{" "}
                  where you show what you made.
                </p>
              </div>
              <div className="stage">
                <div className="num">02</div>
                <h3>What you bring</h3>
                <p className="quote">One pursuit. Your curiosity.</p>
                <p>
                  You pick <strong>one thing</strong> you care about — music, a
                  machine, a film, a community project, research, art, code,
                  anything you can make progress on in ten weeks. You show up,
                  ask for help when stuck, and drive the work. No exam; your
                  proof is the thing you build.
                </p>
              </div>
              <div className="stage">
                <div className="num">03</div>
                <h3>How to apply</h3>
                <p className="quote">Short form. You take it from there.</p>
                <p>
                  <strong>1.</strong> Go to the apply page and sign in with your
                  phone. <strong>2.</strong> Tell us about yourself and your
                  pursuit idea. <strong>3.</strong> Record a short video so we can
                  hear you in your own words. We read every application.
                </p>
                <p style={{ marginTop: 16, marginBottom: 0 }}>
                  <Link href="/apply" className="program-link for-students-apply-link">
                    Start your application →
                  </Link>
                </p>
              </div>
            </div>

            <div
              className="faq-block"
              role="region"
              aria-labelledby="faq-heading"
            >
              <h3 className="faq-title" id="faq-heading">
                Quick answers
              </h3>
              <div className="faq-accordion">
                <details className="faq-details">
                  <summary className="faq-summary">
                    Does it cost anything?
                  </summary>
                  <div className="faq-answer">
                    <p>
                      No. The Learning Challenge is free for learners; donors
                      and partners cover program costs.
                    </p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    How much time per week?
                  </summary>
                  <div className="faq-answer">
                    <p>
                      Expect a steady rhythm over ten weeks — roughly a few hours
                      on your pursuit each week, plus cohort gatherings and
                      check-ins with your Champion.
                    </p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    Do I need a perfect idea?
                  </summary>
                  <div className="faq-answer">
                    <p>
                      No. You need something you genuinely want to try. It can
                      evolve — the point is to chase, not to pitch a polished plan
                      on day one.
                    </p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    What if I&apos;m not in a &quot;top&quot; school?
                  </summary>
                  <div className="faq-answer">
                    <p>
                      That&apos;s fine. The cohort is intentionally mixed; many
                      spots are for first-generation learners and government-school
                      students.
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>

        <section className="what-we-do reveal" id="learning-challenge">
          <div className="container">
            <span className="eyebrow">⌁ what we do</span>
            <h2 className="section-title">
              We run <em className="serif">programs</em> that put that belief into
              practice.
            </h2>
            <p
              style={{
                maxWidth: 720,
                marginTop: 22,
                fontSize: 18,
                lineHeight: 1.55,
              }}
            >
              It starts with the flagship Learning Challenge. After those ten
              weeks, graduates choose what fits them next: take space to keep
              building their own pursuit, join the Alumni Council and grow
              toward serving as a Peer Champion in the community, or, if invited,
              enter LC 2.0, a six-week apprenticeship phase with partner
              organisations to help secure an internship or another real-world
              role.
            </p>

            <div className="programs-grid">
              <div className="program-card flagship">
                <div className="program-tag">⤿ flagship program</div>
                <h3>The Learning Challenge</h3>
                <p className="program-pitch">
                  A 10-week journey where a young person picks one thing they
                  care about, gets a Champion (a trained adult mentor), a small
                  resource budget, and a tribe of peers, then walks away with
                  proof of what they did. Free for every learner.
                </p>
                <ul className="program-stats">
                  <li>
                    <strong>10 weeks</strong> · 4 peak moments · steady weekly
                    rhythm
                  </li>
                  <li>
                    <strong>~15 learners</strong> per cohort · ages 14–19 ·
                    India
                  </li>
                  <li>
                    <strong>~80%</strong> from government schools · 20% from
                    high-income schools
                  </li>
                </ul>
                <Link href="/apply" className="program-link">
                  Apply for this cohort →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="proof reveal" id="stories">
          <div className="container">
            <span className="eyebrow">⌁ from the cohort</span>
            <h2 className="section-title">In their own words.</h2>

            <StoriesCarousel />
          </div>
        </section>

        <section className="involved support-fund reveal" id="fund">
          <div className="container">
            <span className="eyebrow">⌁ fund the program</span>
            <h2 className="section-title">
              Keep it <em className="serif">free</em> for learners.
            </h2>
            <p className="lede">
              Every rupee goes toward Champion stipends, in-person gatherings,
              and the resources young people ask for during their pursuit — so
              family income never decides who gets a seat.
            </p>
            <div className="support-single-wrap">
              <div className="involve-card fund">
                <div className="role-tag">⤿ for funders + donors</div>
                <h3>Fund&nbsp;a learner. Or&nbsp;a&nbsp;cohort.</h3>
                <p className="pitch">
                  We&apos;re a young organisation with a clear method. Scaling
                  thoughtfully means pairing every cohort with reliable support
                  — and staying honest about where the money lands.
                </p>
                <ul className="ways">
                  <li>₹15,000 funds one learner&apos;s full 10-week journey</li>
                  <li>₹2,00,000 underwrites a cohort of fifteen</li>
                  <li>Long-term: anchor partner for a full year</li>
                </ul>
                <a href="#" className="cta-link">
                  Donate now →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="involved support-partner reveal" id="partner">
          <div className="container">
            <span className="eyebrow">⌁ partner with us</span>
            <h2 className="section-title">
              Schools, studios, and orgs — <em className="serif">meet</em> our
              learners halfway.
            </h2>
            <p className="lede">
              Refer young people. Host an apprenticeship. Lend space or gear.
              Guest a session or co-design a Showcase. The program gets
              stronger every time someone shows up for the cohort.
            </p>
            <div className="support-single-wrap support-partner-wrap">
              <div className="involve-card partner">
                <div className="role-tag">⤿ for schools + organisations</div>
                <h3>Partner with us.</h3>
                <p className="pitch">
                  If you run a school, a youth program, a creative studio, or a
                  company that works with young talent — there is a lane for you.
                  We&apos;ll find a fit that actually serves learners, not box-checking.
                </p>
                <ul className="ways">
                  <li>Refer young people from your school or community</li>
                  <li>
                    Host an apprenticeship or internship for an LC 2.0 graduate
                  </li>
                  <li>
                    Offer studio space, equipment, or expertise as a resource
                  </li>
                  <li>Co-design a Showcase or guest a Midpoint</li>
                </ul>
                <a href="#" className="cta-link">
                  Start a conversation →
                </a>
              </div>
            </div>

            <div className="champion-callout" id="champion">
              <div className="champion-callout-inner">
                <span className="champion-eyebrow">⤿ for individuals</span>
                <h3>Become a Champion.</h3>
                <p>
                  Champions don&apos;t teach — they show up twice a week for ten
                  weeks, ask better questions, and trust a young person to steer.
                  We train you before each cohort; you bring presence and
                  patience.
                </p>
                <ul className="champion-highlights">
                  <li>~3 hours a week across 10 weeks</li>
                  <li>Open to professionals, parents, alumni</li>
                </ul>
                <a href="#" className="cta-link champion-cta">
                  Apply to be a Champion →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta" id="support">
          <span
            className="mascot-img"
            style={{
              width: 90,
              height: 90,
              margin: "0 auto 30px",
              display: "block",
              transform: "rotate(-8deg)",
              animation: "bob 6s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
          <h2>
            Your <span className="y">pursuit</span> starts with one
            <br />
            <span className="o">application.</span>
          </h2>
          <p
            style={{
              maxWidth: 640,
              margin: "30px auto 0",
              fontSize: 18,
              opacity: 0.85,
            }}
          >
            If you&apos;re 14–19 in India and want ten weeks of trust, tribe,
            and proof — we want to read what you&apos;re chasing. Applications are
            free; support from funders is what keeps it that way.
          </p>
          <div className="ctas">
            <Link href="/apply" className="btn btn-primary">
              Apply now →
            </Link>
            <a href="#fund" className="btn btn-secondary">
              Support our work
            </a>
          </div>
        </section>

        <footer>
          <div className="container">
            <div className="brand-block">
              <span
                className="mascot-img"
                style={{
                  width: 56,
                  height: 56,
                  display: "block",
                  marginBottom: 14,
                }}
                aria-hidden="true"
              />
              Griptape India
              <p>
                Trusting young people with the time, tribe, and resources to find a
                calling worth chasing.
              </p>
            </div>
            <div>
              <h5>Explore</h5>
              <ul>
                <li>
                  <a href="#about-ngo">About</a>
                </li>
                <li>
                  <a href="#for-students">For students</a>
                </li>
                <li>
                  <a href="#learning-challenge">The Learning Challenge</a>
                </li>
                <li>
                  <a href="#stories">Stories</a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Get involved</h5>
              <ul>
                <li>
                  <Link href="/apply">Apply</Link>
                </li>
                <li>
                  <a href="#fund">Donate</a>
                </li>
                <li>
                  <a href="#partner">Partner with us</a>
                </li>
                <li>
                  <a href="#champion">Become a Champion</a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Find us</h5>
              <ul>
                <li>India · began in Bangalore</li>
                <li>
                  <a href="mailto:hello@griptape.in">hello@griptape.in</a>
                </li>
                <li>
                  <a href="#">Instagram</a>
                </li>
                <li>
                  <a href="#">YouTube</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="legal container">
            <div>© Griptape India {year} · made with grit</div>
            <div>Inspired by The GripTape Challenge, USA</div>
          </div>
        </footer>
      </div>
    </>
  );
}
