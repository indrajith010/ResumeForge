import { Link } from "react-router-dom";
import { Reveal } from "../../components/Reveal";
import { BLOG_POSTS } from "../../content/blogPosts";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Reveal className="text-center mb-14">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">The ResumeForge Blog</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Practical, no-nonsense advice on ATS formatting, keywords, and job search strategy.
        </p>
      </Reveal>

      <div className="space-y-6">
        {BLOG_POSTS.map((post, i) => (
          <Reveal key={post.slug} delay={i * 50}>
            <Link
              to={`/blog/${post.slug}`}
              className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <span>{post.author}</span>
                <span aria-hidden="true">&middot;</span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
