'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowRight, CheckCircle, Play, Zap, BarChart3, Globe, Shield, Star, Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const { user, isAuthenticated } = useKindeBrowserClient();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStart = () => {
    if (url) {
      // If user enters URL, go to dashboard with it
      // If not logged in, Kinde will handle the redirect flow naturally if we protect /dashboard
      // But for better UX, we can check auth state
      if (isAuthenticated) {
        router.push(`/dashboard?url=${encodeURIComponent(url)}`);
      } else {
        // Redirect to register, then to dashboard with URL
        // Note: Kinde post-login redirect is set in env, but we can try to pass params if supported
        // For now, simple redirect to register
        window.location.href = `/api/auth/login?post_login_redirect_url=/dashboard?url=${encodeURIComponent(url)}`;
      }
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">Agentic Eye</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How it Works</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="px-5 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <LoginLink className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log in</LoginLink>
                <RegisterLink className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                  Start Free
                </RegisterLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-lg font-medium">
              <Link href="#features" onClick={() => setIsMenuOpen(false)}>Features</Link>
              <Link href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
              <LoginLink className="text-gray-400">Log in</LoginLink>
              <RegisterLink className="text-purple-500">Sign up Free</RegisterLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-gray-300">AI Model Updated: DeepSeek-V3</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
          >
            Go Viral on Autopilot.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-12"
          >
            Paste any YouTube or TikTok URL. Our AI analyzes the comments, detects viral patterns, and generates your next hit script in seconds.
          </motion.p>

          {/* Interactive Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-black rounded-2xl p-2 z-10 border border-white/10 shadow-2xl">
              <Search className="w-6 h-6 text-gray-500 ml-4" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube or TikTok URL..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-4 outline-none placeholder-gray-500 text-lg"
              />
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                Analyze <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
          >
            {/* Add logos here if needed */}
            <span className="text-sm font-semibold tracking-widest uppercase">Trusted by 1000+ Creators</span>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Top Creators Use Us</h2>
            <p className="text-gray-400">Stop guessing. Start using data-backed intelligence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: "Deep Sentiment Analysis", desc: "Understand exactly what your audience loves and hates." },
              { icon: Zap, title: "Viral Pattern Detection", desc: "Identify the hooks and formats that are exploding right now." },
              { icon: Globe, title: "Multi-Platform Intelligence", desc: "Works seamlessly for both YouTube and TikTok content." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400">Start for free. Upgrade when you go viral.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-300 mb-2">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Perfect for trying it out.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-5 h-5 text-green-500" /> 3 Free Analyses</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-5 h-5 text-green-500" /> Basic Sentiment</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-5 h-5 text-green-500" /> 100 Comments Limit</li>
              </ul>
              <RegisterLink className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-center transition-all">
                Start Free
              </RegisterLink>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-900/40 to-black border border-purple-500/30 relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-b-lg">MOST POPULAR</div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Diamond</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">For serious creators.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white"><CheckCircle className="w-5 h-5 text-purple-400" /> 100 Analyses/mo</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle className="w-5 h-5 text-purple-400" /> DeepSeek-V3 AI</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle className="w-5 h-5 text-purple-400" /> 500 Comments Limit</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle className="w-5 h-5 text-purple-400" /> Script Generation</li>
              </ul>
              <RegisterLink className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-center transition-all shadow-lg shadow-purple-500/25">
                Get Started
              </RegisterLink>
            </div>

            {/* Agency Tier */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-300 mb-2">Solitaire</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">For agencies & teams.</p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-5 h-5 text-green-500" /> Unlimited Analyses</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-5 h-5 text-green-500" /> Priority Support</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-5 h-5 text-green-500" /> API Access</li>
                <li className="flex items-center gap-3 text-gray-300"><CheckCircle className="w-5 h-5 text-green-500" /> Custom Reports</li>
              </ul>
              <RegisterLink className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-center transition-all">
                Contact Sales
              </RegisterLink>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Agentic Eye</span>
          </div>
          <p className="text-gray-500 text-sm">© 2025 Agentic Eye. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
