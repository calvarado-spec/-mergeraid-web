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
          Identify Tax Risk Before the Deal Closes
        </h2>
        <p className="text-base sm:text-lg max-w-2xl mx-auto text-gray-700 mb-8">
          MergerAid guides you through a structured tax risk screening for asset and equity transactions — so you can flag exposure early and move faster.
        </p>
        <Link href="/pricing">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition">
            Start Screening
          </button>
        </Link>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 px-5 bg-white text-center">
        <h3 className="text-2xl sm:text-3xl font-semibold mb-10 text-blue-700">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div>
            <h4 className="text-xl font-semibold mb-2">Structured Screening</h4>
            <p className="text-gray-600">Answer a guided set of questions covering federal, state, employment, and unclaimed property tax risk — built around how real M&A tax diligence is done.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">Instant Risk Summary</h4>
            <p className="text-gray-600">Get a clear summary of identified risk areas the moment you complete the questionnaire. No waiting, no back and forth.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">Downloadable Report</h4>
            <p className="text-gray-600">Generate a PDF screening report with identified risks and estimated exposure ranges — ready to share with your team or advisor.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
