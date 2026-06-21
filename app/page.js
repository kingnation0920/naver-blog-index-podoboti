import { XMLParser } from "fast-xml-parser";

const NAVER_BLOG_ID = "podoboti";
const RSS_URL = `https://rss.blog.naver.com/${NAVER_BLOG_ID}.xml`;
export const revalidate = 3600;

async function getPosts() {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);
    let items = data?.rss?.channel?.item ?? [];
    if (!Array.isArray(items)) items = [items];
    return items.map((item) => {
      const link = item.link ?? "#";
      const match = link.match(/\/(\d+)(?:\?|$)/);
      const slug = match ? match[1] : null;
      return {
        title: typeof item.title === "string" ? item.title : item.title?.["#text"] ?? "(제목 없음)",
        link,
        slug,
        pubDate: item.pubDate ?? "",
      };
    });
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 32 }}>블로그 포스트 목록</h1>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post) =>
          post.slug ? (
            <li key={post.slug} style={{ borderBottom: "1px solid #eee", padding: "16px 0" }}>
              <a
                href={`/posts/${post.slug}`}
                style={{ fontSize: 16, color: "#1a1a1a", textDecoration: "none", fontWeight: 500 }}
              >
                {post.title}
              </a>
              {post.pubDate && (
                <time style={{ display: "block", marginTop: 4, fontSize: 12, color: "#999" }}>
                  {post.pubDate}
                </time>
              )}
            </li>
          ) : null
        )}
      </ul>
    </main>
  );
}
