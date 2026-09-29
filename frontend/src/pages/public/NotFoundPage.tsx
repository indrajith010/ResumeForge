import { Link } from "react-router-dom";
import { Logo } from "../../components/Logo";

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <Logo showWordmark={false} size={40} />
      <p className="mt-6 text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wider">404</p>
      <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Page not found</h1>
      <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-md">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Back to Home
      </Link>
    </div>
  );
}
