from ninja import Router, Schema
from django.shortcuts import get_object_or_404
from .models import Aluno
from academic.models import Matricula
from diary.models import Nota, Frequencia
from typing import List

router = Router()

class LoginIn(Schema):
    cpf: str

class LoginOut(Schema):
    id: int
    nome: str
    token: str # Simple token (just ID for now)

@router.post("/login", response=LoginOut)
def login(request, payload: LoginIn):
    # Strip dots and dashes just in case
    clean_cpf = payload.cpf.replace('.', '').replace('-', '')
    
    # Try to find student by CPF
    # We filter by pessoa__cpf because Aluno has a O2O to Pessoa
    aluno = get_object_or_404(Aluno, pessoa__cpf=clean_cpf)
    
    return {
        "id": aluno.id,
        "nome": aluno.pessoa.nome,
        "token": str(aluno.id)
    }

class NotaSchema(Schema):
    disciplina: str
    avaliacao: str
    valor: float

class FrequenciaSchema(Schema):
    presente: int
    total: int
    porcentagem: float

class MeOut(Schema):
    nome: str
    turma: str | None
    notas: List[NotaSchema]
    frequencia: FrequenciaSchema

@router.get("/me", response=MeOut)
def get_me(request, student_id: int):
    # In a real app, we would get student_id from the token/session
    aluno = get_object_or_404(Aluno, id=student_id)
    
    # Get active enrollment
    matricula = Matricula.objects.filter(aluno=aluno, status=Matricula.Status.ATIVA).first()
    
    notas_data = []
    freq_data = {"presente": 0, "total": 0, "porcentagem": 0.0}
    turma_nome = None
    
    if matricula:
        turma_nome = str(matricula.turma)
        
        # Get grades
        notas = Nota.objects.filter(matricula=matricula).select_related('avaliacao', 'avaliacao__disciplina')
        for n in notas:
            notas_data.append({
                "disciplina": n.avaliacao.disciplina.nome if n.avaliacao.disciplina else "Geral",
                "avaliacao": n.avaliacao.nome,
                "valor": float(n.valor) if n.valor else 0.0
            })
            
        # Get attendance
        frequencias = Frequencia.objects.filter(matricula=matricula)
        total_aulas = frequencias.count()
        presente = frequencias.filter(presente=True).count()
        
        if total_aulas > 0:
            porcentagem = (presente / total_aulas) * 100
        else:
            porcentagem = 100.0 # Default to 100% if no classes yet
            
        freq_data = {
            "presente": presente,
            "total": total_aulas,
            "porcentagem": round(porcentagem, 1)
        }

    return {
        "nome": aluno.pessoa.nome,
        "turma": turma_nome,
        "notas": notas_data,
        "frequencia": freq_data
    }
