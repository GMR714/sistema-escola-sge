from django.contrib import admin
from .models import Pessoa, Aluno, Professor

@admin.register(Pessoa)
class PessoaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf', 'data_nascimento')
    search_fields = ('nome', 'cpf')

@admin.register(Aluno)
class AlunoAdmin(admin.ModelAdmin):
    list_display = ('get_nome', 'nis', 'codigo_inep')
    search_fields = ('pessoa__nome', 'nis')
    
    def get_nome(self, obj):
        return obj.pessoa.nome
    get_nome.short_description = 'Nome'

@admin.register(Professor)
class ProfessorAdmin(admin.ModelAdmin):
    list_display = ('get_nome', 'vinculo_empregaticio')
    
    def get_nome(self, obj):
        return obj.pessoa.nome
    get_nome.short_description = 'Nome'
