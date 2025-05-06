// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {WebProof, WebProofLib} from "./WebProof.sol";
import {Proof} from "./Proof.sol";
import {IVerifier} from "./IVerifier.sol";

contract AdvancedWebProofProver {
    using WebProofLib for string;

    address public immutable verifier; // Verifier ZK (Groth16, Plonk, dsb)
    mapping(bytes32 => bool) public usedProofs; // anti replay
    mapping(address => bool) public isVerified;

    event ProofVerified(address indexed user, bytes32 indexed contextHash, string username, uint256 followers);

    constructor(address _verifier) {
        verifier = _verifier;
    }

    /// @notice Submit WebProof & ZK Proof, publicInputs: [followers, hash(username)]
    function submitWebProof(
        WebProof calldata web,
        Proof calldata proof,
        uint256[2] calldata publicInputs,
        bytes calldata zkproof
    ) external {
        // Pastikan hash JSON utuh dan anti replay
        require(web.hash == WebProofLib.computeHash(web.jsonBody), "Invalid WebProof hash");
        require(!usedProofs[proof.contextHash], "Proof already used");
        require(proof.contextHash == web.hash, "Mismatch context hash");
        require(bytes(web.username).length > 0, "Username required");
        require(web.followers >= 100, "Minimal followers 100");

        // Verifikasi ZK proof via kontrak eksternal (Groth16/Plonk)
        bool verified = IVerifier(verifier).verifyProof(zkproof, publicInputs);
        require(verified, "Invalid ZK proof");

        // Validasi public input vs WebProof
        require(publicInputs[0] == web.followers, "Followers mismatch");
        require(publicInputs[1] == uint256(keccak256(bytes(web.username))), "Username hash mismatch");

        usedProofs[proof.contextHash] = true;
        isVerified[msg.sender] = true;
        emit ProofVerified(msg.sender, proof.contextHash, web.username, web.followers);
    }

    function checkVerified(address user) external view returns (bool) {
        return isVerified[user];
    }
}
