import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
