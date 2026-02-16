from django.db import models

class Escola(models.Model):
    nome = models.CharField(max_length=255)
    inep = models.CharField(max_length=20, null=True, blank=True)
    endereco = models.TextField(null=True, blank=True)
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)
    
    def __str__(self):
        return self.nome

class AnoLetivo(models.Model):
    ano = models.IntegerField()  # 2026
    data_inicio = models.DateField()
    data_fim = models.DateField()
    ativo = models.BooleanField(default=True)
    escola = models.ForeignKey(Escola, on_delete=models.CASCADE, related_name='anos_letivos')

    def __str__(self):
        return f"{self.ano} - {self.escola.nome}"

class Etapa(models.Model):
    """Bimestre, Trimestre, Semestre"""
    nome = models.CharField(max_length=50) # ex: 1º Bimestre
    ano_letivo = models.ForeignKey(AnoLetivo, on_delete=models.CASCADE, related_name='etapas')
    data_inicio = models.DateField()
    data_fim = models.DateField()

    def __str__(self):
        return f"{self.nome} ({self.ano_letivo})"

class NivelEnsino(models.Model):
    """Infantil, Fundamental I, etc"""
    nome = models.CharField(max_length=100)
    
    def __str__(self):
        return self.nome

class Disciplina(models.Model):
    nome = models.CharField(max_length=100)
    codigo = models.CharField(max_length=20, unique=True) # MAT, POR
    
    def __str__(self):
        return self.nome

class MatrizCurricular(models.Model):
    """Define quais disciplinas existem em qual ano escolaridade/escola"""
    nome = models.CharField(max_length=100) # ex: Fundamental I - 1º Ano
    escola = models.ForeignKey(Escola, on_delete=models.CASCADE)
    nivel = models.ForeignKey(NivelEnsino, on_delete=models.PROTECT)
    disciplinas = models.ManyToManyField(Disciplina, related_name='matrizes')
    
    def __str__(self):
        return f"{self.nome} - {self.escola}"

class Zoneamento(models.Model):
    bairro = models.CharField(max_length=255, unique=True)
    escola = models.ForeignKey(Escola, on_delete=models.CASCADE, related_name='zoneamentos')

    def __str__(self):
        return f"{self.bairro} -> {self.escola}"
