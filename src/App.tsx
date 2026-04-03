import React, {useEffect, useMemo, useState} from 'react';
import {Pencil, Plus, Sparkles, Tag, Trash2, WalletCards, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';

type Category = '영상' | '음악' | 'AI' | '쇼핑' | '기타';
type SortOption = 'price-desc' | 'price-asc' | 'name-asc';

interface Subscription {
  id: string;
  name: string;
  price: number;
  category: Category;
}

const STORAGE_KEY = 'digital-rent-subscriptions';

const theme = {
  primary: '#CCFF00',
  onPrimary: '#1A2000',
  primaryContainer: '#ECFF9C',
  onPrimaryContainer: '#263000',
  surface: '#FCFDF8',
  surfaceSubtle: '#F3F6EA',
  surfaceContainer: '#FFFFFF',
  surfaceContainerHigh: '#EFF3E4',
  surfaceContainerHighest: '#E7ECD9',
  onSurface: '#111827',
  onSurfaceSoft: '#3F4A3B',
  onSurfaceVariant: '#5E6B58',
  outline: '#96A18F',
  danger: '#C7381C',
  dangerSoft: '#FFE0DA',
  shadow: '0 22px 48px rgba(17, 24, 39, 0.12)',
};

const categoryOptions: Category[] = ['영상', '음악', 'AI', '쇼핑', '기타'];

const categoryMeta: Record<Category, {emoji: string; bg: string; color: string}> = {
  영상: {emoji: 'TV', bg: '#E8F1FF', color: '#244C8F'},
  음악: {emoji: 'SND', bg: '#FFF1E2', color: '#9A5614'},
  AI: {emoji: 'AI', bg: '#ECFF9C', color: '#314200'},
  쇼핑: {emoji: 'BAG', bg: '#FFE5F2', color: '#9A2165'},
  기타: {emoji: 'ETC', bg: '#EEF2F7', color: '#435164'},
};

const defaultSubscriptions: Subscription[] = [
  {id: '1', name: '넷플릭스', price: 17000, category: '영상'},
  {id: '2', name: '유튜브 프리미엄', price: 14900, category: '영상'},
  {id: '3', name: '스포티파이', price: 10900, category: '음악'},
  {id: '4', name: '제미나이', price: 29000, category: 'AI'},
  {id: '5', name: '클로드', price: 29000, category: 'AI'},
];

function getLogoUrl(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('유튜브') || lower.includes('youtube')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg';
  }
  if (lower.includes('스포티파이') || lower.includes('spotify')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg';
  }
  if (lower.includes('쿠팡') || lower.includes('coupang')) return 'https://logo.clearbit.com/coupang.com';
  if (lower.includes('티빙') || lower.includes('tving')) return 'https://logo.clearbit.com/tving.com';
  if (lower.includes('웨이브') || lower.includes('wavve')) return 'https://logo.clearbit.com/wavve.com';
  if (lower.includes('디즈니') || lower.includes('disney')) return 'https://logo.clearbit.com/disneyplus.com';
  if (lower.includes('애플') || lower.includes('apple')) return 'https://logo.clearbit.com/apple.com';
  return null;
}

function isValidCategory(category: unknown): category is Category {
  return typeof category === 'string' && categoryOptions.includes(category as Category);
}

function loadSubscriptions() {
  if (typeof window === 'undefined') {
    return defaultSubscriptions;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultSubscriptions;

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return defaultSubscriptions;

    const normalized = parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const candidate = item as Partial<Subscription>;
        if (typeof candidate.id !== 'string') return null;
        if (typeof candidate.name !== 'string' || !candidate.name.trim()) return null;
        if (typeof candidate.price !== 'number' || Number.isNaN(candidate.price) || candidate.price < 0) return null;

        const category = isValidCategory(candidate.category) ? candidate.category : '기타';

        return {
          id: candidate.id,
          name: candidate.name.trim(),
          price: candidate.price,
          category,
        } satisfies Subscription;
      })
      .filter((item): item is Subscription => item !== null);

    return normalized.length > 0 ? normalized : defaultSubscriptions;
  } catch {
    return defaultSubscriptions;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR', {style: 'currency', currency: 'KRW', maximumFractionDigits: 0}).format(value);
}

