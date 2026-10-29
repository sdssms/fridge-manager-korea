'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function AddItemModal({ isOpen, onClose, onSubmit }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [fridgeType, setFridgeType] = useState('NORMAL');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        name,
        fridgeType,
        expiryDate,
        quantity: 1,
        unit: '개',
        category: 'ETC',
        memo: '',
      });
      
      // 폼 초기화
      setName('');
      setExpiryDate('');
      setFridgeType('NORMAL');
      onClose();
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickDays = [
    { label: '오늘', days: 0 },
    { label: '내일', days: 1 },
    { label: '3일', days: 3 },
    { label: '7일', days: 7 },
  ];

  const handleQuickDay = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setExpiryDate(date.toISOString().split('T')[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">식재료 등록</DialogTitle>
          <DialogDescription>
            냉장고에 새로운 식재료를 추가합니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
              className="text-base"
            />
            
            {/* 자주 등록하는 항목 */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-sm text-gray-500">자주 등록:</span>
              {['🥛 우유', '🥚 계란', '🥬 김치', '🍚 쌀'].map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setName(item.split(' ')[1])}
                  className="h-7 text-sm"
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>

          {/* 냉장고 선택 */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              냉장고 선택 <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
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
                  className="h-20 flex flex-col gap-1"
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* 유통기한 */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              유통기한 <span className="text-red-500">*</span>
            </Label>
            
            {/* 빠른 선택 버튼 */}
            <div className="grid grid-cols-4 gap-2">
              {quickDays.map((item) => (
                <Button
                  key={item.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDay(item.days)}
                  className="h-9"
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {/* 직접 입력 */}
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="text-base"
            />

            {/* 미리보기 */}
            {expiryDate && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm text-gray-600">
                  선택한 날짜: <strong>{expiryDate}</strong>
                </p>
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent-light"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
