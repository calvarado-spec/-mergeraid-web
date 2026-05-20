import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FEATURES = [
  {
    title: "Asset & Equity Deals",
    description: "Separate guided question flows for asset acquisitions and equity purchases. The logic adapts dynamically based on your deal structure.",
  },
  {
    title: "Federal Tax Risk",
    description: "Covers ERC exposure, prior reorganizations, open examinations, related party transactions, NOL limitations, and entity-specific eligibility risks.",
  },
  {
    title: "State Income Tax Nexus",
    description: "Identifies economic and physical nexus exposure across all 50 states with state-by-state sales input for threshold analysis.",
  },
  {
    title: "Sales & Use Tax",
    description: "Reviews taxable sales, multi-state filing obligations, exemption certificate practices, and use tax compliance gaps.",
  },
  {
    title: "Employment Tax",
    description: "Flags multi-state employment tax exposure and independent contractor misclassification risk.",
  },
  {
    title: "PE-Ready Reports",
    description: "Generates a structured risk summary grouped by category, ready to plug into your diligence memo or client deliverable.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-1 mt-20">

        {/* Page header */}
        <section className="py-16 px-6 bg-blue-50 text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            Everything You Need for Tax Due Diligence
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            MergerAid covers every major risk area in a structured, guided workflow.
          </p>
        </section>

        {/* Feature cards */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="border border-blue-100 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-blue-700 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="py-14 px-6 bg-blue-600 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to run your first diligence?
          </h2>
          <Link href="/pricing">
            <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl text-lg hover:bg-blue-50 transition">
              Get Started
            </button>
          </Link>
        </section>

      </main>
      <Footer />
    </div>
  );
}
