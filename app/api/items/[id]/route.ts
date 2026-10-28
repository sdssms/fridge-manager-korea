import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.foodItem.delete({
    where: { id: params.id },
  })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const item = await prisma.foodItem.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(item)
}
