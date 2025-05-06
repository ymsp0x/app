// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {AdvancedWebProofProver} from "../src/vlayer/AdvancedWebProofProver.sol";
import {TwitterNFT} from "../src/vlayer/TwitterNFT.sol";

contract DeployVlayerScript is Script {
    function run() external {
        vm.startBroadcast();

        // Ganti dengan address kontrak verifier ZK yang sebenarnya jika sudah ada!
        // Sementara gunakan address dummy agar deploy berhasil di testnet/devnet.
        address verifier = address(0x1234567890123456789012345678901234567890);

        // Deploy AdvancedWebProofProver dengan address verifier
        AdvancedWebProofProver advancedProver = new AdvancedWebProofProver(verifier);
        console.log("AdvancedWebProofProver deployed at:", address(advancedProver));

        // Deploy TwitterNFT dengan address advancedProver sebagai prover
        TwitterNFT twitterNFT = new TwitterNFT(address(advancedProver));
        console.log("TwitterNFT deployed at:", address(twitterNFT));

        vm.stopBroadcast();
    }
}
