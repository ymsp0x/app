// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {Script, console2} from "forge-std/Script.sol";
import {SimpleVerifier} from "../src/vlayer/SimpleVerifier.sol";
import {AdvancedWebProofProver} from "../src/vlayer/AdvancedWebProofProver.sol";
import {TwitterNFT} from "../src/vlayer/TwitterNFT.sol";

contract DeployAllVlayerWithJson is Script {
    function run() external {
        vm.startBroadcast();

        // Step 1: Deploy SimpleVerifier
        SimpleVerifier verifier = new SimpleVerifier();
        console2.log("SimpleVerifier deployed at:", address(verifier));

        // Step 2: Deploy AdvancedWebProofProver (with verifier address)
        AdvancedWebProofProver prover = new AdvancedWebProofProver(address(verifier));
        console2.log("AdvancedWebProofProver deployed at:", address(prover));

        // Step 3: Deploy TwitterNFT (with prover address)
        TwitterNFT twitterNFT = new TwitterNFT(address(prover));
        console2.log("TwitterNFT deployed at:", address(twitterNFT));

        vm.stopBroadcast();

        // Tulis alamat kontrak ke file JSON (di folder broadcast)
        string memory json = string.concat(
            "{\n",
            '  "SimpleVerifier": "', vm.toString(address(verifier)), '",\n',
            '  "AdvancedWebProofProver": "', vm.toString(address(prover)), '",\n',
            '  "TwitterNFT": "', vm.toString(address(twitterNFT)), '"\n',
            "}\n"
        );
        string memory outPath = string.concat("broadcast/DeployedAddresses.json");
        vm.writeFile(outPath, json);
        console2.log("Deployed addresses saved to:", outPath);
    }
}
