import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getPost, getAllPosts } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import "../blog.css";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug.current }));
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* Gold blob cluster — top right of article header, like every article spread in the mag */
function BlobCluster() {
  return (
    <svg viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="blob-cluster" aria-hidden="true">
      <ellipse cx="40"  cy="28"  rx="22" ry="14" fill="#F0A018" transform="rotate(-20 40 28)" />
      <ellipse cx="82"  cy="14"  rx="17" ry="11" fill="#F0A018" transform="rotate(-8 82 14)" />
      <ellipse cx="118" cy="34"  rx="15" ry="10" fill="#F0A018" transform="rotate(16 118 34)" />
      <ellipse cx="152" cy="12"  rx="13" ry="8"  fill="#F0A018" transform="rotate(-5 152 12)" />
      <ellipse cx="60"  cy="58"  rx="13" ry="9"  fill="#F0A018" transform="rotate(24 60 58)" />
      <ellipse cx="100" cy="62"  rx="16" ry="10" fill="#F0A018" transform="rotate(-14 100 62)" />
      <ellipse cx="140" cy="56"  rx="11" ry="7"  fill="#F0A018" transform="rotate(8 140 56)" />
      <ellipse cx="165" cy="80"  rx="12" ry="8"  fill="#F0A018" transform="rotate(-18 165 80)" />
      <ellipse cx="32"  cy="90"  rx="10" ry="6"  fill="#F0A018" transform="rotate(10 32 90)" />
      <ellipse cx="78"  cy="100" rx="14" ry="9"  fill="#F0A018" transform="rotate(-6 78 100)" />
      <ellipse cx="120" cy="104" rx="10" ry="7"  fill="#F0A018" transform="rotate(20 120 104)" />
      <ellipse cx="155" cy="120" rx="8"  ry="5"  fill="#F0A018" transform="rotate(-10 155 120)" />
    </svg>
  );
}

/* Clasped hands closing mark — orange + green, like the Shriya Karanam page in the magazine */
function ClaspedHands() {
  return (
    <svg viewBox="0 0 480 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="clasped-hands" aria-hidden="true">
      {/* Gold blobs top left */}
      <ellipse cx="38"  cy="24"  rx="20" ry="13" fill="#F0A018" transform="rotate(-18 38 24)" />
      <ellipse cx="80"  cy="10"  rx="16" ry="10" fill="#F0A018" transform="rotate(8 80 10)" />
      <ellipse cx="20"  cy="60"  rx="13" ry="8"  fill="#F0A018" transform="rotate(15 20 60)" />
      {/* Gold blobs bottom right */}
      <ellipse cx="424" cy="240" rx="19" ry="12" fill="#F0A018" transform="rotate(20 424 240)" />
      <ellipse cx="458" cy="218" rx="14" ry="9"  fill="#F0A018" transform="rotate(-12 458 218)" />
      <ellipse cx="442" cy="265" rx="11" ry="7"  fill="#F0A018" transform="rotate(5 442 265)" />

      {/* ORANGE HAND — rising from lower left */}
      {/* Palm */}
      <path d="M20 260 C10 220 20 175 55 148 C82 126 114 128 138 148 C158 164 162 188 150 210 C138 232 112 248 82 256 C58 262 35 264 20 260Z" fill="#E54B1A" />
      {/* Index finger */}
      <path d="M138 148 C148 126 156 102 150 78 C146 64 136 58 126 66 C118 74 118 96 128 122 C132 132 136 142 138 148Z" fill="#E54B1A" />
      {/* Middle finger */}
      <path d="M128 122 C118 96 114 74 118 56 C122 42 132 38 140 46 C148 56 146 80 138 108" fill="#E54B1A" />
      {/* Ring finger */}
      <path d="M116 130 C104 106 98 82 104 62 C108 48 118 44 126 52 C134 62 132 86 124 114" fill="#E54B1A" />
      {/* Pinky */}
      <path d="M102 142 C90 120 86 98 92 80 C96 66 106 62 114 70 C120 78 118 100 108 126" fill="#E54B1A" />
      {/* White finger-gap highlights */}
      <path d="M128 122 C130 132 134 140 138 148" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M116 130 C120 140 124 146 128 150" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M102 142 C108 150 114 156 120 160" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* GREEN HAND — descending from upper right */}
      {/* Palm */}
      <path d="M460 20 C470 60 460 105 425 132 C398 154 366 152 342 132 C322 116 318 92 330 70 C342 48 368 32 398 24 C422 18 445 16 460 20Z" fill="#1A5C3B" />
      {/* Index finger */}
      <path d="M342 132 C332 154 324 178 330 202 C334 216 344 222 354 214 C362 206 362 184 352 158 C348 148 344 138 342 132Z" fill="#1A5C3B" />
      {/* Middle finger */}
      <path d="M352 158 C362 184 366 206 362 224 C358 238 348 242 340 234 C332 224 334 200 342 172" fill="#1A5C3B" />
      {/* Ring finger */}
      <path d="M364 150 C376 174 382 198 376 218 C372 232 362 236 354 228 C346 218 348 194 356 166" fill="#1A5C3B" />
      {/* Pinky */}
      <path d="M378 138 C390 160 394 182 388 200 C384 214 374 218 366 210 C360 202 362 180 372 154" fill="#1A5C3B" />
      {/* White finger-gap highlights */}
      <path d="M352 158 C350 148 346 140 342 132" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M364 150 C360 140 356 134 352 130" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M378 138 C372 130 366 126 360 124" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Overlap shadow where hands meet */}
      <path d="M138 148 C150 158 160 170 162 185 C164 198 158 208 148 212 C138 216 126 210 118 198 C110 186 112 168 124 156 Z" fill="#0D3D22" opacity="0.35" />
      <path d="M342 132 C330 122 320 110 318 95 C316 82 322 72 332 68 C342 64 354 70 362 82 C370 94 368 112 356 124 Z" fill="#8B2A08" opacity="0.3" />
    </svg>
  );
}

