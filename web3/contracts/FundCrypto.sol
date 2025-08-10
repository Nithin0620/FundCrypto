// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract FundCrypto {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 ammountCollected;
        string image;
        address[] donators;
        uint256[] donations; 
    }
    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns=0;

    function createCampaign(address _owner,string memory _title, string memory _description,
                            uint256 _target,uint256 _deadline,uint256 _ammountCollected,string memory _image) public returns (uint256){
        
        Campaign storage campaign = campaigns[numberOfCampaigns];

        require(_deadline > block.timestamp , "The deadline should be in future");

        campaign.owner = _owner;
        campaign.description = _description;
        campaign.title = _title;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.ammountCollected = _ammountCollected;
        campaign.image = _image;

        numberOfCampaigns++;
        return numberOfCampaigns-1;
    }

    function donateToCampaign(uint256 _id) public payable{
        uint256 ammount = msg.value;

        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender);
        campaign.donations.push(ammount);

        (bool sent,) = payable(campaign.owner).call{value:ammount}("");

        if(sent){
            campaign.ammountCollected = campaign.ammountCollected + ammount;
        }
    }

    function getDonators(uint256 _id) view public returns (address[] memory,uint256[] memory){
        return (campaigns[_id].donators , campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory){
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for(uint256 i=0;i<numberOfCampaigns;i++){
            Campaign storage item = campaigns[i];
            allCampaigns[i]= item;
        }

        return allCampaigns;
    }

}