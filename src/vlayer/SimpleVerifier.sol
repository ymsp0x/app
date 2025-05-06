// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Dummy verifier contract, always returns true for testing
contract SimpleVerifier {
    /// @notice Simulasi verifikasi ZK (Groth16, Plonk, dll)
    function verifyProof(
        bytes calldata proof,
        uint256[2] calldata publicInputs
    ) external pure returns (bool) {
        // Demo/development only: always return true
        return true;
    }
}
