from ninja import Router, Schema
from typing import List
from .models import Aluno

router = Router()

class AlunoOut(Schema):
    id: int
    nome: str
    cpf: str | None
    data_nascimento: str

@router.get("/alunos", response=List[AlunoOut])
def listar_alunos(request):
    alunos = Aluno.objects.select_related('pessoa').all()
    return [
        {
            "id": a.id,
            "nome": a.pessoa.nome,
            "cpf": a.pessoa.cpf,
            "data_nascimento": str(a.pessoa.data_nascimento)
        }
        for a in alunos
    ]
