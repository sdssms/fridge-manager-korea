'use client';

import { motion } from 'framer-motion';
import clsx from 'clsx';

interface StatCardProps {
  icon: string;
  label: string;
  count: number;
  color: 'urgent' | 'warning' | 'fresh';
  description: string;
  onClick?: () => void;
}

const colorStyles = {
  urgent: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
  warning: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  fresh: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
};

export default function StatCard({
  icon,
  label,
  count,
  color,
  description,
  onClick,
}: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <motion.button
      onClick={onClick}
      className={clsx(
        'flex flex-col items-center justify-center',
        'min-w-[110px] p-5',
        'bg-white rounded-lg border-2',
        'transition-all duration-200',
        'hover:shadow-md hover:-translate-y-1',
        'active:scale-95',
        styles.border
      )}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={clsx('text-4xl mb-2', styles.text)}>
        {icon}
      </div>
      <div className={clsx('text-sm font-medium mb-1', styles.text)}>
        {label}
      </div>
      <div className={clsx('text-2xl font-bold mb-1', styles.text)}>
        {count}
      </div>
      <div className="text-xs text-gray-500">
        {description}
      </div>
    </motion.button>
  );
}
