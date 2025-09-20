'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const DownloadCTA: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-16 md:py-24 bg-primary-main text-white">
      <div className="container-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Motorove Community?</h2>
            <p className="text-lg mb-8">
              Download the app today and connect with thousands of fellow motorcycle enthusiasts. 
              Your next adventure awaits!
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <Link href="https://apps.apple.com/app/motorove" className="bg-white text-primary-main px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 3c-2.05 0-3.7 1.24-4.5 3-0.8-1.76-2.45-3-4.5-3C4.01 3 2 5.01 2 8.5c0 3.77 3.4 6.86 8.55 11.53L12 21.35l1.45-1.32C18.6 15.36 22 12.27 22 8.5 22 5.01 19.99 3 16.5 3z"/>
                </svg>
                App Store
              </Link>
              <Link href="https://play.google.com/store/apps/details?id=com.motorove" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3v18l9-9L5 3zm11 0L7 12l9 9 3-3-6-6 6-6-3-3z"/>
                </svg>
                Google Play
              </Link>
            </div>

            <div className="flex flex-wrap gap-8">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold">Secure & Private</h4>
                  <p className="text-sm text-white/80">Your data stays protected</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold">Free Download</h4>
                  <p className="text-sm text-white/80">Basic features at no cost</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative h-[400px] md:h-[500px] flex justify-center"
          >
            <div className="absolute top-1/2 transform -translate-y-1/2 -rotate-6">
              <Image
                src="/assets/images/app-screen-1.png"
                alt="Motorove App Screen"
                width={250}
                height={500}
                className="rounded-3xl shadow-lg"
              />
            </div>
            <div className="absolute top-1/2 transform -translate-y-1/2 translate-x-20 rotate-6">
              <Image
                src="/assets/images/app-screen-2.png"
                alt="Motorove App Screen"
                width={250}
                height={500}
                className="rounded-3xl shadow-lg"
              />
            </div>
            
            {/* QR code for app download */}
            <div className="absolute bottom-0 right-0 bg-white p-4 rounded-xl shadow-lg">
              <Image
                src="/assets/images/qr-code.png"
                alt="Download App QR Code"
                width={100}
                height={100}
              />
              <p className="text-xs text-neutral-black text-center mt-2 font-medium">Scan to download</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DownloadCTA;
