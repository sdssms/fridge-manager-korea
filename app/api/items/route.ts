import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.foodItem.findMany({
    include: {
      fridge: true,
    },
    orderBy: {
      expiryDate: 'asc',
    },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await prisma.foodItem.create({
    data: body,
  })
  return NextResponse.json(item)
}
