from django.contrib import admin
from .models import Aula, Frequencia, Avaliacao, Nota

@admin.register(Aula)
class AulaAdmin(admin.ModelAdmin):
    list_display = ('turma', 'data', 'conteudo')
    list_filter = ('turma',)

@admin.register(Frequencia)
class FrequenciaAdmin(admin.ModelAdmin):
    list_display = ('aula', 'matricula', 'presente')

@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'turma', 'data', 'valor_maximo')

@admin.register(Nota)
class NotaAdmin(admin.ModelAdmin):
    list_display = ('avaliacao', 'matricula', 'valor')
