// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "./Certificate.sol";

contract Registry {
    using Counters for Counters.Counter;

    Counters.Counter cnt;
    address certContract;
    


    struct CertificateInfo{
        uint id;
        address owner; // wallet id
        address issuer; // wallet id
        string courseTitle; // Introduction to blockchain
        string ownerName; // Hasan Masum
        string issuerName; // e.g. BUET, Google etc
        uint expireTs;
        bool verified;
    }

    mapping(uint256 => CertificateInfo) certificates;

    constructor(address _certContract){
        cnt.reset();
        certContract = _certContract;
    }


    function addCertifcate(
        address _issuerAccount,
        string memory _courseTitle,
        string memory _ownerName,
        string memory _issuerName,
        uint _expireTs
    ) public {
        uint cid = cnt.current();
        cnt.increment();

        // store onwnership
        Certificate(certContract).safeMint(msg.sender, cid); // 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2

        CertificateInfo memory cert = CertificateInfo(
            cid,
            msg.sender,
            _issuerAccount,
            _courseTitle,
            _ownerName,
            _issuerName,
            _expireTs,
            false
        );

        certificates[cid] = cert;
    }

    /*
    return all the certificates owned by msg.sender
    */
    function getCertificates() public view returns (CertificateInfo[] memory){
        // uint temp = 0;
        // for (uint i=0; i < cnt.current(); i++) {
        //     if(certificates[i].owner == msg.sender){
        //         temp+=1;
        //     }
        // }
        
        // if(temp == 0){
        //     console.log("No certificates found");
        //     CertificateInfo[] memory dummy = new CertificateInfo[](1);
        //     dummy[0].ownerName = "";
        //     return dummy;
        // }
        // // require( temp != 0,
        // //     "List is empty"
        // // ); 

        // CertificateInfo[] memory result = new CertificateInfo[](temp);

        // uint j = 0;
        // for (uint i=0; i < cnt.current(); i++) {
        //     if(certificates[i].owner == msg.sender){
        //         result[j] = certificates[i];
        //         j+=1;
        //     }
        // }

        CertificateInfo[] memory result = new CertificateInfo[](cnt.current());

        for (uint i=0; i < cnt.current(); i++) {
            result[i] = certificates[i];
        }

        return result;
    }

    function getCertificate(uint cid) public view returns (CertificateInfo memory) {
        return certificates[cid];
    }


    function verify(uint cid) public{ // 0xc87bfce1697950331d60F6B141eA912A958A2024
        require( certificates[cid].issuer  == msg.sender,
            "Only issuer can verify a certificate"
        );         
    
        certificates[cid].verified = true;
    }

    function strcmp(string memory s1, string memory s2) public pure returns(bool){
        return keccak256(abi.encodePacked(s1)) == keccak256(abi.encodePacked(s2));
    }


    function checkVerified(
        uint cid,
        string memory _ownerName,
        string memory _issuerName
    ) public view returns (bool) {
        //console.log(cid, _ownerName, _issuerName);
        if(cid >= cnt.current()){
            console.log("certificate doesn't exist");
            return false;
        }

        if(!certificates[cid].verified){
            console.log("certificate is not verified yet");
            return false;
        }

        if(!strcmp(_ownerName, certificates[cid].ownerName)){
            console.log("Invalid owner");
            return false;
        }

        if(!strcmp(_issuerName, certificates[cid].issuerName)){
            console.log("Invalid issuer");
            return false;
        }
        return true;
    }


    struct StackInfo{
        address studentAccount;
        string courseTitle;
        uint surity;
        uint expireTs;
    }

    mapping(address => StackInfo[]) stakes; // stake sender, stacks
    address[] studentAcconts;

    function addSurity(string memory courseTitle, address payable receiver, uint expireTs) public payable{
        require(msg.value>=0, "Invalid amount");
        StackInfo memory si = StackInfo(msg.sender, courseTitle, msg.value, expireTs);
        stakes[msg.sender].push(si);
        receiver.transfer(msg.value);
    }

    function getStackInfo() public view returns (StackInfo[] memory){
        return stakes[msg.sender];
    }

    function refund(address payable receiver) public payable {
        require(msg.value>=0, "Invalid amount");
        receiver.transfer(msg.value);
    }

     
}