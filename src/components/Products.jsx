import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    supplier_id: "",
  });

  const API_BASE_URL = "https://gift-shop-server.onrender.com/api";

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error("Error fetching products");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    setLoading(true);
    try {
      if (editingProduct) {
        await axios.put(
          `${API_BASE_URL}/products/${editingProduct._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        toast.success("Product updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/products`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product added successfully");
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        product_id: "",
        product_name: "",
        category: "",
        price: "",
        quantity: "",
        description: "",
        supplier_id: "",
      });
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const token = localStorage.getItem("token");
      try {
        await axios.delete(`${API_BASE_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        toast.error("Error deleting product");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_id: product.product_id,
      product_name: product.product_name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      description: product.description || "",
      supplier_id: product.supplier_id?._id || product.supplier_id || "",
    });
    setIsModalOpen(true);
  };

  const generateProductId = () => {
    return `PRD${Date.now()}`;
  };

  const categories = [
    "All",
    "Gifts",
    "Toys",
    "Cards",
    "Decorations",
    "Jewelry",
    "Books",
    "Other",
  ];

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      selectedCategory === "" ||
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100">
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
        {/*================================== Header =============================*/}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
              Product Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your inventory and product details
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                product_id: generateProductId(),
                product_name: "",
                category: "",
                price: "",
                quantity: "",
                description: "",
                supplier_id: "",
              });
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:scale-105 transition flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Add Product
          </button>
        </div>

        {/*=========================== Search and Filter ==================================*/}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/*============================= Loading State =================================*/}
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-purple-600 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-gray-500 text-sm sm:text-base">
                Loading products...
              </p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          /*============================ Empty State ================================*/
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="text-6xl sm:text-7xl mb-4">📦</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              No Products Found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              {searchTerm || selectedCategory
                ? "Try adjusting your search or filter"
                : "Start by adding your first product"}
            </p>
            {searchTerm || selectedCategory ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    product_id: generateProductId(),
                    product_name: "",
                    category: "",
                    price: "",
                    quantity: "",
                    description: "",
                    supplier_id: "",
                  });
                  setIsModalOpen(true);
                }}
                className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition inline-flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/*=================================== Mobile Card View =============================*/}
            <div className="block md:hidden space-y-3 sm:space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-gray-800">
                        {product.product_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ID: {product.product_id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-medium">
                        {product.category || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-sm font-bold text-purple-600">
                        ₹{product.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="text-sm font-medium">
                        {product.quantity} units
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      {product.quantity < 10 ? (
                        <span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/*============================ Desktop Table View (hidden on mobile) ================================*/}
            <div className="hidden md:block bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {product.product_id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.product_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {product.category || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-purple-600">
                          ₹{product.price}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {product.quantity < 10 ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-red-100 text-red-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900 mr-3 transition"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-900 transition"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/*================================= Add/Edit Modal =================================*/}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 sm:top-10 md:top-20 mx-auto p-3 sm:p-5 w-full max-w-md">
            <div className="bg-white rounded-xl shadow-2xl">
              <div className="flex justify-between items-center p-4 sm:p-5 border-b">
                <h3 className="text-base sm:text-lg font-bold text-gray-800">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto"
              >
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={formData.product_id}
                    onChange={(e) =>
                      setFormData({ ...formData, product_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50"
                    required
                    readOnly={!!editingProduct}
                  />
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) =>
                      setFormData({ ...formData, product_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((c) => c !== "All")
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Supplier
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4 sm:mb-5">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
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
                    {loading ? "Saving..." : editingProduct ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
