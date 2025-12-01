'use client';

import { useState, useEffect } from 'react';
import {
    Youtube,
    Music2,
    Video,
    History,
    CreditCard,
    Settings,
    ChevronLeft,
    Crown,
    User,
    Zap,
    Download,
    Play
} from 'lucide-react';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Components
import SidebarItem from '@/components/dashboard/SidebarItem';
import CreditGauge from '@/components/dashboard/CreditGauge';
import DashboardHome from '@/components/dashboard/DashboardHome';
import AudienceInsights from '@/components/dashboard/AudienceInsights';
import ViralIntelligence from '@/components/dashboard/ViralIntelligence';
import AIContentIdeas from '@/components/dashboard/AIContentIdeas';
import VideoGenerationPromo from '@/components/dashboard/VideoGenerationPromo';
import VideoRequestForm from '@/components/dashboard/VideoRequestForm';
import HistoryTab from '@/components/dashboard/HistoryTab';
import CreditHistoryTab from '@/components/dashboard/CreditHistoryTab';
import SettingsTab from '@/components/dashboard/SettingsTab';

export default function Dashboard() {
    const { user } = useKindeBrowserClient();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>('youtube-insights');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [credits, setCredits] = useState(0);
    const [creditsLoaded, setCreditsLoaded] = useState(false);
    const [videoCredits, setVideoCredits] = useState(0);
    const [tier, setTier] = useState('Free');
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [videoRequests, setVideoRequests] = useState<any[]>([]);
    const [deepAnalysis, setDeepAnalysis] = useState(false);

    // Video Request State
    const [requestTitle, setRequestTitle] = useState('');
    const [requestNotes, setRequestNotes] = useState('');
    const [requestStyle, setRequestStyle] = useState('Fast-paced');
    const [requestDuration, setRequestDuration] = useState('60s');
    const [requestTone, setRequestTone] = useState('Energetic & Hype');
    const [submittingRequest, setSubmittingRequest] = useState(false);

    // History State
    const [historySearch, setHistorySearch] = useState('');
    const [historySort, setHistorySort] = useState<'date' | 'score'>('date');

    const [transactions, setTransactions] = useState<any[]>([]);

    const fetchCredits = async () => {
        try {
            const res = await fetch('/api/user');
            const data = await res.json();
            if (data.credits !== undefined) {
                setCredits(data.credits);
                setTier(data.tier);
                if (data.videoCredits !== undefined) setVideoCredits(data.videoCredits);
            }
        } catch (error) {
            console.error("Failed to fetch credits", error);
        } finally {
            setCreditsLoaded(true);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/user?type=history');
            const data = await res.json();
            if (data.history) setHistory(data.history);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const fetchVideoRequests = async () => {
        try {
            const res = await fetch('/api/video-request');
            const data = await res.json();
            if (data.requests) setVideoRequests(data.requests);
        } catch (error) {
            console.error("Failed to fetch video requests", error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/user?type=transactions');
            const data = await res.json();
            if (data.transactions) {
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        }
    };

    const verifyPayment = async (sessionId: string) => {
        try {
            const res = await fetch(`/api/stripe?session_id=${sessionId}`);
            const data = await res.json();
            if (data.status === 'paid') {
                // Trigger confetti celebration
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.6 }
                });
                
                setTimeout(() => {
                    confetti({
                        particleCount: 100,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 }
                    });
                    confetti({
                        particleCount: 100,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 }
                    });
                }, 250);
                
                alert("🎉 Payment Successful! Credits Added.");
                fetchCredits();
                fetchTransactions();
                window.history.replaceState({}, document.title, "/dashboard");
            }
        } catch (e) {
            console.error("Payment verification failed", e);
        }
    };

    const handleUpgrade = async (planName: string) => {
        setLoading(true);
        const plans: Record<string, { priceId: string; credits: number }> = {
            'diamond': { priceId: 'price_1PzqMvB3wQ42xPbWvyd03B2J', credits: 100 },
            'solitaire': { priceId: 'price_1PzqP2B3wQ42xPbWs6kZWlh9', credits: 200 }
        };
        const plan = plans[planName];

        try {
            const res = await fetch('/api/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    priceId: plan.priceId,
                    credits: plan.credits
                }),
            });
            const { sessionId } = await res.json();
            const stripe = await stripePromise;
            await (stripe as any)?.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error('Checkout failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!url) return;
        if (credits < 1) {
            setShowUpgrade(true);
            return;
        }

        setLoading(true);
        try {
            const platform = activeTab === 'tiktok-insights' ? 'tiktok' : 'youtube';
            // 1. Analyze (Don't deduct yet)
            const limit = deepAnalysis ? 500 : 50;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
            
            const res = await fetch(`/api/py/m3/analyze?url=${encodeURIComponent(url)}&tier=${tier}&platform=${platform}&limit=${limit}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!res.ok) {
                throw new Error(`Analysis failed: ${res.statusText}`);
            }
            
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setResult(data);

            // Trigger confetti on success
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // 2. Deduct Credit (Only if analysis succeeded)
            await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'deduct', amount: 1, description: "Analyzed video content" })
            });
            setCredits(c => c - 1);
            fetchTransactions();

            // 3. Save to History
            await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save_history', videoUrl: url, result: data })
            });
            fetchHistory();
        } catch (error: any) {
            console.error('Analysis error:', error);
            if (error.name === 'AbortError') {
                alert('Analysis timed out. Please try again or use a shorter video.');
            } else {
                alert(error.message || 'Analysis failed. Please check the URL and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitVideoRequest = async (scriptContent?: string) => {
        if (!requestTitle) return;
        if (credits < 10) {
            alert("Insufficient Credits. Please upgrade or purchase more.");
            return;
        }

        setSubmittingRequest(true);
        try {
            const res = await fetch('/api/video-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: requestTitle,
                    notes: requestNotes || scriptContent || '',
                    style: requestStyle,
                    duration: requestDuration,
                    tone: requestTone
                })
            });

            const data = await res.json();
            if (data.success) {
                // Trigger confetti for video request submission
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.6 }
                });
                
                alert("Request Submitted! We will notify you when it's ready.");
                setRequestTitle('');
                setRequestNotes('');
                fetchVideoRequests();
                fetchCredits();
                fetchTransactions();
            } else {
                alert(data.error || "Failed to submit request");
            }
        } catch (error) {
            console.error("Request failed", error);
            alert("Failed to submit request. Please try again.");
        } finally {
            setSubmittingRequest(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCredits();
            fetchHistory();
            fetchVideoRequests();
            fetchTransactions();

            // Check for payment success
            if (searchParams.get('payment') === 'success') {
                verifyPayment(searchParams.get('session_id')!);
            }

            // Set URL from params if present
            const urlParam = searchParams.get('url');
            if (urlParam) {
                setUrl(urlParam);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, searchParams]);

    // Auto-analyze effect
    useEffect(() => {
        const urlParam = searchParams.get('url');
        if (user && creditsLoaded && urlParam && !loading && !result) {
            // Check if we have enough credits before auto-analyzing
            if (credits >= 1) {
                handleAnalyze();
            } else {
                setShowUpgrade(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, creditsLoaded, credits, searchParams, loading, result]);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden relative">
            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
            >
                <Video className="w-6 h-6 text-purple-600" />
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-4 shadow-sm z-40 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div>
                    <div className="flex items-center gap-2 mb-8 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                            Agentic Eye
                        </span>
                    </div>

                    <nav className="space-y-1">
                        <SidebarItem
                            icon={Youtube}
                            label="YouTube Insights Agent"
                            active={activeTab === 'youtube-insights'}
                            onClick={() => { setActiveTab('youtube-insights'); setResult(null); setUrl(''); }}
                        />
                        <SidebarItem
                            icon={Music2}
                            label="TikTok Insights Agent"
                            active={activeTab === 'tiktok-insights'}
                            onClick={() => { setActiveTab('tiktok-insights'); setResult(null); setUrl(''); }}
                        />
                        <SidebarItem
                            icon={Video}
                            label="Video Request"
                            active={activeTab === 'video-request'}
                            onClick={() => setActiveTab('video-request')}
                        />
                        <div className="my-4 border-t border-gray-100"></div>
                        <SidebarItem
                            icon={History}
                            label="History"
                            active={activeTab === 'history'}
                            onClick={() => setActiveTab('history')}
                        />
                        <SidebarItem
                            icon={CreditCard}
                            label="Credit History"
                            active={activeTab === 'credit-history'}
                            onClick={() => setActiveTab('credit-history')}
                        />
                        <SidebarItem
                            icon={Settings}
                            label="Settings"
                            active={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                        />
                    </nav>
                </div>

                <div className="space-y-3">
                    {tier === 'Free' && (
                        <button
                            onClick={() => handleUpgrade('diamond')}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Crown className="w-4 h-4" /> Upgrade to Pro
                        </button>
                    )}

                    {tier === 'Diamond' && (
                        <button
                            onClick={() => handleUpgrade('solitaire')}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Crown className="w-4 h-4" /> Upgrade to Solitaire
                        </button>
                    )}

                    {tier !== 'Free' && (
                        <button
                            onClick={() => window.location.href = '/pricing'}
                            className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Settings className="w-4 h-4" /> Change Plan
                        </button>
                    )}

                    <Link href="/" className="w-full py-2.5 px-4 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-all flex items-center justify-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> Back to Home
                    </Link>



                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                            <div className="flex flex-col">
                                <p className="text-xs text-gray-500">{tier} Plan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
                {(activeTab === 'youtube-insights' || activeTab === 'tiktok-insights') && (
                    <div className="max-w-5xl mx-auto">
                        {!result ? (
                            <DashboardHome
                                user={user}
                                activeTab={activeTab}
                                credits={credits}
                                tier={tier}
                                history={history}
                                url={url}
                                loading={loading}
                                setUrl={setUrl}
                                handleAnalyze={handleAnalyze}
                                setResult={setResult}
                                deepAnalysis={deepAnalysis}
                                setDeepAnalysis={setDeepAnalysis}
                            />
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <button onClick={() => setResult(null)} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors">
                                        <ChevronLeft className="w-5 h-5" /> Back to Dashboard
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const doc = new jsPDF();
                                                doc.setFillColor(147, 51, 234);
                                                doc.rect(0, 0, 210, 20, 'F');
                                                doc.setTextColor(255, 255, 255);
                                                doc.setFontSize(16);
                                                doc.setFont("helvetica", "bold");
                                                doc.text("Agentic Eye | Analysis Report", 10, 13);
                                                doc.setTextColor(0, 0, 0);
                                                doc.setFontSize(12);
                                                doc.text(`Video URL: ${url}`, 10, 40);
                                                const viralScore = result.viral_score || result.m3_generation?.viral_prediction_engine?.score || 0;
                                                doc.text(`Viral Score: ${viralScore}/100`, 10, 50);
                                                const sentiment = result.sentiment || {};
                                                doc.text(`Sentiment: ${sentiment.positive || 0}% Positive`, 10, 60);
                                                doc.text("\nTop Ideas:", 10, 70);
                                                const ideas = result.ideas || [];
                                                ideas.slice(0, 5).forEach((idea: string, i: number) => {
                                                    doc.text(`${i + 1}. ${idea}`, 10, 80 + (i * 10));
                                                });
                                                doc.save("analysis_report.pdf");
                                            }}
                                            className="flex items-center gap-2 text-purple-600 font-bold hover:bg-purple-50 px-4 py-2 rounded-xl transition-colors"
                                        >
                                            <Download className="w-5 h-5" /> Download Report
                                        </button>
                                    </div>
                                </div>

                                {/* Viral Score Gauge */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 bg-white rounded-3xl p-8 shadow-xl shadow-purple-500/5 border border-purple-100 flex flex-col items-center justify-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                        <h3 className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider">Viral Potential</h3>
                                        <div className="relative w-40 h-40 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                                                <circle
                                                    cx="80" cy="80" r="70"
                                                    stroke="url(#gradient)"
                                                    strokeWidth="12"
                                                    fill="none"
                                                    strokeDasharray="440"
                                                    strokeDashoffset={440 - (440 * (result.viral_score || result.m3_generation?.viral_prediction_engine?.score || 0)) / 100}
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#9333ea" />
                                                        <stop offset="100%" stopColor="#ec4899" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-black text-gray-900">{result.viral_score || result.m3_generation?.viral_prediction_engine?.score || 0}</span>
                                            <span className="text-sm text-gray-400 font-medium">/ 100</span>
                                        </div>
                                        </div>
                                        <p className="mt-4 text-center text-gray-600 font-medium">
                                            {(() => {
                                                const score = result.viral_score || result.m3_generation?.viral_prediction_engine?.score || 0;
                                                return score > 80 ? "🚀 Viral Hit Detected!" : score > 50 ? "📈 Good Potential" : "⚠️ Needs Optimization";
                                            })()}
                                        </p>
                                    </div>

                                    {/* Sentiment & Stats */}
                                    <div className="md:col-span-2 grid grid-cols-2 gap-6">
                                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Sentiment Analysis</h3>
                                            {(() => {
                                                const sentiment = result.sentiment || { positive: 0, neutral: 0, negative: 0 };
                                                return (
                                                    <>
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
                                                                <div style={{ width: `${sentiment.positive}%` }} className="bg-green-500 h-full" />
                                                                <div style={{ width: `${sentiment.neutral}%` }} className="bg-gray-400 h-full" />
                                                                <div style={{ width: `${sentiment.negative}%` }} className="bg-red-500 h-full" />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 text-center">
                                                            <div><div className="text-2xl font-bold text-green-600">{sentiment.positive || 0}%</div><div className="text-xs text-gray-400">Positive</div></div>
                                                            <div><div className="text-2xl font-bold text-gray-600">{sentiment.neutral || 0}%</div><div className="text-xs text-gray-400">Neutral</div></div>
                                                            <div><div className="text-2xl font-bold text-red-600">{sentiment.negative || 0}%</div><div className="text-xs text-gray-400">Negative</div></div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>

                                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                            <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Engagement Data</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Comments Analyzed</span>
                                                    <span className="font-bold text-xl">{result.engagement_metrics?.comments_count || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Total Likes</span>
                                                    <span className="font-bold text-xl">{(result.engagement_metrics?.total_likes || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Topics Found</span>
                                                    <span className="font-bold text-xl">{(result.topics || []).length}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Ideas */}
                                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">AI Viral Content Ideas</h3>
                                    </div>
                                    <div className="grid gap-4">
                                        {(result.ideas || []).map((idea: string, i: number) => (
                                            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-purple-50 hover:border-purple-200 transition-all group flex justify-between items-center">
                                                <div className="flex gap-4">
                                                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-gray-400 border border-gray-200 group-hover:border-purple-300 group-hover:text-purple-600 transition-colors">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-gray-700 font-medium pt-1">{idea}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setRequestTitle(idea);
                                                        setActiveTab('video-request');
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg transition-all"
                                                >
                                                    Create Video
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Full Script */}
                                {result.full_script && (
                                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-2xl">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                    <Play className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="text-xl font-bold">Generated Script</h3>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">READY TO FILM</span>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-6 font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap border border-white/10">
                                            {result.full_script}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'video-request' && (
                    <VideoRequestForm
                        requestTitle={requestTitle}
                        setRequestTitle={setRequestTitle}
                        requestStyle={requestStyle}
                        setRequestStyle={setRequestStyle}
                        requestDuration={requestDuration}
                        setRequestDuration={setRequestDuration}
                        requestTone={requestTone}
                        setRequestTone={setRequestTone}
                        requestNotes={requestNotes}
                        setRequestNotes={setRequestNotes}
                        submittingRequest={submittingRequest}
                        handleSubmitVideoRequest={handleSubmitVideoRequest}
                        videoRequests={videoRequests}
                        tier={tier}
                        credits={credits}
                    />
                )}

                {activeTab === 'history' && (
                    <HistoryTab
                        history={history}
                        tier={tier}
                        setResult={setResult}
                        setUrl={setUrl}
                        setActiveTab={setActiveTab}
                    />
                )}

                {activeTab === 'credit-history' && (
                    <CreditHistoryTab
                        credits={credits}
                        tier={tier}
                        transactions={transactions}
                    />
                )}

                {activeTab === 'settings' && (
                    <SettingsTab tier={tier} />
                )}
            </main>

            {/* Upgrade Modal Overlay */}
            <AnimatePresence>
                {showUpgrade && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Out of Credits</h2>
                            <p className="text-gray-500 mb-8">You need more credits to perform this analysis. Upgrade to Pro for unlimited access.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowUpgrade(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => handleUpgrade('diamond')} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
