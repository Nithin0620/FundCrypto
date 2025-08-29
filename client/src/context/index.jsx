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

import contractABI from "../FundCrypto.json";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const client = createThirdwebClient({
    clientId: "595d28d6cc301f4dd7c24bf6f5fda355",
  });

  const contract = getContract({
    client,
    chain: sepolia,
    address: "0x148415669a843c11eaa548e9ab4be9e5836a315a",
    abi: contractABI.abi,
  });

  const wallet = createWallet("io.metamask");
  const { connect } = useConnect();
  const account = useActiveAccount();
  const address = account?.address;

  const connectMetamask = async () => {
    await connect(async () => {
      await wallet.connect({ client, chain: sepolia });
      return wallet;
    });
  };

  const { mutateAsync: sendTxCreateCampaign } = useSendTransaction();

  const validateCampaignData = (form) => {
    const errors = [];
    if (!form.title?.trim()) errors.push("Title is required");
    if (!form.description?.trim()) errors.push("Description is required");
    if (!form.target || parseFloat(form.target) <= 0)
      errors.push("Target amount must be greater than 0");
    if (!form.deadline) errors.push("Deadline is required");
    else {
      const deadlineDate = new Date(form.deadline);
      if (isNaN(deadlineDate.getTime()) || deadlineDate <= new Date()) {
        errors.push("Deadline must be a valid future date");
      }
    }
    if (!form.image?.trim()) errors.push("Image URL is required");
    return errors;
  };

  const testContractConnection = async () => {
    try {
      const data = await readContract({
        contract,
        method: "getCampaigns",
        params: [],
      });
      console.log("data read successfully:", data);
      return true;
    } catch {
      return false;
    }
  };

  const publishCampaign = async (form) => {
    if (!address) throw new Error("Please connect your wallet first");
    if (!(await testContractConnection()))
      throw new Error("Contract connection failed");

    const validationErrors = validateCampaignData(form);
    if (validationErrors.length > 0)
      throw new Error(validationErrors.join(", "));

    const targetWei =
      typeof form.target === "string" ? toWei(form.target) : form.target;

    const [year, month, day] = form.deadline.split("-").map(Number);
    const deadlineDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
    const deadlineInSeconds = Math.floor(deadlineDate.getTime() / 1000);
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (deadlineInSeconds <= currentTimestamp)
      throw new Error("Deadline must be in the future");

    const transaction = prepareContractCall({
      contract,
      method: "createCampaign",
      params: [
        address,
        form.title.trim(),
        form.description.trim(),
        targetWei,
        BigInt(deadlineInSeconds),
        form.image.trim(),
      ],
    });

    return await sendTxCreateCampaign(transaction);
  };

  const { data: campaignsData } = useReadContract({
    contract,
    method: "getCampaigns",
    params: [],
  });

  const getCampaigns = () =>
    campaignsData
      ? campaignsData.map((c, i) => ({
          owner: c.owner,
          title: c.title,
          description: c.description,
          target: toEther(c.target),
          deadline: Number(c.deadline),
          amountCollected: toEther(c.amountCollected),
          image: c.image,
          pId: i,
        }))
      : [];

  const getUserCampaigns = () =>
    address ? getCampaigns().filter((c) => c.owner === address) : [];

  const { mutateAsync: sendTxDonate } = useSendTransaction();

  const donate = async (pId, amount) => {
    if (!address) throw new Error("Please connect your wallet first");
    if (!amount || parseFloat(amount) <= 0)
      throw new Error("Invalid donation amount");

    const transaction = prepareContractCall({
      contract,
      method: "donateToCampaign",
      params: [BigInt(pId)],
      value: toWei(amount.toString()),
    });

    return await sendTxDonate(transaction);
  };

  // ✅ useGetDonations hook
const useGetDonations = (pId, contract) => {
  const { data, isLoading, error } = useReadContract({
    contract,
    method: "getDonators",
    params: [BigInt(pId)],
  });

  const donations = data
    ? data[0].map((donator, i) => ({
        donator,
        donation: toEther(data[1][i]),
      }))
    : [];

  return { donations, isLoading, error };
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
        testContractConnection,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
