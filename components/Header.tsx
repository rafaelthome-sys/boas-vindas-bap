"use client";

import Image from "next/image";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Image
              src="/logo-bap.png"
              alt="BAP Logo"
              width={120}
              height={49}
              priority
            />
            <div className="hidden sm:block h-8 w-px bg-gray-200" />
            <h1 className="hidden sm:block text-lg font-semibold text-gray-700">
              Boas Vindas
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
