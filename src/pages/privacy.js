import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-700 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-10">Effective Date: June 1, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              MergerAid LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) operates the MergerAid platform. This Privacy Policy explains how we
              collect, use, store, and protect information you provide when using the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We collect the following categories of information:</p>
            <ul className="list-none space-y-2 text-gray-700 leading-relaxed">
              <li>(a) <span className="font-medium">Account Information</span> &mdash; name, email address, and password when you register;</li>
              <li>(b) <span className="font-medium">Deal Information</span> &mdash; company names, deal types, and questionnaire responses you input into the Platform;</li>
              <li>(c) <span className="font-medium">Payment Information</span> &mdash; processed exclusively by Stripe; we do not store credit card numbers or full payment details;</li>
              <li>(d) <span className="font-medium">Usage Data</span> &mdash; IP address, browser type, pages visited, and session duration for security and analytics purposes.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed">
              We use collected information to: provide and operate the Platform; generate screening reports based on your
              inputs; process payments; communicate with you about your account; improve the Platform; and comply with
              legal obligations. We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed">
              Your data is stored in a secured database hosted by Supabase. We implement industry-standard security
              measures including encrypted connections (HTTPS), hashed passwords, and access controls. No method of
              transmission over the internet is 100% secure and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Deal Data Confidentiality</h2>
            <p className="text-gray-700 leading-relaxed">
              We treat all deal-specific information you input into the Platform as confidential. We do not access,
              review, or share your deal data except as required to operate the Platform or comply with legal requirements.
              This includes processing deal data in anonymized, aggregated form to improve Platform functionality, as
              described in our Terms of Service. Our employees and contractors are bound by confidentiality obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-3">We use the following third-party services:</p>
            <ul className="list-none space-y-2 text-gray-700 leading-relaxed">
              <li>Stripe (payment processing &mdash; subject to Stripe&apos;s Privacy Policy);</li>
              <li>Supabase (database hosting);</li>
              <li>Vercel (application hosting).</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Each third party&apos;s use of your information is governed by their respective privacy policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your account and deal data for as long as your account is active or as needed to provide
              services. You may request deletion of your account and associated data by contacting us at{" "}
              <a href="mailto:support@mergeraid.com" className="text-blue-600 hover:underline">support@mergeraid.com</a>.
              We will process deletion requests within 30 days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              Depending on your jurisdiction, you may have rights to access, correct, or delete your personal
              information. To exercise these rights, contact us at{" "}
              <a href="mailto:support@mergeraid.com" className="text-blue-600 hover:underline">support@mergeraid.com</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              The Platform uses essential cookies required for authentication and session management. We do not use
              tracking or advertising cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              The Platform is intended for professional use only and is not directed at individuals under the age of 18.
              We do not knowingly collect information from minors.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">11. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. We will notify you of material changes by email or Platform
              notice. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">12. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              MergerAid LLC &mdash;{" "}
              <a href="mailto:support@mergeraid.com" className="text-blue-600 hover:underline">support@mergeraid.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
