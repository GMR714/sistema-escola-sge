from django.db import models
from pedagogical.models import Escola, AnoLetivo, MatrizCurricular
from people.models import Aluno

class Turma(models.Model):
    nome = models.CharField(max_length=100) # ex: 101, 1A
    ano_letivo = models.ForeignKey(AnoLetivo, on_delete=models.CASCADE, related_name='turmas')
    matriz_curricular = models.ForeignKey(MatrizCurricular, on_delete=models.PROTECT)
    turno = models.CharField(max_length=20, choices=[('M', 'Matutino'), ('V', 'Vespertino'), ('N', 'Noturno'), ('I', 'Integral')])
    
    def __str__(self):
        return f"{self.nome} - {self.ano_letivo} ({self.turno})"

class Matricula(models.Model):
    class Status(models.TextChoices):
        ATIVA = 'ATIVA', 'Ativa'
        TRANSFERIDO = 'TRANSFERIDO', 'Transferido'
        ABANDONO = 'ABANDONO', 'Abandono'
        CONCLUIDO = 'CONCLUIDO', 'Concluído'

    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name='matriculas')
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='matriculas')
    data_matricula = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ATIVA)
    
    class Meta:
        unique_together = ('aluno', 'turma') # Prevent duplicate enrollment in SAME class

    def __str__(self):
        return f"{self.aluno} -> {self.turma}"

class FilaEspera(models.Model):
    class Status(models.TextChoices):
        AGUARDANDO = 'AGUARDANDO', 'Aguardando'
        ALOCADO = 'ALOCADO', 'Alocado'
        CANCELADO = 'CANCELADO', 'Cancelado'

    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name='fila_espera')
    escola_pretendida = models.ForeignKey(Escola, on_delete=models.SET_NULL, null=True, blank=True)
    data_solicitacao = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AGUARDANDO)

    def __str__(self):
        return f"{self.aluno} - {self.status}"
