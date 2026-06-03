import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white py-10 px-6 border-t">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-sm text-gray-600">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Image src="/images/mergeraid-logo.png" alt="MergerAid Logo" width={24} height={24} />
            <h4 className="font-semibold text-blue-700">MergerAid</h4>
          </div>
          <p>Automating M&A tax diligence for modern dealmakers.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Company</h4>
          <ul className="space-y-1">
            <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600">Join Our Team</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600">Press</Link></li>
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
