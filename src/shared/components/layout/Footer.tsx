import React from 'react';
import { GraduationCap, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/codeentra', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: Linkedin, href: 'https://www.linkedin.com/company/codeentra/', label: 'LinkedIn', color: 'hover:text-sky-600' },
    { icon: Facebook, href: 'https://www.facebook.com/people/codeEntra/61577066431979', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Twitter, href: 'https://x.com/codeentra', label: 'X (Twitter)', color: 'hover:text-blue-400' },
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground whitespace-nowrap">
          <div className="p-2 rounded-lg bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <span>© {currentYear} CodeEntra. All rights reserved.</span>
        </div>
        <div className="flex w-full items-center justify-end gap-3 text-sm text-muted-foreground md:w-auto">
          <span className="whitespace-nowrap">Connect with us</span>
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className={`rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-primary ${social.color}`}
            >
              <social.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}