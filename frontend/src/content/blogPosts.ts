export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  tags: string[];
  content: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-is-an-ats-and-why-it-matters",
    title: "What Is an ATS, and Why Should You Format Your Resume Around It?",
    excerpt:
      "Most resumes are read by software before a human ever sees them. Here's what an Applicant Tracking System actually does, and how to format your resume so it doesn't get filtered out.",
    date: "2026-01-12",
    author: "The ResumeForge Team",
    readTime: "5 min read",
    tags: ["ATS", "Resume Tips"],
    content: [
      "An Applicant Tracking System (ATS) is software that companies use to collect, scan, and rank resumes before a recruiter ever opens one. Most mid-size and large employers use one, which means your resume's first \"reader\" is often a parser, not a person.",
      "The ATS extracts structured data from your resume — your name, contact details, work history, skills, and education — and matches it against the keywords in the job description. Resumes that parse cleanly and match relevant keywords surface to the top; resumes that don't often never reach a human at all, regardless of how qualified the candidate is.",
      "The most common reasons a resume fails to parse well are overly creative layouts (multi-column designs, text boxes, tables), image-based headers, uncommon fonts, and missing standard section headings like \"Experience\" or \"Education\". None of that is visible to you when the resume looks great on screen — it only shows up when a parser tries to read it.",
      "This is exactly why ResumeForge's templates are built plain-text-first: clean single-column layouts, standard section headers, and no graphical elements that a parser could choke on. Our built-in ATS Analyzer checks your resume against these same patterns, plus keyword overlap with a job description you paste in, so you can fix issues before you apply rather than finding out after weeks of silence.",
    ],
  },
  {
    slug: "resume-keywords-that-actually-matter",
    title: "Resume Keywords: How to Find the Ones That Actually Matter",
    excerpt:
      "Keyword-stuffing doesn't work, and neither does ignoring the job description entirely. Here's a practical, non-spammy way to pick the keywords worth adding to your resume.",
    date: "2026-01-20",
    author: "The ResumeForge Team",
    readTime: "4 min read",
    tags: ["ATS", "Job Search"],
    content: [
      "Keyword matching gets a bad reputation because people take it too far — repeating a skill five times in white text, or listing tools they've never touched. That approach can get flagged as spam by modern ATS software and, worse, falls apart the moment an interviewer asks a follow-up question.",
      "A better approach: read the job description line by line and underline every concrete skill, tool, and qualification mentioned — not the fluffy language, the specific nouns. Reactjs, PostgreSQL, stakeholder management, Six Sigma, whatever they actually asked for. Then check which of those you genuinely have experience with, and make sure that experience is stated in your resume using the same terms the job posting uses.",
      "If the job asks for \"Node.js\" and your resume says \"backend JavaScript development,\" a keyword-matching system may not connect the two. Mirror the employer's language wherever it's honest to do so — it's not manipulation, it's translation.",
      "ResumeForge's ATS Analyzer automates the first pass of this: paste in a job description and it will show you which of the employer's keywords already appear in your resume and which are missing, so you can decide, entry by entry, whether it makes sense to add them.",
    ],
  },
  {
    slug: "local-first-ai-what-it-means-and-why-it-matters",
    title: "Local-First AI: What It Means for Your Resume Data",
    excerpt:
      "ResumeForge's AI assistant runs against a model on your own machine instead of a cloud API. Here's why that matters if your resume contains sensitive career details.",
    date: "2026-02-02",
    author: "The ResumeForge Team",
    readTime: "4 min read",
    tags: ["Privacy", "AI"],
    content: [
      "Most \"AI resume writer\" tools work the same way under the hood: your resume content gets sent to a third-party API, processed by a model you don't control, and — depending on the provider's policies — potentially retained or used for further training.",
      "ResumeForge takes a different approach. Its AI Assistant talks to a locally-hosted model server (LM Studio) running on your own computer. Your resume content, your job description pastes, and the suggestions generated from them never leave your machine, because there's no external AI API in the loop at all.",
      "This has trade-offs. You need to have LM Studio running locally with a compatible chat model loaded (we've tested it with Qwen3-class models) for the AI features to work — there's no \"it just works from anywhere\" cloud fallback. In exchange, you get a resume assistant that never phones home with your career history, your salary expectations, or the internal details of a job you're applying to.",
      "The AI Assistant is also deliberately constrained: it's instructed to work only from the facts you've already entered and never invent employers, metrics, or skills. It rewrites and tightens what's there — it doesn't fabricate a more impressive version of your career.",
    ],
  },
  {
    slug: "choosing-a-resume-template-that-wont-hurt-you",
    title: "Choosing a Resume Template That Won't Work Against You",
    excerpt:
      "A resume template is a design decision and an ATS-compatibility decision at the same time. Here's how to tell the difference between a template that helps and one that quietly hurts your chances.",
    date: "2026-02-14",
    author: "The ResumeForge Team",
    readTime: "3 min read",
    tags: ["Templates", "Resume Tips"],
    content: [
      "It's tempting to pick a resume template the way you'd pick a slide deck theme — based on what looks the most polished. But a resume template also determines whether an ATS can correctly read your information, so the calculus is different.",
      "Multi-column layouts, for instance, often look modern and space-efficient, but many parsers read left-to-right across the whole page rather than down each column, which can scramble your work history into nonsense from the system's point of view. Icons used as section markers, skill bars, and text embedded in images cause similar problems.",
      "ResumeForge ships three templates — Classic ATS, Modern Professional, and Minimal Clean — that all share the same underlying single-column, standard-heading structure, so switching between them is a styling decision, not an ATS-risk decision. Pick based on tone: Classic ATS reads as traditional and safe for conservative industries, Modern Professional adds color and structure for a more contemporary feel, and Minimal Clean strips things down for a text-focused, typography-driven look.",
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
