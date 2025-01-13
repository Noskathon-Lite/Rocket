import React, { useState, useEffect, useRef } from "react";
import apiClient from "../api/apiClient";

const ParkingLotPage = () => {
  const [detectedPlate, setDetectedPlate] = useState("");
  const [selectedParkingLot, setSelectedParkingLot] = useState("");
  const [isResident, setIsResident] = useState(false);
  const [vehicleType, setVehicleType] = useState("2-wheeler");
  const vehicleTypes = ["2-wheeler", "4-wheeler"];
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState("");
  const [isResident, setIsResident] = useState(false);

  const fetchVehicleInfo = async () => {
    try {
      const response = await apiClient.post(
        "/service/search-plates/",
        {
          plate_number: detectedPlate,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Response for number plate status:", response.data);

      if (response.data) {
        setIsResident(
          response.data.is_resident !== undefined
            ? response.data.is_resident
            : false
        );

        if (response.data.vehicle_type) {
          const validType =
            response.data.vehicle_type === "2-wheeler" ||
            response.data.vehicle_type === "4-wheeler"
              ? response.data.vehicle_type
              : "2-wheeler";
          setVehicleType(validType);
        }

        // Set the vehicle status
        setVehicleStatus(response.data.status || "out");
      } else {
        setIsResident(false);
        setVehicleStatus("out");
      }
    } catch (err) {
      console.error("Error fetching vehicle info:", err);
      setIsResident(false);
      setVehicleStatus("out");
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return; // Ensure a file is selected

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await apiClient.post("/service/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Assuming the response contains the 'detected_plate'
      setDetectedPlate(response.data.detected_plate);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");

      // Optionally, log more detailed error information for debugging
      if (err.response) {
        console.error("Error Response:", err.response);
      } else if (err.message) {
        console.error("Error Message:", err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!selectedParkingLot) {
      setSelectedParkingLot(parkingLots[0]?.parking_lot_id || "");
    }

    try {
      const token = localStorage.getItem("access_token");
      const data = {
        finalized_plate_number: detectedPlate,
        vehicle_type: vehicleType,
        parking_lot_id: selectedParkingLot,
        // is_resident: isResident,
      };
      console.log("Sending data:", data);

      const response = await apiClient.post("/service/finalize/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        await fetchParkingLots();
        setSuccess("Parking details successfully recorded.");

        setImage(null);
        setDetectedPlate("");
        setVehicleType("2-wheeler");
        setIsResident(false);
        setSelectedParkingLot(parkingLots[0]?.parking_lot_id || "");
        setPreviewUrl(null);
        setFileInputKey(Date.now());
        setSimilarVehicles([]);
        setVehicleStatus("out");
      }
    } catch (err) {
      console.error("Error finalizing details:", err);
      if (err.response) {
        //   if (err.response.status === 400) {
        //     setError("The vehicle is already in the parking lot.");
        //   } else if (err.response.data) {
        //     setError(
        //       err.response.data.error ||
        //         "Failed to record parking details. Please try again."
        //     );
        //   }
      } else {
        setError("Failed to record parking details. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 ">
          Parking Lot Management
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="detectedPlate"
                className="block text-sm font-medium text-gray-700 "
              >
                Detected Plate Number
              </label>
              <input
                type="text"
                id="detectedPlate"
                value={detectedPlate}
                onChange={(e) => setDetectedPlate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="vehicleType"
                className="block text-sm font-medium text-gray-700 "
              >
                Vehicle Type
              </label>
              <select
                id="vehicleType"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="parkingLot"
                className="block text-sm font-medium text-gray-700 "
              >
                Parking Lot
              </label>
              <select
                id="parkingLot"
                value={selectedParkingLot}
                onChange={(e) => setSelectedParkingLot(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              >
                {parkingLots.map((lot) => (
                  <option key={lot.parking_lot_id} value={lot.parking_lot_id}>
                    {lot.name} (Available: {lot.remaining})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="residentStatus"
                className="block text-sm font-medium "
              >
                Residency Status
              </label>
              {isResident ? (
                <p className="w-24 px-2 text-sm bg-blue-100 text-blue-800 text-center rounded-full mt-2">
                  Resident
                </p>
              ) : (
                <p className="w-28 px-2 text-sm bg-yellow-100 text-yellow-800 text-center rounded-full mt-2">
                  Non-Resident
                </p>
              )}
            </div>

            <div>
              {vehicleStatus === "in" ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExit(detectedPlate);
                  }}
                  disabled={isLoading || processingExit === detectedPlate}
                  className={`w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    isLoading || processingExit === detectedPlate
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-md"
                  }`}
                >
                  {processingExit === detectedPlate ? "Processing..." : "Exit"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? "Processing..." : "Enter Vehicle"}
                </button>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 ">
                Upload Vehicle Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                key={fileInputKey}
                className="mt-1 block w-full text-sm text-gray-500 
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
              />
            </div>
            {previewUrl && (
              <div className="flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-68 h-48 object-cover rounded-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default ParkingLotPage;
