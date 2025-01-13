import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import apiClient from "../api/apiClient";

const ImmeExit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plateNumber } = location.state || {};
  const [isLoading, setIsLoading] = useState(true);
  const [feeDetails, setFeeDetails] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!plateNumber) {
      setError("No plate number provided. Please try again.");
      setIsLoading(false);
      return;
    }
    const fetchFeeDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await apiClient.post(
          "/service/calculate-fee/",
          { plate_number: plateNumber },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFeeDetails(response.data);
      } catch (err) {
        console.error("Error fetching fee details:", err);
        setError("Failed to fetch fee details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeeDetails();
  }, [plateNumber]);

  const formatDateTime = (dateString) => {
    return dateString
      ? format(parseISO(dateString), "MMM dd, yyyy HH:mm:ss")
      : "-";
  };

  const handleConfirmExit = async () => {
    setIsConfirming(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      await apiClient.post(
        "/service/exit/",
        { plate_number: plateNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccessMessage("Vehicle exit confirmed successfully.");
      setTimeout(() => navigate("/parking-lot"), 2000);
    } catch (err) {
      console.error("Error confirming exit:", err);
      setError("Failed to confirm exit. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };
};

return (
  <div className="max-w-3xl mx-auto pt-8">
    <div className="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-700">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">
          Exit Confirmation
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-100">
                Plate Number
              </h3>
              <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                {feeDetails.plate_number}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-100">
                Entry Time
              </h3>
              <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                {formatDateTime(feeDetails.entry_time)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-100">
                Current Time
              </h3>
              <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                {formatDateTime(feeDetails.current_time)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-100">
                Total Time Parked
              </h3>
              <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                {feeDetails.total_time_parked}
              </p>
            </div>
            {feeDetails.calculated_fee !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-100">
                  Calculated Fee
                </h3>
                <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                  Rs. {feeDetails.calculated_fee.toFixed(2)}
                </p>
              </div>
            )}
            {feeDetails.rate_per_hour !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-100">
                  Rate per Hour
                </h3>
                <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                  Rs. {feeDetails.rate_per_hour.toFixed(2)}
                </p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-100">
                Parking Lot
              </h3>
              <p className="mt-1 text-lg font-semibold dark:text-gray-100">
                {feeDetails.parking_lot_name}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => navigate("/parking-lot")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 dark:hover:bg-gray-600 dark:text-gray-100"
            >
              Return
            </button>
            <button
              onClick={handleConfirmExit}
              disabled={isConfirming}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              {isConfirming ? "Confirming..." : "Confirm Exit"}
            </button>
          </div>
          {error && (
            <div
              className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded"
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          {successMessage && (
            <div
              className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded"
              role="alert"
            >
              <strong className="font-bold">Success:</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default ImmeExit;
