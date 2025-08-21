import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Zap, Mail } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

const team = [
  {
    name: 'Daniya Usman',
    role: 'Backend Developer',
    image: 'https://i.imgur.com/HMasRG6.jpeg'
  },
  {
    name: 'Elpahreth Isaac',
    role: 'Project Manager',
    image: 'https://i.imgur.com/rhVuUV2.jpeg'
  },
  {
    name: 'Kalkidan Addis',
    role: 'UI and UX designer',
    image: 'https://i.imgur.com/ibvN5w3.jpeg'
  },
  {
    name: 'Hidasie Zemenu',
    role: 'Frontend Developer',
    image: 'https://i.imgur.com/BkriFhj.jpeg'
  }
];

const advisor = {
  name: 'Getacher Ashebir',
  role: 'Project Advisor',
  image: 'https://i.imgur.com/XOCQmGk.jpeg'
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
        {/* Hero section without duplicate nav */}
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Decorative elements */}
          <div className="relative mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-20 blur-xl"
            />
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"
            />
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
          >
            About The Student Club
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-block"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1 rounded-full">
              <div className="bg-white dark:bg-gray-900 px-8 py-3 rounded-full">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Empowering schools to build thriving club communities
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed"
          >
            Discover, create, and manage student clubs with beautiful tools designed for modern education. 
            From event planning to member engagement, we provide everything you need to build amazing experiences.
          </motion.p>
        </motion.div>

        {/* Project description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 pl-4">Our Mission</h2>
              </div>
              
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800"
                >
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    We believe extracurricular activities are a cornerstone of student growth. The Student Club streamlines the journey
                    from discovering a club to participating in events, so students can focus on learning, collaborating, and leading.
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800"
                >
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    The platform is designed to be simple for students, powerful for teachers, and insightful for administrators.
                    Features like membership management, event RSVPs, attendance tracking, and announcements are all built-in.
                  </p>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why We Matter</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Student clubs are more than just activities - they're opportunities for growth, leadership, and community building. 
                    Our platform makes these experiences accessible to everyone.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Our Values</h3>
              <p className="text-gray-600 dark:text-gray-400">The principles that guide everything we build</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Human‑Centered</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Simple, inclusive experiences designed for every student and teacher, ensuring accessibility and ease of use.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Reliable</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Data‑safe and dependable platform built for everyday school workflows and long-term success.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Fast</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Built for performance with a delightful, responsive UI that keeps up with your busy schedule.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
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
