"use client";

import Link from 'next/link';
import { ArrowRight, Play, Zap, BarChart3, Lock, Search } from 'lucide-react';
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useState } from 'react';
import { useRouter } from 'next/navigation';



export default function LandingPage() {
  const [url, setUrl] = useState('');
  const router = useRouter();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // Redirect to dashboard with URL param to auto-start analysis
      router.push(`/dashboard?url=${encodeURIComponent(url)}`);
    } else {
      router.push('/api/auth/register');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0c29] text-white">
      {/* Navbar */}
      <nav className="w-full p-6 flex justify-between items-center glass-card border-b-0 rounded-none z-50">
        <div className="text-2xl font-bold text-gradient tracking-tighter">Agentic Eye</div>
        <div className="flex gap-4">
          <LoginLink className="px-6 py-2 rounded-full border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 transition-all">
            Login
          </LoginLink>
          <RegisterLink className="px-6 py-2 rounded-full bg-gradient-primary text-white font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,255,0.4)]">
            Start Free
          </RegisterLink>
        </div>
      </nav>

      <main className="flex-1 w-full flex flex-col items-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] -z-10"></div>

        {/* Hero Section */}
        <div className="mt-20 text-center max-w-4xl px-4 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm text-gray-300">AI Engine v4.0 Live</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Predict Viral Potential <br />
            <span className="text-gradient">Before You Post.</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Stop guessing. Our AI analyzes thousands of comments to find the exact hooks, topics, and scripts your audience is craving right now.
          </p>

          {/* Interactive Input */}
          <form onSubmit={handleStart} className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-black rounded-2xl p-2 z-10">
              <Search className="w-6 h-6 text-gray-400 ml-4" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube or TikTok URL..."
                className="flex-1 bg-white/10 border border-white/20 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white px-4 py-3 rounded-xl outline-none placeholder-gray-400 transition-all"
              />
              <button type="submit" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Analyze
              </button>
            </div>
          </form>
          <p className="mt-4 text-sm text-gray-500">Try it risk-free. No credit card required.</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full px-4">
          {[
            { icon: Zap, title: "Instant Analysis", desc: "Get deep insights from thousands of comments in seconds." },
            { icon: BarChart3, title: "Viral Score", desc: "Know the viral potential before you even pick up the camera." },
            { icon: Lock, title: "Secret Scripts", desc: "AI generates the exact hooks and scripts your audience craves." }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl hover:bg-white/10 transition-all cursor-default group border border-white/5">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Section */}
        <div className="mt-32 w-full max-w-7xl px-4 flex flex-col items-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">
            <span className="text-white">Simple Pricing.</span> <span className="text-gradient">Viral Results.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {/* Free Plan */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-white/30 transition-all flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Free Tier</h3>
              <p className="text-sm text-gray-400 mb-4">Perfect for trying out the power of AI.</p>
              <div className="text-4xl font-black mb-6">$0<span className="text-lg text-gray-500 font-normal"> FREE</span></div>

              <ul className="mt-2 space-y-4 mb-8 flex-grow text-left">
                <li className="flex items-center gap-3 text-gray-300">✓ 10 Ideas to get you started</li>
                <li className="flex items-center gap-3 text-gray-300">✓ 3 Credits per user</li>
                <li className="flex items-center gap-3 text-gray-300">✓ Access to 1 Previous History</li>
                <li className="flex items-center gap-3 text-gray-500 line-through"><span className="text-red-500 font-bold mr-1">✕</span> No Viral Scores</li>
                <li className="flex items-center gap-3 text-gray-500 line-through"><span className="text-red-500 font-bold mr-1">✕</span> NO Video Generations</li>
              </ul>

              <RegisterLink className="block w-full py-3 rounded-xl border border-white/20 text-center font-bold hover:bg-white/10 transition-all">
                Start Free
              </RegisterLink>
            </div>

            {/* Diamond Plan (Highlighted) */}
            <div className="relative glass-card p-8 rounded-3xl border-2 border-pink-500 transform scale-105 shadow-[0_0_40px_rgba(255,0,153,0.3)] flex flex-col bg-[#1a1635]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-primary px-4 py-1 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2 text-cyan-400">Diamond Tier</h3>
              <p className="text-sm text-gray-400 mb-4">For serious creators ready to scale.</p>
              <div className="text-4xl font-black mb-2">$20<span className="text-lg text-gray-500 font-normal"> / month</span></div>
              <p className="text-xs text-gray-500 mb-6">Billed annually ($240/Year)</p>

              <ul className="mt-2 space-y-4 mb-8 flex-grow text-left">
                <li className="flex items-center gap-3 text-white">✓ 20 Ideas to get you started</li>
                <li className="flex items-center gap-3 text-white">✓ 100 Credits/month or 1750 Credits/year</li>
                <li className="flex items-center gap-3 text-white">✓ Half Access to History and Viral Scores</li>
                <li className="flex items-center gap-3 text-white">✓ Medium-level AI Agents</li>
                <li className="flex items-center gap-3 text-white bg-white/10 p-2 rounded-lg">✓ x3 FREE Video Generations a Month <span className="ml-auto text-xs bg-green-500 text-black px-2 py-0.5 rounded font-bold">FREE</span></li>
                <li className="flex items-center gap-3 text-gray-500 line-through"><span className="text-red-500 font-bold mr-1">✕</span> No AI Content Ideas Reports</li>
              </ul>

              <RegisterLink className="block w-full py-3 rounded-xl bg-gradient-primary text-center font-bold hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all">
                Get Diamond
              </RegisterLink>
            </div>

            {/* Solitaire Plan */}
            <div className="glass-card p-8 rounded-3xl border border-white/10 hover:border-white/30 transition-all flex flex-col">
              <h3 className="text-2xl font-bold mb-2 text-purple-400">Solitaire Tier</h3>
              <p className="text-sm text-gray-400 mb-4">Ultimate power for agencies and pros.</p>
              <div className="text-4xl font-black mb-2">$30<span className="text-lg text-gray-500 font-normal"> / month</span></div>
              <p className="text-xs text-gray-500 mb-6">Billed annually ($360/Year)</p>

              <ul className="mt-2 space-y-4 mb-8 flex-grow text-left">
                <li className="flex items-center gap-3 text-gray-300">✓ 30 Ideas to get you started</li>
                <li className="flex items-center gap-3 text-gray-300">✓ 200 Credits/month or 3000 Credits/year</li>
                <li className="flex items-center gap-3 text-gray-300">✓ Full Access to History and Viral Scores</li>
                <li className="flex items-center gap-3 text-gray-300">✓ High-level AI Agents and Report generation</li>
                <li className="flex items-center gap-3 text-white bg-white/10 p-2 rounded-lg">✓ x5 FREE Video Generations a Month <span className="ml-auto text-xs bg-green-500 text-black px-2 py-0.5 rounded font-bold">FREE</span></li>
                <li className="flex items-center gap-3 text-gray-300">✓ Priority support</li>
              </ul>

              <RegisterLink className="block w-full py-3 rounded-xl border border-white/20 text-center font-bold hover:bg-white/10 transition-all">
                Go Solitaire
              </RegisterLink>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-8 text-center text-gray-600 mt-20 border-t border-white/5">
        <p>© 2025 Agentic Eye. All rights reserved.</p>
      </footer>
    </div >
  );
}
