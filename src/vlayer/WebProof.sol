// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Struktur WebProof, hasil parsing backend
struct WebProof {
    string username;
    uint256 followers;
    string jsonBody; // WebProof JSON original (opsional, bisa dipakai untuk audit)
    bytes32 hash;    // Hash dari jsonBody untuk integritas
}

library WebProofLib {
    function computeHash(string memory body) internal pure returns (bytes32) {
        return keccak256(bytes(body));
    }
}
