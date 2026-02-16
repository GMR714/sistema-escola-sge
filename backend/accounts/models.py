from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN_SME = 'ADMIN_SME', 'Administrador SME'
        DIRETOR = 'DIRETOR', 'Diretor Escolar'
        SECRETARIO = 'SECRETARIO', 'Secretário Escolar'
        PROFESSOR = 'PROFESSOR', 'Professor'
        ALUNO = 'ALUNO', 'Aluno/Responsável'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ALUNO)
    escola = models.ForeignKey('pedagogical.Escola', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
