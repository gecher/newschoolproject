import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Zap, Mail } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

const team = [
  {
    name: 'Selamawit Getachew',
    role: 'Frontend Engineer',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face'
  },
  {
    name: 'Alemayehu Mulatu',
    role: 'Full‑Stack Engineer',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face'
  },
  {
    name: 'Sara Gemechu',
    role: 'Product Designer',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=face'
  },
  {
    name: 'Dawit Mekonnen',
    role: 'Mobile Engineer',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face'
  }
];

const advisor = {
  name: 'Dr. Tesfaye Bekele',
  role: 'Project Advisor',
  image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=300&h=300&fit=crop&crop=face'
};

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 relative">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -z-10 inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Local nav */}
        <div className="mb-6 flex justify-end gap-3">
          <button onClick={() => onNavigate('about')} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</button>
          <button onClick={() => onNavigate('login')} className="text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">Get Started</button>
        </div>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            About The Student Club
          </h1>
          <p className="mt-3 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Empowering schools to build thriving club communities with beautiful tools for discovery, events, and communication.
          </p>
        </motion.div>

        {/* Project description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Our Mission</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We believe extracurricular activities are a cornerstone of student growth. The Student Club streamlines the journey
                from discovering a club to participating in events, so students can focus on learning, collaborating, and leading.
              </p>
              <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                The platform is designed to be simple for students, powerful for teachers, and insightful for administrators.
                Features like membership management, event RSVPs, attendance tracking, and announcements are all built-in.
              </p>
            </div>
            <div>
              {/* Tech Stack removed as requested */}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Our Values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-1 text-indigo-600 dark:text-indigo-300"><Heart className="h-4 w-4" /><span className="font-semibold text-gray-900 dark:text-white">Human‑Centered</span></div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Simple, inclusive experiences for every student and teacher.</div>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-1 text-indigo-600 dark:text-indigo-300"><ShieldCheck className="h-4 w-4" /><span className="font-semibold text-gray-900 dark:text-white">Reliable</span></div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Data‑safe and dependable for everyday school workflows.</div>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-1 text-indigo-600 dark:text-indigo-300"><Zap className="h-4 w-4" /><span className="font-semibold text-gray-900 dark:text-white">Fast</span></div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Built for performance with a delightful, responsive UI.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Developers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">Developers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:-translate-y-1 transition-transform"
              >
                <img src={m.image} alt={m.name} className="h-24 w-24 rounded-full object-cover mx-auto shadow" />
                <div className="mt-3 font-semibold text-gray-900 dark:text-white">{m.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{m.role}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Advisor moved below developers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">Advisor</h2>
          <div className="flex items-center justify-center">
            <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm w-full sm:w-auto">
              <div className="relative inline-block">
                <img src={advisor.image} alt={advisor.name} className="h-28 w-28 rounded-full object-cover mx-auto shadow" />
                <span className="absolute -bottom-1 -right-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow">
                  {advisor.role}
                </span>
              </div>
              <div className="mt-3 font-semibold text-gray-900 dark:text-white">{advisor.name}</div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12"
        >
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Want to learn more or collaborate?</h3>
            <p className="opacity-90 mb-4">We’d love to hear from you.</p>
            <a href="mailto:team@studentclub.example" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition">
              <Mail className="h-4 w-4" /> Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
