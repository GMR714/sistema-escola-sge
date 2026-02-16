from django.db import models

class CategoriaTransacao(models.Model):
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=[('R', 'Receita'), ('D', 'Despesa')])

    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()})"

class Transacao(models.Model):
    descricao = models.CharField(max_length=200)
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    data = models.DateField()
    categoria = models.ForeignKey(CategoriaTransacao, on_delete=models.SET_NULL, null=True)
    tipo = models.CharField(max_length=10, choices=[('R', 'Receita'), ('D', 'Despesa')])
    observacao = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.descricao} - R$ {self.valor}"
