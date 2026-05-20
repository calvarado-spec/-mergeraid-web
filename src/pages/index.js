import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">

      {/* Fixed header */}
      <header className="w-full fixed top-0 bg-white z-50 shadow-sm py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <Image src="/images/mergeraid-logo.png" alt="MergerAid Logo" width={32} height={32} />
          <Link href="/">
            <span className="text-2xl font-bold text-blue-700 cursor-pointer">MergerAid</span>
          </Link>
        </div>
        <nav className="space-x-6">
          <Link href="/about" className="hover:text-blue-600">About</Link>
          <Link href="/features" className="hover:text-blue-600">Features</Link>
          <Link href="/pricing" className="hover:text-blue-600">Pricing</Link>
          <Link href="/contact" className="hover:text-blue-600">Contact</Link>
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Sign In</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="text-center py-28 px-6 bg-blue-50 mt-20">
        <h2 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
          Tax Due Diligence At Your Fingertips
        </h2>
        <p className="text-lg max-w-2xl mx-auto text-gray-700 mb-8">
          Streamline your asset and equity diligence reviews with guided, automated analysis built for small and mid-sized deals.
        </p>
        <Link href="/pricing">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition">
            Get Started
          </button>
        </Link>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white text-center">
        <h3 className="text-3xl font-semibold mb-10 text-blue-700">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div>
            <h4 className="text-xl font-semibold mb-2">Step-by-Step Guidance</h4>
            <p className="text-gray-600">Answer key questions about your deal and get automated risk insights.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">Tailored by Deal Type</h4>
            <p className="text-gray-600">Asset or equity acquisition? The logic adapts dynamically to your path.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">PE-Ready Output</h4>
            <p className="text-gray-600">Download or export reports that plug into your diligence memos.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
