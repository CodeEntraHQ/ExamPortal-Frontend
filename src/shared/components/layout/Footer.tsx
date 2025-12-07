import React, { useState } from 'react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { envConfig } from '@/config/env';

export function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const appName = envConfig.appName;

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
          <img 
            src="/codeEntra.png" 
            alt="CodeEntra Logo" 
            className="h-8 w-8 object-contain"
          />
          <span>© {currentYear} CodeEntra. All rights reserved.</span>
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-3 text-sm text-muted-foreground md:w-auto">
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="rounded-full border border-primary/40 px-3 py-2 text-primary transition hover:bg-primary/10"
          >
            Contact Us
          </button>
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
          <a
            href="https://codeentra.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit CodeEntra main site"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-2 text-primary transition hover:bg-primary/10"
          >
            <img 
              src="/codeEntra.png" 
              alt="CodeEntra Logo" 
              className="h-4 w-4 object-contain"
            />
            <span className="sr-only">Visit CodeEntra main site</span>
          </a>
        </div>
      </div>
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Us</DialogTitle>
            <DialogDescription>
              CodeEntra ({appName} Product Division)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium text-foreground">Email</p>
              <a href="mailto:codeentrasocial18@gmail.com" className="text-primary hover:underline">
                codeentrasocial18@gmail.com
              </a>
            </div>
            <div>
              <p className="font-medium text-foreground">Phone</p>
              <a href="tel:+919608758841" className="text-primary hover:underline">
                +91-9608758841
              </a>
            </div>
            <div>
              <p className="font-medium text-foreground">Website</p>
              <a href="https://codeentra.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://codeentra.com
              </a>
            </div>
            <div>
              <p className="font-medium text-foreground">Head Office</p>
              <p className="text-muted-foreground">CodeEntra Unlocking Solutions Pvt. Ltd.</p>
              <p className="text-muted-foreground">Patna</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}