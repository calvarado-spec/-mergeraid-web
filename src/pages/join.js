import Navbar from '../components/Navbar'

export default function Join() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-gray-800 font-sans px-6 py-20 pt-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-6">Join Our Team</h1>
          <p className="text-lg text-gray-700 mb-6">
            At MergerAid, we&apos;re building the future of tax due diligence — smarter, faster, and built for the modern dealmaker.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            While we’re not currently hiring, we’re always looking for curious, driven individuals who want to make an impact in M&A tech.
          </p>
          <p className="text-lg text-gray-700 mb-6">
            Please check back soon or feel free to reach out to <a href="mailto:careers@mergeraid.com" className="text-blue-600 underline">careers@mergeraid.com</a> if you&apos;d like to be considered for future roles.
          </p>
          <p className="text-sm text-gray-500 mt-8">
            Together, we’re making diligence a little less painful — one deal at a time.
          </p>
        </div>
      </div>
    </>
  );
}
