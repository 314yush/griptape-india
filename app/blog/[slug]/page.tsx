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
        <Link href="/blog" className="post-back-link">← All posts</Link>
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
          <div className="post-header-blobs" aria-hidden>
            <span className="blob b1" /><span className="blob b2" />
            <span className="blob b3" /><span className="blob b4" />
          </div>
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
      </article>
    </main>
  );
}
