from ninja import Router, Schema
from django.shortcuts import get_object_or_404
from typing import List
from .models import Escola, AnoLetivo, Disciplina, Zoneamento

router = Router()

# ... (Previous School/Year/Subject endpoints) ...

# --- Zoneamento ---
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
