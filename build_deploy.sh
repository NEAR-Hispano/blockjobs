#!/bin/bash

# compilar el contrato y desplogarlo a la testnet
echo "Compilando el contrato y desplegandolo a la testnet"
npm run build:contract
npm run dev:deploy:contract

echo "Exportanto la cuenta de test a la variable ID"

# export la cuenta de test creada al hacer deploy
old_IFS=$IFS
IFS=$'\n'
for i in `cat ./neardev/dev-account`
do
    export ID=$i
done
IFS=$old_IFS