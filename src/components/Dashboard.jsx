import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  GiftIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    lowStock: 0,
    pendingOrders: 0,
    totalSales: 0,
    averageOrderValue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentCustomers, setRecentCustomers] = useState([]);

  const API_BASE_URL = "https://gift-shop-server.onrender.com/api";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const [productsRes, customersRes, salesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/sales`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const products = productsRes.data;
      const customers = customersRes.data;
      const sales = salesRes.data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySales = sales
        .filter((sale) => new Date(sale.createdAt || sale.date) >= today)
        .reduce((sum, sale) => sum + (sale.total_amount || sale.total || 0), 0);

      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const monthlyRevenue = sales
        .filter((sale) => {
          const saleDate = new Date(sale.createdAt || sale.date);
          return (
            saleDate.getMonth() === currentMonth &&
            saleDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, sale) => sum + (sale.total_amount || sale.total || 0), 0);

      const totalSales = sales.reduce(
        (sum, sale) => sum + (sale.total_amount || sale.total || 0),
        0,
      );
      const averageOrderValue =
        sales.length > 0 ? totalSales / sales.length : 0;

      const lowStock = products.filter(
        (p) => (p.stock_quantity || p.quantity || 0) < 10,
      ).length;
      const pendingOrders = sales.filter(
        (s) => s.status === "pending" || s.status === "processing",
      ).length;

      const recentOrdersData = sales
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
        )
        .slice(0, 5)
        .map((sale) => {
          const customer = customers.find((c) => c._id === sale.customer_id);
          return {
            id: sale.invoice_number || sale._id,
            customer: customer?.customer_name || "Guest",
            amount: sale.total_amount || sale.total || 0,
            status: sale.status || "completed",
            date: sale.createdAt || sale.date,
            payment_mode: sale.payment_mode || "Cash",
          };
        });

      const productSales = {};
      sales.forEach((sale) => {
        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach((item) => {
            const productId = item.product_id;
            if (productSales[productId]) {
              productSales[productId].quantity += item.quantity;
              productSales[productId].revenue +=
                (item.price || 0) * item.quantity;
            } else {
              const product = products.find((p) => p._id === productId);
              productSales[productId] = {
                name: product?.product_name || "Unknown Product",
                quantity: item.quantity,
                revenue: (item.price || 0) * item.quantity,
              };
            }
          });
        }
      });

      const topProductsData = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 4)
        .map((p, index) => ({
          ...p,
          trend: index < 2 ? "up" : "down",
        }));

      const recentCustomersData = customers
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
        )
        .slice(0, 5);

      setStats({
        totalProducts: products.length,
        totalCustomers: customers.length,
        todaySales: todaySales,
        monthlyRevenue: monthlyRevenue,
        lowStock: lowStock,
        pendingOrders: pendingOrders,
        totalSales: totalSales,
        averageOrderValue: averageOrderValue,
      });

      setRecentOrders(recentOrdersData);
      setTopProducts(topProductsData);
      setRecentCustomers(recentCustomersData);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Error loading dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      gradient: "from-emerald-500 to-teal-600",
      period: "this month",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: GiftIcon,
      gradient: "from-blue-500 to-cyan-600",
      period: "in inventory",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: UsersIcon,
      gradient: "from-purple-500 to-pink-600",
      period: "registered",
    },
    {
      title: "Today's Sales",
      value: `₹${stats.todaySales.toLocaleString()}`,
      icon: ShoppingBagIcon,
      gradient: "from-orange-500 to-red-600",
      period: "so far",
    },
  ];

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
      {/*================================== Welcome Header =====================================*/}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/*================================== Stats Grid =========================================*/}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div
                className={`bg-gradient-to-r ${stat.gradient} p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl`}
              >
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400">
                {stat.period}
              </p>
            </div>
            <h3 className="text-sm sm:text-base md:text-2xl font-bold text-gray-800 dark:text-white truncate">
              {stat.value}
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
              {stat.title}
            </p>
          </div>
        ))}
      </div>

      {/*===============================Additional Stats Row ================================*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm opacity-90">
                Total Sales (All Time)
              </p>
              <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 sm:mt-2">
                ₹{stats.totalSales.toLocaleString()}
              </p>
            </div>
            <CurrencyRupeeIcon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm opacity-90">
                Average Order Value
              </p>
              <p className="text-lg sm:text-xl md:text-3xl font-bold mt-1 sm:mt-2">
                ₹{Math.round(stats.averageOrderValue).toLocaleString()}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 opacity-50" />
          </div>
        </div>
      </div>

      {/*================================== Quick Actions & Alerts =====================================*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
        {/*================================== Quick Actions =====================================*/}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {[
              {
                title: "New Sale",
                icon: CurrencyRupeeIcon,
                color: "from-purple-500 to-pink-500",
                link: "/billing",
              },
              {
                title: "Add Product",
                icon: GiftIcon,
                color: "from-green-500 to-emerald-500",
                link: "/products",
              },
              {
                title: "Add Customer",
                icon: UsersIcon,
                color: "from-blue-500 to-cyan-500",
                link: "/customers",
              },
              {
                title: "Reports",
                icon: ChartBarIcon,
                color: "from-orange-500 to-red-500",
                link: "/reports",
              },
            ].map((action, idx) => (
              <Link key={idx} to={action.link}>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center cursor-pointer hover:scale-105 transition-transform">
                  <div
                    className={`bg-gradient-to-r ${action.color} w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3`}
                  >
                    <action.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs md:text-sm">
                    {action.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/*=========================== Alerts =======================*/}
        {(stats.lowStock > 0 || stats.pendingOrders > 0) && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <ExclamationTriangleIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              <h2 className="text-base sm:text-lg md:text-xl font-bold">
                Alerts
              </h2>
            </div>
            <div className="space-y-1 sm:space-y-2">
              {stats.lowStock > 0 && (
                <p className="text-xs sm:text-sm opacity-90">
                  ⚠️ {stats.lowStock} products low in stock
                </p>
              )}
              {stats.pendingOrders > 0 && (
                <p className="text-xs sm:text-sm opacity-90">
                  📦 {stats.pendingOrders} orders pending
                </p>
              )}
            </div>
            <Link to="/products">
              <button className="mt-3 sm:mt-4 bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition">
                View Details →
              </button>
            </Link>
          </div>
        )}
      </div>

      {/*============================ Recent Orders & Top Products ================================*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/*============================== Recent Orders =====================================*/}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white">
              Recent Orders
            </h2>
            <Link
              to="/Billing"
              className="text-xs sm:text-sm text-purple-600 hover:text-purple-700"
            >
              View All →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-400">
              <ShoppingBagIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="text-sm">No orders yet</p>
              <Link
                to="/billing"
                className="text-purple-600 text-xs sm:text-sm mt-2 inline-block"
              >
                Create first order →
              </Link>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base truncate">
                      {order.id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {order.customer}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                      {order.payment_mode}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-purple-600 text-sm sm:text-base">
                      ₹{order.amount.toLocaleString()}
                    </p>
                    <span
                      className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*============================== Top Products =====================================*/}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white">
              Top Products
            </h2>
            <StarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          </div>
          {topProducts.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-400">
              <GiftIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="text-sm">No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {topProducts.map((product, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500">
                        {product.quantity} units sold
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-purple-600 text-xs sm:text-sm md:text-base">
                        ₹{product.revenue.toLocaleString()}
                      </p>
                      <span
                        className={`text-[10px] sm:text-xs ${product.trend === "up" ? "text-green-500" : "text-red-500"}`}
                      >
                        {product.trend === "up" ? "↑ Trending" : "↓ Declining"}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((product.quantity / (topProducts[0]?.quantity || 1)) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/*=================================== Recent Customers ===================================*/}
      <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-white">
            Recent Customers
          </h2>
          <Link
            to="/customers"
            className="text-xs sm:text-sm text-purple-600 hover:text-purple-700"
          >
            View All →
          </Link>
        </div>
        {recentCustomers.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <UsersIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
            <p className="text-sm">No customers yet</p>
            <Link
              to="/customers"
              className="text-purple-600 text-xs sm:text-sm mt-2 inline-block"
            >
              Add first customer →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {recentCustomers.map((customer) => (
              <div
                key={customer._id}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {customer.customer_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base truncate">
                    {customer.customer_name}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    {customer.contact_no || "No phone"}
                  </p>
                  {customer.email && (
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate hidden sm:block">
                      {customer.email}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
