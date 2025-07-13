import { NextResponse } from 'next/server';
import db from '@/data/db.json';

export async function GET() {
  return NextResponse.json(db.Expedicao);
} 