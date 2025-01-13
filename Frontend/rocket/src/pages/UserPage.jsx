import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import DashboardLayout from "../components/DashboardLayout";
import ParkingLotCard from "../components/ParkingLotCard";

const UserPage = () => {
  const navigate = useNavigate();
  const [parkingLots, setParkingLots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState("");

  const fetchParkingLotStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/parking-lot/status/");
      setParkingLots(response.data);
    } catch (err) {
      console.error("Error fetching parking lot status:", err);
      setError("Failed to fetch parking lot status. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("fullName");
    setFullName(name || "User"); // Retrieve the name or set it as User

    if (!token || role !== "user") {
      navigate("/login");
    } else {
      fetchParkingLotStatus();
    }
  }, [navigate]);

  const handleParkingLotClick = (lot) => {
    // Placeholder for future functionality
    console.log("Clicked on parking lot:", lot.name);
    // You can add navigation or modal display logic here
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4">
        {/* Welcome Section */}
        <div className="flex items-center bg-blue-100 p-4 rounded-lg shadow-md mb-6 ">
          <div className="ml-4">
            <h2 className="text-2xl font-semibold text-blue-700 ">
              Welcome, {fullName}!
            </h2>
            <p className="text-sm text-gray-600 ">
              We're glad to have you here. Manage parking spaces with ease!
            </p>
          </div>
        </div>

        {/* Parking Lots Grid Section */}
        <div className="bg-white shadow-md rounded-lg p-6 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 ">
              Parking Lot Status
            </h2>
          </div>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {parkingLots.map((lot) => (
                <ParkingLotCard
                  key={lot.parking_lot_id}
                  lot={lot}
                  onClick={handleParkingLotClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserPage;
