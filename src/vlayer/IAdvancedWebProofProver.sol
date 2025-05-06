// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IAdvancedWebProofProver {
    function checkVerified(address user) external view returns (bool);
}
