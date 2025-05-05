// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Verifier} from "vlayer/Verifier.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract TwitterNFT is ERC721URIStorage, Verifier {
    address public prover;
    uint256 public nextTokenId = 1;

    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(address _prover) ERC721("TwitterProofNFT", "TPNFT") {
        prover = _prover;
    }

    function mintWithTwitterProof(
        address to,
        bytes calldata zkproof,
        string calldata tokenURI
    ) external {
        onlyVerified(prover, bytes4(keccak256("main(bytes)")));
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        emit Minted(to, tokenId, tokenURI);
    }

    function updateTokenURI(uint256 tokenId, string calldata newURI) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner nor approved");
        _setTokenURI(tokenId, newURI);
    }
}
