'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">🏠 Fresh Keep</h1>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">🔔</Button>
            <Button variant="ghost" size="icon">⚙️</Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-red-500 text-2xl mb-1">🔴</div>
            <div className="text-sm text-gray-600">긴급</div>
            <div className="text-2xl font-bold">{items.filter(i => getDaysLeft(i.expiryDate) <= 2).length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-orange-500 text-2xl mb-1">🟡</div>
            <div className="text-sm text-gray-600">주의</div>
            <div className="text-2xl font-bold">{items.filter(i => getDaysLeft(i.expiryDate) > 2 && getDaysLeft(i.expiryDate) <= 5).length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-green-500 text-2xl mb-1">🟢</div>
            <div className="text-sm text-gray-600">신선</div>
            <div className="text-2xl font-bold">{items.filter(i => getDaysLeft(i.expiryDate) > 5).length}</div>
          </div>
        </div>

        {/* 식재료 리스트 */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">전체 식재료 ({items.length})</h2>
          </div>
          <div className="divide-y">
            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                등록된 식재료가 없습니다
              </div>
            ) : (
              items.map((item) => {
                const days = getDaysLeft(item.expiryDate);
                const color = days <= 2 ? 'text-red-500' : days <= 5 ? 'text-orange-500' : 'text-green-500';
                
                return (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.fridge.type} · {item.quantity}{item.unit}</p>
                    </div>
                    <div className={`text-right ${color}`}>
                      <div className="font-semibold">D{days >= 0 ? '+' : ''}{days}</div>
                      <div className="text-xs">{item.expiryDate}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <Button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg"
        size="icon"
      >
        <span className="text-2xl">+</span>
      </Button>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>식재료 등록</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">식재료명</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 우유"
                required
              />
            </div>

            <div>
              <Label>냉장고</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
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
                    className="h-16 flex flex-col"
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-xs">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="expiryDate">유통기한</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                취소
              </Button>
              <Button type="submit" className="flex-1">
                저장
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
