// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Prover} from "vlayer/Prover.sol";
import {Proof} from "vlayer/Proof.sol";
import {Web, WebLib} from "vlayer/WebProof.sol";

contract AdvancedWebProofProver is Prover {
    using WebLib for Web;

    function main(Web memory web) public returns (Proof memory, string memory) {
        string memory username = web.jsonGetString("user.screen_name");
        require(bytes(username).length > 0, "Username is empty");

        int256 followersCount = web.jsonGetInt("user.followers | length(@)");
        require(followersCount >= 100, "Not enough followers");

        return (proof(), web.body);
    }
}
