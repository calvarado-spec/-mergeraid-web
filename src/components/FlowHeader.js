import Link from "next/link";

export default function FlowHeader() {
  return (
    <header className="w-full bg-white border-b border-blue-100 py-3 px-6 flex items-center justify-between print:hidden">
      <Link href="/" className="text-xl font-bold text-blue-700">
        MergerAid
      </Link>
      <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
        ← Exit to Home
      </Link>
    </header>
  );
}
