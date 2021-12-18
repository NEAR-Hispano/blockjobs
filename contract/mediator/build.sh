#!/bin/bash
set -e

RUSTFLAGS='-C link-arg=-s' cargo +stable build --target wasm32-unknown-unknown --release
cp ../target/wasm32-unknown-unknown/release/marketplace.wasm ../../../out/marketplace.wasm
cp ../target/wasm32-unknown-unknown/release/mediator.wasm ../../../out/mediator.wasm