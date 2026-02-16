from django.db import models
from people.models import Pessoa

class Funcionario(models.Model):
    pessoa = models.OneToOneField(Pessoa, on_delete=models.CASCADE, related_name='funcionario_profile')
    cargo = models.CharField(max_length=100)
    data_admissao = models.DateField()
    salario_base = models.DecimalField(max_digits=10, decimal_places=2)
    carga_horaria_semanal = models.IntegerField(default=40)

    def __str__(self):
        return f"{self.pessoa.nome} - {self.cargo}"

class FolhaPagamento(models.Model):
    funcionario = models.ForeignKey(Funcionario, on_delete=models.CASCADE, related_name='pagamentos')
    mes = models.IntegerField() # 1-12
    ano = models.IntegerField()
    valor_liquido = models.DecimalField(max_digits=10, decimal_places=2)
    data_pagamento = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[('PENDENTE', 'Pendente'), ('PAGO', 'Pago')], default='PENDENTE')

    def __str__(self):
        return f"Folha {self.mes}/{self.ano} - {self.funcionario.pessoa.nome}"
