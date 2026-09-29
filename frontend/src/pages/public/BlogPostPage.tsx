import { Link, Navigate, useParams } from "react-router-dom";
import { Reveal } from "../../components/Reveal";
import { BLOG_POSTS, getBlogPostBySlug } from "../../content/blogPosts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Reveal>
        <Link to="/blog" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-flex items-center gap-1">
          &#8592; Back to Blog
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500 mb-10">
          <span>{post.author}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readTime}</span>
        </div>

        <div className="prose-content space-y-5">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>

      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">More from the blog</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="block bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{p.readTime}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
