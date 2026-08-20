import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white py-10 px-6 border-t">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-sm text-gray-600">
        <div>
          <h4 className="font-semibold text-blue-700 mb-2">MergerAid</h4>
          <p>Tax risk screening for modern dealmakers.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Company</h4>
          <ul className="space-y-1">
            <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
            <li><Link href="/join" className="hover:text-blue-600">Join Our Team</Link></li>
            <li><Link href="/press" className="hover:text-blue-600">Press</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Legal</h4>
          <ul className="space-y-1">
            <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-6">
        &copy; 2025 MergerAid. All rights reserved.
      </p>
    </footer>
  );
}
