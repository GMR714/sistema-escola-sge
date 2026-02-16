from ninja import Router, Schema
from django.shortcuts import get_object_or_404
from typing import List
from .models import Escola, AnoLetivo, Disciplina

router = Router()

# --- Escola ---
class EscolaIn(Schema):
    nome: str
    inep: str = None
    endereco: str = None

class EscolaOut(Schema):
    id: int
    nome: str
    inep: str | None
    endereco: str | None

@router.get("/escolas", response=List[EscolaOut])
def listar_escolas(request):
    return Escola.objects.all()

@router.post("/escolas", response={201: EscolaOut})
def criar_escola(request, payload: EscolaIn):
    escola = Escola.objects.create(**payload.dict())
    return 201, escola

@router.put("/escolas/{escola_id}", response=EscolaOut)
def atualizar_escola(request, escola_id: int, payload: EscolaIn):
    escola = get_object_or_404(Escola, id=escola_id)
    for attr, value in payload.dict().items():
        setattr(escola, attr, value)
    escola.save()
    return escola

@router.delete("/escolas/{escola_id}", response={204: None})
def deletar_escola(request, escola_id: int):
    escola = get_object_or_404(Escola, id=escola_id)
    escola.delete()
    return 204, None

# --- Ano Letivo ---
class AnoLetivoIn(Schema):
    escola_id: int
    ano: int
    data_inicio: str
    data_fim: str
    ativo: bool = True

class AnoLetivoOut(Schema):
    id: int
    escola_id: int
    ano: int
    data_inicio: str
    data_fim: str
    ativo: bool

@router.get("/escolas/{escola_id}/anos-letivos", response=List[AnoLetivoOut])
def listar_anos_letivos(request, escola_id: int):
    return AnoLetivo.objects.filter(escola_id=escola_id)

@router.post("/anos-letivos", response={201: AnoLetivoOut})
def criar_ano_letivo(request, payload: AnoLetivoIn):
    ano = AnoLetivo.objects.create(**payload.dict())
    return 201, ano

@router.put("/anos-letivos/{ano_id}", response=AnoLetivoOut)
def atualizar_ano_letivo(request, ano_id: int, payload: AnoLetivoIn):
    ano = get_object_or_404(AnoLetivo, id=ano_id)
    for attr, value in payload.dict().items():
        setattr(ano, attr, value)
    ano.save()
    return ano

@router.delete("/anos-letivos/{ano_id}", response={204: None})
def deletar_ano_letivo(request, ano_id: int):
    ano = get_object_or_404(AnoLetivo, id=ano_id)
    ano.delete()
    return 204, None

# --- Disciplina ---
class DisciplinaIn(Schema):
    nome: str
    codigo: str

class DisciplinaOut(Schema):
    id: int
    nome: str
    codigo: str

@router.get("/disciplinas", response=List[DisciplinaOut])
def listar_disciplinas(request):
    return Disciplina.objects.all()

@router.post("/disciplinas", response={201: DisciplinaOut})
def criar_disciplina(request, payload: DisciplinaIn):
    disciplina = Disciplina.objects.create(**payload.dict())
    return 201, disciplina

@router.put("/disciplinas/{disciplina_id}", response=DisciplinaOut)
def atualizar_disciplina(request, disciplina_id: int, payload: DisciplinaIn):
    disciplina = get_object_or_404(Disciplina, id=disciplina_id)
    for attr, value in payload.dict().items():
        setattr(disciplina, attr, value)
    disciplina.save()
    return disciplina

@router.delete("/disciplinas/{disciplina_id}", response={204: None})
def deletar_disciplina(request, disciplina_id: int):
    disciplina = get_object_or_404(Disciplina, id=disciplina_id)
    disciplina.delete()
    return 204, None

# --- Zoneamento ---
from .models import Zoneamento

class ZoneamentoIn(Schema):
    bairro: str
    escola_id: int

class ZoneamentoOut(Schema):
    id: int
    bairro: str
    escola_id: int
    escola_nome: str

@router.get("/zoneamento", response=List[ZoneamentoOut])
def listar_zoneamento(request):
    return [
        {
            "id": z.id,
            "bairro": z.bairro,
            "escola_id": z.escola.id,
            "escola_nome": z.escola.nome
        }
        for z in Zoneamento.objects.select_related('escola').all()
    ]

@router.post("/zoneamento", response={201: ZoneamentoOut})
def criar_zoneamento(request, payload: ZoneamentoIn):
    escola = get_object_or_404(Escola, id=payload.escola_id)
    z = Zoneamento.objects.create(bairro=payload.bairro, escola=escola)
    return 201, {
        "id": z.id,
        "bairro": z.bairro,
        "escola_id": z.escola.id,
        "escola_nome": z.escola.nome
    }

@router.delete("/zoneamento/{z_id}", response={204: None})
def deletar_zoneamento(request, z_id: int):
    z = get_object_or_404(Zoneamento, id=z_id)
    z.delete()
    return 204, None
