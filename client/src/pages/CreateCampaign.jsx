import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import { useStateContext } from '../context';
import { money } from '../assets';
import CustomButton from "../components/CustomButton"
import FormField from "../components/FormField" 
import Loader from '../components/Loader';
import { checkIfImage } from '../utils';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { createCampaign, address } = useStateContext();
  const [form, setForm] = useState({
    name: '',
    title: '',
    description: '',
    target: '', 
    deadline: '',
    image: ''
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value })
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!form.target) {
      newErrors.target = 'Target amount is required';
    } else {
      const targetNum = parseFloat(form.target);
      if (isNaN(targetNum) || targetNum <= 0) {
        newErrors.target = 'Target amount must be a valid number greater than 0';
      }
    }
    
    if (!form.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const selectedDate = new Date(form.deadline);
      const now = new Date();
      
      if (selectedDate <= now) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }
    
    if (!form.image.trim()) {
      newErrors.image = 'Image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if wallet is connected
    // if (!address) {
    //   alert('Please connect your wallet first');
    //   return;
    // }

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check image validity
    checkIfImage(form.image, async (exists) => {
      if(exists) {
        setIsLoading(true);
        try {
          // Convert target to wei format (string to be handled in context)
          const campaignData = {
            ...form,
            target: form.target // Keep as string, will be converted to wei in context
          };
          
          console.log('Submitting campaign:', campaignData);
          
          await createCampaign(campaignData);
          
          console.log('Campaign created successfully!');
          navigate('/');
        } catch (error) {
          console.error('Error creating campaign:', error);
          
          // Display user-friendly error messages
          
        } finally {
          setIsLoading(false);
        }
      } else {
        alert('Please provide a valid image URL');
        setForm({ ...form, image: '' });
        setErrors({ ...errors, image: 'Please provide a valid image URL' });
      }
    });
  }

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">Start a Campaign</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Your Name *"
            placeholder="John Doe"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange('name', e)}
          />
          <FormField 
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange('title', e)}
          />
          {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
        </div>

        <FormField 
          labelName="Story *"
          placeholder="Write your story"
          isTextArea
          value={form.description}
          handleChange={(e) => handleFormFieldChange('description', e)}
        />
        {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}

        <div className="w-full flex justify-start items-center p-4 bg-[#8c6dfd] h-[120px] rounded-[10px]">
          <img src={money} alt="money" className="w-[40px] h-[40px] object-contain"/>
          <h4 className="font-epilogue font-bold text-[25px] text-white ml-[20px]">You will get 100% of the raised amount</h4>
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Goal *"
            placeholder="ETH 0.50"
            inputType="number"
            value={form.target}
            handleChange={(e) => handleFormFieldChange('target', e)}
          />
          {errors.target && <span className="text-red-500 text-sm">{errors.target}</span>}
          
          <FormField 
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange('deadline', e)}
          />
          {errors.deadline && <span className="text-red-500 text-sm">{errors.deadline}</span>}
        </div>

        <FormField 
          labelName="Campaign image *"
          placeholder="Place image URL of your campaign"
          inputType="url"
          value={form.image}
          handleChange={(e) => handleFormFieldChange('image', e)}
        />
        {errors.image && <span className="text-red-500 text-sm">{errors.image}</span>}

        <div className="flex justify-center items-center mt-[40px]">
          <CustomButton 
            btnType="submit"
            title="Submit new campaign"
            styles="bg-[#1dc071]"
          />
        </div>
      </form>
    </div>
  )
}

export default CreateCampaign