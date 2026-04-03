import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trash2, Plus, X, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Subscription {
  id: string;
  name: string;
  price: number;
}

// Material You - Vibrant Lime Theme Palette
const theme = {
  primary: '#CCFF00', // Vibrant, bright lime
  onPrimary: '#1A2000',
  primaryContainer: '#E5FF66',
  onPrimaryContainer: '#1A2000',
  surface: '#FFFFFF',
  surfaceContainer: '#F8FAFC', // Very light gray with a hint of blue
  surfaceContainerHigh: '#F1F5F9', // Slightly darker blue-gray for list items
  onSurface: '#111827',
  onSurfaceVariant: '#4B5563',
  outline: '#9CA3AF',
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',
};

// Harmonious chart colors based on the key color
const CHART_COLORS = [
  '#CCFF00', // Vibrant Lime
  '#B3E600', // Slightly deeper
  '#D9FF33', // Lighter
  '#99CC00', // Olive-ish but bright
  '#E6FF66', // Very light
  '#A6FF00', // Neon green-lime
  '#E0FF4D', // Soft neon
];

const getLogoUrl = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('유튜브') || lower.includes('youtube')) return 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg';
  if (lower.includes('스포티파이') || lower.includes('spotify')) return 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg';
  if (lower.includes('쿠팡') || lower.includes('coupang')) return 'https://logo.clearbit.com/coupang.com';
  if (lower.includes('티빙') || lower.includes('tving')) return 'https://logo.clearbit.com/tving.com';
  if (lower.includes('웨이브') || lower.includes('wavve')) return 'https://logo.clearbit.com/wavve.com';
  if (lower.includes('디즈니') || lower.includes('disney')) return 'https://logo.clearbit.com/disneyplus.com';
  if (lower.includes('애플') || lower.includes('apple')) return 'https://logo.clearbit.com/apple.com';
  return null;
};

