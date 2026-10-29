'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Bell, Settings, ShoppingCart, ChefHat } from 'lucide-react';

type FoodItem = {
  id: string;
  name: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  category: string;
  fridge: {
    type: string;
  };
};

export default function Home() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // 폼 상태
  const [name, setName] = useState('');
  const [fridgeType, setFridgeType] = useState('NORMAL');
  const [expiryDate, setExpiryDate] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          fridgeType,
          expiryDate,
          quantity: 1,
          unit: '개',
          category: 'ETC',
        }),
      });

      if (res.ok) {
        await fetchItems();
        setName('');
        setExpiryDate('');
        setFridgeType('NORMAL');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const getDaysLeft = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setExpiryDate(date.toISOString().split('T')[0]);
  };

  const urgentCount = items.filter(i => getDaysLeft(i.expiryDate) <= 2).length;
  const warningCount = items.filter(i => getDaysLeft(i.expiryDate) > 2 && getDaysLeft(i.expiryDate) <= 5).length;
  const freshCount = items.filter(i => getDaysLeft(i.expiryDate) > 5).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header - 모바일 최적화 */}
      <header className="bg-white border-b sticky top-0 z-20 safe-top">
        <div className="px-4 py-4 flex items-center justify-between max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <span>🏠</span>
            <span>Fresh Keep</span>
          </h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 pb-24 md:pb-8">
        {/* 통계 카드 - 모바일: 세로 스택, 태블릿+: 가로 3개 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-red-100">
            <div className="text-3xl md:text-4xl mb-2">🔴</div>
            <div className="text-xs md:text-sm text-gray-600 mb-1">긴급</div>
            <div className="text-2xl md:text-3xl font-bold text-red-500">{urgentCount}</div>
            <div className="text-xs text-gray-500 mt-1">D-2 이하</div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-orange-100">
            <div className="text-3xl md:text-4xl mb-2">🟡</div>
            <div className="text-xs md:text-sm text-gray-600 mb-1">주의</div>
            <div className="text-2xl md:text-3xl font-bold text-orange-500">{warningCount}</div>
            <div className="text-xs text-gray-500 mt-1">D-5 이하</div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-green-100">
            <div className="text-3xl md:text-4xl mb-2">🟢</div>
            <div className="text-xs md:text-sm text-gray-600 mb-1">신선</div>
            <div className="text-2xl md:text-3xl font-bold text-green-500">{freshCount}</div>
            <div className="text-xs text-gray-500 mt-1">D+6 이상</div>
          </div>
        </div>

        {/* 빠른 액션 - 모바일 최적화 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            variant="outline" 
            className="h-14 md:h-12 flex items-center justify-center gap-2 text-base md:text-sm font-medium"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>장보기 리스트</span>
          </Button>
          <Button 
            variant="outline"
            className="h-14 md:h-12 flex items-center justify-center gap-2 text-base md:text-sm font-medium"
          >
            <ChefHat className="h-5 w-5" />
            <span>오늘 뭐 먹지?</span>
          </Button>
        </div>

        {/* 식재료 리스트 - 큰 터치 영역 */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-base md:text-lg">전체 식재료 ({items.length})</h2>
          </div>
          <div className="divide-y">
            {items.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">📦</div>
                <p className="text-gray-500 mb-2">등록된 식재료가 없습니다</p>
                <p className="text-sm text-gray-400">+ 버튼을 눌러 추가해보세요</p>
              </div>
            ) : (
              items.map((item) => {
                const days = getDaysLeft(item.expiryDate);
                const color = days <= 2 ? 'text-red-500' : days <= 5 ? 'text-orange-500' : 'text-green-500';
                const bgColor = days <= 2 ? 'bg-red-50' : days <= 5 ? 'bg-orange-50' : 'bg-green-50';
                
                return (
                  <button
                    key={item.id}
                    className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base md:text-lg mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.fridge.type === 'NORMAL' && '🏠 일반'}
                        {item.fridge.type === 'KIMCHI' && '🥬 김치'}
                        {item.fridge.type === 'SIDE_DISH' && '🍱 밑반찬'}
                        {item.fridge.type === 'BABY_FOOD' && '🍼 이유식'}
                        {' · '}
                        {item.quantity}{item.unit}
                      </p>
                    </div>
                    <div className={`flex flex-col items-end gap-1 ml-4 ${color}`}>
                      <div className={`px-3 py-1 rounded-full ${bgColor} font-bold text-sm md:text-base`}>
                        D{days >= 0 ? '+' : ''}{days}
                      </div>
                      <div className="text-xs text-gray-500">{item.expiryDate}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* FAB - 모바일 최적화 (큰 크기, 안전 영역) */}
      <Button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 md:bottom-6 right-6 h-16 w-16 md:h-14 md:w-14 rounded-full shadow-2xl z-30"
        size="icon"
      >
        <Plus className="h-8 w-8 md:h-6 md:w-6" />
      </Button>

      {/* Sheet (모바일) / Dialog (PC) - 반응형 모달 */}
      <Sheet open={showModal} onOpenChange={setShowModal}>
        <SheetContent side="bottom" className="h-[90vh] md:h-auto rounded-t-3xl md:rounded-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl md:text-2xl">식재료 등록</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* 식재료명 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                식재료명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 우유, 계란, 김치..."
                required
                autoFocus
                className="h-12 text-base"
              />
              
              {/* 자주 등록 */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-sm text-gray-500 w-full mb-1">자주 등록:</span>
                {['🥛 우유', '🥚 계란', '🥬 김치', '🍚 쌀'].map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setName(item.split(' ')[1])}
                    className="h-9"
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>

            {/* 냉장고 선택 - 큰 터치 영역 */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                냉장고 선택 <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'NORMAL', label: '일반', icon: '🏠' },
                  { value: 'KIMCHI', label: '김치', icon: '🥬' },
                  { value: 'SIDE_DISH', label: '밑반찬', icon: '🍱' },
                  { value: 'BABY_FOOD', label: '이유식', icon: '🍼' },
                ].map((type) => (
                  <Button
                    key={type.value}
                    type="button"
                    variant={fridgeType === type.value ? 'default' : 'outline'}
                    onClick={() => setFridgeType(type.value)}
                    className="h-24 md:h-20 flex flex-col gap-2"
                  >
                    <span className="text-3xl md:text-2xl">{type.icon}</span>
                    <span className="text-sm">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 유통기한 - 빠른 선택 */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                유통기한 <span className="text-red-500">*</span>
              </Label>
              
              {/* 빠른 선택 */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: '오늘', days: 0 },
                  { label: '내일', days: 1 },
                  { label: '3일', days: 3 },
                  { label: '7일', days: 7 },
                ].map((item) => (
                  <Button
                    key={item.label}
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickDate(item.days)}
                    className="h-11"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* 날짜 직접 선택 */}
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="h-12 text-base"
              />

              {/* 미리보기 */}
              {expiryDate && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">선택한 날짜</p>
                  <p className="font-semibold text-lg">{expiryDate}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {getDaysLeft(expiryDate)}일 남음
                  </p>
                </div>
              )}
            </div>

            {/* 버튼 - 큰 터치 영역 */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1 h-12 md:h-11 text-base"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 md:h-11 text-base"
              >
                저장하기
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </main>
  );
}
