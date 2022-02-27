#!/bin/bash

# compilar el contrato y desplogarlo a la testnet
echo "Compilando el contrato y desplegandolo a la testnet"

cd contract
./build.sh

cd marketplace

echo "Deployando el contrato de marketplace"
near dev-deploy ../out/marketplace.wasm
echo "Exportanto la cuenta del contrato marketplace en MA_ID"
source neardev/dev-account.env
export MA_ID=$CONTRACT_NAME

cd ../mediator

echo "Deployando el contrato de mediator"
near dev-deploy ../out/mediator.wasm
echo "Exportanto la cuenta del contrato mediador en ME"
source neardev/dev-account.env
export ME=$CONTRACT_NAME

cd ../ft

echo "Deployando el contrato del token"
near dev-deploy ../out/ft.wasm
echo "Exportanto la cuenta del contrato mediador en FT_ID"
source neardev/dev-account.env
export FT_ID=$CONTRACT_NAME

cd ../../

echo "Creando el fichero .env en frontend"
cd ./frontend/src/
NEWLINE=$'\n'
TAP=$'\t'
echo "{${NEWLINE}${TAP}\"MARKETPLACE_CONTRACT\": \"$MA_ID\",${NEWLINE}${TAP}\"MEDIATOR_CONTRACT\": \"$ME\",${NEWLINE}${TAP}\"FT_CONTRACT\": \"${FT_ID}\"${NEWLINE}}" > contractsAccounts.json
cd ../../

echo "inicializando el contrato de FT"
near call $FT new_default_meta '{"owner_id": "'$FT'", "initial_supply": "1000000", "sales_contract": "'$FT'"}' --accountId $FT

echo "inicializando el contrato de Marketplace"
near call $MA new '{"owner_id": "'$MA'", "mediator": "'$ME'", "ft": "'$FT'"}' --accountId $MA --amount 0.03

echo "inicializando el contrato Mediator"
near call $ME new '{"marketplace_id": "'$MA'", "token_id": "'$FT'"}' --accountId $ME
