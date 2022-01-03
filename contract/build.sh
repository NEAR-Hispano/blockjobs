#!/bin/bash
set -e
cd "`dirname $0`"
source flags.sh
cargo build --all --target wasm32-unknown-unknown --release
mkdir -p ./out
cp target/wasm32-unknown-unknown/release/*.wasm ./out/