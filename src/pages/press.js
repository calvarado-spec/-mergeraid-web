import Navbar from '../components/Navbar'

export default function Press() {
  return (
        <>
          <Navbar />
    <div className="min-h-screen bg-white text-gray-800 font-sans px-6 py-20 pt-32">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">MergerAid in the Press</h1>
        <p className="text-lg text-gray-700 mb-6">
          We’re building something big — and people are starting to notice.
        </p>
        <p className="text-lg text-gray-700 mb-6">
          Stay tuned for upcoming media coverage, thought leadership, and interviews with the team behind MergerAid.
        </p>
        <p className="text-sm text-gray-500 mt-8">
          For press inquiries, please contact <a href="mailto:press@mergeraid.com" className="text-blue-600 underline">press@mergeraid.com</a>.
        </p>
      </div>
    </div>
    </>
  );
}
