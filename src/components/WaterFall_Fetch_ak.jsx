import React, { useState, useEffect } from "react";
import Waterfall_Plot from "./WaterFall_Plot";

function WaterFall_Fetch_ak() {
  const [originalData, setOriginalData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [intermediateData, setIntermediateData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedVPN, setSelectedVPN] = useState("");
  const [customerOptions, setCustomerOptions] = useState([]);
  const [vpnOptions, setVpnOptions] = useState([]);

  // Define month headers for the table
  const MonHeader = [
    "01-May",
    "01-Jun",
    "01-Jul",
    "01-Aug",
    "01-Sep",
    "01-Oct",
    "01-Nov",
    "01-Dec",
    "01-Jan",
  ];

  // Function to fetch and process the JSON file
  const fetchJsonData = async () => {
    try {
      const response = await fetch("/waterfallModelTest7.json");
      const data = await response.json();

      // Extract unique customers and VPNs
      const customerSet = new Set(data.map((item) => item.Customer));
      const vpnSet = new Set(data.map((item) => item.VPN));

      setCustomerOptions(Array.from(customerSet));
      setVpnOptions(Array.from(vpnSet));
      setOriginalData(data);
    } catch (error) {
      console.error("Error fetching JSON data:", error);
    }
  };

  // Function to aggregate data for the selected VPN
  const aggregateDataByVPN = (data, vpn) => {
    const aggregatedData = {};

    data.forEach((item) => {
      if (item.VPN === vpn) {
        if (!aggregatedData[item.month]) {
          aggregatedData[item.month] = {};
        }

        MonHeader.forEach((month) => {
          if (item[month] !== undefined) {
            aggregatedData[item.month][month] = item[month];
          }
        });
      }
    });

    return Object.keys(aggregatedData).map((month) => ({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      values: MonHeader.map((header) =>
        aggregatedData[month][header] !== undefined
          ? aggregatedData[month][header]
          : "-"
      ),
    }));
  };

  // Function to calculate intermediate values
  const calculateIntermediateValues = (data) => {
    if (data.length === 0) return [];

    const intermediateData = [];

    for (let i = 0; i < data.length; i++) {
      const monthData = data[i];

      // Check if month is "May"
      if (monthData.month === "May") {
        intermediateData.push({
          month: monthData.month,
          intermediateValue: 0,
          status: "neutral",
        });
        continue;
      }

      // Determine the index for the current value based on the month
      const currentIndex = i;
      let currentValue = 0;

      if (monthData.values && monthData.values[currentIndex] !== undefined) {
        currentValue = parseFloat(monthData.values[currentIndex]) || 0;
      }

      // Determine the previous month's value using the same index
      let previousValue = 0;
      if (i > 0) {
        const previousMonthData = data[i - 1];
        if (
          previousMonthData.values &&
          previousMonthData.values[currentIndex] !== undefined
        ) {
          previousValue =
            parseFloat(previousMonthData.values[currentIndex]) || 0;
        }
      }

      const intermediateValue = currentValue - previousValue;
      const status =
        intermediateValue > 0
          ? "positive"
          : intermediateValue < 0
          ? "negative"
          : "neutral";

      intermediateData.push({
        month: monthData.month,
        intermediateValue: isNaN(intermediateValue) ? 0 : intermediateValue,
        status,
      });
    }

    return intermediateData;
  };

  // Filter VPN options based on the selected customer
  const getFilteredVpnOptions = () => {
    if (!selectedCustomer) return vpnOptions;
    const customerData = originalData.filter(item => item.Customer === selectedCustomer);
    const filteredVpnSet = new Set(customerData.map(item => item.VPN));
    return Array.from(filteredVpnSet);
  };

  useEffect(() => {
    fetchJsonData();
  }, []);

  useEffect(() => {
    if (originalData.length > 0 && selectedCustomer) {
      const filteredVendors = getFilteredVpnOptions();
      setVpnOptions(filteredVendors);
      setSelectedVPN(""); // Reset VPN selection when customer changes
    }
  }, [selectedCustomer, originalData]);

  useEffect(() => {
    if (originalData.length > 0 && selectedVPN) {
      const aggregatedData = aggregateDataByVPN(originalData, selectedVPN);
      setDisplayData(aggregatedData);

      const intermediateValues = calculateIntermediateValues(aggregatedData);
      setIntermediateData(intermediateValues);
    }
  }, [originalData, selectedVPN]);

  return (
    <div className="p-8 bg-gradient-to-r from-gray-100 to-gray-300 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-gray-800">Data for Selected VPN</h1>

        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2 text-gray-700">Select Customer:</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Customer</option>
            {customerOptions.map((customer, index) => (
              <option key={index} value={customer}>
                {customer}
              </option>
            ))}
          </select>
        </div>

        {selectedCustomer && (
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2 text-gray-700">Select VPN:</label>
            <select
              value={selectedVPN}
              onChange={(e) => setSelectedVPN(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select VPN</option>
              {vpnOptions.map((vpn, index) => (
                <option key={index} value={vpn}>
                  {vpn}
                </option>
              ))}
            </select>
          </div>
        )}

        {displayData.length > 0 && (
          <div>
            <h2 className="text-3xl font-semibold mb-4 text-center text-gray-800">Data for {selectedCustomer} - {selectedVPN}</h2>
            <table className="w-full border-collapse border border-gray-300 mb-8 bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-6 py-3 border border-gray-300 text-left text-gray-700">Month</th>
                  {MonHeader.map((header, index) => (
                    <th key={index} className="px-6 py-3 border border-gray-300 text-left text-gray-700">
                      {header.split("-")[1]} {/* Displaying only month part */}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-100">
                    <td className="px-6 py-4 border border-gray-300 text-gray-800">{row.month}</td>
                    {row.values.map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 border border-gray-300 ${
                          value === "-" ? "text-gray-500" : "text-gray-800"
                        }`}
                      >
                        {value === "-" ? "-" : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className="text-3xl font-semibold mb-4 text-center text-gray-800">Waterfall Chart</h2>
            <Waterfall_Plot data={intermediateData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default WaterFall_Fetch_ak;
