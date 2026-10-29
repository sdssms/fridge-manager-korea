'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays } from 'date-fns';
import StatCard from './components/StatCard';
import FoodCard from './components/FoodCard';
import AddItemModal from './components/AddItemModal';

type FoodItem = {
  id: string;
  name: string;
  category: string;
  expiryDate: string | null;
  quantity: number | null;
  unit: string | null;
  cubeCount: number | null;
  fridge: {
    name: string;
    type: string;
  };
};

type FilterType = 'ALL' | 'NORMAL' | 'KIMCHI' | 'SIDE_DISH' | 'BABY_FOOD';

const fridgeTypeLabels: Record<string, string> = {
  NORMAL: '일반 냉장고',
  KIMCHI: '김치 냉장고',
  SIDE_DISH: '밑반찬 냉장고',
};

const getCategoryEmoji = (category: string, name: string) => {
  const emojiMap: Record<string, string> = {
    DAIRY: '🥛',
    VEGETABLE_FRUIT: '🥬',
    MEAT_FISH: '🐟',
    KIMCHI: '🥬',
    SIDE_DISH: '🍱',
    BABY_FOOD: '🍼',
    SOUP_STEW: '🍲',
    SAUCE_SEASONING: '🧂',
    ETC: '📦',
  };
  
  // 이름 기반 매칭
  if (name.includes('우유')) return '🥛';
  if (name.includes('계란')) return '🥚';
  if (name.includes('김치')) return '🥬';
  if (name.includes('나물')) return '🥬';
  if (name.includes('멸치')) return '🐟';
  if (name.includes('큐브') || name.includes('이유식')) return '🍼';
  
  return emojiMap[category] || '📦';
};

const getDaysLeft = (expiryDate: string | null) => {
  if (!expiryDate) return 999;
  return differenceInDays(new Date(expiryDate), new Date());
};

export default function Home() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (formData: any) => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          expiryDate: formData.expiryDate,
          quantity: formData.quantity,
          unit: formData.unit,
          fridgeType: formData.fridgeType,
          memo: formData.memo,
        }),
      });
      
      if (res.ok) {
        await fetchItems();
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  // 통계 계산
  const urgentItems = items.filter(item => {
    const days = getDaysLeft(item.expiryDate);
    return days <= 2;
  });

  const warningItems = items.filter(item => {
    const days = getDaysLeft(item.expiryDate);
    return days > 2 && days <= 5;
  });

  const freshItems = items.filter(item => {
    const days = getDaysLeft(item.expiryDate);
    return days > 5;
  });

  // 필터링
  const filteredItems = items.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'BABY_FOOD') return item.category === 'BABY_FOOD';
    return item.fridge.type === filter;
  });

  // 정렬 (유통기한 빠른 순)
  const sortedItems = [...filteredItems].sort((a, b) => {
    const daysA = getDaysLeft(a.expiryDate);
    const daysB = getDaysLeft(b.expiryDate);
    return daysA - daysB;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-600 text-body-md">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bg-secondary pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <h1 className="text-h3 text-primary font-bold">Fresh Keep</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-xl">🔔</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-xl">⚙️</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 통계 카드 */}
        <section className="mb-8">
          <h2 className="text-h4 font-semibold text-primary mb-4">냉장고 현황</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <StatCard
              icon="🔴"
              label="긴급"
              count={urgentItems.length}
              color="urgent"
              description="D-2 이하"
              onClick={() => {/* TODO: 필터 */}}
            />
            <StatCard
              icon="🟡"
              label="주의"
              count={warningItems.length}
              color="warning"
              description="D-5 이하"
              onClick={() => {/* TODO: 필터 */}}
            />
            <StatCard
              icon="🟢"
              label="신선"
              count={freshItems.length}
              color="fresh"
              description="D+6 이상"
              onClick={() => {/* TODO: 필터 */}}
            />
          </div>
        </section>

        {/* 빠른 액션 */}
        <section className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              className="flex items-center justify-center gap-2 bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-accent transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">📝</span>
              <span className="text-body-md font-medium text-primary">장보기 리스트</span>
            </motion.button>
            <motion.button
              className="flex items-center justify-center gap-2 bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-accent transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">👨‍🍳</span>
              <span className="text-body-md font-medium text-primary">오늘 뭐 먹지?</span>
            </motion.button>
          </div>
        </section>

        {/* 필터 탭 */}
        <section className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { key: 'ALL', label: '전체', count: items.length },
              { key: 'NORMAL', label: '일반', count: items.filter(i => i.fridge.type === 'NORMAL').length },
              { key: 'KIMCHI', label: '김치', count: items.filter(i => i.fridge.type === 'KIMCHI').length },
              { key: 'SIDE_DISH', label: '밑반찬', count: items.filter(i => i.fridge.type === 'SIDE_DISH').length },
              { key: 'BABY_FOOD', label: '이유식', count: items.filter(i => i.category === 'BABY_FOOD').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as FilterType)}
                className={`
                  px-4 py-2 rounded-lg text-body-md font-medium whitespace-nowrap transition-all
                  ${filter === tab.key
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </section>

        {/* 정렬 */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-body-sm text-text-secondary">
            총 {sortedItems.length}개
          </p>
          <select className="text-body-sm text-text-secondary bg-white border border-gray-300 rounded-lg px-3 py-1.5">
            <option>유통기한 빠른 순</option>
            <option>유통기한 늦은 순</option>
            <option>등록일 최신순</option>
            <option>이름 가나다순</option>
          </select>
        </div>

        {/* 식재료 그리드 */}
        <section>
          {sortedItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏪</div>
              <h3 className="text-h3 font-semibold text-primary mb-2">냉장고가 비어있어요</h3>
              <p className="text-body-md text-text-secondary mb-6">
                첫 식재료를 등록해보세요!
              </p>
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-accent-light transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">+</span>
                첫 식재료 등록하기
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {sortedItems.map((item, index) => (
                  <FoodCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    emoji={getCategoryEmoji(item.category, item.name)}
                    daysUntilExpiry={getDaysLeft(item.expiryDate)}
                    fridgeType={fridgeTypeLabels[item.fridge.type] || item.fridge.name}
                    quantity={
                      item.cubeCount
                        ? `${item.cubeCount}큐브`
                        : item.quantity && item.unit
                        ? `${item.quantity}${item.unit}`
                        : undefined
                    }
                    onClick={() => {/* TODO: 상세 보기 */}}
                    onMenuClick={(e) => {
                      e.stopPropagation();
                      // TODO: 메뉴
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      {/* FAB */}
      <motion.button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-accent text-white rounded-full shadow-xl flex items-center justify-center text-3xl hover:bg-accent-light transition-colors z-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        +
      </motion.button>

      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
