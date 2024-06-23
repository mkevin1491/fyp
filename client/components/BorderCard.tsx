import React from 'react';

const BorderCard = ({ title, description, color }) => {
  return (
    <div className={`max-w-xs flex flex-col bg-white border border-t-4 ${color} shadow-sm rounded-xl`}>
      <div className="p-4 md:p-5">
        <h3 className="text-lg font-bold text-gray-800">
          {description}
        </h3>
        <p className="mt-2 text-gray-500">
          {title}
        </p>
      </div>
    </div>
  );
};

export default BorderCard;
