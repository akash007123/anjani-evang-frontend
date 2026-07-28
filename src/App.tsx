import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'motion/react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/layout/LoadingSpinner';
import WhatsAppContact from './components/layout/WhatsAppContact';
import GeminiChatbot from './components/layout/GeminiChatbot';
import { AdminAuthProvider } from './context/AdminAuthContext';
import GuestRoute from './components/admin/GuestRoute';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import SEOConfig from './components/SEOConfig';
import LocalBusinessSchema from './components/LocalBusinessSchema';
import PageTransition from './components/PageTransition';

// Lazy-loaded Page Imports for smooth Suspense route transitions
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Team = lazy(() => import('./pages/Team'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const Packages = lazy(() => import('./pages/Packages'));
const Menu = lazy(() => import('./pages/Menu'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const FAQs = lazy(() => import('./pages/FAQs'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetails = lazy(() => import('./pages/BlogDetails'));
const Contact = lazy(() => import('./pages/Contact'));
const Booking = lazy(() => import('./pages/Booking'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/admin/Login'));
const Signup = lazy(() => import('./pages/admin/Signup'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Helper Component: Auto scroll viewport to top on route navigate
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Conditional Routing Content Wrapper
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner fullPage={true} />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/admin-login" element={<GuestRoute><PageTransition><Login /></PageTransition></GuestRoute>} />
              <Route path="/admin-signup" element={<GuestRoute><PageTransition><Signup /></PageTransition></GuestRoute>} />
              <Route path="/admin/*" element={<PageTransition><Admin /></PageTransition>} />
              <Route path="/*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream selection:bg-primary/35 selection:text-secondary">
      
      {/* Sticky Header */}
      <Header />

      {/* Primary Content Router Stage with Suspense loading boundary */}
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner fullPage={true} />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/team" element={<PageTransition><Team /></PageTransition>} />
              <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
              <Route path="/services/:slug" element={<PageTransition><ServiceDetails /></PageTransition>} />
              <Route path="/packages" element={<PageTransition><Packages /></PageTransition>} />
              <Route path="/menu" element={<PageTransition><Menu /></PageTransition>} />
              <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
              <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
              <Route path="/projects/:slug" element={<PageTransition><ProjectDetails /></PageTransition>} />
              <Route path="/testimonials" element={<PageTransition><Testimonials /></PageTransition>} />
              <Route path="/faqs" element={<PageTransition><FAQs /></PageTransition>} />
              <Route path="/blogs" element={<PageTransition><Blog /></PageTransition>} />
              <Route path="/blogs/:slug" element={<PageTransition><BlogDetails /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
              <Route path="/booking" element={<PageTransition><Booking /></PageTransition>} />
              <Route path="/*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {/* Premium Footer */}
      <Footer />

      {/* Floating WhatsApp Contact Widget */}
      <WhatsAppContact />

      {/* Floating Gemini AI Chatbot Widget */}
      <GeminiChatbot />

    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ToastProvider>
          <AdminAuthProvider>
            <Router>
              <ScrollToTop />
              <SEOConfig />
              <LocalBusinessSchema />
              <AppContent />
            </Router>
          </AdminAuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}