const portableTextComponents = {
  block: {
    h2: ({ children }: any) => <h2 className="post-h2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="post-h3">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="post-blockquote">{children}</blockquote>
    ),
    normal: ({ children }: any) => <p className="post-p">{children}</p>,
  },
  types: {
    image: ({ value }: any) => (
      <figure className="post-figure">
        <div className="post-figure-img">
          <Image
            src={urlFor(value).width(800).url()}
            alt={value.alt ?? ""}
            fill
            className="post-img"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
        {value.caption && (
          <figcaption className="post-caption">{value.caption}</figcaption>
        )}
      </figure>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer" className="post-link">
        {children}
      </a>
    ),
  },
};

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <main className="post-page">
      <div className="post-back">
        <Link href="/blog" className="post-back-link">← Griptape India Mag</Link>
      </div>

      {post.mainImage?.asset && (
        <div className="post-cover">
          <Image
            src={urlFor(post.mainImage).width(1200).height(600).url()}
            alt={post.mainImage.alt ?? post.title}
            fill
            className="post-cover-img"
            priority
            sizes="100vw"
          />
        </div>
      )}

      <article className="post-article">
        <header className="post-header">
          <BlobCluster />
          {post.publishedAt && (
            <time className="post-date">{formatDate(post.publishedAt)}</time>
          )}
          <h1 className="post-title">{post.title}</h1>
          {post.author?.name && (
            <div className="post-byline">
              {post.author.image?.asset && (
                <div className="post-author-avatar">
                  <Image
                    src={urlFor(post.author.image).width(48).height(48).url()}
                    alt={post.author.name}
                    fill
                    className="post-avatar-img"
                  />
                </div>
              )}
              <div className="post-byline-text">
                <span className="post-byline-name">{post.author.name}</span>
                {(post.author as any).role && (
                  <span className="post-byline-role">{(post.author as any).role}</span>
                )}
              </div>
            </div>
          )}
        </header>

        {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}

        {post.body && (
          <div className="post-body">
            <PortableText value={post.body} components={portableTextComponents} />
          </div>
        )}

        {/* Closing illustration — clasped hands, like the magazine's article endings */}
        <div className="post-closing">
          <ClaspedHands />
        </div>
      </article>
    </main>
  );
}
