"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Calendar, CheckCircle2, User, Heart, MapPin } from "lucide-react";

const MobileMockup = () => {
  const [step, setStep] = useState(0);
  const [isClicking, setIsClicking] = useState(false);
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    if (step === 0) {
      // Show cursor after 1.5 seconds, then click after 2 seconds
      const cursorTimer = setTimeout(() => setShowCursor(true), 1500);
      const clickTimer = setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => {
          setIsClicking(false);
          setShowCursor(false);
          setStep(1);
        }, 300);
      }, 2000);
      
      return () => {
        clearTimeout(cursorTimer);
        clearTimeout(clickTimer);
      };
    } else if (step === 1) {
      const timer = setTimeout(() => setStep(2), 2500);
      return () => clearTimeout(timer);
    } else if (step === 2) {
      const timer = setTimeout(() => setStep(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="relative w-[300px] h-[560px] border-[10px] border-slate-900 rounded-[2.8rem] bg-slate-50 shadow-2xl overflow-hidden ring-4 ring-slate-800/30">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-20" />

      {/* Status bar dots */}
      <div className="absolute top-1.5 right-6 flex gap-1 z-30">
        <div className="w-1 h-1 rounded-full bg-slate-400" />
        <div className="w-1 h-1 rounded-full bg-slate-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      </div>

      {/* Screen content */}
      <div className="p-5 pt-10 flex flex-col h-full bg-slate-50">
        {/* App header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-red-800 rounded-full flex items-center justify-center">
              <Droplets className="h-3.5 w-3.5 text-white" />
            </div>
            <p className="text-[11px] font-bold text-slate-800">VitalFlow</p>
          </div>
          <p className="text-sm font-semibold text-slate-800 mt-0.5">Blood Bank System</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Register Screen */}
          {step === 0 && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-6">
                <User className="h-12 w-12 text-red-800 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">Join VitalFlow</h3>
                <p className="text-xs text-slate-600">Become a life saver today</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Full Name</label>
                  <div className="h-9 bg-white rounded-lg border border-slate-200 flex items-center px-3">
                    <span className="text-xs text-slate-800 font-medium">John Smith</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Blood Group</label>
                  <div className="h-9 bg-white rounded-lg border border-slate-200 flex items-center px-3">
                    <span className="text-xs text-slate-800 font-medium">A+</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700">Phone Number</label>
                  <div className="h-9 bg-white rounded-lg border border-slate-200 flex items-center px-3">
                    <span className="text-xs text-slate-800 font-medium">+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <motion.button
                  className="w-full h-10 bg-red-800 text-white rounded-lg font-semibold text-xs shadow-lg"
                  animate={isClicking ? { scale: [1, 0.95, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  Register Now
                </motion.button>
                
                {/* Animated Mouse Cursor */}
                {showCursor && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, y: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0, 
                      y: 0,
                      scale: isClicking ? 0.8 : 1
                    }}
                    className="absolute -top-3 -right-3 pointer-events-none z-10"
                  >
                    <svg 
                      width="28" 
                      height="28" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="drop-shadow-lg"
                    >
                      <path 
                        d="M8.5 2L3 7.5L8.5 13L10.5 11L7 7.5L10.5 4L8.5 2Z" 
                        fill="white" 
                        stroke="#374151" 
                        strokeWidth="1.5"
                      />
                      <path 
                        d="M8.5 2L3 7.5L8.5 13L10.5 11L7 7.5L10.5 4L8.5 2Z" 
                        fill="#374151"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Donate Blood Screen */}
          {step === 1 && (
            <motion.div
              key="donate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-6">
                <Droplets className="h-12 w-12 text-red-800 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">Ready to Donate?</h3>
                <p className="text-xs text-slate-600">Find nearby donation centers</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { name: "City Blood Bank", distance: "2.1 km", time: "Open now" },
                  { name: "Medical Center", distance: "3.5 km", time: "Open 24/7" },
                  { name: "Community Hospital", distance: "5.2 km", time: "9 AM - 6 PM" }
                ].map((center, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{center.name}</p>
                        <p className="text-xs text-slate-500">{center.distance} • {center.time}</p>
                      </div>
                      <MapPin className="h-4 w-4 text-red-800" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                className="w-full h-10 bg-red-800 text-white rounded-lg font-semibold text-xs shadow-lg"
                whileTap={{ scale: 0.98 }}
              >
                Donate Blood
              </motion.button>
            </motion.div>
          )}

          {/* Step 3: Save Lives Screen */}
          {step === 2 && (
            <motion.div
              key="save-lives"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative mb-6"
              >
                {/* Animated heart with pulse effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <Heart className="h-10 w-10 text-white fill-white" />
                </motion.div>
                
                {/* Pulse rings */}
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-4 border-red-400"
                />
                <motion.div
                  animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 rounded-full border-4 border-red-300"
                />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-bold text-red-800 mb-2"
              >
                Save Many Lives!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-slate-600 mb-4 px-4"
              >
                Your donation can save up to 3 lives. Thank you for being a hero!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-green-50 border border-green-200 rounded-lg p-3 w-full"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-800">Donation Complete</span>
                </div>
                <p className="text-xs text-green-700">Impact score: +150</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const steps = [
  {
    step: 1,
    title: "Register as Donor",
    description:
      "Sign up with your blood group and medical information. Complete your profile in minutes and join our life-saving community.",
  },
  {
    step: 2,
    title: "Donate Blood",
    description:
      "Find nearby donation centers and schedule your visit. Your donation is safely collected and processed by medical professionals.",
  },
  {
    step: 3,
    title: "Save Many Lives",
    description:
      "Your blood reaches patients in need. Track your impact, earn certificates, and see how many lives you've saved with each donation.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-background py-16 sm:py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-red-800 border border-red-800/30 bg-red-800/5 px-3 py-1 rounded-full mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl leading-tight">
            How VitalFlow Works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            From registration to saving lives in three simple steps. Join our mission today.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* LEFT: Steps */}
          <div className="w-full lg:w-1/2 space-y-10">
            {steps.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                className="flex items-start gap-5"
              >
                {/* Step number + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-red-800 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-red-800/25">
                    {item.step}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="w-[2px] h-10 bg-gradient-to-b from-red-800/40 to-transparent mt-2" />
                  )}
                </div>

                {/* Text */}
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* RIGHT: Mobile Mockup — hidden on small/medium, visible on lg+ */}
          <motion.div
            className="hidden lg:flex w-full lg:w-1/2 justify-center lg:justify-end"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Decorative glow behind phone */}
            <div className="relative">
              <div className="absolute inset-0 -m-8 rounded-full bg-red-800/10 blur-3xl" />
              <MobileMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
