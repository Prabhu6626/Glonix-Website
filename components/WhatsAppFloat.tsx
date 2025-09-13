"use client";
import { useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";

export default function WhatsAppFloat({ phoneNumber }: { phoneNumber: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const formattedPhone = phoneNumber.replace(/\D/g, '');

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative flex items-center">
        {showTooltip && (
          <div className="absolute right-16 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            Chat with us on WhatsApp!
            <div className="absolute top-1/2 right-0 -mr-1.5 -mt-1.5 w-3 h-3 rotate-45 bg-gray-900"></div>
          </div>
        )}
        <Link
          href={`https://wa.me/+919840495235`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 shadow-lg hover:bg-green-600 transition-colors"
          aria-label="Contact us on WhatsApp"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <FaWhatsapp className="text-white text-3xl" />
        </Link>
      </div>
    </div>
  );
}