import React from "react";
import ProgressBar from "./ProgressBar";

const ParkingLotCard = ({ lot }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-gray-400">
      <h3 className="text-lg font-semibold mb-2">{lot.name}</h3>
      <ProgressBar occupancy={lot.occupied} capacity={lot.total} height="h-4" />
      <div className="mt-2 flex justify-between text-sm">
        <span>Occupied: {lot.occupied}</span>
        <span>Total: {lot.total}</span>
      </div>
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-800">
        Available: {lot.remaining}
      </div>
    </div>
  );
};

export default ParkingLotCard;
