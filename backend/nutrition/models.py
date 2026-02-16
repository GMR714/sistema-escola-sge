from django.db import models

class Alimento(models.Model):
    nome = models.CharField(max_length=100)
    unidade = models.CharField(max_length=10, choices=[('KG', 'Quilos'), ('L', 'Litros'), ('UN', 'Unidade'), ('CX', 'Caixa')])
    estoque_atual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    estoque_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=5)

    def __str__(self):
        return f"{self.nome} ({self.unidade})"

class Cardapio(models.Model):
    data = models.DateField()
    descricao = models.TextField() # Ex: Arroz, Feijão, Frango
    turno = models.CharField(max_length=20, choices=[('M', 'Matutino'), ('V', 'Vespertino')])

    def __str__(self):
        return f"Cardápio {self.data} ({self.turno})"