type SortOption = 'price-desc' | 'price-asc' | 'name-asc';

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: '1', name: '넷플릭스', price: 17000 },
    { id: '2', name: '유튜브 프리미엄', price: 14900 },
    { id: '3', name: '스포티파이', price: 10900 },
    { id: '4', name: '제미나이', price: 29000 },
    { id: '5', name: '클로드', price: 29000 },
  ]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price-desc');

  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'ko-KR');
      return 0;
    });
  }, [subscriptions, sortBy]);

  const totalCost = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  }, [subscriptions]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    
    const newSub: Subscription = {
      id: Date.now().toString(),
      name: name.trim(),
      price: Number(price),
    };
    
    setSubscriptions([...subscriptions, newSub]);
    setName('');
    setPrice('');
    setIsAddModalOpen(false);
  };

  const handleRemove = (id: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center sm:p-4 font-sans">
      {/* Mobile App Container */}
      <div 
        className="w-full max-w-[400px] h-[100dvh] sm:h-[850px] sm:rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden"
        style={{ backgroundColor: theme.surface }}
      >
        {/* Top App Bar (Material 3) */}
        <header className="pt-12 pb-[32px] flex items-center justify-center z-10">
          <h1 
            className="text-[20px] font-bold tracking-tight text-center"
            style={{ color: theme.onSurface }}
          >
            디지털 사글세 💸
          </h1>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-[20px] pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Dashboard Card (Chart & Total) */}
          <div 
            className="rounded-[28px] p-[20px] mb-[32px] flex flex-row items-center justify-between relative overflow-hidden"
            style={{ backgroundColor: theme.surfaceContainer }}
          >
            <div className="flex flex-col z-10 flex-1 pr-4">
              <span 
                className="text-sm font-medium mb-2"
                style={{ color: theme.outline }}
              >
                이번 달 총 사글세
              </span>
              <motion.div 
                key={totalCost}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl sm:text-3xl font-bold tracking-tight break-keep"
                style={{ color: theme.onSurface }}
              >
                {formatCurrency(totalCost)}
              </motion.div>
            </div>

            <div className="w-[80px] h-[80px] relative z-10 shrink-0 flex items-center justify-center text-[60px]">
              💸
            </div>
          </div>

          {/* Subscription List Header */}
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 
              className="text-[18px] font-bold"
              style={{ color: theme.onSurfaceVariant }}
            >
              사글세 목록
            </h2>
            
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-transparent pl-2 pr-[18px] py-1 text-sm font-medium outline-none cursor-pointer"
                style={{ color: theme.outline }}
              >
                <option value="price-desc">높은순</option>
                <option value="price-asc">낮은순</option>
                <option value="name-asc">가나다순</option>
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                <ArrowUpDown size={14} style={{ color: theme.outline }} />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {sortedSubscriptions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8 text-sm"
                  style={{ color: theme.outline }}
                >
                  등록된 사글세가 없습니다.
                </motion.div>
              ) : (
                sortedSubscriptions.map((sub, index) => {
                  const logoUrl = getLogoUrl(sub.name);
                  const isKeyColorBrand = sub.name.includes('넷플릭스') || sub.name.includes('제미나이') || sub.name.includes('클로드');
                  
                  return (
                    <motion.div
                      key={sub.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className="relative rounded-[20px] bg-[#FEE2E2]"
                    >
                      {/* Background Trash Icon */}
                      <div className="absolute right-0 top-0 bottom-0 w-[80px] flex items-center justify-center">
                        <button
                          onClick={() => handleRemove(sub.id)}
                          className="w-full h-full flex items-center justify-center text-[#DC2626]"
                          aria-label="삭제"
                        >
                          <Trash2 size={24} />
                        </button>
                      </div>

                      {/* Foreground Swipeable Item */}
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: -80, right: 0 }}
                        dragElastic={0.1}
                        dragDirectionLock
                        className="relative flex items-center justify-between p-[16px] rounded-[20px] z-10"
                        style={{ backgroundColor: theme.surfaceContainer }}
                      >
                        <div className="flex items-center gap-[16px]">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden shrink-0"
                            style={{ 
                              backgroundColor: logoUrl ? 'transparent' : (isKeyColorBrand ? theme.primary : CHART_COLORS[index % CHART_COLORS.length]),
                              color: theme.onPrimary
                            }}
                          >
                            {logoUrl ? (
                              <img 
                                src={logoUrl} 
                                alt={sub.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              sub.name.charAt(0)
                            )}
                          </div>
                          <span className="font-medium text-[15px]" style={{ color: theme.onSurface }}>
                            {sub.name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-bold text-[17px]" style={{ color: theme.onSurface }}>
                            {formatCurrency(sub.price)}
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* FAB (Floating Action Button) - Material 3 Style */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="absolute bottom-[41px] right-6 w-[64px] h-[64px] rounded-[20px] shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20"
          style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
        >
          <Plus size={30} />
        </button>

        {/* Bottom Sheet Modal for Adding Subscription */}
        <AnimatePresence>
          {isAddModalOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
                className="absolute inset-0 bg-black/30 z-30"
              />
              
              {/* Sheet */}
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 rounded-t-[28px] p-6 z-40 shadow-2xl flex flex-col"
                style={{ backgroundColor: theme.surfaceContainer }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-medium" style={{ color: theme.onSurface }}>새 월세 추가</h3>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 rounded-full"
                    style={{ color: theme.onSurfaceVariant, backgroundColor: theme.surfaceContainerHigh }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAdd} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-medium px-1" style={{ color: theme.onSurfaceVariant }}>
                      항목 이름
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 넷플릭스"
                      className="px-4 py-4 rounded-2xl outline-none transition-all text-base"
                      style={{ 
                        backgroundColor: theme.surface, 
                        color: theme.onSurface,
                        border: `1px solid ${theme.surfaceContainerHigh}`
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="price" className="text-sm font-medium px-1" style={{ color: theme.onSurfaceVariant }}>
                      월 요금
                    </label>
                    <input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="예: 17000"
                      className="px-4 py-4 rounded-2xl outline-none transition-all text-base"
                      style={{ 
                        backgroundColor: theme.surface, 
                        color: theme.onSurface,
                        border: `1px solid ${theme.surfaceContainerHigh}`
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!name.trim() || !price}
                    className="mt-4 w-full py-4 rounded-[20px] font-medium text-base transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: theme.primary, color: theme.onPrimary }}
                  >
                    추가하기
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
