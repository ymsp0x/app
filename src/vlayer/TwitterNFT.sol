// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/token/ERC721/ERC721.sol";
import "@openzeppelin/token/ERC721/extensions/ERC721URIStorage.sol";
import {IAdvancedWebProofProver} from "./IAdvancedWebProofProver.sol"; // interface prover kamu

contract TwitterNFT is ERC721URIStorage {
    address public prover; // Kontrak prover yang sudah diverifikasi
    uint256 public nextTokenId = 1;

    event MintWithProof(address indexed minter, uint256 tokenId, string username);

    constructor(address _prover) ERC721("TwitterProofNFT", "TPNFT") {
        prover = _prover;
    }

    function setProver(address _prover) external {
        // Batasi akses jika perlu (misal: onlyOwner)
        prover = _prover;
    }

    function mintWithTwitterProof(
        string calldata username,
        string calldata tokenURI
    ) external {
        // Pastikan user sudah diverifikasi via prover
        require(IAdvancedWebProofProver(prover).checkVerified(msg.sender), "Not verified by prover");

        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit MintWithProof(msg.sender, tokenId, username);
    }
}
