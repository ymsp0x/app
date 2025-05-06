// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Struktur ZK Proof untuk integrasi dengan verifier eksternal (Groth16, Plonk, dkk)
struct Proof {
    bytes zkproof;           // ZK proof bytes (dari circom, dsb)
    uint64 timestamp;
    bytes32 contextHash;     // Biasanya hash dari WebProof.jsonBody
}
