export const daysLeft = (deadline) => {
  const deadlineInMs = Number(deadline) * 1000; // convert seconds → ms
  const difference = deadlineInMs - Date.now();
  return Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));
};


export const calculateBarPercentage = (goal, raisedAmount) => {
   const percentage = Math.round((raisedAmount * 100) / goal);

   return percentage;
};

export const checkIfImage = (url, callback) => {
   const img = new Image();
   img.src = url;

   if (img.complete) callback(true);

   img.onload = () => callback(true);
   img.onerror = () => callback(false);
};