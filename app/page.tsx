import type { Metadata } from "next";
import Link from "next/link";
import LandingReveal from "./LandingReveal";
import StoriesCarousel from "./StoriesCarousel";
import "./griptape-landing.css";

export const metadata: Metadata = {
  title:
    "Apply | Griptape India Learning Challenge | India non-profit for ages 14–19",
  description:
    "Apply to the free Learning Challenge: 10 weeks, one pursuit you choose, a Champion mentor, peer tribe, and proof you can build it. Griptape India began in Bangalore and works with young people across India, inspired by GripTape, USA.",
};

function MarqueeSegment() {
  return (
    <span>
      YOU CHOOSE WHAT MATTERS TO YOU{" "}
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
                fontSize: 21,
                marginLeft: 2,
              }}
            >
              India
            </em>
          </Link>
          <ul className="nav-links-desktop">
            <li>
              <a href="#about-ngo">About</a>
            </li>
            <li>
              <a href="#for-students">Program</a>
            </li>
            <li>
              <a href="#partner">Partner</a>
            </li>
            <li>
              <a href="#stories">Stories</a>
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
                  <a href="#about-ngo">About</a>
                </li>
                <li>
                  <a href="#for-students">Program</a>
                </li>
                <li>
                  <a href="#partner">Partner</a>
                </li>
                <li>
                  <a href="#stories">Stories</a>
                </li>
              </ul>
            </div>
          </details>
          <div className="nav-cta-group">
            <Link href="https://forms.gle/3qp4wpf2oCFucd4r5" className="btn btn-primary nav-btn">
              Apply
            </Link>
            <a href="#fund" className="btn btn-secondary nav-btn">
              Support
            </a>
          </div>
        </nav>

        <header className="hero">
          <div className="hero-decor" aria-hidden="true">
            <span className="mascot-img mascot-float m1" />
            <span className="mascot-img mascot-float m2" />
            <div className="sticker s1">first-gen learners welcome ✿</div>
            <div className="sticker s2">14 – 19 yrs ★</div>
            <div className="sticker s3">India · began in Bangalore</div>
            <div className="sticker s4">no curriculum.</div>
          </div>

          <div className="hero-inner">
            <p className="kicker">⤿ you don&apos;t need a perfect plan!</p>
            <h1>
              <span className="y">Find what matters to you</span>
              <br />
              <span className="underline">Build it with us.</span>
            </h1>
            <p className="sub">
              At Griptape, learners don&apos;t wait for permission. They learn,
              fail, iterate, and build again.
            </p>
            <div className="ctas">
              <Link href="https://forms.gle/3qp4wpf2oCFucd4r5" className="btn btn-primary">
                Apply →
              </Link>
              <a href="#fund" className="btn btn-secondary">
                Support
              </a>
            </div>
          </div>
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
              For young people in India who want to build something real.
            </h2>
            <div className="about-ngo-grid">
              <div className="about-ngo-panel">
                <h3>What we are</h3>
                <p>
                  Griptape India gives young people (ages 14–19) total control
                  to design their own 10-week learning experience, resources to
                  pursue it, and an adult who shows up for them without taking
                  over.
                </p>
                <p>
                  Want to learn something? Build something? Do it your way,
                  when and where you want? We&apos;re here for that.
                </p>
                <p>It&apos;s really that simple.</p>
              </div>
              <div className="about-ngo-panel">
                <h3>Why we exist</h3>
                <p>
                  Most education optimises for exams and compliance. We optimise
                  for agency: picking a pursuit, sticking with it, and proving
                  you can ship something you care about, with adults who trust
                  you instead of directing every step.
                </p>
              </div>
              <div className="about-ngo-panel about-ngo-wide">
                <h3>Inspired by GripTape, USA</h3>
                <p>
                  Our method draws from{" "}
                  <strong>The GripTape Challenge</strong> in the United States.
                  Griptape India is its own entity, born in Bangalore and open to
                  young people across India, with the same DNA: real choice,
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
                <h2>Three things, simple.</h2>
              </div>
              <p>
                Griptape India isn&apos;t a curriculum. It&apos;s a worldview:
                young people are capable of far more than we give them credit
                for. All they need is the right environment of trust and
                support.
              </p>
            </div>

            <div className="explainer-grid">
              <div className="explainer">
                <div className="step">⤿ 01</div>
                <h3>Young people don&apos;t need more instruction.</h3>
                <p>
                  In a world where every answer is a click away, what matters is
                  the muscle to <strong>figure things out.</strong> That muscle is
                  built by doing, not by being taught.
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
                  the rest takes care of itself. We find and train adults who
                  show up exactly that way.
                </p>
              </div>
              <div className="explainer">
                <div className="step">⤿ 03</div>
                <h3>Purpose is found by chasing.</h3>
                <p>
                  You don&apos;t think your way into knowing what you care about.
                  You <strong>chase something</strong>, and the chasing teaches
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
              we are looking for you.
            </h2>
            <p
              className="lede for-students-lede"
              style={{
                maxWidth: 720,
                marginTop: 22,
                fontSize: 23,
                lineHeight: 1.55,
              }}
            >
              You bring curiosity and commitment; we bring the people and
              resources for the thing you choose.
            </p>

            <div className="stage-grid for-students-three">
              <div className="stage">
                <div className="num">01</div>
                <h3>What you get</h3>
                <p className="quote">Real support. Total freedom.</p>
                <p>
                  A dedicated adult who believes in you without taking over.
                  The ability to mobilise resources and people around your
                  pursuit. And a community of young people all working on
                  their own thing alongside you.
                </p>
              </div>
              <div className="stage">
                <div className="num">02</div>
                <h3>What you bring</h3>
                <p className="quote">One pursuit. Your curiosity.</p>
                <p>
                  You pick <strong>one thing</strong> you care about: music, a
                  machine, a film, a community project, research, art, code.
                  You show up, ask for help when stuck, and drive the work.
                  You design your learning journey; we provide the support.
                </p>
              </div>
              <div className="stage">
                <div className="num">03</div>
                <h3>How to apply</h3>
                <p className="quote">The journey starts here.</p>
                <p style={{ marginBottom: 2 }}><strong>1.</strong> Go to the apply page and sign in with your phone.</p>
                <p style={{ marginBottom: 2 }}><strong>2.</strong> Tell us about yourself and your pursuit idea.</p>
                <p style={{ marginBottom: 2 }}><strong>3.</strong> Record a short video so we can hear you in your own words.</p>
                <p style={{ marginTop: 16, marginBottom: 0 }}>
                  <Link href="https://forms.gle/3qp4wpf2oCFucd4r5" className="program-link for-students-apply-link">
                    Apply →
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
                    Who is a Champion and what do they do?
                  </summary>
                  <div className="faq-answer">
                    <p>
                      A Champion is a trained adult who believes in you and
                      shows up for you throughout the 10 weeks. They don&apos;t
                      teach or take over your project. Instead, they ask good
                      questions, help you think through challenges, and trust
                      you to drive the work. Think of them as someone genuinely
                      in your corner.
                    </p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    How much time per week?
                  </summary>
                  <div className="faq-answer">
                    <p>
                      You decide how you want to use your time each week and
                      how you work towards your project. You have full ownership
                      over your time. There will also be a weekly check-in call
                      with your Champion (up to 20 minutes), plus three key
                      gatherings across the 10 weeks: orientation, midpoint,
                      and showcase.
                    </p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    Do I need a perfect idea?
                  </summary>
                  <div className="faq-answer">
                    <p>
                      No. You just need something that really matters to you.
                      The idea can evolve, but the thing you care about should
                      feel real and important to you. The point is to chase,
                      not to pitch.
                    </p>
                  </div>
                </details>
                <details className="faq-details">
                  <summary className="faq-summary">
                    What happens after 10 weeks?
                  </summary>
                  <div className="faq-answer">
                    <p>
                      You become part of the Griptape India alumni network, a
                      community of young people who are all passionate about
                      building something. You can use that community to keep
                      building, find collaborators, support each other, and
                      keep growing long after the program ends. The 10 weeks
                      are just the beginning.
                    </p>
                  </div>
                </details>
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
              70% of the young people we serve come from underserved communities.
              When you fund Griptape, you fund a young person&apos;s opportunity
              to design their own learning journey and build real agency.
            </p>
            <div className="support-single-wrap">
              <div className="involve-card fund">
                <div className="role-tag">⤿ for funders + donors</div>
                <h3>Fund&nbsp;a learner. Or&nbsp;a&nbsp;cohort.</h3>
                <p className="pitch">
                  We&apos;re a young organisation with a clear method. Scaling
                  thoughtfully means pairing every cohort with reliable support
                  and staying honest about where the money lands.
                </p>
                <ul className="ways">
                  <li>₹10,000 funds one learner&apos;s full 10-week journey</li>
                  <li>₹2,00,000 supports a cohort of 20 young people</li>
                  <li>Long-term: anchor partner for a full year</li>
                </ul>
                <a href="https://forms.gle/yUyr1QkrSSbf8Bx99" target="_blank" rel="noopener noreferrer" className="cta-link">
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
              For <em className="serif">schools</em> and orgs.
            </h2>
            <p className="lede">
              Want to bring the Learning Challenge to your students? You choose
              which young people participate; we run the program for them.
            </p>
            <div className="support-single-wrap support-partner-wrap">
              <div className="involve-card partner">
                <div className="role-tag">⤿ for schools + organisations</div>
                <h3>Partner with us.</h3>
                <p className="pitch">
                  If you&apos;re a school or organisation that wants to give
                  your students the chance to design their own learning
                  experience, reach out. We&apos;ll figure out the fit together.
                </p>
                <a href="mailto:griptapeindia@gmail.com" className="cta-link">
                  Start a conversation →
                </a>
              </div>
            </div>

            <div className="champion-callout" id="champion">
              <div className="champion-callout-inner">
                <span className="champion-eyebrow">⤿ for individuals</span>
                <h3>Become a Champion.</h3>
                <p>
                  Champions don&apos;t teach. They show up online, ask better
                  questions, and genuinely believe in a young person&apos;s
                  ability to figure things out. If you believe in a child&apos;s
                  agency and want to support without taking over, this is for you.
                  We train you before each cohort; you bring presence and belief.
                </p>
                <ul className="champion-highlights">
                  <li>~3 hours a week across 10 weeks · fully online</li>
                  <li>Open to professionals, parents, alumni</li>
                </ul>
                <a href="https://forms.gle/qapsCnoRd4VWdgrt6" target="_blank" rel="noopener noreferrer" className="cta-link champion-cta">
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
              fontSize: 23,
              opacity: 0.85,
            }}
          >
            If you&apos;re 14–19 in India and want to pursue something that
            really matters to you, we want to hear from you. Looking forward
            to your application.
          </p>
          <div className="ctas">
            <Link href="https://forms.gle/3qp4wpf2oCFucd4r5" className="btn btn-primary">
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
                You bring the passion, we provide the support.
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
                  <a href="#stories">Testimonials</a>
                </li>
                <li>
                  <a href="https://research.griptape.org" target="_blank" rel="noopener noreferrer">Research</a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Get involved</h5>
              <ul>
                <li>
                  <a href="https://forms.gle/3qp4wpf2oCFucd4r5" target="_blank" rel="noopener noreferrer">Apply</a>
                </li>
                <li>
                  <a href="https://forms.gle/yUyr1QkrSSbf8Bx99" target="_blank" rel="noopener noreferrer">Donate</a>
                </li>
                <li>
                  <a href="#partner">Partner with us</a>
                </li>
                <li>
                  <a href="https://forms.gle/qapsCnoRd4VWdgrt6" target="_blank" rel="noopener noreferrer">Become a Champion</a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Find us</h5>
              <ul>
                <li>
                  <a href="mailto:griptapeindia@gmail.com">griptapeindia@gmail.com</a>
                </li>
                <li>
                  <a href="https://www.instagram.com/griptape.india" target="_blank" rel="noopener noreferrer">Instagram</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="legal container">
            <div>© Griptape India {year} · made with grit</div>
            <div>In partnership with GripTape Org, USA</div>
          </div>
        </footer>
      </div>
    </>
  );
}
