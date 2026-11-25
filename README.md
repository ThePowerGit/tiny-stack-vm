# tiny-stack-vm

A tiny stack virtual machine for make.fun's `tiny-stack-vm-01` bounty: `main.ts` runs each
`program.bin` on its `input.bin` and writes the exact bytes the program printed and its exit code.

Entry for [make.fun](https://make.fun/bounty/tiny-stack-vm-01-run-20261122).

[![make.fun](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/ThePowerGit/tiny-stack-vm/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/ThePowerGit/tiny-stack-vm/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122)

## Run

```sh
MAKEFUN_INPUT_DIR=practice/input MAKEFUN_OUTPUT_DIR=out node main.ts
```

Reads `$MAKEFUN_INPUT_DIR/<id>/program.bin` and `input.bin`, writes `stdout.bin` and `exit.txt`.
Node 22, no dependencies.
