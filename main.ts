// tiny-stack-vm: run each program.bin on input.bin exactly as the reference generator/subject/vm.mjs does.
// Reads $MAKEFUN_INPUT_DIR/<id>/{program.bin,input.bin}; writes $MAKEFUN_OUTPUT_DIR/<id>/{stdout.bin,exit.txt}.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input', O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const SM = 256, CM = 64, MM = 256, SL = 1e6, OM = 65536;

// One Int32Array row of 5 per opcode byte: [immediate bytes, pops, pushes, kind, sub].
// kinds: 0 HALT 1 PUSH8 2 PUSH32 3 POP 4 DUP 5 SWAP 6 OVER 7 ROT 8 NEG 9 NOT 10 binary
//        11 JMP 12 JZ 13 JNZ 14 CALL 15 RET 16 LOAD 17 STORE 18 PRINT 19 PUTC 20 IN 21 EXIT
const T = new Int32Array(1280).fill(-1);
const d = (b, imm, p, q, k, s) => { const i = b * 5; T[i] = imm; T[i + 1] = p; T[i + 2] = q; T[i + 3] = k; T[i + 4] = s ?? -1; };
d(0, 0, 0, 0, 0); d(1, 1, 0, 1, 1); d(2, 4, 0, 1, 2); d(3, 0, 1, 0, 3); d(4, 0, 1, 2, 4);
d(5, 0, 2, 2, 5); d(6, 0, 2, 3, 6); d(7, 0, 3, 3, 7); d(0x17, 0, 1, 1, 8); d(0x1b, 0, 1, 1, 9);
const BIN = [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x18, 0x19, 0x1a, 0x1c, 0x1d, 0x1e, 0x20, 0x21, 0x22];
BIN.forEach((b, s) => d(b, 0, 2, 1, 10, s));
d(0x30, 2, 0, 0, 11); d(0x31, 2, 1, 0, 12); d(0x32, 2, 1, 0, 13);
d(0x33, 2, 0, 0, 14); d(0x34, 0, 0, 0, 15); d(0x40, 0, 1, 1, 16); d(0x41, 0, 2, 0, 17);
d(0x50, 0, 1, 0, 18); d(0x51, 0, 1, 0, 19); d(0x52, 0, 0, 1, 20); d(0x53, 0, 1, 0, 21);

function run(P, inp) {
  const n = P.length, D = new Int32Array(SM), C = new Int32Array(CM), M = new Int32Array(MM), out = new Uint8Array(OM);
  let sp = 0, cp = 0, ol = 0, ip = 0, pc = 0, st = 0;
  for (;;) {
    // Trap order is vm.mjs's: steps, pc bounds, opcode, immediate bounds, then the two stack checks.
    if (st === SL) return [out, ol, 10];
    if (pc < 0 || pc >= n) return [out, ol, 9];
    const t = P[pc] * 5, imm = T[t];
    if (imm < 0) return [out, ol, 5];
    const p = T[t + 1], q = T[t + 2], k = T[t + 3], s = T[t + 4];
    if (pc + imm >= n) return [out, ol, 9];
    st++;
    const nx = pc + 1 + imm;
    if (sp < p) return [out, ol, 2];
    if (sp - p + q > SM) return [out, ol, 3];
    pc = nx;
    if (k === 0) return [out, ol, 0];
    if (k === 1) { D[sp++] = (P[nx - 1] << 24) >> 24; continue; }
    if (k === 2) { D[sp++] = P[nx - 4] | (P[nx - 3] << 8) | (P[nx - 2] << 16) | (P[nx - 1] << 24); continue; }
    if (k === 3) { sp--; continue; }
    if (k === 4) { D[sp] = D[sp - 1]; sp++; continue; }
    if (k === 5) { const x = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = x; continue; }
    if (k === 6) { D[sp] = D[sp - 2]; sp++; continue; }
    if (k === 7) { const x = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = x; continue; }
    if (k === 8) { D[sp - 1] = -D[sp - 1] | 0; continue; }
    if (k === 9) { D[sp - 1] = ~D[sp - 1]; continue; }
    if (k === 10) {
      const b = D[sp - 1], a = D[sp - 2];
      let r = 0;
      if (s === 0) r = (a + b) | 0;
      else if (s === 1) r = (a - b) | 0;
      else if (s === 2) r = Math.imul(a, b);
      else if (s === 3) { if (b === 0) return [out, ol, 4]; r = a === -2147483648 && b === -1 ? a : (a / b) | 0; }
      else if (s === 4) { if (b === 0) return [out, ol, 4]; r = b === -1 ? 0 : a % b | 0; }
      else if (s === 5) { if (b === 0) return [out, ol, 4]; r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
      else if (s === 6) { if (b === 0) return [out, ol, 4]; r = (a >>> 0) % (b >>> 0) | 0; }
      else if (s === 7) r = a & b;
      else if (s === 8) r = a | b;
      else if (s === 9) r = a ^ b;
      else if (s === 10) r = a << (b & 31);
      else if (s === 11) r = a >> (b & 31);
      else if (s === 12) r = (a >>> (b & 31)) | 0;
      else if (s === 13) r = a === b ? 1 : 0;
      else if (s === 14) r = a < b ? 1 : 0;
      else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
      sp -= 2; D[sp++] = r; continue;
    }
    if (k === 11 || k === 12 || k === 13) {
      const rel = ((P[nx - 2] | (P[nx - 1] << 8)) << 16) >> 16;
      let go = true;
      if (k !== 11) { const v = D[--sp]; go = k === 12 ? v === 0 : v !== 0; }
      if (go) pc = nx + rel;
      continue;
    }
    if (k === 14) { if (cp === CM) return [out, ol, 7]; C[cp++] = nx; pc = P[nx - 2] | (P[nx - 1] << 8); continue; }
    if (k === 15) { if (cp === 0) return [out, ol, 8]; pc = C[--cp]; continue; }
    if (k === 16) { const a = D[sp - 1]; if (a < 0 || a >= MM) return [out, ol, 6]; D[sp - 1] = M[a]; continue; }
    if (k === 17) { const a = D[sp - 1], v = D[sp - 2]; if (a < 0 || a >= MM) return [out, ol, 6]; sp -= 2; M[a] = v; continue; }
    if (k === 18) { const b = Buffer.from(String(D[sp - 1]), 'utf8'); if (ol + b.length > OM) return [out, ol, 11]; sp--; out.set(b, ol); ol += b.length; continue; }
    if (k === 19) { if (ol + 1 > OM) return [out, ol, 11]; out[ol++] = D[--sp] & 255; continue; }
    if (k === 20) { D[sp++] = ip < inp.length ? inp[ip++] : -1; continue; }
    return [out, ol, D[--sp] & 255];
  }
}

for (const id of readdirSync(I).sort()) {
  let r;
  try { r = run(readFileSync(join(I, id, 'program.bin')), readFileSync(join(I, id, 'input.bin'))); }
  catch { r = [new Uint8Array(0), 0, 0]; }
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), r[0].subarray(0, r[1]));
  writeFileSync(join(O, id, 'exit.txt'), r[2] + '\n');
}
