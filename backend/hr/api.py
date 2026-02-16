from ninja import Router, Schema
from typing import List
from .models import Funcionario, FolhaPagamento

router = Router()

class FuncionarioOut(Schema):
    id: int
    nome: str
    cargo: str
    salario: float

    @staticmethod
    def resolve_nome(obj):
        return obj.pessoa.nome

    @staticmethod
    def resolve_salario(obj):
        return float(obj.salario_base)

@router.get("/funcionarios", response=List[FuncionarioOut])
def listar_funcionarios(request):
    return Funcionario.objects.select_related('pessoa').all()
