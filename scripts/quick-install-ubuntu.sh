#!/bin/bash

# Script de Instalação Rápida - Market Dashboard
# Ubuntu 18.04 LTS
# 
# Instalação mínima e rápida

set -e

echo "=== Instalação Rápida - Market Dashboard ==="
echo

# Atualizar sistema
echo "Atualizando sistema..."
sudo apt update -y

# Instalar dependências básicas
echo "Instalando dependências..."
sudo apt install -y curl git build-essential

# Instalar Node.js 18
echo "Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar dependências do projeto
echo "Instalando dependências do projeto..."
npm install

# Testar build
echo "Testando build..."
npm run build

echo
echo "=== Instalação Concluída! ==="
echo "Execute: npm run dev"
echo "Acesse: http://localhost:3050"
