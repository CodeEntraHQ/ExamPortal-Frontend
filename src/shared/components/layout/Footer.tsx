import React from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  GraduationCap, 
  Facebook, 
  Instagram, 
  Twitter,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
  ];

  const footerSections = [
    {
      title: 'Solutions',
      links: [
        { label: 'Exams', href: '#' },
        { label: 'Analytics', href: '#' },
        { label: 'Proctoring', href: '#' },
        { label: 'Question Bank', href: '#' },
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact', href: '#' },
        { label: 'Help Center', href: '#' },
        { label: 'Documentation', href: '#' },
        { label: 'Community', href: '#' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'News', href: '#' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'GDPR', href: '#' },
      ]
    }
  ];

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ExamEntra
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Your one-stop solution for managing and taking exams with ease. 
                Empowering educational institutions with innovative assessment technology.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  support@examentra.com
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  +1 (555) 123-4567
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  San Francisco, CA
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-muted-foreground hover:text-primary transition-colors"
                      asChild
                    >
                      <a href={link.href}>{link.label}</a>
                    </Button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="text-sm text-muted-foreground">
            © {currentYear} ExamEntra. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Follow us:</span>
            {socialLinks.map((social) => (
              <motion.div
                key={social.label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-muted-foreground transition-colors ${social.color}`}
                  asChild
                  aria-label={social.label}
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer">
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}