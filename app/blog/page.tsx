import Link from "next/link";
import Image from "next/image";
import { getAllPosts, type Post } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import "./blog.css";

export const revalidate = 60;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function MountainScene() {
  return (
    <svg viewBox="0 0 320 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="mountain-illo" aria-hidden="true">
      {/* Gold blob footprints — scattered top right like the magazine */}
      <ellipse cx="195" cy="32"  rx="18" ry="11" fill="#F0A018" transform="rotate(-22 195 32)" />
      <ellipse cx="234" cy="15"  rx="14" ry="9"  fill="#F0A018" transform="rotate(-8 234 15)" />
      <ellipse cx="266" cy="38"  rx="12" ry="8"  fill="#F0A018" transform="rotate(18 266 38)" />
      <ellipse cx="295" cy="12"  rx="11" ry="7"  fill="#F0A018" transform="rotate(-5 295 12)" />
      <ellipse cx="218" cy="56"  rx="10" ry="7"  fill="#F0A018" transform="rotate(26 218 56)" />
      <ellipse cx="254" cy="60"  rx="13" ry="8"  fill="#F0A018" transform="rotate(-12 254 60)" />
      <ellipse cx="287" cy="66"  rx="9"  ry="6"  fill="#F0A018" transform="rotate(10 287 66)" />
      <ellipse cx="310" cy="90"  rx="10" ry="7"  fill="#F0A018" transform="rotate(-20 310 90)" />
      <ellipse cx="316" cy="48"  rx="8"  ry="5"  fill="#F0A018" transform="rotate(5 316 48)" />

      {/* Main orange mountain */}
      <path d="M0 440 L0 238 C0 148 18 80 122 53 C202 32 258 74 270 172 C280 244 274 440 274 440Z" fill="#E54B1A" />
      {/* Depth/shadow on right flank */}
      <path d="M122 55 C188 74 243 120 260 188 C275 248 270 440 212 440 L274 440 C274 440 280 244 270 172 C258 74 202 32 122 55Z" fill="#B83410" opacity="0.4" />

      {/* Top figure at the peak */}
      <ellipse cx="118" cy="40" rx="13" ry="15" fill="#1A5C3B" />
      <path d="M106 54 C106 83 130 83 130 54Z" fill="#1A5C3B" />
      <path d="M108 62 C94 52 88 42" stroke="#1A5C3B" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M128 62 C142 72 146 85" stroke="#1A5C3B" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M112 83 C106 101 102 116" stroke="#1A5C3B" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M124 83 C128 101 130 116" stroke="#1A5C3B" strokeWidth="9" strokeLinecap="round" fill="none" />

      {/* Mid figure — climbing */}
      <ellipse cx="70" cy="197" rx="10" ry="12" fill="#1A5C3B" />
      <path d="M61 208 C61 230 79 230 79 208Z" fill="#1A5C3B" />
      <path d="M63 215 C53 208 47 200" stroke="#1A5C3B" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M77 215 C86 222 88 232" stroke="#1A5C3B" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M65 230 C59 246 56 258" stroke="#1A5C3B" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M75 230 C79 246 80 258" stroke="#1A5C3B" strokeWidth="7" strokeLinecap="round" fill="none" />

      {/* Lower figure — reaching up */}
      <ellipse cx="32" cy="325" rx="8" ry="10" fill="#1A5C3B" />
      <path d="M25 335 C25 355 39 355 39 335Z" fill="#1A5C3B" />
      <path d="M27 342 C18 348 14 357" stroke="#1A5C3B" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M37 342 C45 346 49 355" stroke="#1A5C3B" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M27 355 C22 368 20 379" stroke="#1A5C3B" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M37 355 C39 368 41 379" stroke="#1A5C3B" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug.current}`} className="blog-card">
      <div className="blog-card-image">
        {post.mainImage?.asset ? (
          <Image
            src={urlFor(post.mainImage).width(600).height(360).url()}
            alt={post.mainImage.alt ?? post.title}
            fill
            className="blog-card-img"
            sizes="(max-width: 600px) 100vw, 50vw"
          />
        ) : (
          <div className="blog-card-img-placeholder" aria-hidden />
        )}
      </div>
      <div className="blog-card-body">
        {post.publishedAt && (
          <time className="blog-card-date">{formatDate(post.publishedAt)}</time>
        )}
        <h2 className="blog-card-title">{post.title}</h2>
        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
        {post.author?.name && (
          <span className="blog-card-author">by {post.author.name}</span>
        )}
      </div>
    </Link>
  );
}

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <main className="blog-page">
      <div className="blog-header">
        <div className="blog-header-illo">
          <MountainScene />
        </div>
        <div className="blog-header-text">
          <h1 className="blog-heading">Griptape<br />India Mag</h1>
          <p className="blog-sub">
            What our learners are building, what we are learning, and everything in between.
          </p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="blog-empty">
          <p>No posts yet. Check back soon.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
