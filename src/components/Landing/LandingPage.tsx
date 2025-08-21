import React, { useState, useEffect } from 'react';
import {
  Users, Calendar,
  MessageCircle, ArrowRight,
  ChevronDown, User, Star,
  MapPin, Clock, Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import sampleData from '../../data/sample-data.json';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentClub, setCurrentClub] = useState(0);
  
  

  // Auto-play slides
  const slides = [
    {
      image: "https://i.imgur.com/MXRFgo2.jpeg",
      title: "Student Collaboration",
      subtitle: "Connect with peers and build lasting friendships"
    },
    {
      image: "https://i.imgur.com/uKliuxp.jpeg",
      title: "Academic Excellence",
      subtitle: "Enhance your learning through extracurricular activities"
    },
    {
      image: "https://i.imgur.com/U62VBJ0.jpeg",
      title: "Leadership Development",
      subtitle: "Develop essential skills for your future career"
    }
  ];

  // Auto-play slides effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  // Auto-play categories effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCategory((prev) => (prev + 1) % clubCategories.length);
    }, 3000); // Change category every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-play clubs effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentClub((prev) => (prev + 1) % 3); // Show 3 clubs per category
    }, 3000); // Change club every 3 seconds

    return () => clearInterval(interval);
  }, []);

  

  // Removed features array as section was deleted
  // const features = [
  //   {
  //     icon: Users,
  //     title: "Club Discovery & Management",
  //     description: "Find and join clubs that match your interests. Create, manage student clubs with ease. Track memberships and organize activities.",
  //     color: "Purple"
  //   },
  //   {
  //     icon: Calendar,
  //     title: "Event Management & Organization",
  //     description: "Schedule events, manage RSVPs, and track attendance for all your club activities. Organize and attend exciting events.",
  //     color: "purple"
  //   },
  //   {
  //     icon: MessageCircle,
  //     title: "Communication Hub",
  //     description: "Stay connected with announcements, forums, and real-time notifications.",
  //     color: "purple"
  //   }
  // ];

  

     // Club Categories with clubs from JSON data
   const clubCategories = sampleData.clubCategories;

  // Build testimonial items from sample data users
  const testimonialItems = (sampleData.users || []).filter((u: any) => !!u.profilePhoto).slice(0, 3).map((u: any, idx: number) => ({
    name: u.fullName,
    role: u.role === 'TEACHER' ? 'Teacher' : u.role === 'ADMIN' ? 'Administrator' : 'Student',
    quote: idx === 0 ? 'I found my voice and my people. The event tools are so easy!' : idx === 1 ? 'Managing signups and announcements is finally effortless.' : 'Badges and progress tracking keep our team motivated.',
    rating: idx === 2 ? 4 : 5,
    image: u.profilePhoto as string
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">


      {/* Hero Section with Auto-play Slides */}
      <motion.section
         className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Auto-play Slides */}
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden mb-16">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: currentSlide === index ? 1 : 0,
                  scale: currentSlide === index ? 1 : 1.1
                }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <div className="relative h-full">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <motion.h2
                        className="text-4xl md:text-6xl font-bold mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 20
                        }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.p
                        className="text-xl md:text-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 20
                        }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      >
                        {slide.subtitle}
                      </motion.p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {slides.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Transform Your
                              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> The Student Club</span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              Everything You Need to Succeed
            </motion.p>
            <motion.p
              className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              The ultimate platform for managing student clubs, events, and activities. Connect, collaborate, and create amazing experiences together.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.button
                onClick={() => onNavigate('login')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Merged mini cards: features + testimonials */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Feature cards */}
                  <motion.div 
                    className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5"
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-3" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Club Discovery & Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Find and join clubs that match your interests.</p>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5"
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Calendar className="h-6 w-6 text-green-600 dark:text-green-400 mb-3" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Event Management & Organization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Schedule events and track attendance.</p>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5"
                    whileHover={{ y: -3, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-3" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Communication Hub</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Announcements, forums, and notifications.</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      

      {/* Club Categories Section */}
      <motion.section
        className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Club Categories
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover diverse clubs across different categories and find your perfect fit
            </p>
          </motion.div>

          {/* Category Carousel */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div className="flex transition-transform duration-1000 ease-in-out" style={{
                transform: `translateX(-${currentCategory * 100}%)`
              }}>
                {clubCategories.map((category, categoryIndex) => (
                  <div key={category.id} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      {/* Category Info */}
                      <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: currentCategory === categoryIndex ? 1 : 0,
                          x: currentCategory === categoryIndex ? 0 : -20
                        }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        <motion.h3
                          className="text-3xl font-bold text-gray-900 dark:text-white"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: currentCategory === categoryIndex ? 1 : 0,
                            y: currentCategory === categoryIndex ? 0 : 20
                          }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        >
                          {category.name}
                        </motion.h3>
                        <motion.p
                          className="text-lg text-gray-600 dark:text-gray-400"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: currentCategory === categoryIndex ? 1 : 0,
                            y: currentCategory === categoryIndex ? 0 : 20
                          }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        >
                          {category.description}
                        </motion.p>
                        
                        {/* Clubs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {category.clubs.map((club, clubIndex) => (
                            <motion.div
                              key={clubIndex}
                              className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 transition-all duration-300 ${
                                currentClub === clubIndex ? 'border-indigo-500 scale-105' : 'border-gray-200 dark:border-gray-700'
                              }`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ 
                                opacity: currentCategory === categoryIndex ? 1 : 0,
                                y: currentCategory === categoryIndex ? 0 : 20
                              }}
                              transition={{ duration: 0.8, delay: 0.5 + clubIndex * 0.1 }}
                              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                            >
                              <div className="relative h-40 md:h-48 mb-3 rounded-lg overflow-hidden">
                                <img
                                  src={club.image}
                                  alt={club.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                                  {club.members} members
                                </div>
                              </div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {club.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {club.description}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Category Image */}
                      <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ 
                          opacity: currentCategory === categoryIndex ? 1 : 0,
                          x: currentCategory === categoryIndex ? 0 : 20
                        }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      >
                        <div className="relative h-[520px] md:h-[560px] rounded-2xl overflow-hidden shadow-2xl">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                          <div className="absolute bottom-6 left-6 text-white">
                            <h4 className="text-3xl md:text-4xl font-bold mb-2">{category.name}</h4>
                            <p className="text-xl opacity-90">{category.clubs.length} clubs available</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {clubCategories.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    currentCategory === index 
                      ? 'bg-indigo-600 scale-125' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  onClick={() => setCurrentCategory(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <motion.button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setCurrentCategory((prev) => (prev - 1 + clubCategories.length) % clubCategories.length)}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronDown className="h-6 w-6 text-gray-600 dark:text-gray-400 transform rotate-90" />
            </motion.button>
            <motion.button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setCurrentCategory((prev) => (prev + 1) % clubCategories.length)}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronDown className="h-6 w-6 text-gray-600 dark:text-gray-400 transform -rotate-90" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-block mb-6"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1 rounded-full">
                <div className="bg-white dark:bg-gray-900 px-6 py-2 rounded-full">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Testimonials</span>
                </div>
              </div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
            >
              What People Say
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            >
              Real voices from students and teachers who've transformed their school experience
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialItems.map((t: any, i: number) => {
              const initials = t.name.split(' ').map((s: string) => s[0]).slice(0,2).join('');
              return (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 30, rotateY: -15 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 * i, ease: "easeOut" }}
                  whileHover={{ 
                    y: -10, 
                    rotateY: 5, 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                  className="group relative"
                >
                  {/* Card background with gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                    <div className="flex items-start gap-3">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="h-10 w-10 rounded-full object-cover shadow-md" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md text-xs font-semibold">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-4 w-4 ${idx < t.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-700'}`}
                            fill={idx < t.rating ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <p className="text-gray-800 dark:text-gray-100">“{t.quote}”</p>
                      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{t.name}</span>
                        <span className="ml-2">— {t.role}</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </motion.div>
            )})}
          </div>
        </div>
      </motion.section>

      {/* Location Section with Google Maps */}
      <motion.section
        className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Find Us
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Visit our school and experience the vibrant club community firsthand
            </p>
          </motion.div>

          

          {/* Google Maps - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Map</h3>
            
            <div className="relative h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
              <iframe
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63050.30259082863!2d38.63417387008666!3d9.004875426057769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b8779e01dc533%3A0x9e0a30b0545a390d!2z4Yuo4Yib4YqQIOGJpeGIreGIg-GKlSDhiIHhiIjhibDhipsg4Yuw4Yio4YyDIOGJteGIneGIheGIreGJtSDhiaThibUgWWVtYW5lIEJpcmhhbiBTZWNvbmRvcnkgYW5kIEVsZW1lbnRhcnkgU2Nob29s!5e0!3m2!1sen!2set!4v1755778111309!5m2!1sen!2set"                 width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="School Location"
              ></iframe>
              
              
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Click on the map to open in Google Maps
              </p>
              <button
                onClick={() => window.open('https://maps.app.goo.gl/pKnU7v7hDvJK5TPVA', '_blank')}
                className="mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                Open in Google Maps →
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section at the end */}
      <motion.section
        className="py-20 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10" />
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-block mb-6"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1 rounded-full">
                <div className="bg-white dark:bg-gray-900 px-6 py-2 rounded-full">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">FAQ</span>
                </div>
              </div>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            >
              Quick answers to common questions about our platform
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                q: 'How do I join a club?', 
                a: 'Browse categories, open a club, and tap Join. Your membership request will be sent to the club admins.', 
                tag: 'Getting Started',
                icon: '🚀'
              },
              { 
                q: 'Can teachers manage multiple clubs?', 
                a: 'Yes. Teachers can advise multiple clubs, manage events, memberships, and announcements in one place.', 
                tag: 'Teachers',
                icon: '👨‍🏫'
              },
              { 
                q: 'Do you support event RSVPs and attendance?', 
                a: 'Absolutely. Create events, collect RSVPs, set limits, and track attendance with ease.', 
                tag: 'Events',
                icon: '📅'
              },
              { 
                q: 'What about achievements and badges?', 
                a: 'Students earn badges for participation, leadership, and milestones. Progress is visible on their profile.', 
                tag: 'Achievements',
                icon: '🏆'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * idx }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                {/* Card background with gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
                  <details className="group" open={idx === 0}>
                    <summary className="flex items-center justify-between px-8 py-6 cursor-pointer list-none select-none hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all duration-300">
                      <span className="flex items-center gap-4">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                          {item.q}
                        </span>
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold border border-indigo-400/20">
                          {item.tag}
                        </span>
                        <motion.div
                          animate={{ rotate: 0 }}
                          transition={{ duration: 0.3 }}
                          className="group-open:rotate-180"
                        >
                          <ChevronDown className="h-6 w-6 text-gray-500 group-hover:text-indigo-500 transition-colors duration-300" />
                        </motion.div>
                      </span>
                    </summary>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="px-8 pb-6 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-b from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60"
                    >
                      <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed pt-4">
                        {item.a}
                      </p>
                    </motion.div>
                  </details>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-gray-900 text-white py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center juwstify-center mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
                             <span className="ml-2 text-xl font-bold">The Student Club</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering students to create, connect, and grow through meaningful club experiences.
            </p>
                         <p className="text-gray-500">&copy; 2024 The Student Club. All rights reserved.</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
