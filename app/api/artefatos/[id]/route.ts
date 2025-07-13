import { NextRequest, NextResponse } from "next/server";
import { ApiService } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Buscar todos os artefatos
    const artefatos = await ApiService.getArtefatos();
    
    // Encontrar o artefato específico
    const artefato = artefatos.find(a => a.id === id);
    
    if (!artefato) {
      return NextResponse.json(
        { error: "Artefato não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(artefato);
  } catch (error) {
    console.error('Erro ao buscar artefato:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Aqui você implementaria a lógica para atualizar o artefato
    // Por enquanto, apenas retornar sucesso
    console.log('Atualizando artefato:', id, body);
    
    return NextResponse.json({ 
      message: "Artefato atualizado com sucesso",
      id: id 
    });
  } catch (error) {
    console.error('Erro ao atualizar artefato:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // Aqui você implementaria a lógica para deletar o artefato
    // Por enquanto, apenas retornar sucesso
    console.log('Deletando artefato:', id);
    
    return NextResponse.json({ 
      message: "Artefato deletado com sucesso",
      id: id 
    });
  } catch (error) {
    console.error('Erro ao deletar artefato:', error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 