import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  await prisma.foodItem.delete({
    where: { id: params.id },
  })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const body = await request.json()
  const item = await prisma.foodItem.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(item)
}
