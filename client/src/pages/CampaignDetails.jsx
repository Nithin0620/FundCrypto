import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import CountBox from "../components/CountBox"
import CustomButton from "../components/CustomButton"
import Loader from "../components/Loader"
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, address } = useStateContext();

  const [isLoading1, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const { donations: donators, isLoading, error } = getDonations(state.pId, contract);
  
  const remainingDays = daysLeft(state.deadline);

  // const fetchDonators = async () => {
  //   if (state.pId !== undefined) {
  //     try {
  //       const { donations, isLoading, error} = await getDonations(state.pId);
  //       console.log("data",donations);
  //       setDonators(donations);
  //     } catch (error) {
  //       console.error("Error fetching donators:", error);
  //     }
  //   }
  // }

  useEffect(() => {
  if (error) {
    console.error("Error fetching donators:", error);
  }
}, [error]);

  const handleDonate = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    // Check if campaign has ended
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime >= state.deadline) {
      alert('This campaign has ended and no longer accepts donations');
      return;
    }

    setIsLoading(true);

    try {
      await donate(state.pId, amount);
      
      alert('Donation successful! Thank you for supporting this campaign.');
      
      // Refresh donators list
      // await fetchDonators();
      
      // Clear the amount field
      setAmount('');
      
      // Optional: Navigate back to home or stay on the page
      // navigate('/');
    } catch (error) {
      console.error('Donation failed:', error);
      
      if (error.message.includes('user rejected')) {
        alert('Transaction was cancelled by user');
      } else if (error.message.includes('insufficient funds')) {
        alert('Insufficient funds in your wallet');
      } else if (error.message.includes('Campaign has ended')) {
        alert('This campaign has ended and no longer accepts donations');
      } else if (error.message.includes('Campaign does not exist')) {
        alert('This campaign no longer exists');
      } else {
        alert('Donation failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Check if campaign data exists
  if (!state) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <p className="font-epilogue font-semibold text-[18px] text-white">
          Campaign not found. Please go back to the campaigns page.
        </p>
      </div>
    );
  }

  const isCampaignEnded = remainingDays <= 0;

  return (
    <div>
      {isLoading1 && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={state.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl"/>
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div 
              className="absolute h-full bg-[#4acd8d]" 
              style={{ 
                width: `${calculateBarPercentage(state.target, state.amountCollected)}%`, 
                maxWidth: '100%'
              }}
            />
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays > 0 ? remainingDays : 0} />
          <CountBox title={`Raised of ${state.target}`} value={state.amountCollected} />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Creator</h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain"/>
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{state.owner}</h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">Campaign Creator</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Story</h4>

            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{state.description}</p>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donators</h4>

            <div className="mt-[20px] flex flex-col gap-4">
              {donators.length > 0 ? donators.map((item, index) => (
                <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                  <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-all">{index + 1}. {item.donator}</p>
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-all">{item.donation} ETH</p>
                </div>
              )) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">No donators yet. Be the first one!</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Fund</h4>   

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="font-epilogue font-medium text-[20px] leading-[30px] text-center text-[#808191]">
              Fund the campaign
            </p>
            
            {isCampaignEnded ? (
              <div className="mt-[30px]">
                <div className="w-full py-[20px] px-[15px] bg-[#3a3a43] rounded-[10px] text-center">
                  <p className="font-epilogue font-semibold text-[16px] text-[#808191]">
                    This campaign has ended
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-[30px]">
                <input 
                  type="number"
                  placeholder="ETH 0.1"
                  step="0.01"
                  min="0"
                  className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                  <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">Back it because you believe in it.</h4>
                  <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">Support the project for no reward, just because it speaks to you.</p>
                </div>

                <CustomButton 
                  btnType="button"
                  title={!address ? "Connect Wallet" : "Fund Campaign"}
                  styles={`w-full ${!address ? "bg-[#8c6dfd]" : "bg-[#1dc071]"}`}
                  handleClick={!address ? () => alert("Please connect your wallet first") : handleDonate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetails