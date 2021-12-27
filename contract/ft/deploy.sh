#!/bin/bash

# # compilar el contrato y desplogarlo a la testnet
# echo "Compilando el contrato y desplegandolo a la testnet"

# cargo +stable build --target wasm32-unknown-unknown --release
# mkdir -p ../../out
# cp ../target/wasm32-unknown-unknown/release/ft.wasm ../out/ft.wasm

echo "Deployando el contrato del token fungible"

near dev-deploy ../../out/ft.wasm

echo "Exportanto la cuenta de test a la variable ID"

cd contract
cd ft
# export la cuenta de test creada al hacer deploy
old_IFS=$IFS
IFS=$'\n'
for i in `cat ./neardev/dev-account`
do
    export ID3=$i
done
IFS=$old_IFS

read -p "Escribe una cuenta de testnet: " cuenta
export ID4=$cuenta
echo "Exportando $cuenta a la variable ID2"