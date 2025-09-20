'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <Image 
                src="/assets/images/logo-white.png" 
                alt="Motorove Logo" 
                width={40} 
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-heading font-bold">Motorove</span>
            </div>
            <p className="text-neutral-lightGrey mb-4">
              The ultimate motorcycle app for connecting riders, discovering routes, and joining events.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon="facebook" href="https://facebook.com/motorove" />
              <SocialIcon icon="instagram" href="https://instagram.com/motorove" />
              <SocialIcon icon="twitter" href="https://twitter.com/motorove" />
              <SocialIcon icon="youtube" href="https://youtube.com/motorove" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink href="#features">Features</FooterLink>
              <FooterLink href="#community">Community</FooterLink>
              <FooterLink href="#routes">Routes</FooterLink>
              <FooterLink href="#events">Events</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/safety">Riding Safety</FooterLink>
              <FooterLink href="/faq">FAQs</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Download */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Download App</h3>
            <div className="flex flex-col space-y-3">
              <Link href="https://apps.apple.com/app/motorove">
                <Image 
                  src="/assets/images/app-store-badge.png" 
                  alt="Download on App Store" 
                  width={150} 
                  height={50}
                  className="h-auto"
                />
              </Link>
              <Link href="https://play.google.com/store/apps/details?id=com.motorove">
                <Image 
                  src="/assets/images/google-play-badge.png" 
                  alt="Get it on Google Play" 
                  width={150} 
                  height={50} 
                  className="h-auto"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-darkGrey mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-lightGrey text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Motorove. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-neutral-lightGrey hover:text-white text-sm">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-neutral-lightGrey hover:text-white text-sm">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-neutral-lightGrey hover:text-white text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children }) => {
  return (
    <li>
      <Link 
        href={href} 
        className="text-neutral-lightGrey hover:text-white transition-colors"
      >
        {children}
      </Link>
    </li>
  );
};

interface SocialIconProps {
  icon: string;
  href: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ icon, href }) => {
  return (
    <Link 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      className="bg-neutral-darkGrey hover:bg-primary-main w-10 h-10 rounded-full flex items-center justify-center transition-colors"
    >
      <span className="sr-only">{icon}</span>
      {/* Simple icon placeholder */}
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        {icon === 'facebook' && <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>}
        {icon === 'twitter' && <path d="M23.64 4.54c-.77.36-1.6.6-2.46.7.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C19.54 3.03 18.4 2.5 17 2.5c-2.7 0-4.87 2.2-4.87 4.9 0 .4.04.77.13 1.13-4.04-.2-7.62-2.13-10.02-5.06-.42.72-.66 1.56-.66 2.46 0 1.7.87 3.2 2.18 4.08-.8-.03-1.55-.24-2.2-.6v.06c0 2.38 1.7 4.36 3.95 4.8-.4.1-.82.16-1.26.16-.3 0-.6-.03-.9-.08.63 1.95 2.45 3.37 4.6 3.4-1.7 1.33-3.82 2.12-6.14 2.12-.4 0-.8-.02-1.18-.06 2.18 1.4 4.76 2.22 7.55 2.22 9.06 0 14-7.5 14-14v-.6c.96-.7 1.8-1.56 2.45-2.54z"/>}
        {icon === 'instagram' && <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.7 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.22-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85.15-3.23 1.67-4.77 4.92-4.92 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.7.07 4.95.07 3.26 0 3.67-.01 4.95-.07 4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.7.07-4.95 0-3.26-.01-3.67-.07-4.95-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84c-3.4 0-6.16 2.76-6.16 6.16 0 3.4 2.76 6.16 6.16 6.16 3.4 0 6.16-2.76 6.16-6.16 0-3.4-2.76-6.16-6.16-6.16zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.4-11.85c-.8 0-1.44.65-1.44 1.44s.65 1.44 1.44 1.44c.8 0 1.44-.65 1.44-1.44s-.65-1.44-1.44-1.44z"/>}
        {icon === 'youtube' && <path d="M23.8 7.2s-.2-1.7-1-2.4c-.9-1-1.9-1-2.4-1-3.4-.2-8.4-.2-8.4-.2s-5 0-8.4.2c-.5.1-1.5.1-2.4 1-.7.7-1 2.4-1 2.4S0 9.1 0 11.1v1.8c0 1.9.2 3.9.2 3.9s.2 1.7 1 2.4c.9 1 2.1.9 2.6 1 1.9.2 8.2.2 8.2.2s5 0 8.4-.3c.5-.1 1.5-.1 2.4-1 .7-.7 1-2.4 1-2.4s.2-1.9.2-3.9V11c0-1.9-.2-3.8-.2-3.8zM9.5 15.1V8.4l6.5 3.4-6.5 3.3z"/>}
      </svg>
    </Link>
  );
};

export default Footer;
