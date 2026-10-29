'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

interface FoodCardProps {
  id: string;
  name: string;
  emoji: string;
  daysUntilExpiry: number;
  fridgeType: string;
  quantity?: string;
  category?: string;
  onClick?: () => void;
  onMenuClick?: (e: React.MouseEvent) => void;
}

function getStatusColor(days: number) {
  if (days < 0) return 'expired';
  if (days <= 2) return 'urgent';
  if (days <= 5) return 'warning';
  return 'fresh';
}

function getStatusLabel(days: number) {
  if (days < 0) return '만료됨';
  if (days === 0) return '오늘';
  if (days === 1) return 'D-1';
  if (days <= 2) return `D-${days}`;
  return `D+${days}`;
}

const statusStyles = {
  expired: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    badge: 'bg-gray-200 text-gray-700',
  },
  urgent: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
  },
  warning: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
  },
  fresh: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    badge: 'bg-green-100 text-green-700',
  },
};

export default function FoodCard({
  id,
  name,
  emoji,
  daysUntilExpiry,
  fridgeType,
  quantity,
  category,
  onClick,
  onMenuClick,
}: FoodCardProps) {
  const status = getStatusColor(daysUntilExpiry);
  const statusLabel = getStatusLabel(daysUntilExpiry);
  const styles = statusStyles[status];

  return (
    <motion.div
      className="bg-white rounded-lg p-5 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Menu Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={onMenuClick}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Emoji */}
      <div className="text-5xl text-center mb-3">
        {emoji}
      </div>

      {/* Name */}
      <h3 className="text-lg font-semibold text-center mb-2 text-gray-900">
        {name}
      </h3>

      {/* Status Badge */}
      <div className="flex justify-center mb-3">
        <span className={clsx(
          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold',
          styles.badge
        )}>
          {statusLabel}
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center justify-center gap-1">
          <span>🏠</span>
          <span>{fridgeType}</span>
        </div>
        {quantity && (
          <div className="flex items-center justify-center gap-1">
            <span>📦</span>
            <span>{quantity}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
