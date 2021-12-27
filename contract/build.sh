#!/bin/bash
set -e

cargo +stable build --target wasm32-unknown-unknown --release
mkdir -p ../out
cp target/wasm32-unknown-unknown/release/mediator.wasm ../out/mediator.wasm
cp target/wasm32-unknown-unknown/release/marketplace.wasm ../out/marketplace.wasm
cp target/wasm32-unknown-unknown/release/ft.wasm ../out/ft.wasm

