import { NextRequest, NextResponse } from 'next/server';
import db from '@/data/db.json';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const expedicao = db.Expedicao.find(e => e.id === id);
    
    if (!expedicao) {
      return NextResponse.json(
        { error: 'Expedição não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(expedicao);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    
    // Aqui você implementaria a lógica para atualizar a expedição no banco de dados
    // Por enquanto, apenas retornamos uma resposta de sucesso
    
    return NextResponse.json({ 
      message: 'Expedição atualizada com sucesso',
      id: id 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 