from django.db import models

class Pessoa(models.Model):
    nome = models.CharField(max_length=255)
    cpf = models.CharField(max_length=14, unique=True, null=True, blank=True)
    data_nascimento = models.DateField()
    nome_mae = models.CharField(max_length=255, null=True, blank=True)
    endereco = models.TextField(null=True, blank=True)
    
    class RacaCor(models.TextChoices):
        NAO_DECLARADA = 'ND', 'Não Declarada'
        BRANCA = 'BR', 'Branca'
        PRETA = 'PR', 'Preta'
        PARDA = 'PA', 'Parda'
        AMARELA = 'AM', 'Amarela'
        INDIGENA = 'IN', 'Indígena'
    
    raca_cor = models.CharField(max_length=2, choices=RacaCor.choices, default=RacaCor.NAO_DECLARADA)
    deficiencia = models.BooleanField(default=False)
    
    def __str__(self):
        return self.nome

class Aluno(models.Model):
    pessoa = models.OneToOneField(Pessoa, on_delete=models.CASCADE, related_name='aluno_profile')
    nis = models.CharField(max_length=20, null=True, blank=True)
    transporte_escolar = models.BooleanField(default=False)
    codigo_inep = models.CharField(max_length=20, null=True, blank=True)
    
    def __str__(self):
        return f"Aluno: {self.pessoa.nome}"

class Professor(models.Model):
    pessoa = models.OneToOneField(Pessoa, on_delete=models.CASCADE, related_name='professor_profile')
    escolaridade = models.CharField(max_length=100, null=True, blank=True)
    vinculo_empregaticio = models.CharField(max_length=100, null=True, blank=True) # Efetivo, Contrato, etc.
    
    def __str__(self):
        return f"Prof. {self.pessoa.nome}"
