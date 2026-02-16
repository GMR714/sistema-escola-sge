from ninja import Router, Schema
from django.shortcuts import get_object_or_404
from typing import List
from .models import Veiculo, Rota, Motorista

router = Router()

# --- Schemas ---
class VeiculoOut(Schema):
    id: int
    placa: str
    modelo: str
    capacidade: int

class RotaOut(Schema):
    id: int
    nome: str
    origem: str
    destino: str
    turno: str

# --- Veiculos ---
@router.get("/veiculos", response=List[VeiculoOut])
def listar_veiculos(request):
    return Veiculo.objects.all()

@router.post("/veiculos", response=VeiculoOut)
def criar_veiculo(request, payload: VeiculoOut):
    veiculo = Veiculo.objects.create(**payload.dict(exclude={'id'}))
    return veiculo

# --- Rotas ---
@router.get("/rotas", response=List[RotaOut])
def listar_rotas(request):
    return Rota.objects.all()
