from django.db import models
from academic.models import Turma, Matricula

class Aula(models.Model):
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='aulas')
    data = models.DateField()
    conteudo = models.TextField()
    
    def __str__(self):
        return f"Aula {self.data} - {self.turma}"

class Frequencia(models.Model):
    aula = models.ForeignKey(Aula, on_delete=models.CASCADE, related_name='frequencias')
    matricula = models.ForeignKey(Matricula, on_delete=models.CASCADE)
    presente = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('aula', 'matricula')

class Avaliacao(models.Model):
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='avaliacoes')
    disciplina = models.ForeignKey('pedagogical.Disciplina', on_delete=models.CASCADE, related_name='avaliacoes', null=True, blank=True) # Multidisciplinary or Null for now to avoid migration breakage
    nome = models.CharField(max_length=100) # Prova 1, Trabalho 1
    data = models.DateField()
    valor_maximo = models.DecimalField(max_digits=5, decimal_places=2)
    
    def __str__(self):
        return f"{self.nome} ({self.turma})"

class Nota(models.Model):
    avaliacao = models.ForeignKey(Avaliacao, on_delete=models.CASCADE, related_name='notas')
    matricula = models.ForeignKey(Matricula, on_delete=models.CASCADE)
    valor = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    class Meta:
        unique_together = ('avaliacao', 'matricula')

class PlanoAula(models.Model):
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='planos_aula')
    data = models.DateField()
    conteudo = models.TextField()
    metodologia = models.TextField(null=True, blank=True)
    tarefa_casa = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"Plano {self.data} - {self.turma}"
