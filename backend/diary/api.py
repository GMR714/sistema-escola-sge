from ninja import Router, Schema
from django.shortcuts import get_object_or_404
from typing import List
from .models import Avaliacao, Nota
from academic.models import Turma, Matricula

router = Router()

# --- Schemas ---
# --- Schemas ---
class AvaliacaoIn(Schema):
    turma_id: int
    disciplina_id: int | None = None # Optional for now to support old frontend until updated
    nome: str
    data: str
    valor_maximo: float

class AvaliacaoOut(Schema):
    id: int
    nome: str
    data: str
    valor_maximo: float
    disciplina_nome: str | None

class NotaIn(Schema):
    matricula_id: int
    valor: float

class NotasLoteIn(Schema):
    notas: List[NotaIn]

class NotaOut(Schema):
    id: int
    matricula_id: int
    aluno_nome: str
    valor: float | None

# --- Endpoints ---

@router.get("/turmas/{turma_id}/avaliacoes", response=List[AvaliacaoOut])
def listar_avaliacoes_turma(request, turma_id: int):
    turma = get_object_or_404(Turma, id=turma_id)
    avaliacoes = turma.avaliacoes.select_related('disciplina').all()
    return [
        {
            "id": a.id,
            "nome": a.nome,
            "data": str(a.data),
            "valor_maximo": a.valor_maximo,
            "disciplina_nome": a.disciplina.nome if a.disciplina else "Geral"
        }
        for a in avaliacoes
    ]

@router.post("/avaliacoes", response={201: AvaliacaoOut})
def criar_avaliacao(request, payload: AvaliacaoIn):
    turma = get_object_or_404(Turma, id=payload.turma_id)
    disciplina = None
    if payload.disciplina_id:
        from pedagogical.models import Disciplina
        disciplina = get_object_or_404(Disciplina, id=payload.disciplina_id)

    avaliacao = Avaliacao.objects.create(
        turma=turma,
        disciplina=disciplina,
        nome=payload.nome,
        data=payload.data,
        valor_maximo=payload.valor_maximo
    )
    return 201, {
        "id": avaliacao.id,
        "nome": avaliacao.nome,
        "data": str(avaliacao.data),
        "valor_maximo": avaliacao.valor_maximo,
        "disciplina_nome": avaliacao.disciplina.nome if avaliacao.disciplina else "Geral"
    }

@router.get("/avaliacoes/{avaliacao_id}/notas", response=List[NotaOut])
def listar_notas_avaliacao(request, avaliacao_id: int):
    avaliacao = get_object_or_404(Avaliacao, id=avaliacao_id)
    
    # Busca todas as matrículas da turma
    matriculas = Matricula.objects.filter(turma=avaliacao.turma, status=Matricula.Status.ATIVA).select_related('aluno__pessoa')
    
    # Busca notas existentes
    notas_existentes = {n.matricula_id: n for n in Nota.objects.filter(avaliacao=avaliacao)}
    
    resultado = []
    for m in matriculas:
        nota = notas_existentes.get(m.id)
        resultado.append({
            "id": nota.id if nota else 0, # 0 indica que não tem nota salva ainda
            "matricula_id": m.id,
            "aluno_nome": m.aluno.pessoa.nome,
            "valor": nota.valor if nota else None
        })
        
    return resultado

@router.post("/avaliacoes/{avaliacao_id}/notas", response={200: dict})
def lancar_notas(request, avaliacao_id: int, payload: NotasLoteIn):
    avaliacao = get_object_or_404(Avaliacao, id=avaliacao_id)
    
    for item in payload.notas:
        matricula = get_object_or_404(Matricula, id=item.matricula_id)
        
        Nota.objects.update_or_create(
            avaliacao=avaliacao,
            matricula=matricula,
            defaults={'valor': item.valor}
        )
        
    return 200, {"message": "Notas lançadas com sucesso"}

# --- Plano de Aula ---
from .models import PlanoAula

class PlanoAulaIn(Schema):
    turma_id: int
    data: str
    conteudo: str
    metodologia: str = None
    tarefa_casa: str = None

class PlanoAulaOut(Schema):
    id: int
    turma_id: int
    data: str
    conteudo: str
    metodologia: str | None
    tarefa_casa: str | None

@router.get("/turmas/{turma_id}/planos", response=List[PlanoAulaOut])
def listar_planos_aula(request, turma_id: int):
    return PlanoAula.objects.filter(turma_id=turma_id).order_by('-data')

@router.post("/planos", response={201: PlanoAulaOut})
def criar_plano_aula(request, payload: PlanoAulaIn):
    turma = get_object_or_404(Turma, id=payload.turma_id)
    plano = PlanoAula.objects.create(
        turma=turma,
        data=payload.data,
        conteudo=payload.conteudo,
        metodologia=payload.metodologia,
        tarefa_casa=payload.tarefa_casa
    )
    return 201, plano

@router.put("/planos/{plano_id}", response=PlanoAulaOut)
def atualizar_plano_aula(request, plano_id: int, payload: PlanoAulaIn):
    plano = get_object_or_404(PlanoAula, id=plano_id)
    for attr, value in payload.dict().items():
        if attr != 'turma_id': # Não muda a turma
            setattr(plano, attr, value)
    plano.save()
    return plano

@router.delete("/planos/{plano_id}", response={204: None})
def deletar_plano_aula(request, plano_id: int):
    plano = get_object_or_404(PlanoAula, id=plano_id)
    plano.delete()
    return 204, None
