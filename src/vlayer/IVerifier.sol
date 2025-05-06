// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Interface standar untuk Verifier ZK (Groth16, Plonk, etc)
interface IVerifier {
    function verifyProof(
        bytes calldata proof,
        uint256[2] calldata publicInputs
    ) external view returns (bool);
}
