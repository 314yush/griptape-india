import Link from "next/link";
import "../portfolio/portfolio.css";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gtp">
      <nav className="gtp-nav">
        <Link href="/" className="gtp-brand">
          <span className="mascot-img gtp-brand-mascot" aria-hidden />
          Griptape <em>India</em>
        </Link>
        <div className="gtp-nav-links">
          <Link href="/">Home</Link>
          <Link href="/blog">Magazine</Link>
          <Link href="/projects" className="gtp-btn gtp-btn-ink gtp-btn-sm">
            Projects
          </Link>
        </div>
      </nav>
      <main className="gtp-wrap">{children}</main>
    </div>
  );
}
