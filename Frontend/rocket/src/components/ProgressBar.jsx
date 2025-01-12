import React from "react";

const ProgressBar = ({
  occupancy,
  capacity,
  showPercentage = true,
  height = "h-6",
}) => {
  const percentage = Math.round((occupancy / capacity) * 100);

  const getColor = (percentage) => {
    if (percentage < 50) return "bg-green-500";
    if (percentage < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full">
      <div
        className={`relative ${height} bg-gray-200 rounded-full shadow-inner overflow-hidden dark:bg-gray-300`}
      >
        <div
          className={`h-full ${getColor(
            percentage
          )} transition-all duration-500 ease-out rounded-full relative`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {showPercentage && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
              {percentage}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
