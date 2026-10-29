'use client';

import { useState } from 'react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function AddItemModal({ isOpen, onClose, onSubmit }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [fridgeType, setFridgeType] = useState('NORMAL');
  const [expiryDate, setExpiryDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      fridgeType,
      expiryDate,
      quantity: 1,
      unit: '개',
      category: 'ETC',
      memo: '',
    });
    
    setName('');
    setExpiryDate('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-0 md:flex md:items-center md:justify-center z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-primary mb-4">식재료 등록</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">식재료명</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                placeholder="예: 우유"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">냉장고</label>
              <select
                value={fridgeType}
                onChange={(e) => setFridgeType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
              >
                <option value="NORMAL">일반</option>
                <option value="KIMCHI">김치</option>
                <option value="SIDE_DISH">밑반찬</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">유통기한</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 border-2 border-gray-300 rounded-lg font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-accent text-white rounded-lg font-semibold"
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
