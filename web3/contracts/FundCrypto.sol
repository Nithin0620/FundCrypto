// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract FundCrypto {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected; // Fixed typo: was 'ammountCollected'
        string image;
        address[] donators; 
        uint256[] donations; 
    }
    
    mapping(uint256 => Campaign) public campaigns;
    uint256 public numberOfCampaigns = 0;

    // Events for better tracking
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        string title,
        uint256 target,
        uint256 deadline
    );
    
    event DonationMade(
        uint256 indexed campaignId,
        address indexed donator,
        uint256 amount
    );

    function createCampaign(
        address _owner,
        string memory _title, 
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        
        // Validation checks
        require(_deadline > block.timestamp, "The deadline should be in future");
        require(_target > 0, "Target amount should be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_owner != address(0), "Owner address cannot be zero");

        Campaign storage campaign = campaigns[numberOfCampaigns];

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        emit CampaignCreated(numberOfCampaigns, _owner, _title, _target, _deadline);
        
        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        require(msg.value > 0, "Donation amount should be greater than 0");
        
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp < campaign.deadline, "Campaign has ended");

        uint256 amount = msg.value;

        // Add donator and donation before transfer for security
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        // Transfer to campaign owner
        (bool sent,) = payable(campaign.owner).call{value: amount}("");
        
        if(sent) {
            campaign.amountCollected = campaign.amountCollected + amount;
            emit DonationMade(_id, msg.sender, amount);
        } else {
            // Revert the arrays if transfer failed
            campaign.donators.pop();
            campaign.donations.pop();
            revert("Transfer to campaign owner failed");
        }
    }

    function getDonators(uint256 _id) view public returns (address[] memory, uint256[] memory) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for(uint256 i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];
            allCampaigns[i] = item;
        }

        return allCampaigns;
    }

    // Additional helper function to get a single campaign
    function getCampaign(uint256 _id) public view returns (Campaign memory) {
        require(_id < numberOfCampaigns, "Campaign does not exist");
        return campaigns[_id];
    }
}