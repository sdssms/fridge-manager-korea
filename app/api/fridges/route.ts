import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const fridges = await prisma.fridge.findMany({
    include: {
      items: true,
    },
  })
  return NextResponse.json(fridges)
}

export async function POST(request: Request) {
  const body = await request.json()
  const fridge = await prisma.fridge.create({
    data: body,
  })
  return NextResponse.json(fridge)
}
