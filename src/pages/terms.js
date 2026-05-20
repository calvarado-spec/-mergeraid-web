import Navbar from '../components/Navbar'

export default function Terms() {
  return (
                <>
                  <Navbar />
    <div className="min-h-screen bg-white text-gray-800 font-sans px-6 py-20 pt-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">Terms of Use</h1>
        <p className="mb-4">
          By accessing or using MergerAid, you agree to be bound by these Terms of Use. Please read them carefully before using our platform.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Use of Platform</h2>
        <p className="mb-4">
          MergerAid is intended for professional use in tax due diligence analysis. You may not misuse our services or access them using unauthorized methods.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Intellectual Property</h2>
        <p className="mb-4">
          All content, logic, and software provided by MergerAid are protected by intellectual property laws. You may not copy, modify, or distribute any part of our services without written permission.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Limitation of Liability</h2>
        <p className="mb-4">
          MergerAid does not guarantee the accuracy or completeness of its outputs. Use of the platform does not constitute legal or tax advice.
        </p>
        <p className="text-sm text-gray-500 mt-10">
          Last updated: July 2025
        </p>
      </div>
    </div>
    </>
  );
}
