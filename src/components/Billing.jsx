import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  PrinterIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastBill, setLastBill] = useState(null);
  const [loading, setLoading] = useState(false);

  const printRef = useRef();
  const billRef = useRef();

  //=============API Base URL======================
  const API_BASE_URL = "https://gift-shop-server.onrender.com/api";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const [productsRes, customersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching data");
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch =
      product.product_name?.toLowerCase().includes(searchLower) || false;
    const categoryMatch =
      product.category?.toLowerCase().includes(searchLower) || false;
    return nameMatch || categoryMatch;
  });

  const addToCart = (product) => {
    const currentStock =
      product.stock_quantity !== undefined
        ? product.stock_quantity
        : product.quantity;

    if (currentStock === 0) {
      toast.error("Out of stock");
      return;
    }

    const existing = cart.find((i) => i.product_id === product._id);

    if (existing) {
      if (existing.quantity + 1 > currentStock) {
        toast.error("Stock limit reached");
        return;
      }

      setCart(
        cart.map((i) =>
          i.product_id === product._id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product._id,
          product_name: product.product_name,
          quantity: 1,
          price: product.price,
          maxStock: currentStock,
        },
      ]);
    }

    toast.success("Added to cart");
  };

  const updateQuantity = (id, qty) => {
    const item = cart.find((i) => i.product_id === id);
    if (!item) return;

    if (qty > item.maxStock) {
      toast.error("Stock exceeded");
      return;
    }

    if (qty <= 0) {
      setCart(cart.filter((i) => i.product_id !== id));
    } else {
      setCart(
        cart.map((i) => (i.product_id === id ? { ...i, quantity: qty } : i)),
      );
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((i) => i.product_id !== id));
    toast.success("Removed from cart");
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal - discount;

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error("Select customer");
      return;
    }
    if (!cart.length) {
      toast.error("Cart empty");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/sales`,
        {
          customer_id: selectedCustomer,
          items: cart.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
          })),
          payment_mode: paymentMode,
          discount: discount,
          total_amount: total,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const billData = {
        ...res.data,
        items: cart,
        subtotal: subtotal,
        total: total,
        discount: discount,
        customer: customers.find((c) => c._id === selectedCustomer),
        payment_mode: paymentMode,
        date: new Date(),
        invoice_number: `INV-${Date.now()}`,
      };

      setLastBill(billData);
      toast.success("Bill generated successfully!");

      setCart([]);
      setDiscount(0);
      setSelectedCustomer("");
    } catch (error) {
      console.error("Billing error:", error);
      toast.error("Billing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //=========Function to download bill as PDF ============
  const downloadPDF = async () => {
    if (!lastBill) {
      toast.error("No bill to download");
      return;
    }

    const element = billRef.current;
    if (!element) return;

    try {
      toast.loading("Generating PDF...", { id: "pdf" });

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`bill_${lastBill.invoice_number}.pdf`);

      toast.success("PDF downloaded!", { id: "pdf" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF", { id: "pdf" });
    }
  };

  //================Function to print only the bill=============
  const printBill = () => {
    if (!lastBill) {
      toast.error("No bill to print");
      return;
    }

    const printContent = billRef.current.innerHTML;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Gift Shop Bill</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
            }
            .bill-container {
              max-width: 80mm;
              margin: 0 auto;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 18px;
              margin-bottom: 5px;
            }
            .header p {
              font-size: 10px;
              color: #666;
              margin: 2px 0;
            }
            .details {
              margin-bottom: 20px;
              font-size: 10px;
            }
            .details p {
              margin: 3px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 10px;
            }
            th, td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              font-weight: bold;
              border-bottom: 1px solid #000;
            }
            .text-right {
              text-align: right;
            }
            .totals {
              margin-top: 10px;
              text-align: right;
              font-size: 10px;
            }
            .totals p {
              margin: 3px 0;
            }
            .total-amount {
              font-size: 12px;
              font-weight: bold;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 1px solid #000;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              font-size: 9px;
            }
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="bill-container">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  //============= Bill Component to display and print =============
  const BillDisplay = () => {
    if (!lastBill) return null;

    return (
      <div className="mt-4 sm:mt-6 bg-white rounded-xl shadow-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 border-b pb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            Bill Generated Successfully!
          </h2>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            {/*====================== Download PDF Button ======================*/}
            <button
              onClick={downloadPDF}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <DocumentArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">Download</span>
              PDF
            </button>

            {/*====================== Print Button ======================*/}
            <button
              onClick={printBill}
              className="flex-1 sm:flex-none bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              <PrinterIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">Print</span>
              Bill
            </button>
          </div>
        </div>

        {/*====================== Bill Content ======================*/}
        <div
          ref={billRef}
          className="bill-content"
          style={{ maxWidth: "80mm", margin: "0 auto" }}
        >
          <div className="header text-center border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
            <h1 className="text-base sm:text-lg font-bold">Gift Shop</h1>
            <p className="text-[10px] sm:text-xs text-gray-600">
              123 Gift Street, City
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">
              Phone: +91 9876543210
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600">
              GST: 22AAAAA0000A1Z
            </p>
          </div>

          <div className="details mb-3 sm:mb-4 text-[10px] sm:text-xs">
            <p>
              <strong>Bill No:</strong> {lastBill.invoice_number}
            </p>
            <p>
              <strong>Date:</strong> {new Date(lastBill.date).toLocaleString()}
            </p>
            <p>
              <strong>Customer:</strong>{" "}
              {lastBill.customer?.customer_name || "Guest"}
            </p>
            <p>
              <strong>Payment Mode:</strong> {lastBill.payment_mode}
            </p>
          </div>

          <table className="w-full mb-3 sm:mb-4 text-[10px] sm:text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1 sm:py-2">Item</th>
                <th className="text-right py-1 sm:py-2">Qty</th>
                <th className="text-right py-1 sm:py-2">Price</th>
                <th className="text-right py-1 sm:py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {lastBill.items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-1 sm:py-2">{item.product_name}</td>
                  <td className="text-right py-1 sm:py-2">{item.quantity}</td>
                  <td className="text-right py-1 sm:py-2">₹{item.price}</td>
                  <td className="text-right py-1 sm:py-2">
                    ₹{item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals text-right text-[10px] sm:text-xs">
            <p>Subtotal: ₹{lastBill.subtotal}</p>
            {lastBill.discount > 0 && <p>Discount: -₹{lastBill.discount}</p>}
            <p className="total-amount text-sm sm:text-base font-bold mt-1 sm:mt-2 pt-1 sm:pt-2 border-t">
              Total: ₹{lastBill.total}
            </p>
          </div>

          <div className="footer text-center mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
            <p className="text-[9px] sm:text-xs">
              Thank you for shopping with us!
            </p>
            <p className="text-[7px] sm:text-[8px] mt-1 sm:mt-2">
              ** Computer generated bill **
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 p-3 sm:p-4 md:p-6 pb-20 sm:pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/*====================== PRODUCTS SECTION ======================*/}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
            Products
          </h2>

          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg sm:rounded-xl mb-3 sm:mb-4 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {loading ? (
            <div className="text-center py-8 sm:py-10">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-gray-500 text-sm sm:text-base">
                Loading products...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
              {filteredProducts.map((p) => (
                <div
                  key={p._id}
                  className="bg-white border rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-xl transition"
                >
                  <h3 className="font-bold text-sm sm:text-base truncate">
                    {p.product_name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {p.category || "General"}
                  </p>
                  <p className="text-purple-600 font-bold text-base sm:text-lg mt-1 sm:mt-2">
                    ₹{p.price}
                  </p>
                  <button
                    onClick={() => addToCart(p)}
                    className="mt-2 sm:mt-3 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-1.5 sm:py-2 rounded-lg hover:scale-105 transition flex justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/*====================== CART SECTION ======================*/}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 flex justify-between items-center">
            Cart
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-red-500 text-xs sm:text-sm hover:text-red-700"
              >
                Clear All
              </button>
            )}
          </h2>

          {cart.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-gray-400">
              <p className="text-5xl sm:text-6xl mb-3 sm:mb-4">🛒</p>
              <p className="text-sm sm:text-base">Cart is empty</p>
              <p className="text-xs sm:text-sm mt-1">
                Add products to continue
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-[350px] sm:max-h-[400px] overflow-y-auto mb-3 sm:mb-4">
                {cart.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex justify-between items-start mb-2 sm:mb-3 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {item.product_name}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <span className="w-6 sm:w-8 text-center text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="ml-1 sm:ml-2 text-red-500"
                        >
                          <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-sm sm:text-base ml-2">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="my-2 sm:my-3" />

              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span>Discount:</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-20 sm:w-28 border p-1 rounded text-right text-sm sm:text-base"
                  />
                </div>

                <div className="flex justify-between text-lg sm:text-xl font-bold text-green-600 pt-2 border-t">
                  <span>Total:</span>
                  <span>₹{total}</span>
                </div>

                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm sm:text-base"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.customer_name}
                    </option>
                  ))}
                </select>

                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm sm:text-base"
                >
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                </select>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-xl hover:scale-105 transition disabled:opacity-50 text-sm sm:text-base font-semibold"
                >
                  {loading ? "Processing..." : "Generate Bill"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/*====================== Display Bill after generation ======================*/}
      <BillDisplay />
    </div>
  );
};

export default Billing;
