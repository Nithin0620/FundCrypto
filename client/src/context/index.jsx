/* global BigInt */

import React, { useEffect, useContext, createContext } from "react";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
  useConnect,
} from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";
import {
  getContract,
  prepareContractCall,
  createThirdwebClient,
  toWei,
  toEther,
  readContract,
} from "thirdweb";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const client = createThirdwebClient({
    clientId: "595d28d6cc301f4dd7c24bf6f5fda355",
  });

  const contract = getContract({
    client,
    chain: sepolia,
    address: "0xcf35d77bfe4c3f16675e79d435dc218736d920cb",
  });

  const wallet = createWallet("io.metamask");
  const { connect } = useConnect();
  const account = useActiveAccount();
  const address = account?.address;

  // Log address changes for debugging
  useEffect(() => {
    console.log("Account updated:", account);
    console.log("Address:", address);
    if (!account) {
      console.warn("No active account detected");
    }
  }, [account, address]);

  const connectMetamask = async () => {
    try {
      await connect(async () => {
        await wallet.connect({
          client,
          chain: sepolia,
        });
        return wallet;
      });
      console.log("Wallet connected successfully");
    } catch (error) {
      console.error("MetaMask connection failed:", error);
    }
  };

  const { mutateAsync: sendTxCreateCampaign } = useSendTransaction();

  // Enhanced validation function
  const validateCampaignData = (form) => {
    const errors = [];

    if (!form.title || form.title.trim() === "") {
      errors.push("Title is required");
    }
    
    if (!form.description || form.description.trim() === "") {
      errors.push("Description is required");
    }
    
    if (!form.target) {
      errors.push("Target amount is required");
    } else {
      const targetNum = parseFloat(form.target);
      if (isNaN(targetNum) || targetNum <= 0) {
        errors.push("Target amount must be a valid number greater than 0");
      }
    }
    
    if (!form.deadline) {
      errors.push("Deadline is required");
    } else {
      const deadlineDate = new Date(form.deadline);
      const now = new Date();
      
      if (isNaN(deadlineDate.getTime())) {
        errors.push("Deadline must be a valid date");
      } else if (deadlineDate <= now) {
        errors.push("Deadline must be in the future");
      }
    }
    
    if (!form.image || form.image.trim() === "") {
      errors.push("Image URL is required");
    }

    return errors;
  };

  // Test contract connection
  const testContractConnection = async () => {
    try {
      console.log("Testing contract connection...");
      const campaigns = await readContract({
        contract,
        method: "function getCampaigns() view returns (tuple(address owner,string title,string description,uint256 target,uint256 deadline,uint256 ammountCollected,string image,address[] donators,uint256[] donations)[])",
        params: [],
      });
      console.log("Contract connection successful, campaigns:", campaigns);
      return true;
    } catch (error) {
      console.error("Contract connection failed:", error);
      return false;
    }
  };

  const publishCampaign = async (form) => {
    console.log("=== CAMPAIGN CREATION DEBUG ===");
    
    // Check wallet connection
    if (!address) {
      const error = "No address available. Please connect your wallet first.";
      console.error(error);
      throw new Error(error);
    }
    console.log("✓ Wallet connected:", address);

    // Test contract connection
    const contractConnected = await testContractConnection();
    if (!contractConnected) {
      throw new Error("Contract connection failed");
    }
    console.log("✓ Contract connection verified");

    // Validate form data
    const validationErrors = validateCampaignData(form);
    if (validationErrors.length > 0) {
      const error = `Validation failed: ${validationErrors.join(", ")}`;
      console.error(error);
      throw new Error(error);
    }
    console.log("✓ Form validation passed");

    // Prepare data
    const targetWei = toWei(form.target.toString());
    const deadlineTimestamp = Math.floor(new Date(form.deadline).getTime() / 1000);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    console.log("Campaign data:", {
      owner: address,
      title: form.title,
      description: form.description,
      target: form.target,
      targetWei: targetWei.toString(),
      deadline: form.deadline,
      deadlineTimestamp: deadlineTimestamp,
      currentTimestamp: currentTimestamp,
      timeUntilDeadline: deadlineTimestamp - currentTimestamp,
      image: form.image,
    });

    // Double-check deadline
    if (deadlineTimestamp <= currentTimestamp) {
      const error = `Deadline must be in the future. Current: ${currentTimestamp}, Deadline: ${deadlineTimestamp}`;
      console.error(error);
      throw new Error(error);
    }
    console.log("✓ Deadline validation passed");

    try {
      // Try with explicit gas estimation
      const transaction = prepareContractCall({
        contract,
        method: "function createCampaign(address _owner,string _title,string _description,uint256 _target,uint256 _deadline,uint256 _ammountCollected,string _image) returns (uint256)",

        params: [
          address,
          form.title.trim(),
          form.description.trim(),
          targetWei,
          BigInt(deadlineTimestamp),
          BigInt(0), // _ammountCollected should be 0 for new campaigns
          form.image.trim(),
        ],
      });

      console.log("✓ Transaction prepared:", transaction);
      
      const result = await sendTxCreateCampaign(transaction);
      console.log("✓ Campaign created successfully:", result);
      return result;
      
    } catch (error) {
      console.error("❌ Error creating campaign:", error);
      
      // Enhanced error analysis
      if (error.message.includes("execution reverted")) {
        console.error("EXECUTION REVERTED - Possible causes:");
        console.error("1. Contract may have additional validation logic");
        console.error("2. Contract may be paused or have access controls");
        console.error("3. Gas estimation may have failed");
        console.error("4. Contract address may be incorrect");
        console.error("5. Function signature may not match contract");
        
        // Check if it's a gas issue
        if (error.message.includes("gas") || error.message.includes("out of gas")) {
          console.error("   → This appears to be a gas-related issue");
        }
        
        // Check if it's a validation issue
        if (error.data === "0x") {
          console.error("   → No revert reason provided by contract");
          console.error("   → This usually means a require() statement failed without a message");
        }
      }
      
      throw error;
    }
  };

  const { data: campaignsData } = useReadContract({
    contract,
    method:
      "function getCampaigns() view returns (tuple(address owner,string title,string description,uint256 target,uint256 deadline,uint256 ammountCollected,string image)[])",
    params: [],
  });

  const getCampaigns = () => {
    return campaignsData
      ? campaignsData.map((campaign, i) => ({
          owner: campaign.owner,
          title: campaign.title,
          description: campaign.description,
          target: toEther(campaign.target),
          deadline: Number(campaign.deadline),
          amountCollected: toEther(campaign.ammountCollected), // Note: contract uses 'ammountCollected'
          image: campaign.image,
          pId: i,
        }))
      : [];
  };

  const getUserCampaigns = () => {
    if (!address) return [];
    return getCampaigns().filter((c) => c.owner === address);
  };

  const { mutateAsync: sendTxDonate } = useSendTransaction();

  const donate = async (pId, amount) => {
    if (!address) {
      console.error("No address available. Please connect your wallet first.");
      return;
    }

    try {
      const transaction = prepareContractCall({
        contract,
        method: "function donateToCampaign(uint256) payable",
        params: [pId],
        value: toWei(amount.toString()),
      });

      await sendTxDonate(transaction);
      console.log("Donation successful");
    } catch (error) {
      console.error("Error donating:", error);
    }
  };

  const useGetDonations = (pId) => {
    const { data } = useReadContract({
      contract,
      method:
        "function getDonators(uint256) view returns (address[], uint256[])",
      params: [pId],
    });

    const parsedDonations = data
      ? data[0].map((donator, i) => ({
          donator,
          donation: toEther(data[1][i]),
        }))
      : [];

    return parsedDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connectMetamask,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations: useGetDonations,
        isConnected: !!address,
        testContractConnection, // Added for debugging
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);