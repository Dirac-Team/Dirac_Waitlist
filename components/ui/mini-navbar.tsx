"use client";

import React from 'react';

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const defaultTextColor = 'text-gray-300';
  const hoverTextColor = 'text-white';
  const textSizeClass = 'text-sm';

  return (
    <a href={href} className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass}`}>
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </a>
  );
};

export function Navbar() {
  const navLinksData = [
    { label: 'Home', href: '/' },
    { label: 'About us', href: '/about' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Waitlist', href: '/waitlist' },
    { label: 'Contact us', href: '/contact' },
  ];

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20
                       flex items-center justify-center
                       px-6 py-3 backdrop-blur-sm
                       rounded-full
                       border border-[#333] bg-[#1f1f1f57]
                       w-auto
                       transition-all duration-300">
      <nav className="flex items-center space-x-6 text-sm">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>
    </header>
  );
}
