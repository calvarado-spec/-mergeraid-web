// mergeraid.com
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <Navbar />

      {/* Hero */}
      <section className="text-center py-20 sm:py-28 px-5 bg-blue-50 mt-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-700 mb-4">
          Tax Due Diligence At Your Fingertips
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto text-gray-700 mb-8">
          Streamline your asset and equity diligence reviews with guided, automated analysis built for small and mid-sized deals.
        </p>
        <Link href="/pricing">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition">
            Get Started
          </button>
        </Link>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 px-5 bg-white text-center">
        <h3 className="text-2xl sm:text-3xl font-semibold mb-10 text-blue-700">How It Works</h3>
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
