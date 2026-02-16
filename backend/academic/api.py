from ninja import Router, Schema
from django.shortcuts import get_object_or_404
from typing import List
from .models import Matricula, Turma, FilaEspera
from people.models import Aluno
from pedagogical.models import Escola

router = Router()

class MatriculaIn(Schema):
    aluno_id: int
    turma_id: int

class MatriculaOut(Schema):
    id: int
    aluno_nome: str
    turma_nome: str
    status: str

@router.post("/matriculas", response={201: MatriculaOut, 409: dict})
def criar_matricula(request, payload: MatriculaIn):
    aluno = get_object_or_404(Aluno, id=payload.aluno_id)
    turma = get_object_or_404(Turma, id=payload.turma_id)

    # Validar Conflito: Aluno não pode ter matrícula ATIVA no mesmo Ano Letivo
    # Verifica se existe matrícula desse aluno, em turmas DESSA escola e DESSE ano, com status ATIVA.
    ano_letivo = turma.ano_letivo
    
    conflito = Matricula.objects.filter(
        aluno=aluno,
        turma__ano_letivo=ano_letivo,
        status=Matricula.Status.ATIVA
    ).exists()

    if conflito:
        return 409, {"message": f"O aluno {aluno.pessoa.nome} já possui uma matrícula ativa no ano letivo {ano_letivo.ano}."}

    matricula = Matricula.objects.create(
        aluno=aluno,
        turma=turma,
        status=Matricula.Status.ATIVA
    )
    
    return 201, {
        "id": matricula.id,
        "aluno_nome": matricula.aluno.pessoa.nome,
        "turma_nome": matricula.turma.nome,
        "status": matricula.status
    }

@router.get("/matriculas", response=List[MatriculaOut])
def listar_matriculas(request):
    matriculas = Matricula.objects.select_related('aluno__pessoa', 'turma').all()
    return [
        {
            "id": m.id,
            "aluno_nome": m.aluno.pessoa.nome,
            "turma_nome": m.turma.nome,
            "status": m.status
        }
        for m in matriculas
    ]

class TurmaOut(Schema):
    id: int
    nome: str
    ano: int
    turno: str

@router.get("/turmas", response=List[TurmaOut])
def listar_turmas(request):
    turmas = Turma.objects.select_related('ano_letivo').all()
    return [
        {
            "id": t.id,
            "nome": t.nome,
            "ano": t.ano_letivo.ano,
            "turno": t.get_turno_display()
        }
        for t in turmas
    ]

class AlunoSimples(Schema):
    id: int # ID da Matricula (para lançar frequencia/nota) ou ID do Aluno? Usaremos ID da Matricula pois o diário é sobre matriculas
    aluno_id: int
    nome: str

@router.get("/turmas/{turma_id}/alunos", response=List[AlunoSimples])
def listar_alunos_turma(request, turma_id: int):
    turma = get_object_or_404(Turma, id=turma_id)
    matriculas = Matricula.objects.filter(turma=turma, status=Matricula.Status.ATIVA).select_related('aluno__pessoa')
    
    return [
        {
            "id": m.aluno.id,
            "nome": m.aluno.pessoa.nome
        }
        for m in matriculas
    ]

# --- Fila de Espera ---
class FilaIn(Schema):
    aluno_id: int
    escola_id: int | None = None

class FilaOut(Schema):
    id: int
    aluno_id: int
    aluno_nome: str
    escola_nome: str | None
    data_solicitacao: str
    status: str

@router.get("/fila", response=List[FilaOut])
def listar_fila(request):
    fila = FilaEspera.objects.select_related('aluno__pessoa', 'escola_pretendida').all()
    return [
        {
            "id": f.id,
            "aluno_id": f.aluno.id,
            "aluno_nome": f.aluno.pessoa.nome,
            "escola_nome": f.escola_pretendida.nome if f.escola_pretendida else "Zoneamento Automático",
            "data_solicitacao": str(f.data_solicitacao),
            "status": f.status
        }
        for f in fila
    ]

@router.post("/fila", response={201: FilaOut})
def adicionar_fila(request, payload: FilaIn):
    aluno = get_object_or_404(Aluno, id=payload.aluno_id)
    escola = None
    if payload.escola_id:
        escola = get_object_or_404(Escola, id=payload.escola_id)
    
    # TODO: Implementar lógica de Zoneamento aqui se escola for None
    
    item = FilaEspera.objects.create(
        aluno=aluno,
        escola_pretendida=escola,
        status=FilaEspera.Status.AGUARDANDO
    )
    
    return 201, {
        "id": item.id,
        "aluno_id": item.aluno.id,
        "aluno_nome": item.aluno.pessoa.nome,
        "escola_nome": item.escola_pretendida.nome if item.escola_pretendida else None,
        "data_solicitacao": str(item.data_solicitacao),
        "status": item.status
    }

@router.delete("/fila/{item_id}", response={204: None})
def remover_da_fila(request, item_id: int):
    item = get_object_or_404(FilaEspera, id=item_id)
    item.delete()
    return 204, None

# --- Conselho de Classe ---
from diary.models import Nota
from pedagogical.models import Disciplina
from django.db.models import Sum

class NotaDisciplina(Schema):
    disciplina: str
    total: float

class AlunoConselho(Schema):
    aluno_nome: str
    notas: List[NotaDisciplina]

@router.get("/turmas/{turma_id}/conselho", response=List[AlunoConselho])
def dados_conselho_classe(request, turma_id: int):
    turma = get_object_or_404(Turma, id=turma_id)
    matriculas = Matricula.objects.filter(turma=turma, status=Matricula.Status.ATIVA).select_related('aluno__pessoa')
    disciplinas = Disciplina.objects.all() # Idealmente filtrar por Matriz da turma
    
    # Otimização: Buscar todas as notas da turma de uma vez
    notas_raw = Nota.objects.filter(
        matricula__turma=turma
    ).select_related('avaliacao', 'avaliacao__disciplina')
    
    # Dicionário para acesso rápido: [matricula_id][disciplina_id] = soma_notas
    notas_map = {}
    for nota in notas_raw:
        if not nota.valor: continue
        
        mat_id = nota.matricula_id
        disc_id = nota.avaliacao.disciplina_id
        
        if not disc_id: continue # Ignora notas sem disciplina (legado ou erro)
        
        if mat_id not in notas_map: notas_map[mat_id] = {}
        if disc_id not in notas_map[mat_id]: notas_map[mat_id][disc_id] = 0
        
        notas_map[mat_id][disc_id] += float(nota.valor)
        
    resultado = []
    for m in matriculas:
        lista_notas = []
        for d in disciplinas:
            total = notas_map.get(m.id, {}).get(d.id, 0.0)
            lista_notas.append({
                "disciplina": d.nome,
                "total": total
            })
            
        resultado.append({
            "aluno_nome": m.aluno.pessoa.nome,
            "notas": lista_notas
        })
        
    return resultado
