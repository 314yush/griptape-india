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
        <p className="blog-kicker">From the Griptape community</p>
        <h1 className="blog-heading">Griptape India Mag</h1>
        <p className="blog-sub">
          What our learners are building, what we are learning, and everything in between.
        </p>
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
