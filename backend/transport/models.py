from django.db import models
from people.models import Pessoa

class Veiculo(models.Model):
    placa = models.CharField(max_length=10, unique=True)
    modelo = models.CharField(max_length=100)
    capacidade = models.IntegerField()
    ano = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.modelo} ({self.placa})"

class Motorista(models.Model):
    pessoa = models.OneToOneField(Pessoa, on_delete=models.CASCADE, related_name='motorista_profile')
    cnh = models.CharField(max_length=20)
    categoria_cnh = models.CharField(max_length=5) # A, B, C, D, E

    def __str__(self):
        return f"Motorista {self.pessoa.nome}"

class Rota(models.Model):
    nome = models.CharField(max_length=100)
    origem = models.CharField(max_length=100)
    destino = models.CharField(max_length=100)
    veiculo = models.ForeignKey(Veiculo, on_delete=models.SET_NULL, null=True, blank=True)
    motorista = models.ForeignKey(Motorista, on_delete=models.SET_NULL, null=True, blank=True)
    turno = models.CharField(max_length=20, choices=[('M', 'Matutino'), ('V', 'Vespertino'), ('N', 'Noturno')])

    def __str__(self):
        return f"{self.nome} ({self.turno})"
