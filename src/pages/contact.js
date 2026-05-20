import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-20 mt-20">
        <div className="max-w-3xl mx-auto">

          <h1 className="text-4xl font-bold text-blue-700 mb-4 text-center">Get In Touch</h1>
          <p className="text-center text-gray-500 mb-12">
            Have questions about MergerAid? We&apos;d love to hear from you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* General Inquiries */}
            <div className="border border-blue-100 rounded-2xl p-8 bg-white shadow-sm flex flex-col items-center text-center">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">General Inquiries</h2>
              <p className="text-gray-500 text-sm mb-6">Questions about the platform, your account, or how it works.</p>
              <p className="text-gray-700 font-medium mb-4">contact@mergeraid.com</p>
              <a href="mailto:contact@mergeraid.com" className="block w-full">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
                  Send Email
                </button>
              </a>
            </div>

            {/* Sales & Pricing */}
            <div className="border border-blue-100 rounded-2xl p-8 bg-white shadow-sm flex flex-col items-center text-center">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">Sales &amp; Pricing</h2>
              <p className="text-gray-500 text-sm mb-6">Enterprise pricing, volume licensing, and subscription access.</p>
              <p className="text-gray-700 font-medium mb-4">sales@mergeraid.com</p>
              <a href="mailto:sales@mergeraid.com" className="block w-full">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
                  Send Email
                </button>
              </a>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            For enterprise pricing, volume licensing, or custom integrations, reach out to our sales team directly.
          </p>

        </div>
      </main>
      <Footer />
    </div>
  );
}
