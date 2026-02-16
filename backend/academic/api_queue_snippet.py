# ... (Existing imports)
from .models import Matricula, Turma, FilaEspera
from pedagogical.models import Escola

# ... (Existing endpoints)

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
