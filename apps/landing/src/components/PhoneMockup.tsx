"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface PhoneMockupProps {
  screenshot: string;
  alt: string;
  className?: string;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({
  screenshot,
  alt,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Phone frame - realistic iPhone mockup */}
      <div className="relative">
        {/* Phone body */}
        <div className="relative bg-neutral-black rounded-[2.5rem] sm:rounded-[3.5rem] p-2 sm:p-3 shadow-[0_10px_40px_rgba(0,0,0,0.2)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          {/* Screen bezel */}
          <div className="relative bg-neutral-black rounded-[2rem] sm:rounded-[3rem] border-[2px] sm:border-[3px] border-neutral-darkGrey/20">
            {/* Dynamic Island */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-neutral-black rounded-b-2xl sm:rounded-b-3xl px-4 sm:px-6 shadow-lg">
                <div className="w-16 h-5 sm:w-24 sm:h-7 bg-neutral-black rounded-full" />
              </div>
            </div>

            {/* Screen content */}
            <div className="relative w-[250px] h-[540px] sm:w-[300px] sm:h-[650px] bg-neutral-black rounded-[2rem] sm:rounded-[3rem]">
              <Image
                src={screenshot}
                alt={alt}
                width={300}
                height={650}
                className="w-full h-full object-cover rounded-[2rem] sm:rounded-[3rem]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute -left-1 top-20 sm:top-24 w-0.5 sm:w-1 h-6 sm:h-7 bg-neutral-darkGrey rounded-l-sm" />
        <div className="absolute -left-1 top-32 sm:top-40 w-0.5 sm:w-1 h-8 sm:h-10 bg-neutral-darkGrey rounded-l-sm" />
        <div className="absolute -left-1 top-44 sm:top-56 w-0.5 sm:w-1 h-8 sm:h-10 bg-neutral-darkGrey rounded-l-sm" />
        <div className="absolute -right-1 top-28 sm:top-32 w-0.5 sm:w-1 h-8 sm:h-10 bg-neutral-darkGrey rounded-r-sm" />
      </div>
    </div>
  );
};

export default PhoneMockup;
