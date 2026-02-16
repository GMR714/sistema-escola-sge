from ninja import Router, Schema
from typing import List
from .models import Alimento, Cardapio

router = Router()

class AlimentoOut(Schema):
    id: int
    nome: str
    estoque_atual: float
    unidade: str

class CardapioOut(Schema):
    id: int
    data: str
    descricao: str
    turno: str

@router.get("/alimentos", response=List[AlimentoOut])
def listar_alimentos(request):
    return Alimento.objects.all()

@router.get("/cardapios", response=List[CardapioOut])
def listar_cardapios(request):
    return Cardapio.objects.all()
