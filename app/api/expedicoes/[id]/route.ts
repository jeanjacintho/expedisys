import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "@/lib/api"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const expedicoes = await ApiService.getExpedicoes()
    const expedicao = expedicoes.find(e => e.id === parseInt(id))
    
    if (!expedicao) {
      return NextResponse.json(
        { error: "Expedição não encontrada" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(expedicao)
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const expedicoes = await ApiService.getExpedicoes()
    const expedicao = expedicoes.find(e => e.id === parseInt(id))
    
    if (!expedicao) {
      return NextResponse.json(
        { error: "Expedição não encontrada" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(expedicao)
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const expedicoes = await ApiService.getExpedicoes()
    const expedicao = expedicoes.find(e => e.id === parseInt(id))
    
    if (!expedicao) {
      return NextResponse.json(
        { error: "Expedição não encontrada" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: "Expedição deletada com sucesso" })
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 