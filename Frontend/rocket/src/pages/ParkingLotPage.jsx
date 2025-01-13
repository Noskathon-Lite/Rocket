import React, { useState, useEffect, useRef } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
  Car,
  Bike,
  Home,
  Building,
  Clock,
  AlertCircle,
  Phone,
  User,
} from "lucide-react";
import CameraFeed from "../components/CameraFeed";

const ParkingLotPage = () => {
  const [image, setImage] = useState(null);
  const [detectedPlate, setDetectedPlate] = useState("");
  const [vehicleType, setVehicleType] = useState("2-wheeler");
  const vehicleTypes = ["2-wheeler", "4-wheeler"];
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedParkingLot, setSelectedParkingLot] = useState("");
  const [isResident, setIsResident] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [similarVehicles, setSimilarVehicles] = useState([]);
  const [processingExit, setProcessingExit] = useState(null);
  const [hoveredVehicle, setHoveredVehicle] = useState(null);
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });
  const [vehicleStatus, setVehicleStatus] = useState("out");
  const similarVehiclesRef = useRef(null);
  const navigate = useNavigate();

  const SERVER_BASE_URL = "http://localhost:8000/";

  useEffect(() => {
    if (detectedPlate) {
      fetchParkingLots();
      fetchVehicleInfo();
      fetchSimilarVehicles();
    }
    console.log("Detected Plate:", detectedPlate);
  }, [detectedPlate]);

  const fetchParkingLots = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/parking-lot/status/");
      setParkingLots(response.data);
      if (response.data.length > 0) {
        setSelectedParkingLot(response.data[0].parking_lot_id);
      }
    } catch (err) {
      console.error("Error fetching parking lots:", err);
      setError("Failed to fetch parking lots. Please try again.");
      setTimeout(() => setError(null), 2000);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleImageCapture = async (imageBlob) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", imageBlob, "captured_image.jpg");

    try {
      const response = await apiClient.post("/service/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setDetectedPlate(response.data.detected_plate);
      setPreviewUrl(URL.createObjectURL(imageBlob));
      setSuccess("Image captured and uploaded successfully.");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSimilarVehicles = async () => {
    if (!detectedPlate) {
      console.log("Detected plate is empty, skipping similar vehicles fetch.");
      setSimilarVehicles([]);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await apiClient.post(
        "/service/search-similar/",
        { plate_number: detectedPlate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Response from server:", response.data);

      if (response.data && Array.isArray(response.data.similar_vehicles)) {
        response.data.similar_vehicles.forEach((vehicle) => {
          console.log(
            `Vehicle ${vehicle.plate_number} status: ${vehicle.status}`
          );
        });
        setSimilarVehicles(response.data.similar_vehicles);
      } else {
        console.error("Unexpected response format:", response.data);
        setSimilarVehicles([]);
      }
    } catch (err) {
      console.error(
        "Error fetching similar vehicles:",
        err.response?.data || err.message
      );
      setError("Failed to fetch similar vehicles. Please try again.");
      setSimilarVehicles([]);
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
        setSimilarVehicles([]);
        setVehicleStatus("out");
      }
    } catch (err) {
      console.error("Error finalizing details:", err);
      if (err.response) {
        if (err.response.status === 400) {
          setError("");
        } else if (err.response.data) {
          setError(
            err.response.data.error ||
              "Failed to record parking details. Please try again."
          );
        }
      } else {
        setError("Failed to record parking details. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimilarVehicleClick = (plateNumber) => {
    setDetectedPlate(plateNumber);
    fetchVehicleInfo();
  };

  const handleExit = (plateNumber) => {
    setProcessingExit(plateNumber);
    navigate("/imme-exit", { state: { plateNumber } });
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const calculateCardPosition = (event) => {
    const offset = 10;
    let left = event.clientX + offset;
    let top = event.clientY + offset;

    if (left + 256 > window.innerWidth) {
      left = event.clientX - 256 - offset;
    }

    if (top + 200 > window.innerHeight) {
      top = event.clientY - 200 - offset;
    }

    setCardPosition({ top, left });
  };

  const handleMouseEnter = (event, vehicle) => {
    setHoveredVehicle(vehicle);
    calculateCardPosition(event);
  };

  const ResidentCard = ({ vehicle }) => {
    if (!vehicle || !vehicle.resident_info) return null;

    const photoUrl = vehicle.resident_info.photo
      ? `${SERVER_BASE_URL}${vehicle.resident_info.photo}`
      : null;

    return (
      <div
        className="fixed z-50 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-400"
        style={{
          top: `${cardPosition.top}px`,
          left: `${cardPosition.left}px`,
        }}
      >
        <h3 className="text-lg font-semibold mb-2">Resident Card</h3>
        {photoUrl && (
          <img
            src={photoUrl}
            alt="Resident"
            className="w-32 h-32 object-cover rounded-md mx-auto mb-2"
          />
        )}
        <p className="text-sm font-medium">{vehicle.resident_info.full_name}</p>
        <p className="text-sm text-gray-600 flex items-center mt-1">
          <Phone className="w-4 h-4 mr-1" />
          {vehicle.resident_info.phone_number}
        </p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
            Parking Lot Management
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="detectedPlate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
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
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
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
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
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
                  className="block text-sm font-medium dark:text-gray-200"
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
                    {processingExit === detectedPlate
                      ? "Processing..."
                      : "Exit"}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-100">
                  Capture Vehicle Image
                </label>
                <CameraFeed onCapture={handleImageCapture} />
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

          {(error || success) && (
            <div className="max-w-4xl mx-auto p-6">
              {error && (
                <div
                  className="p-4 bg-red-100 border border-red-400 text-red-700 rounded"
                  role="alert"
                >
                  <strong className="font-bold">Error:</strong>
                  <span className="block sm:inline"> {error}</span>
                </div>
              )}

              {success && (
                <div
                  className="p-4 bg-green-100 border border-green-400 text-green-700 rounded"
                  role="alert"
                >
                  <strong className="font-bold">Success:</strong>
                  <span className="block sm:inline"> {success}</span>
                </div>
              )}
            </div>
          )}

          {similarVehicles.length > 0 && (
            <div
              className="mt-6 bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-700"
              ref={similarVehiclesRef}
            >
              <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b dark:text-gray-100 dark:bg-gray-700">
                Similar Vehicles
              </h2>
              <ul className="divide-y divide-gray-200">
                {similarVehicles.map((vehicle, index) => (
                  <li
                    key={index}
                    onClick={() =>
                      handleSimilarVehicleClick(vehicle.plate_number)
                    }
                    onMouseEnter={(e) => handleMouseEnter(e, vehicle)}
                    onMouseLeave={() => setHoveredVehicle(null)}
                    className="p-4 hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer relative dark:hover:bg-gray-500"
                  >
                    <div className="grid grid-cols-5 items-center gap-4">
                      <div className="flex items-center space-x-4 col-span-2">
                        <div className="flex-shrink-0">
                          {vehicle.vehicle_type.toLowerCase() ===
                          "2-wheeler" ? (
                            <Bike className="h-6 w-6 text-gray-400" />
                          ) : (
                            <Car className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">
                            {vehicle.plate_number}
                          </p>
                          <p className="text-sm text-gray-500 truncate dark:text-gray-50">
                            {vehicle.vehicle_type}
                          </p>
                        </div>
                      </div>

                      <div className="text-center">
                        {vehicle.is_resident ? (
                          <p className="px-2 inline-block text-sm bg-blue-100 text-blue-800 rounded-full">
                            Resident
                          </p>
                        ) : (
                          <p className="px-2 inline-block text-sm bg-yellow-100 text-yellow-800 rounded-full">
                            Non-Resident
                          </p>
                        )}
                      </div>

                      <div className="text-center">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            vehicle.status === "in"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {vehicle.status === "in" ? "In" : "Out"}
                        </span>
                      </div>

                      <div className="text-center">
                        {vehicle.status === "in" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExit(vehicle.plate_number);
                            }}
                            disabled={processingExit === vehicle.plate_number}
                            className={`text-red-600 hover:bg-red-50 bg-red-100 rounded-lg px-3 py-1 font-semibold transition-all hover:scale-105 outline outline-2 outline-offset-0 outline-red-300 hover:outline-offset-4 hover:outline-red-400 ${
                              processingExit === vehicle.plate_number
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-md"
                            }`}
                          >
                            {processingExit === vehicle.plate_number
                              ? "Processing..."
                              : "Exit"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </form>
      {hoveredVehicle && <ResidentCard vehicle={hoveredVehicle} />}
    </DashboardLayout>
  );
};

export default ParkingLotPage;
