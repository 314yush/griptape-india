import { client } from "./client";

export type Post = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt?: string;
  mainImage?: { asset: any; alt?: string };
  author?: { name: string; image?: any };
  body?: any[];
};

export async function getAllPosts(): Promise<Post[]> {
  return client.fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      _id, title, slug, publishedAt, excerpt, mainImage, author->{ name, image }
    }`
  );
}

export async function getPost(slug: string): Promise<Post | null> {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      _id, title, slug, publishedAt, excerpt, mainImage, body,
      author->{ name, image, bio }
    }`,
    { slug }
  );
}
