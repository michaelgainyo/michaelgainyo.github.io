import { getCollection } from 'astro:content';

export async function getContent(path: Parameters<typeof getCollection>[0]) {
  let posts = await getCollection(path);
  const prod = process.env.NODE_ENV === 'production';
  if (prod) posts = posts.filter((post) => post.data.publish === true);
  return posts;
}
