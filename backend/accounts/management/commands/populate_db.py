import random
from datetime import date
from django.core.management.base import BaseCommand
from django.db import transaction
from pedagogical.models import Escola, AnoLetivo, NivelEnsino, Disciplina, MatrizCurricular, Etapa
from people.models import Pessoa, Aluno, Professor
from academic.models import Turma, Matricula

class Command(BaseCommand):
    help = 'Populates the database with mock data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Generating mock data...")
        
        with transaction.atomic():
            # 1. Escola
            escola, _ = Escola.objects.get_or_create(
                nome="Escola Municipal Guiricema",
                defaults={'inep': '12345678', 'endereco': 'Centro'}
            )

            # 2. Ano Letivo 2026
            ano_letivo, _ = AnoLetivo.objects.get_or_create(
                ano=2026,
                escola=escola,
                defaults={'data_inicio': date(2026, 2, 1), 'data_fim': date(2026, 12, 15), 'ativo': True}
            )
            
            # Etapas
            for bim in range(1, 5):
                Etapa.objects.get_or_create(nome=f"{bim}º Bimestre", ano_letivo=ano_letivo, defaults={'data_inicio': date(2026, 2, 1), 'data_fim': date(2026, 4, 1)})

            # 3. Niveis e Disciplinas
            nivel, _ = NivelEnsino.objects.get_or_create(nome="Fundamental I")
            
            disciplinas_nomes = ["Matemática", "Português", "História", "Geografia", "Ciências"]
            disciplinas_objs = []
            for nome in disciplinas_nomes:
                d, _ = Disciplina.objects.get_or_create(nome=nome, codigo=nome[:3].upper())
                disciplinas_objs.append(d)

            # 4. Matriz
            matriz, _ = MatrizCurricular.objects.get_or_create(
                nome="Matriz Padrão Fund I",
                escola=escola,
                nivel=nivel
            )
            matriz.disciplinas.set(disciplinas_objs)

            # 5. Turmas
            turmas = []
            for nome_turma in ["101 - A", "102 - B", "201 - A"]:
                t, _ = Turma.objects.get_or_create(
                    nome=nome_turma,
                    ano_letivo=ano_letivo,
                    matriz_curricular=matriz,
                    defaults={'turno': 'M'}
                )
                turmas.append(t)

            # 6. Alunos e Matriculas
            nomes_alunos = [
                "João Silva", "Maria Oliveira", "Pedro Santos", "Ana Souza", "Lucas Lima",
                "Julia Rocha", "Marcos Costa", "Fernanda Alves", "Gabriel Dias", "Beatriz Melo"
            ]

            for i, nome in enumerate(nomes_alunos):
                pessoa, _ = Pessoa.objects.get_or_create(
                    cpf=f"111222333{i:02d}",
                    defaults={
                        'nome': nome,
                        'data_nascimento': date(2015, 5, 15),
                        'nome_mae': f"Mãe de {nome}"
                    }
                )
                aluno, _ = Aluno.objects.get_or_create(pessoa=pessoa)
                
                # Matricular em uma turma aleatória
                turma = random.choice(turmas)
                if not Matricula.objects.filter(aluno=aluno, turma__ano_letivo=ano_letivo, status='ATIVA').exists():
                    Matricula.objects.create(aluno=aluno, turma=turma, status='ATIVA')
            
            # 7. Professor
            prof_pessoa, _ = Pessoa.objects.get_or_create(
                cpf="99988877700",
                defaults={'nome': "Professor Girafales", 'data_nascimento': date(1980, 1, 1)}
            )
            professor, _ = Professor.objects.get_or_create(pessoa=prof_pessoa, defaults={'vinculo_empregaticio': 'Efetivo'})

            # 8. Módulo Transporte
            from transport.models import Veiculo, Rota, Motorista
            veiculo, _ = Veiculo.objects.get_or_create(
                placa="ABC-1234",
                defaults={'modelo': 'Ônibus Escolar', 'capacidade': 40}
            )
            motorista_pessoa, _ = Pessoa.objects.get_or_create(
                cpf="11111111111",
                defaults={'nome': "Seu Madruga (Motorista)", 'data_nascimento': date(1975, 5, 20)}
            )
            motorista, _ = Motorista.objects.get_or_create(pessoa=motorista_pessoa, cnh="12345678900")
            Rota.objects.get_or_create(
                nome="Rota Rural 01",
                veiculo=veiculo,
                motorista=motorista,
                turno='M'
            )

            # 9. Módulo Nutrição (Merenda)
            from nutrition.models import Alimento, Cardapio
            arroz, _ = Alimento.objects.get_or_create(nome="Arroz", unidade="KG", defaults={'estoque_atual': 100})
            feijao, _ = Alimento.objects.get_or_create(nome="Feijão", unidade="KG", defaults={'estoque_atual': 50})
            Cardapio.objects.get_or_create(
                data=date.today(),
                descricao="Arroz, feijão e carne moída",
                turno='M'
            )

            # 10. Módulo RH
            from hr.models import Funcionario, FolhaPagamento
            func_pessoa, _ = Pessoa.objects.get_or_create(
                cpf="22222222222",
                defaults={'nome': "Dona Florinda (Secretária)", 'data_nascimento': date(1980, 2, 10)}
            )
            funcionario, _ = Funcionario.objects.get_or_create(
                pessoa=func_pessoa,
                defaults={'cargo': 'Secretária', 'data_admissao': date(2025, 1, 1), 'salario_base': 2500.00}
            )
            FolhaPagamento.objects.get_or_create(
                funcionario=funcionario,
                mes=2,
                ano=2026,
                defaults={'valor_liquido': 2300.00, 'data_pagamento': date(2026, 3, 5), 'status': 'PAGO'}
            )

            # 11. Módulo Financeiro
            from finance.models import CategoriaTransacao, Transacao
            cat_receita, _ = CategoriaTransacao.objects.get_or_create(nome="Verba Federal", tipo='R')
            cat_despesa, _ = CategoriaTransacao.objects.get_or_create(nome="Manutenção", tipo='D')
            
            Transacao.objects.get_or_create(
                descricao="Repasse PNAE",
                valor=5000.00,
                tipo='R',
                categoria=cat_receita,
                data=date.today()
            )
            Transacao.objects.get_or_create(
                descricao="Conserto do Telhado",
                valor=1200.00,
                tipo='D',
                categoria=cat_despesa,
                data=date.today()
            )

            # 12. Notas (Pedagógico)
            from diary.models import Avaliacao, Nota
            disciplina_mat = Disciplina.objects.get(nome="Matemática")
            avaliacao, _ = Avaliacao.objects.get_or_create(
                turma=turmas[0],
                disciplina=disciplina_mat,
                etapa=Etapa.objects.first(),
                nome="Prova Bimestral 1",
                defaults={'valor_total': 30.0, 'data': date(2026, 3, 10)}
            )
            
            # Lançar notas para alunos da turma 0
            for matricula in Matricula.objects.filter(turma=turmas[0]):
                Nota.objects.get_or_create(
                    matricula=matricula,
                    avaliacao=avaliacao,
                    defaults={'valor': 25.5}
                )

        self.stdout.write(self.style.SUCCESS('Successfully populated database!'))
