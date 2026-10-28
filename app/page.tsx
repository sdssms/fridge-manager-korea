'use client'

import { useState, useEffect } from 'react'
import { Plus, Refrigerator, AlertCircle, Clock, Baby } from 'lucide-react'
import { differenceInDays, format } from 'date-fns'
import { ko } from 'date-fns/locale'

type FoodItem = {
  id: string
  name: string
  category: string
  expiryDate: string | null
  quantity: number | null
  unit: string | null
  cubeCount: number | null
  fridge: {
    name: string
    type: string
  }
}

export default function Home() {
  const [items, setItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const res = await fetch('/api/items')
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }

  const getDaysLeft = (expiryDate: string | null) => {
    if (!expiryDate) return null
    return differenceInDays(new Date(expiryDate), new Date())
  }

  const getStatusColor = (daysLeft: number | null) => {
    if (daysLeft === null) return 'bg-gray-100 text-gray-600'
    if (daysLeft <= 0) return 'bg-red-100 text-red-600 border-red-300'
    if (daysLeft <= 3) return 'bg-orange-100 text-orange-600 border-orange-300'
    return 'bg-green-100 text-green-600 border-green-300'
  }

  const getStatusText = (daysLeft: number | null) => {
    if (daysLeft === null) return '날짜 없음'
    if (daysLeft <= 0) return 'D-Day (오늘까지!)'
    if (daysLeft === 1) return 'D-1 (내일까지)'
    return `D-${daysLeft}`
  }

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      KIMCHI: '🥬',
      SIDE_DISH: '🍱',
      BABY_FOOD: '🍼',
      MEAT_FISH: '🥩',
      VEGETABLE_FRUIT: '🥕',
      DAIRY: '🥛',
      SOUP_STEW: '🍲',
      SAUCE_SEASONING: '🧂',
      ETC: '📦',
    }
    return emojiMap[category] || '📦'
  }

  const urgentItems = items.filter((item) => {
    const daysLeft = getDaysLeft(item.expiryDate)
    return daysLeft !== null && daysLeft <= 3
  })

  const freshItems = items.filter((item) => {
    const daysLeft = getDaysLeft(item.expiryDate)
    return daysLeft === null || daysLeft > 3
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Refrigerator className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">우리집 냉장고</h1>
            </div>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600">
              <Plus className="w-5 h-5" />
              <span>등록</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-red-600">{urgentItems.length}</div>
            <div className="text-xs text-red-600 mt-1">곧 먹어야 해요</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-600">{freshItems.length}</div>
            <div className="text-xs text-green-600 mt-1">신선해요</div>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center">
            <Baby className="w-6 h-6 text-pink-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-pink-600">
              {items.filter((i) => i.category === 'BABY_FOOD').length}
            </div>
            <div className="text-xs text-pink-600 mt-1">이유식</div>
          </div>
        </div>

        {/* 긴급 알림 */}
        {urgentItems.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              🚨 곧 먹어야 해요!
            </h2>
            <div className="space-y-2">
              {urgentItems.map((item) => {
                const daysLeft = getDaysLeft(item.expiryDate)
                return (
                  <div
                    key={item.id}
                    className={`bg-white border-2 rounded-lg p-4 ${getStatusColor(daysLeft)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getCategoryEmoji(item.category)}</span>
                        <div>
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.fridge.name}
                            {item.cubeCount && ` · ${item.cubeCount}큐브`}
                            {item.quantity && item.unit && ` · ${item.quantity}${item.unit}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{getStatusText(daysLeft)}</div>
                        {item.expiryDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(item.expiryDate), 'MM/dd', { locale: ko })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 신선한 식재료 */}
        {freshItems.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">✅ 신선해요</h2>
            <div className="space-y-2">
              {freshItems.map((item) => {
                const daysLeft = getDaysLeft(item.expiryDate)
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.fridge.name}
                            {item.cubeCount && ` · ${item.cubeCount}큐브`}
                            {item.quantity && item.unit && ` · ${item.quantity}${item.unit}`}
                          </p>
                        </div>
                      </div>
                      {daysLeft !== null && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-600">
                            {getStatusText(daysLeft)}
                          </div>
                          {item.expiryDate && (
                            <div className="text-xs text-gray-400 mt-1">
                              {format(new Date(item.expiryDate), 'MM/dd', { locale: ko })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 빈 상태 */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <Refrigerator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              냉장고가 비어있어요
            </h3>
            <p className="text-gray-500 mb-6">
              식재료를 등록하고 유통기한을 관리해보세요!
            </p>
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto hover:bg-green-600">
              <Plus className="w-5 h-5" />
              <span>첫 식재료 등록하기</span>
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
