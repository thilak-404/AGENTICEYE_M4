import { useState } from 'react';
import { History, Search, ArrowRight, Lock } from 'lucide-react';

interface HistoryTabProps {
    history: any[];
    tier: string;
    setResult: (result: any) => void;
    setUrl: (url: string) => void;
    setActiveTab: (tab: string) => void;
}

export default function HistoryTab({ history, tier, setResult, setUrl, setActiveTab }: HistoryTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    // Tier Logic
    const isFree = tier === 'Free';
    const isDiamond = tier === 'Diamond';
    const limit = isFree ? 1 : isDiamond ? 10 : Infinity;

    const filteredHistory = history
        .filter(item => item.videoUrl.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

    const displayedHistory = filteredHistory.slice(0, limit);
    const hiddenCount = filteredHistory.length - displayedHistory.length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-6 h-6 text-purple-600" />
                    Analysis History
                </h2>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search URLs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No history yet</h3>
                    <p className="text-gray-500">Your analysis reports will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayedHistory.map((item, i) => {
                        let resultData: any = {};
                        try {
                            resultData = typeof item.result === 'string' ? JSON.parse(item.result) : item.result;
                        } catch (e) {
                            console.error('Failed to parse history result:', e);
                        }
                        const viralScore = resultData?.viral_score || resultData?.m3_generation?.viral_prediction_engine?.score || 0;
                        return (
                            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-gray-900 truncate max-w-md">{item.videoUrl}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-900">Score</div>
                                            <div className={`text-lg font-bold ${viralScore >= 80 ? 'text-green-600' :
                                                    viralScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {viralScore}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setResult(resultData);
                                                setUrl(item.videoUrl);
                                                setActiveTab('youtube-insights');
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-purple-600 transition-colors"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {hiddenCount > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 text-center">
                            <Lock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                            <p className="text-purple-900 font-medium mb-2">
                                {hiddenCount} older reports are locked.
                            </p>
                            <p className="text-sm text-purple-700 mb-4">
                                Upgrade to {isFree ? 'Diamond' : 'Solitaire'} to access your full history.
                            </p>
                            <button onClick={() => window.location.href = '/pricing'} className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors">
                                Upgrade Now
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
