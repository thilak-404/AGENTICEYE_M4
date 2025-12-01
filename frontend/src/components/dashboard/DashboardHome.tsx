import { Zap, Music2, Youtube } from 'lucide-react';
import StoryLoader from './StoryLoader';

interface DashboardHomeProps {
    user: any;
    activeTab: string;
    credits: number;
    tier: string;
    history: any[];
    url: string;
    loading: boolean;
    setUrl: (url: string) => void;
    handleAnalyze: () => void;
    setResult: (result: any) => void;
    deepAnalysis: boolean;
    setDeepAnalysis: (val: boolean) => void;
}

export default function DashboardHome({
    user,
    activeTab,
    credits,
    tier,
    history,
    url,
    loading,
    setUrl,
    handleAnalyze,
    setResult,
    deepAnalysis,
    setDeepAnalysis
}: DashboardHomeProps) {
    return (
        <div className="space-y-8">
            {/* Welcome Panel */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.given_name || 'Creator'} 👋</h1>
                    <p className="text-purple-100 text-lg max-w-2xl">
                        Paste any {activeTab === 'tiktok-insights' ? 'TikTok' : 'YouTube'} URL to discover what content your audience wants next.
                        Our AI analyzes comments, sentiment, and trends to predict your next viral hit.
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Credits Available</span>
                    <div className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        {credits} <span className="text-xs font-normal text-gray-400">/ {tier === 'Diamond' ? 100 : tier === 'Solitaire' ? 200 : 3}</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Videos Analyzed</span>
                    <div className="text-2xl font-black text-gray-900">{history.length}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Avg. Viral Score</span>
                    <div className="text-2xl font-black text-purple-600">
                        {history.length > 0
                            ? Math.round(history.reduce((acc, curr) => {
                                try {
                                    const res = typeof curr.result === 'string' ? JSON.parse(curr.result) : curr.result;
                                    return acc + (res?.viral_score || res?.m3_generation?.viral_prediction_engine?.score || 0);
                                } catch (e) {
                                    return acc;
                                }
                            }, 0) / history.length)
                            : 0}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Last Analysis</span>
                    <div className="text-sm font-bold text-gray-900 mt-auto">
                        {history.length > 0 ? new Date(history[0].createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 mb-6 justify-center text-gray-400">
                        {activeTab === 'tiktok-insights' ? <Music2 className="w-6 h-6" /> : <Youtube className="w-6 h-6" />}
                        <span className="font-medium">Paste Link &rarr; AI Brain &rarr; Viral Ideas</span>
                    </div>

                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-2 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100 transition-all shadow-sm hover:shadow-md">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder={activeTab === 'tiktok-insights' ? "https://tiktok.com/@user/video/..." : "https://youtube.com/watch?v=..."}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 px-4 py-3 text-lg outline-none placeholder-gray-400"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 min-w-[160px] justify-center"
                        >
                            {loading ? <StoryLoader /> : <><Zap className="w-5 h-5" /> Analyze Now</>}
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2">
                        <label className={`flex items-center gap-2 select-none ${tier === 'Free' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={deepAnalysis}
                                    onChange={(e) => tier !== 'Free' && setDeepAnalysis(e.target.checked)}
                                    disabled={tier === 'Free'}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${deepAnalysis ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${deepAnalysis ? 'translate-x-4' : ''}`}></div>
                            </div>
                            <span className={`text-sm font-medium ${deepAnalysis ? 'text-purple-700' : 'text-gray-500'}`}>
                                Deep Analysis {tier === 'Free' ? '(Upgrade to Unlock)' : '(Slower, more accurate)'}
                            </span>
                        </label>
                    </div>

                    {/* Recent History Quick Links */}
                    {history.length > 0 && (
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider py-1">Recent:</span>
                            {history.slice(0, 3).map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        const res = typeof item.result === 'string' ? JSON.parse(item.result) : item.result;
                                        setResult(res);
                                        setUrl(item.videoUrl);
                                    }}
                                    className="text-xs bg-gray-100 hover:bg-purple-50 hover:text-purple-600 text-gray-600 px-3 py-1 rounded-full transition-colors truncate max-w-[200px]"
                                >
                                    {item.videoUrl}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
