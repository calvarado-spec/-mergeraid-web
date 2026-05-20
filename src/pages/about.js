import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-20 mt-20">
        <div className="max-w-3xl mx-auto">

          <h1 className="text-4xl font-bold text-blue-700 mb-4 text-center">
            Built by Practitioners, for Practitioners
          </h1>
          <p className="text-center text-gray-500 text-sm mb-12">
            The story behind MergerAid
          </p>

          <div className="space-y-8 text-gray-700 text-base leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Why We Built This</h2>
              <p>
                MergerAid was built by M&A tax professionals who spent years conducting manual due diligence reviews — the same structured, question-driven process repeated deal after deal. Every engagement started with the same checklist: open tax years, nexus exposure, ERC claims, employment tax, unclaimed property. The questions were always the same. The answers were what changed.
              </p>
              <p className="mt-4">
                We built this platform to automate the repeatable parts of that process so advisors can spend their time on what actually requires judgment: interpreting the answers, assessing the risk, and advising the client.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">What the Platform Covers</h2>
              <p>
                The platform covers every major risk area in a tax due diligence engagement. For asset acquisitions, the question flow addresses federal tax exposure (including reorganizations and ERC), state income tax nexus, sales and use tax compliance, employment tax obligations across states, real and personal property tax filings, and unclaimed property processes.
              </p>
              <p className="mt-4">
                For equity deals, the logic branches by entity type — S Corporation, C Corporation, or Partnership — and surfaces the specific issues that matter for each structure: S corp eligibility requirements, Section 382 ownership changes and NOL limitations, BBA audit rules for partnerships, and more. Both flows end with a set of common questions covering open tax years, notices, and uncertain tax positions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">Who It Is For</h2>
              <p>
                MergerAid is designed for PE firms, M&A advisory teams, and business owners preparing for a transaction. Whether you are running one deal or managing a high-volume deal pipeline, the platform delivers consistent, structured output that plugs directly into your diligence memos — without the overhead of building questionnaires from scratch for every engagement.
              </p>
            </div>

            <div className="border-t border-blue-100 pt-8">
              <p className="text-gray-500 text-sm text-center">
                Questions? Reach us at{' '}
                <a href="mailto:contact@mergeraid.com" className="text-blue-600 underline hover:text-blue-800">
                  contact@mergeraid.com
                </a>
              </p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
