import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const WaterFall_Excel_Fetch = () => {
  const [sheetsData, setSheetsData] = useState([]);
  const [vpnOptions, setVpnOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerGroupOptions, setCustomerGroupOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [selectedVpn, setSelectedVpn] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerGroup, setSelectedCustomerGroup] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [additionalHeaders, setAdditionalHeaders] = useState([]);
  const [commonHeaders, setCommonHeaders] = useState([]); // State for common headers

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const allSheetsData = [];

      // Read data from the first four worksheets
      workbook.SheetNames.slice(0, 4).forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = sheetData[0];
        const dataRows = sheetData.slice(1); // Ignore the header row
        allSheetsData.push({ sheetName, headers, dataRows });
      });

      // Set data for all sheets
      setSheetsData(allSheetsData);

      // Extract common values and headers
      const commonValues = extractCommonValues(allSheetsData);
      setVpnOptions(commonValues.vpn);
      setCustomerOptions(commonValues.customer);
      setCustomerGroupOptions(commonValues.customerGroup);
      setProgramOptions(commonValues.program);
      setAdditionalHeaders(commonValues.additionalHeaders);

      // Find and set common headers
      const commonHeaders = findCommonHeaders(allSheetsData);
      setCommonHeaders(commonHeaders); // Ensure this is set
    };

    reader.readAsArrayBuffer(file);
  };

  // Helper function to extract common values and additional headers
  const extractCommonValues = (sheets) => {
    if (sheets.length === 0) return { vpn: [], customer: [], customerGroup: [], program: [], additionalHeaders: [] };

    const [firstSheet, ...otherSheets] = sheets;

    // Extract common values for each column
    const extractColumnValues = (columnIndex) =>
      new Set(firstSheet.dataRows.map((row) => row[columnIndex]).filter(Boolean));

    const commonVpnValues = extractColumnValues(2);
    const commonCustomerValues = extractColumnValues(0);
    const commonCustomerGroupValues = extractColumnValues(1);
    const commonProgramValues = extractColumnValues(3);

    const filterCommonValues = (columnIndex, initialValues) =>
      Array.from(initialValues).filter((value) =>
        sheets.every((sheet) =>
          sheet.dataRows.some((row) => row[columnIndex] === value)
        )
      );

    const commonVpn = filterCommonValues(2, commonVpnValues);
    const commonCustomer = filterCommonValues(0, commonCustomerValues);
    const commonCustomerGroup = filterCommonValues(1, commonCustomerGroupValues);
    const commonProgram = filterCommonValues(3, commonProgramValues);

    // Extract additional headers and values
    const additionalHeaders = firstSheet.headers.slice(5); // Assuming the additional columns start from index 4
    const additionalValues = new Array(additionalHeaders.length).fill(null).map(() => new Set());

    sheets.forEach((sheet) => {
      sheet.dataRows.forEach((row) => {
        const rowKey = row.slice(0, 4).join('|'); // Key based on the first four columns
        const existingValues = additionalValues.map((_, index) => row[4 + index]);

        if (commonVpn.includes(row[2])) { // Check if row's VPN is common
          existingValues.forEach((value, index) => {
            if (value) {
              additionalValues[index].add(value);
            }
          });
        }
      });
    });

    const commonAdditionalValues = additionalValues.map(set => Array.from(set));

    return {
      vpn: commonVpn,
      customer: commonCustomer,
      customerGroup: commonCustomerGroup,
      program: commonProgram,
      additionalHeaders,
      commonAdditionalValues,
    };
  };

  // Helper function to find common headers across all worksheets
  const findCommonHeaders = (sheets) => {
    if (sheets.length === 0) return [];

    // Start with the headers from the first sheet
    const [firstSheet, ...otherSheets] = sheets;
    let commonHeaders = firstSheet.headers;

    // Compare headers with each subsequent sheet
    otherSheets.forEach((sheet) => {
      commonHeaders = commonHeaders.filter((header) =>
        sheet.headers.includes(header)
      );
    });

    return commonHeaders;
  };

  // Filter data based on the selected filters
  useEffect(() => {
    if (selectedVpn === "") {
      setFilteredData([]);
      return;
    }

    const filteredRows = sheetsData.flatMap((sheet) =>
      sheet.dataRows.filter((row) =>
        (selectedVpn === "" || row[2] === selectedVpn) &&
        (selectedCustomer === "" || row[0] === selectedCustomer) &&
        (selectedCustomerGroup === "" || row[1] === selectedCustomerGroup) &&
        (selectedProgram === "" || row[3] === selectedProgram)
      ).map((row) => {
        // Map additional values to rows
        const additionalValues = additionalHeaders.map((_, index) => row[4 + index]);
        return row.concat(additionalValues);
      })
    );

    setFilteredData(filteredRows);
  }, [selectedVpn, selectedCustomer, selectedCustomerGroup, selectedProgram, sheetsData, additionalHeaders]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "vpn":
        setSelectedVpn(value);
        break;
      case "customer":
        setSelectedCustomer(value);
        break;
      case "customerGroup":
        setSelectedCustomerGroup(value);
        break;
      case "program":
        setSelectedProgram(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        className="mb-4"
      />

      {/* Display common headers */}
      {commonHeaders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4">Common Headers</h2>
          <ul className="list-disc ml-6">
            {commonHeaders.map((header, index) => (
              <li key={index}>{header}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Existing dropdowns and filtered data code */}
      {/* VPN Dropdown */}
      {vpnOptions.length > 0 && (
        <div className="mb-4">
          <label htmlFor="vpnSelect" className="mr-2">
            Select VPN:
          </label>
          <select
            id="vpnSelect"
            name="vpn"
            value={selectedVpn}
            onChange={handleFilterChange}
            className="border px-2 py-1"
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

      {/* Customer Dropdown */}
      {selectedVpn && customerOptions.length > 0 && (
        <div className="mb-4">
          <label htmlFor="customerSelect" className="mr-2">
            Select Customer:
          </label>
          <select
            id="customerSelect"
            name="customer"
            value={selectedCustomer}
            onChange={handleFilterChange}
            className="border px-2 py-1"
          >
            <option value="">Select Customer</option>
            {customerOptions.map((customer, index) => (
              <option key={index} value={customer}>
                {customer}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Customer Group Dropdown */}
      {selectedVpn && customerGroupOptions.length > 0 && (
        <div className="mb-4">
          <label htmlFor="customerGroupSelect" className="mr-2">
            Select Customer Group:
          </label>
          <select
            id="customerGroupSelect"
            name="customerGroup"
            value={selectedCustomerGroup}
            onChange={handleFilterChange}
            className="border px-2 py-1"
          >
            <option value="">Select Customer Group</option>
            {customerGroupOptions.map((customerGroup, index) => (
              <option key={index} value={customerGroup}>
                {customerGroup}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Program Dropdown */}
      {selectedVpn && programOptions.length > 0 && (
        <div className="mb-4">
          <label htmlFor="programSelect" className="mr-2">
            Select Program:
          </label>
          <select
            id="programSelect"
            name="program"
            value={selectedProgram}
            onChange={handleFilterChange}
            className="border px-2 py-1"
          >
            <option value="">Select Program</option>
            {programOptions.map((program, index) => (
              <option key={index} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display filtered rows */}
      {filteredData.length > 0 ? (
        <div className="mb-6 overflow-auto">
          <table className="table-auto border-collapse w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Customer</th>
                <th className="border px-4 py-2">Customer Group</th>
                <th className="border px-4 py-2">VPN</th>
                <th className="border px-4 py-2">Program</th>
                {additionalHeaders.map((header, index) => (
                  <th key={index} className="border px-4 py-2 text-right">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
  {filteredData.map((row, rowIndex) => (
    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-100"}>
      {row.map((cell, cellIndex) => {
        // Skip first 4 columns (Customer, Customer Group, VPN, Program)
        const isIntegerColumn = cellIndex >= 4 && Number.isInteger(cell);

        // Determine whether to align the integer columns based on their position (skip every other one)
        const alignmentClass =
          isIntegerColumn && (cellIndex % 2 === 0) ? "text-right" : "text-left";

        return (
          <td key={cellIndex} className={`border px-4 py-2 ${alignmentClass}`}>
            {cell}
          </td>
        );
      })}
    </tr>
  ))}
</tbody>
          </table>
        </div>
      ) : selectedVpn && (
        <p>No data found for the selected filters.</p>
      )}
    </div>
  );
};

export default WaterFall_Excel_Fetch;
