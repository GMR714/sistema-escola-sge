from django.contrib import admin
from .models import Escola, AnoLetivo, Etapa, NivelEnsino, Disciplina, MatrizCurricular

@admin.register(Escola)
class EscolaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'inep')

@admin.register(AnoLetivo)
class AnoLetivoAdmin(admin.ModelAdmin):
    list_display = ('ano', 'escola', 'ativo', 'data_inicio', 'data_fim')
    list_filter = ('ativo', 'escola')

@admin.register(Etapa)
class EtapaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'ano_letivo')

@admin.register(NivelEnsino)
class NivelEnsinoAdmin(admin.ModelAdmin):
    list_display = ('nome',)

@admin.register(Disciplina)
class DisciplinaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'codigo')

@admin.register(MatrizCurricular)
class MatrizCurricularAdmin(admin.ModelAdmin):
    list_display = ('nome', 'escola', 'nivel')
