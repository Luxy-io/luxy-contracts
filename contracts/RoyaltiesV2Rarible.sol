/*
                            __;φφφ≥,,╓╓,__
                           _φ░░░░░░░░░░░░░φ,_
                           φ░░░░░░░░░░░░╚░░░░_
                           ░░░░░░░░░░░░░░░▒▒░▒_
                          _░░░░░░░░░░░░░░░░╬▒░░_
    _≤,                    _░░░░░░░░░░░░░░░░╠░░ε
    _Σ░≥_                   `░░░░░░░░░░░░░░░╚░░░_
     _φ░░                     ░░░░░░░░░░░░░░░▒░░
       ░░░,                    `░░░░░░░░░░░░░╠░░___
       _░░░░░≥,                 _`░░░░░░░░░░░░░░░░░φ≥, _
       ▒░░░░░░░░,_                _ ░░░░░░░░░░░░░░░░░░░░░≥,_
      ▐░░░░░░░░░░░                 φ░░░░░░░░░░░░░░░░░░░░░░░▒,
       ░░░░░░░░░░░[             _;░░░░░░░░░░░░░░░░░░░░░░░░░░░
       \░░░░░░░░░░░»;;--,,. _  ,░░░░░░░░░░░░░░░░░░░░░░░░░░░░░Γ
       _`░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░φ,,
         _"░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"=░░░░░░░░░░░░░░░░░
            Σ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░_    `╙δ░░░░Γ"  ²░Γ_
         ,φ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░_
       _φ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░φ░░≥_
      ,▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░≥
     ,░░░░░░░░░░░░░░░░░╠▒░▐░░░░░░░░░░░░░░░╚░░░░░≥
    _░░░░░░░░░░░░░░░░░░▒░░▐░░░░░░░░░░░░░░░░╚▒░░░░░
    φ░░░░░░░░░░░░░░░░░φ░░Γ'░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░░░░░░░░░░░░░░░░░░░_ ░░░░░░░░░░░░░░░░░░░░░░░░[
    ╚░░░░░░░░░░░░░░░░░░░_  └░░░░░░░░░░░░░░░░░░░░░░░░
    _╚░░░░░░░░░░░░░▒"^     _7░░░░░░░░░░░░░░░░░░░░░░Γ
     _`╚░░░░░░░░╚²_          \░░░░░░░░░░░░░░░░░░░░Γ
         ____                _`░░░░░░░░░░░░░░░Γ╙`
                               _"φ░░░░░░░░░░╚_
                                 _ `""²ⁿ""

        ██╗         ██╗   ██╗    ██╗  ██╗    ██╗   ██╗
        ██║         ██║   ██║    ╚██╗██╔╝    ╚██╗ ██╔╝
        ██║         ██║   ██║     ╚███╔╝      ╚████╔╝ 
        ██║         ██║   ██║     ██╔██╗       ╚██╔╝  
        ███████╗    ╚██████╔╝    ██╔╝ ██╗       ██║   
        ╚══════╝     ╚═════╝     ╚═╝  ╚═╝       ╚═╝   
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LibPart.sol";

interface RoyaltiesV2Rarible {
    event RoyaltiesSet(uint256 tokenId, LibPart.Part[] royalties);

    function getRaribleV2Royalties(uint256 id)
        external
        view
        returns (LibPart.Part[] memory);
}