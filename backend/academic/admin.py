from django.contrib import admin
from .models import Turma, Matricula

@admin.register(Turma)
class TurmaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'ano_letivo', 'turno', 'matriz_curricular')
    list_filter = ('ano_letivo', 'turno')

@admin.register(Matricula)
class MatriculaAdmin(admin.ModelAdmin):
    list_display = ('aluno', 'turma', 'status', 'data_matricula')
    list_filter = ('status', 'turma__ano_letivo')
    search_fields = ('aluno__pessoa__nome',)
