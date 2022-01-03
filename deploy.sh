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
echo "Exportanto la cuenta del contrato mediador en ME_ID"
source neardev/dev-account.env
export ME_ID=$CONTRACT_NAME

cd ../ft

echo "Deployando el contrato del token"
near dev-deploy ../out/ft.wasm
echo "Exportanto la cuenta del contrato mediador en FT_ID"
source neardev/dev-account.env
export FT_ID=$CONTRACT_NAME

cd ../../

# echo "Exportanto la cuenta de test a la variable ID"

# # export la cuenta de test creada al hacer deploy
# old_IFS=$IFS
# IFS=$'\n'
# for i in `cat ./neardev/dev-account`
# do
#     export ID=$i
# done
# IFS=$old_IFS

read -p "Escribe una cuenta de testnet: " cuenta
export ID=$cuenta
echo "Exportando $cuenta a la variable ID"

echo "inicializando el contrato de FT"
near call $FT_ID new_default_meta '{"owner_id": "'$FT_ID'", "initial_supply": "1000"}' --accountId $FT_ID

echo "inicializando el contrato de Marketplace"
near call $MA_ID new '{"owner_id": "'$MA_ID'", "mediator": "'$ME_ID'", "ft": "'$FT_ID'"}' --accountId $MA_ID --amount 0.03

echo "inicializando el contrato Mediator"
near call $ME_ID new '{"marketplace_account_id": "'$MA_ID'"}' --accountId $ME_ID
