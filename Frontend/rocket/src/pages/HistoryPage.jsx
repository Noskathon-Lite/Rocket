import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import DashboardLayout from "../components/DashboardLayout";
import { Check, X } from "lucide-react";
import { format, parse, startOfMonth, endOfMonth } from "date-fns";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token == "user") {
      navigate("/login");
    } else {
      fetchParkingRecords();
    }
  }, [navigate]);

  const fetchParkingRecords = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await apiClient.get("/parking-lot/records/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(response.data);
    } catch (err) {
      console.error("Error fetching parking records:", err);
      setError("Failed to fetch parking records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  //Filtering by months
  const filteredRecords = records
    .filter((record) => {
      if (!record.entry_time) return false;
      const recordDate = new Date(record.entry_time);
      const selectedDate = parse(selectedMonth, "yyyy-MM", new Date());
      return (
        recordDate >= startOfMonth(selectedDate) &&
        recordDate <= endOfMonth(selectedDate)
      );
    })
    .sort((a, b) => {
      const timeA =
        a.status === "in" ? new Date(a.entry_time) : new Date(a.exit_time);
      const timeB =
        b.status === "in" ? new Date(b.entry_time) : new Date(b.exit_time);
      return timeB - timeA;
    });

  const getMonthOptions = () => {
    const months = new Set();
    records.forEach((record) => {
      if (record.entry_time)
        months.add(format(new Date(record.entry_time), "yyyy-MM"));
      if (record.exit_time)
        months.add(format(new Date(record.exit_time), "yyyy-MM"));
    });
    return [...months].sort((a, b) => b.localeCompare(a));
  };

  const formatDateTime = (dateString) => {
    return dateString
      ? format(new Date(dateString), "MMM dd, yyyy HH:mm:ss")
      : "-";
  };

  const formatParkedTime = (parkedTime) => {
    if (!parkedTime) return "-";

    try {
      // Extract numbers before "day", "hour", and "minute"
      const days = parkedTime.match(/(\d+)\s*day/)?.[1];
      const hours = parkedTime.match(/(\d+)\s*hour/)?.[1];
      const minutes = parkedTime.match(/(\d+)\s*minute/)?.[1];

      const parts = [];

      if (days && parseInt(days) > 0) parts.push(`${days}d`);
      if (hours && parseInt(hours) > 0) parts.push(`${hours}h`);
      if (minutes && parseInt(minutes) > 0) parts.push(`${minutes}m`);

      return parts.length > 0 ? parts.join(" ") : "0m";
    } catch (error) {
      console.error("Error formatting parked time:", error);
      return parkedTime;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Parking History
          </h1>
          <div className="flex items-center gap-2">
            <label
              htmlFor="month-select"
              className="text-sm font-medium text-gray-700 dark:text-gray-100"
            >
              Filter:
            </label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-600"
            >
              {getMonthOptions().map((option) => (
                <option key={option} value={option}>
                  {format(parse(option, "yyyy-MM", new Date()), "MMMM yyyy")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!error && (!filteredRecords || filteredRecords.length === 0) ? (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No records available for the selected month
          </div>
        ) : (
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="tableheader">Plate Number</th>
                    <th class="tableheader"> Vehicle Type</th>
                    <th class="tableheader">Parking Lot</th>
                    <th class="tableheader"> Entry Time</th>
                    <th class="tableheader"> Exit Time</th>
                    <th class="tableheader"> Status</th>
                    <th class="tableheader"> Parked Time</th>
                    <th class="tableheader"> Total Fee</th>
                    <th class="tableheader"> Residency Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs dark:text-gray-100">
                        <span title={record.plate_number}>
                          {record.plate_number}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-100">
                        {record.vehicle_type?.toLowerCase() === "2-wheeler"
                          ? "2-Wheeler"
                          : record.vehicle_type?.toLowerCase() === "4-wheeler"
                          ? "4-Wheeler"
                          : "-"}
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs dark:text-gray-100">
                        <span title={record.parking_lot_name}>
                          {record.parking_lot_name}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-100">
                        {formatDateTime(record.entry_time)}
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-100">
                        {record.status.toLowerCase() === "in"
                          ? "-"
                          : formatDateTime(record.exit_time)}
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status.toLowerCase() === "in"
                              ? "bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-50 dark:text-gray-900"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-100">
                        {formatParkedTime(record.parked_time)}
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-100">
                        {record.total_fee || "-"}
                      </td>
                      <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm">
                        {record.is_resident ? (
                          <Check className="h-5 w-5 text-green-500 dark:text-green-400" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 dark:text-red-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
