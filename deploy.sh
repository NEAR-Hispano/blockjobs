#!/bin/bash

# compilar el contrato y desplogarlo a la testnet
echo "Compilando el contrato y desplegandolo a la testnet"

cd contract
./build.sh

cd ..

#echo "Deployando el contrato del token"
#near dev-deploy out/ft.wasm

echo "Deployando el contrato de marketplace"
near dev-deploy out/marketplace.wasm

#echo "Deployando el contrato de mediator"
#near dev-deploy out/mediator.wasm

echo "Exportanto la cuenta de test a la variable ID"

# export la cuenta de test creada al hacer deploy
old_IFS=$IFS
IFS=$'\n'
for i in `cat ./neardev/dev-account`
do
    export ID=$i
done
IFS=$old_IFS

read -p "Escribe una cuenta de testnet: " cuenta
export ID2=$cuenta
echo "Exportando $cuenta a la variable ID2"