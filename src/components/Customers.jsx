import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    contact_no: "",
    email: "",
    address: "",
  });

  const API_BASE_URL = "https://gift-shop-server.onrender.com/api";

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Error fetching customers");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseHistory = async (customerId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sales/customer/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPurchaseHistory(response.data);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      setPurchaseHistory([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    setLoading(true);
    try {
      if (editingCustomer) {
        await axios.put(
          `${API_BASE_URL}/customers/${editingCustomer._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        toast.success("Customer updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/customers`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Customer added successfully");
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({
        customer_id: "",
        customer_name: "",
        contact_no: "",
        email: "",
        address: "",
      });
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving customer");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      const token = localStorage.getItem("token");
      try {
        await axios.delete(`${API_BASE_URL}/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Customer deleted successfully");
        fetchCustomers();
      } catch (error) {
        toast.error("Error deleting customer");
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_id: customer.customer_id,
      customer_name: customer.customer_name,
      contact_no: customer.contact_no,
      email: customer.email || "",
      address: customer.address || "",
    });
    setIsModalOpen(true);
  };

  const handleView = async (customer) => {
    setSelectedCustomer(customer);
    await fetchPurchaseHistory(customer._id);
    setIsViewModalOpen(true);
  };

  // Generate customer ID
  const generateCustomerId = () => {
    return `CUST${Date.now()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100">
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
        {/*====================== Header ======================*/}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Customer Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your customers and view their purchase history
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setFormData({
                customer_id: generateCustomerId(),
                customer_name: "",
                contact_no: "",
                email: "",
                address: "",
              });
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:scale-105 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Add Customer
          </button>
        </div>

        {/*================================= Loading State ====================================*/}
        {loading && customers.length === 0 ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-purple-600 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-gray-500 text-sm sm:text-base">
                Loading customers...
              </p>
            </div>
          </div>
        ) : customers.length === 0 ? (
          /*====================== Empty State ======================*/
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="text-6xl sm:text-7xl mb-4">👥</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              No Customers Yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              Start by adding your first customer
            </p>
            <button
              onClick={() => {
                setEditingCustomer(null);
                setFormData({
                  customer_id: generateCustomerId(),
                  customer_name: "",
                  contact_no: "",
                  email: "",
                  address: "",
                });
                setIsModalOpen(true);
              }}
              className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition inline-flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Add Your First Customer
            </button>
          </div>
        ) : (
          /*============================= Customers Grid ==============================*/
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {customers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/*====================== Card Header ======================*/}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 sm:px-5 py-3 sm:py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-white truncate">
                        {customer.customer_name}
                      </h3>
                      <p className="text-xs text-purple-100 mt-0.5 sm:mt-1">
                        ID: {customer.customer_id}
                      </p>
                    </div>
                    <div className="flex gap-1 sm:gap-2 ml-2">
                      <button
                        onClick={() => handleView(customer)}
                        className="text-white/80 hover:text-white transition p-1"
                      >
                        <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-white/80 hover:text-white transition p-1"
                      >
                        <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="text-red-300 hover:text-red-100 transition p-1"
                      >
                        <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/*====================== Card Body ======================*/}
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs sm:text-sm text-gray-500 min-w-[65px]">
                      Contact:
                    </span>
                    <p className="text-xs sm:text-sm text-gray-800 break-all">
                      {customer.contact_no}
                    </p>
                  </div>
                  {customer.email && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs sm:text-sm text-gray-500 min-w-[65px]">
                        Email:
                      </span>
                      <p className="text-xs sm:text-sm text-gray-800 break-all">
                        {customer.email}
                      </p>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs sm:text-sm text-gray-500 min-w-[65px]">
                        Address:
                      </span>
                      <p className="text-xs sm:text-sm text-gray-600 break-all">
                        {customer.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/*=============================== Add/Edit Modal ==================================*/}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-3 sm:p-5 w-full max-w-md">
            <div className="bg-white rounded-xl shadow-2xl">
              <div className="flex justify-between items-center p-4 sm:p-5 border-b">
                <h3 className="text-base sm:text-lg font-bold text-gray-800">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-5">
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    value={formData.customer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, customer_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                    readOnly={!!editingCustomer}
                  />
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customer_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_no}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_no: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div className="mb-4 sm:mb-5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    rows="3"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:scale-105 transition disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading
                      ? "Saving..."
                      : editingCustomer
                        ? "Update"
                        : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/*=============================== View Customer Modal ==================================*/}
      {isViewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-3 sm:p-5 w-full max-w-2xl">
            <div className="bg-white rounded-xl shadow-2xl">
              <div className="flex justify-between items-center p-4 sm:p-5 border-b">
                <h3 className="text-base sm:text-lg font-bold text-gray-800">
                  Customer Details & Purchase History
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-4 sm:p-5">
                <div className="mb-4 sm:mb-6">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800">
                    {selectedCustomer.customer_name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
                    <p className="text-xs sm:text-sm text-gray-600">
                      <span className="font-medium">Contact:</span>{" "}
                      {selectedCustomer.contact_no}
                    </p>
                    {selectedCustomer.email && (
                      <p className="text-xs sm:text-sm text-gray-600">
                        <span className="font-medium">Email:</span>{" "}
                        {selectedCustomer.email}
                      </p>
                    )}
                    {selectedCustomer.address && (
                      <p className="text-xs sm:text-sm text-gray-600 col-span-2">
                        <span className="font-medium">Address:</span>{" "}
                        {selectedCustomer.address}
                      </p>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-2 sm:mb-3">
                  Purchase History
                </h4>
                {purchaseHistory.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-400">
                    <p className="text-sm">No purchase history found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Order ID
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Date
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Total
                            </th>
                            <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500">
                              Payment
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {purchaseHistory.map((sale) => (
                            <tr key={sale._id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm">
                                {sale.invoice_number || sale._id.slice(-8)}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm">
                                {new Date(
                                  sale.createdAt || sale.date,
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-purple-600">
                                ₹{sale.total_amount || sale.total}
                              </td>
                              <td className="px-3 sm:px-4 py-2 text-xs sm:text-sm">
                                {sale.payment_mode || "Cash"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-4 sm:mt-6 flex justify-end">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
