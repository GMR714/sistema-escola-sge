from ninja import Router, Schema
from typing import List
from .models import Transacao

router = Router()

class TransacaoOut(Schema):
    id: int
    descricao: str
    valor: float
    tipo: str
    data: str

@router.get("/transacoes", response=List[TransacaoOut])
def listar_transacoes(request):
    return Transacao.objects.all()
