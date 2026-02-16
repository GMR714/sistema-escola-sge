from ninja import Router
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from weasyprint import HTML
from people.models import Aluno
from diary.models import Nota
from academic.models import Matricula

router = Router()

@router.get("/boletim/{aluno_id}")
def gerar_boletim(request, aluno_id: int):
    aluno = get_object_or_404(Aluno, id=aluno_id)
    
    # Busca matrícula ativa (assumindo ano atual 2026)
    # Em produção, pegaria do request ou contexto
    matricula = Matricula.objects.filter(aluno=aluno, status=Matricula.Status.ATIVA).first()
    
    if not matricula:
        return 404, {"message": "Aluno não possui matrícula ativa."}
        
    notas = Nota.objects.filter(matricula=matricula).select_related('avaliacao', 'avaliacao__turma')
    
    # Agrupar notas por disciplina? 
    # Modelo atual: Nota -> Avaliacao -> Turma -> Matriz?
    # Simplificação: Lista plana de avaliações por enquanto.
    
    html_string = render_to_string('reports/boletim.html', {
        'aluno': aluno,
        'matricula': matricula,
        'notas': notas
    })

    pdf_file = HTML(string=html_string).write_pdf()

    response = HttpResponse(pdf_file, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="boletim_{aluno.pessoa.nome}.pdf"'
    return response

# --- Educacenso Exports ---
import csv
from pedagogical.models import Escola

@router.get("/educacenso/escolas")
def exportar_escolas(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="escolas_educacenso.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Nome', 'INEP', 'Endereço'])

    escolas = Escola.objects.all()
    for escola in escolas:
        writer.writerow([escola.id, escola.nome, escola.inep, escola.endereco])

    return response

@router.get("/educacenso/alunos")
def exportar_alunos(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="alunos_educacenso.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Nome', 'CPF', 'Data Nascimento', 'Nome Mãe', 'Raça/Cor', 'Deficiência', 'NIS', 'INEP', 'Transporte'])

    alunos = Aluno.objects.select_related('pessoa').all()
    for aluno in alunos:
        writer.writerow([
            aluno.id,
            aluno.pessoa.nome,
            aluno.pessoa.cpf,
            aluno.pessoa.data_nascimento,
            aluno.pessoa.nome_mae,
            aluno.pessoa.get_raca_cor_display(),
            'Sim' if aluno.pessoa.deficiencia else 'Não',
            aluno.nis,
            aluno.codigo_inep,
            'Sim' if aluno.transporte_escolar else 'Não'
        ])

    return response

# --- Dashboard Stats ---
from django.db.models import Count, Avg, Q
from academic.models import Turma
from people.models import Professor

@router.get("/dashboard/stats")
def get_dashboard_stats(request):
    total_escolas = Escola.objects.count()
    total_alunos = Aluno.objects.count()
    total_professores = Professor.objects.count()
    total_turmas = Turma.objects.count()
    
    # Students at risk (Mock logic for now as full aggregation is heavy)
    
    alunos_baixo_desempenho = []
    
    # Pega ultimas notas para exemplificar
    notas_baixas = Nota.objects.filter(valor__lt=60).select_related('matricula__aluno__pessoa', 'avaliacao__disciplina')[:5]
    
    for n in notas_baixas:
        alunos_baixo_desempenho.append({
            "aluno": n.matricula.aluno.pessoa.nome,
            "motivo": f"Nota baixa em {n.avaliacao.disciplina.nome if n.avaliacao.disciplina else 'Avaliação'}: {n.valor}"
        })

    return {
        "counts": {
            "escolas": total_escolas,
            "alunos": total_alunos,
            "professores": total_professores,
            "turmas": total_turmas
        },
        "at_risk": alunos_baixo_desempenho
    }
