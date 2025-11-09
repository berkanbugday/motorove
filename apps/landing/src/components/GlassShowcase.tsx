"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * GlassShowcase Component
 * 
 * Demonstrates all Liquid Glass effects available in the design system.
 * This component can be added to any page to showcase the glassmorphism effects.
 * 
 * Usage:
 * import GlassShowcase from "@components/GlassShowcase";
 * <GlassShowcase />
 */
const GlassShowcase: React.FC = () => {
  return (
    <section className="bg-background-primary glass-gradient-bg py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-bold text-neutral-white">
              Liquid Glass Effects
            </h2>
            <p className="text-xl text-neutral-grey">
              Modern glassmorphism design system
            </p>
          </div>

          {/* Basic Glass */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-neutral-white">Basic Glass</h3>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass rounded-2xl p-8"
            >
              <h4 className="text-xl font-semibold text-neutral-white mb-2">
                .glass
              </h4>
              <p className="text-neutral-grey">
                Subtle frosted glass effect with 5% transparency and 10px blur.
                Perfect for navigation bars and subtle overlays.
              </p>
            </motion.div>
          </div>

          {/* Glass Card */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-neutral-white">Glass Card</h3>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-2xl p-8"
            >
              <h4 className="text-xl font-semibold text-neutral-white mb-2">
                .glass-card
              </h4>
              <p className="text-neutral-grey">
                Standard glass card with 8% transparency, 12px blur, and shadow.
                Ideal for content containers and feature cards.
              </p>
            </motion.div>
          </div>

          {/* Glass Strong */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-neutral-white">Strong Glass</h3>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-strong rounded-2xl p-8"
            >
              <h4 className="text-xl font-semibold text-neutral-white mb-2">
                .glass-strong
              </h4>
              <p className="text-neutral-grey">
                Enhanced glass effect with 12% transparency and 16px blur.
                Use for prominent UI elements and modals.
              </p>
            </motion.div>
          </div>

          {/* Glass Accent */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-neutral-white">Accent Glass</h3>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-accent rounded-2xl p-8"
            >
              <h4 className="text-xl font-semibold text-neutral-white mb-2">
                .glass-accent
              </h4>
              <p className="text-neutral-white">
                Motorove red-tinted glass with 15% transparency.
                Perfect for call-to-action elements and highlights.
              </p>
            </motion.div>
          </div>

          {/* Interactive Glass Grid */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-neutral-white">
              Interactive Glass (.glass-hover)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card glass-hover rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">🏍️</div>
                <h4 className="text-lg font-semibold text-neutral-white mb-2">
                  Hover Me
                </h4>
                <p className="text-sm text-neutral-grey">
                  Lifts and glows on hover
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-card glass-hover rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">⚡</div>
                <h4 className="text-lg font-semibold text-neutral-white mb-2">
                  Interactive
                </h4>
                <p className="text-sm text-neutral-grey">
                  Smooth transitions
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-card glass-hover rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">✨</div>
                <h4 className="text-lg font-semibold text-neutral-white mb-2">
                  Modern
                </h4>
                <p className="text-sm text-neutral-grey">
                  Apple-inspired design
                </p>
              </motion.div>
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-neutral-white">
              Shimmer Animation
            </h3>
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 glass-shimmer" />
              <div className="relative z-10">
                <h4 className="text-xl font-semibold text-neutral-white mb-2">
                  .glass-shimmer
                </h4>
                <p className="text-neutral-grey">
                  Animated light sweep effect for loading states and attention.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-neutral-white">Glass Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-card glass-hover px-8 py-4 rounded-lg font-semibold text-neutral-white"
              >
                Glass Button
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-accent glass-hover px-8 py-4 rounded-lg font-semibold text-neutral-white"
              >
                Accent Button
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-main hover:bg-primary-light px-8 py-4 rounded-lg font-semibold text-neutral-white transition-colors"
              >
                Solid Button
              </motion.button>
            </div>
          </div>

          {/* Code Example */}
          <div className="glass-strong rounded-2xl p-8">
            <h3 className="text-xl font-bold text-neutral-white mb-4">
              Quick Start
            </h3>
            <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-neutral-grey">
{`// Basic glass container
<div className="glass rounded-lg p-6">
  Content here
</div>

// Interactive glass card
<div className="glass-card glass-hover rounded-xl p-8">
  Hover me!
</div>

// Accent glass button
<button className="glass-accent glass-hover px-6 py-3">
  Call to Action
</button>`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlassShowcase;
