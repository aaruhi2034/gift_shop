import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const Reports = () => {
  const [reportType, setReportType] = useState("daily");
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    lowStockItems: 0,
    topProducts: [],
  });

  const API_BASE_URL = "https://gift-shop-server.onrender.com/api";

  useEffect(() => {
    fetchReports();
  }, [reportType]);

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const [salesRes, productsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/reports/sales/${reportType}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSalesData(salesRes.data);
      setInventoryData(productsRes.data);

      const lowStock = productsRes.data.filter(
        (p) => (p.stock_quantity || p.quantity || 0) < 10,
      );
      const totalSales = salesRes.data.reduce(
        (sum, sale) => sum + (sale.total_amount || sale.total || 0),
        0,
      );
      const topProducts = [...productsRes.data]
        .sort(
          (a, b) =>
            (b.stock_quantity || b.quantity || 0) -
            (a.stock_quantity || a.quantity || 0),
        )
        .slice(0, 5);

      setSummary({
        totalSales: totalSales,
        totalOrders: salesRes.data.length,
        lowStockItems: lowStock.length,
        topProducts: topProducts,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Error fetching reports");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const reportData = {
      type: reportType,
      date: new Date().toISOString(),
      sales: salesData,
      inventory: inventoryData,
      summary: summary,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gift_shop_report_${reportType}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully");
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#FF6B6B",
    "#4ECDC4",
  ];

  // Prepare category data for pie chart
  const categoryData = inventoryData.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    const existing = acc.find((item) => item.name === category);
    if (existing) {
      existing.value += product.stock_quantity || product.quantity || 0;
    } else {
      acc.push({
        name: category,
        value: product.stock_quantity || product.quantity || 0,
      });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100">
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
        {/*============================================ Header =================================*/}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Reports & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              View sales reports, inventory analytics, and business insights
            </p>
          </div>
        </div>

        {/*==================================== Report Controls ==================================*/}
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {["daily", "weekly", "monthly"].map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition text-sm sm:text-base ${
                    reportType === type
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={downloadReport}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:scale-105 transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <DocumentArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Download Report
            </button>
          </div>
        </div>

        {/*=========================== Loading State ======================================*/}
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-purple-600 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-gray-500 text-sm sm:text-base">
                Loading reports...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/*==================================== Summary Cards =======================================*/}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
              <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <CurrencyRupeeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <span className="text-xs text-gray-400 capitalize">
                    {reportType}
                  </span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
                  ₹{summary.totalSales.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Total Sales
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                  {summary.totalOrders}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Total Orders
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
                  {summary.lowStockItems}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Low Stock Items
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-5 hover:shadow-lg transition">
                <div className="flex items-center justify-between mb-2">
                  <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <p className="text-sm sm:text-base md:text-lg font-bold text-gray-800 capitalize">
                  {reportType}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  Report Period
                </p>
              </div>
            </div>

            {/*============================== Charts ==========================*/}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/*========================== Sales Chart ==========================*/}
              <div className="bg-white rounded-xl shadow-xl p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-purple-600" />
                  Sales Overview
                </h3>
                {salesData.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No sales data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Line
                        type="monotone"
                        dataKey="total_amount"
                        stroke="#8884d8"
                        name="Sales Amount"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/*============================ Inventory Distribution =====================================*/}
              <div className="bg-white rounded-xl shadow-xl p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                  Inventory by Category
                </h3>
                {categoryData.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No inventory data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          percent > 0.05
                            ? `${name}: ${(percent * 100).toFixed(0)}%`
                            : ""
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/*============================ Top Products Bar Chart =====================================*/}
            <div className="bg-white rounded-xl shadow-xl p-4 sm:p-5 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                Top 5 Products by Stock
              </h3>
              {summary.topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No product data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summary.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="product_name"
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="quantity"
                      fill="#82ca9d"
                      name="Stock Quantity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/*============================ Sales Table =====================================*/}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 p-4 sm:p-5 pb-0">
                Sales Transactions
              </h3>

              {salesData.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No sales transactions found</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block md:hidden p-4 space-y-3">
                    {salesData.map((sale) => (
                      <div key={sale._id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-sm">
                              {sale.order_id || sale._id?.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                sale.createdAt || sale.order_date || sale.date,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="font-bold text-purple-600 text-sm">
                            ₹{sale.total_amount || sale.total}
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {sale.payment_mode || "Cash"}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            {sale.status || "Completed"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Order ID
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Payment Mode
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.map((sale) => (
                          <tr
                            key={sale._id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                              {sale.order_id || sale._id?.slice(-8)}
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                sale.createdAt || sale.order_date || sale.date,
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm font-medium text-purple-600">
                              ₹{sale.total_amount || sale.total}
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                              {sale.payment_mode || "Cash"}
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                  sale.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {sale.status || "Completed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