export default function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadSubscriptions());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>('영상');
  const [sortBy, setSortBy] = useState<SortOption>('price-desc');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

  const totalCost = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  }, [subscriptions]);

  const yearlyCost = useMemo(() => totalCost * 12, [totalCost]);

  const categorySummary = useMemo(() => {
    return subscriptions.reduce<Record<Category, number>>(
      (acc, sub) => {
        acc[sub.category] += 1;
        return acc;
      },
      {영상: 0, 음악: 0, AI: 0, 쇼핑: 0, 기타: 0},
    );
  }, [subscriptions]);

  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'price-asc') return a.price - b.price;
      return a.name.localeCompare(b.name, 'ko-KR');
    });
  }, [subscriptions, sortBy]);

  const isEditing = editingId !== null;

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('영상');
    setEditingId(null);
  };

  const openCreateSheet = () => {
    resetForm();
    setIsSheetOpen(true);
  };

  const openEditSheet = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setName(subscription.name);
    setPrice(String(subscription.price));
    setCategory(subscription.category);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const numericPrice = Number(price);

    if (!trimmedName || !price || Number.isNaN(numericPrice) || numericPrice < 0) return;

    if (isEditing) {
      setSubscriptions((current) =>
        current.map((sub) =>
          sub.id === editingId
            ? {
                ...sub,
                name: trimmedName,
                price: numericPrice,
                category,
              }
            : sub,
        ),
      );
    } else {
      setSubscriptions((current) => [
        ...current,
        {
          id: Date.now().toString(),
          name: trimmedName,
          price: numericPrice,
          category,
        },
      ]);
    }

    closeSheet();
  };

  const handleRemove = (id: string) => {
    setSubscriptions((current) => current.filter((sub) => sub.id !== id));
  };

  return (
    <div
      className="min-h-screen p-0 sm:p-4"
      style={{
        background:
          'radial-gradient(circle at top left, rgba(204,255,0,0.26), transparent 32%), linear-gradient(180deg, #F9FBEF 0%, #EFF4E5 100%)',
      }}
    >
      <div
        className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden sm:min-h-[880px] sm:rounded-[36px]"
        style={{backgroundColor: theme.surface, boxShadow: theme.shadow}}
      >
        <header className="relative overflow-hidden px-6 pb-6 pt-12">
          <div
            className="absolute inset-x-0 top-0 h-32 opacity-80"
            style={{
              background:
                'radial-gradient(circle at 20% 10%, rgba(204,255,0,0.55), transparent 35%), radial-gradient(circle at 90% 20%, rgba(236,255,156,0.8), transparent 28%)',
            }}
          />
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase" style={{backgroundColor: theme.primaryContainer, color: theme.onPrimaryContainer}}>
              <Sparkles size={14} />
              브라우저에 자동 저장됨
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-black tracking-tight" style={{color: theme.onSurface}}>
                  디지털 사글세
                </h1>
                <p className="mt-2 text-sm leading-6" style={{color: theme.onSurfaceSoft}}>
                  매달 빠져나가는 구독료를 한 화면에서 정리하고, 연간 부담까지 한 번에 체크하세요.
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] text-3xl" style={{backgroundColor: theme.primary}}>
                💸
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-28 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <section className="mb-5 rounded-[32px] p-5" style={{backgroundColor: theme.surfaceContainer}}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-sm font-medium" style={{color: theme.onSurfaceVariant}}>
                  이번 달 총 사글세
                </span>
                <motion.div
                  key={totalCost}
                  initial={{scale: 0.96, opacity: 0.6}}
                  animate={{scale: 1, opacity: 1}}
                  className="mt-2 text-[30px] font-black tracking-tight sm:text-[34px]"
                  style={{color: theme.onSurface}}
                >
                  {formatCurrency(totalCost)}
                </motion.div>
                <p className="mt-2 text-sm" style={{color: theme.onSurfaceVariant}}>
                  1년이면 {formatCurrency(yearlyCost)} 정도 나가요.
                </p>
              </div>

              <div className="rounded-[24px] px-4 py-3 text-right" style={{backgroundColor: theme.surfaceSubtle}}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{color: theme.onSurfaceVariant}}>
                  active
                </p>
                <p className="mt-1 text-3xl font-black" style={{color: theme.onSurface}}>
                  {subscriptions.length}
                </p>
                <p className="text-xs" style={{color: theme.onSurfaceVariant}}>
                  subscriptions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categoryOptions.map((item) => (
                <div key={item} className="rounded-[22px] px-4 py-3" style={{backgroundColor: theme.surfaceSubtle}}>
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="inline-flex min-w-10 items-center justify-center rounded-full px-2 py-1 text-[10px] font-black tracking-[0.12em]"
                      style={{backgroundColor: categoryMeta[item].bg, color: categoryMeta[item].color}}
                    >
                      {categoryMeta[item].emoji}
                    </span>
                    <span className="text-sm font-semibold" style={{color: theme.onSurface}}>
                      {item}
                    </span>
                  </div>
                  <span className="text-xs" style={{color: theme.onSurfaceVariant}}>
                    {categorySummary[item]}개 관리 중
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between px-1">
              <div>
                <h2 className="text-[18px] font-bold" style={{color: theme.onSurface}}>
                  사글세 목록
                </h2>
                <p className="mt-1 text-xs" style={{color: theme.onSurfaceVariant}}>
                  이름, 카테고리, 월 요금을 수정하고 정리할 수 있어요.
                </p>
              </div>

              <div className="relative flex items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none rounded-full px-4 py-2 pr-9 text-sm font-semibold outline-none"
                  style={{backgroundColor: theme.surfaceContainerHigh, color: theme.onSurface}}
                >
                  <option value="price-desc">가격 높은순</option>
                  <option value="price-asc">가격 낮은순</option>
                  <option value="name-asc">가나다순</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{color: theme.onSurfaceVariant}}>
                  ▼
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {sortedSubscriptions.length === 0 ? (
                  <motion.div
                    initial={{opacity: 0, y: 12}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0}}
                    className="rounded-[28px] px-6 py-10 text-center"
                    style={{backgroundColor: theme.surfaceContainer, border: `1px dashed ${theme.surfaceContainerHighest}`}}
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl" style={{backgroundColor: theme.primaryContainer}}>
                      🧾
                    </div>
                    <h3 className="text-lg font-bold" style={{color: theme.onSurface}}>
                      아직 등록된 사글세가 없어요
                    </h3>
                    <p className="mx-auto mt-2 max-w-[240px] text-sm leading-6" style={{color: theme.onSurfaceVariant}}>
                      첫 구독을 추가하면 이 브라우저에 자동으로 저장되고, 월간과 연간 총액도 바로 계산됩니다.
                    </p>
                    <button
                      onClick={openCreateSheet}
                      className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold"
                      style={{backgroundColor: theme.primary, color: theme.onPrimary}}
                    >
                      <Plus size={16} />
                      첫 구독 추가하기
                    </button>
                  </motion.div>
                ) : (
                  sortedSubscriptions.map((sub) => {
                    const logoUrl = getLogoUrl(sub.name);
                    const meta = categoryMeta[sub.category];

                    return (
                      <motion.div
                        key={sub.id}
                        layout
                        initial={{opacity: 0, y: 18}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, scale: 0.97}}
                        className="relative overflow-hidden rounded-[26px] p-[1px]"
                        style={{
                          background: 'linear-gradient(135deg, rgba(204,255,0,0.65), rgba(239,243,228,0.85))',
                        }}
                      >
                        <div className="rounded-[25px] p-4" style={{backgroundColor: theme.surfaceContainer}}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-4">
                              <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xs font-black tracking-[0.14em]"
                                style={{backgroundColor: logoUrl ? theme.surfaceSubtle : meta.bg, color: meta.color}}
                              >
                                {logoUrl ? (
                                  <img
                                    src={logoUrl}
                                    alt={sub.name}
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  meta.emoji
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-[16px] font-bold" style={{color: theme.onSurface}}>
                                    {sub.name}
                                  </h3>
                                  <span
                                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                                    style={{backgroundColor: meta.bg, color: meta.color}}
                                  >
                                    <Tag size={12} />
                                    {sub.category}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs" style={{color: theme.onSurfaceVariant}}>
                                  {sub.category} 카테고리 구독 · 브라우저에 자동 저장됨
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-[18px] font-black" style={{color: theme.onSurface}}>
                                {formatCurrency(sub.price)}
                              </p>
                              <p className="text-xs" style={{color: theme.onSurfaceVariant}}>
                                연 {formatCurrency(sub.price * 12)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold" style={{backgroundColor: theme.surfaceSubtle, color: theme.onSurfaceSoft}}>
                              <WalletCards size={14} />
                              매달 빠져나가는 비용
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditSheet(sub)}
                                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold"
                                style={{backgroundColor: theme.surfaceContainerHigh, color: theme.onSurface}}
                              >
                                <Pencil size={14} />
                                수정
                              </button>
                              <button
                                onClick={() => handleRemove(sub.id)}
                                className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold"
                                style={{backgroundColor: theme.dangerSoft, color: theme.danger}}
                              >
                                <Trash2 size={14} />
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>

        <button
          onClick={openCreateSheet}
          className="absolute bottom-7 right-6 z-20 flex h-[64px] w-[64px] items-center justify-center rounded-[22px] transition-transform hover:scale-105 active:scale-95"
          style={{backgroundColor: theme.primary, color: theme.onPrimary, boxShadow: '0 16px 32px rgba(204,255,0,0.28)'}}
          aria-label="구독 추가"
        >
          <Plus size={28} />
        </button>

        <AnimatePresence>
          {isSheetOpen && (
            <>
              <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                onClick={closeSheet}
                className="absolute inset-0 z-30 bg-black/30"
              />

              <motion.div
                initial={{y: '100%'}}
                animate={{y: 0}}
                exit={{y: '100%'}}
                transition={{type: 'spring', damping: 24, stiffness: 220}}
                className="absolute bottom-0 left-0 right-0 z-40 rounded-t-[32px] p-6"
                style={{backgroundColor: theme.surfaceContainer}}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black" style={{color: theme.onSurface}}>
                      {isEditing ? '구독 수정' : '새 구독 추가'}
                    </h3>
                    <p className="mt-1 text-sm" style={{color: theme.onSurfaceVariant}}>
                      이름, 월 요금, 카테고리를 입력하면 바로 반영돼요.
                    </p>
                  </div>
                  <button
                    onClick={closeSheet}
                    className="rounded-full p-2"
                    style={{backgroundColor: theme.surfaceContainerHigh, color: theme.onSurfaceVariant}}
                    aria-label="닫기"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="px-1 text-sm font-medium" style={{color: theme.onSurfaceVariant}}>
                      항목 이름
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="예: 넷플릭스"
                      className="rounded-2xl px-4 py-4 text-base outline-none"
                      style={{
                        backgroundColor: theme.surface,
                        color: theme.onSurface,
                        border: `1px solid ${theme.surfaceContainerHighest}`,
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="price" className="px-1 text-sm font-medium" style={{color: theme.onSurfaceVariant}}>
                      월 요금
                    </label>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="예: 17000"
                      className="rounded-2xl px-4 py-4 text-base outline-none"
                      style={{
                        backgroundColor: theme.surface,
                        color: theme.onSurface,
                        border: `1px solid ${theme.surfaceContainerHighest}`,
                      }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="px-1 text-sm font-medium" style={{color: theme.onSurfaceVariant}}>
                      카테고리
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {categoryOptions.map((item) => {
                        const meta = categoryMeta[item];
                        const isSelected = category === item;

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setCategory(item)}
                            className="rounded-2xl px-3 py-3 text-sm font-bold transition-transform active:scale-[0.98]"
                            style={{
                              backgroundColor: isSelected ? theme.primary : meta.bg,
                              color: isSelected ? theme.onPrimary : meta.color,
                            }}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!name.trim() || !price}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-[22px] py-4 text-base font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                    style={{backgroundColor: theme.primary, color: theme.onPrimary}}
                  >
                    {isEditing ? <Pencil size={18} /> : <Plus size={18} />}
                    {isEditing ? '수정하기' : '추가하기'}
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
