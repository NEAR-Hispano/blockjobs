#!/bin/bash

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

cd ../sales

echo "Deployando el contrato de ventas y airdrop"
near dev-deploy ../out/sales.wasm
echo "Exportanto la cuenta del contrato mediador en SA"
source neardev/dev-account.env
export SA=$CONTRACT_NAME

cd ../../

echo "inicializando el contrato de FT"
near call $FT new_default_meta '{"owner_id": "'$MA'", "initial_supply": "1000000000000000", "sales_contract": "'$SA'"}' --accountId $FT

echo "inicializando el contrato de Marketplace"
near call $MA new '{"owner_id": "'$MA'", "mediator": "'$ME'", "ft": "'$FT'"}' --accountId $MA --amount 0.03
echo "Añadiendo FT"
near call $MA add_token '{"token": "'$FT'"}' --accountId $MA
near call $MA add_token '{"token": "usdc.fakes.testnet"}' --accountId $MA

echo "inicializando el contrato Mediator"
near call $ME new '{"marketplace_id": "'$MA'", "token_id": "'$FT'"}' --accountId $ME

echo "inicializando el contrato Sales"
near call $SA new '{"ft_address": "'$FT'", "admin_id": "pruebaprueba.testnet"}' --accountId $ME

ft_address: AccountId, admin_id: AccountId