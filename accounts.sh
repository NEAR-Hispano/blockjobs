#!/bin/bash

cd contract
cd marketplace

echo "Exportanto la cuenta del contrato marketplace en MA"
source neardev/dev-account.env
export MA=$CONTRACT_NAME

cd ../mediator
echo "Exportanto la cuenta del contrato mediador en ME"
source neardev/dev-account.env
export ME=$CONTRACT_NAME

cd ../ft
echo "Exportanto la cuenta del contrato mediador en FT"
source neardev/dev-account.env
export FT=$CONTRACT_NAME

cd ../sales
echo "Exportanto la cuenta del contrato de ventas en SA"
source neardev/dev-account.env
export SA=$CONTRACT_NAME

cd ../../
echo "Exportando dariofs.testnet a la variable ID"
ID=dariofs.testnet
echo "Exportando proofs333.testnet a la variable ID2"
ID2=proofs333.testnet