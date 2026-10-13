import type { Metadata } from "next";
import Link from "next/link";
import "./portfolio.css";

export const metadata: Metadata = {
  title: { default: "Learner Portfolio", template: "%s · Griptape Portfolio" },
  description: "Log what you're making and how you're making it. Earn Griptape badges and download your portfolio.",
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gtp">
      <nav className="gtp-nav">
        <Link href="/" className="gtp-brand">
          <span className="mascot-img gtp-brand-mascot" aria-hidden />
          Griptape <em>portfolio</em>
        </Link>
        <div className="gtp-nav-links">
          <Link href="/portfolio">How it works</Link>
          <Link href="/portfolio/me" className="gtp-btn gtp-btn-ink gtp-btn-sm">
            Sign in
          </Link>
        </div>
      </nav>
      <main className="gtp-wrap">{children}</main>
    </div>
  );
}
