import Link from "next/link";
import { Language } from "@motorove/shared";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-white mb-4">
          Page Not Found
        </h2>
        <p className="text-neutral-grey mb-8">
          The page you are looking for does not exist.
        </p>
        <Link
          href={`/${Language.TR.toLowerCase()}`}
          className="inline-block px-6 py-3 bg-primary-main text-neutral-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
