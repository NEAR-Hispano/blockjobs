#!/bin/bash

# compilar el contrato y desplogarlo a la testnet
echo "Compilando el contrato y desplegandolo a la testnet"

cd contract
./build.sh

cd marketplace

echo "Deployando el contrato de marketplace"
near dev-deploy ../out/marketplace.wasm
echo "Exportanto la cuenta del contrato marketplace en MA"
source neardev/dev-account.env
export MA=$CONTRACT_NAME

cd ../mediator

echo "Deployando el contrato de mediator"
near dev-deploy ../out/mediator.wasm
echo "Exportanto la cuenta del contrato mediador en ME"
source neardev/dev-account.env
export ME=$CONTRACT_NAME

cd ../ft

echo "Deployando el contrato del token"
near dev-deploy ../out/ft.wasm
echo "Exportanto la cuenta del contrato mediador en FT"
source neardev/dev-account.env
export FT=$CONTRACT_NAME

cd ../../

echo "Exportando dariofs.testnet a la variable ID"
ID=dariofs.testnet
echo "Exportando proofs333.testnet a la variable ID2"
ID2=proofs333.testnet
