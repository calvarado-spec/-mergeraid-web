import Navbar from '../components/Navbar'

export default function Privacy() {

  return (
            <>
              <Navbar />
    <div className="min-h-screen bg-white text-gray-800 font-sans px-6 py-20 pt-32">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">Privacy Policy</h1>
        <p className="mb-4">
          MergerAid respects your privacy and is committed to protecting the personal information you share with us.
          This Privacy Policy outlines how we collect, use, and safeguard your data when you use our platform.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Information We Collect</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Personal details such as name and email address when signing up.</li>
          <li>Deal-specific data entered into our system for analysis.</li>
          <li>Technical data like browser type, IP address, and usage behavior.</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-6 mb-2">How We Use Your Information</h2>
        <p className="mb-4">
          We use the information to provide, improve, and personalize your experience with MergerAid.
          Your data is never sold or shared with third parties except as required by law.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-2">Your Rights</h2>
        <p className="mb-4">
          You may request access to, correction of, or deletion of your personal data at any time by contacting us at 
          <a href="mailto:support@mergeraid.com" className="text-blue-600 underline"> support@mergeraid.com</a>.
        </p>
        <p className="text-sm text-gray-500 mt-10">
          Last updated: July 2025
        </p>
      </div>
    </div>
    </>
  );
}
