import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";

const Navbar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "New order received",
      message: "Order #ORD1234 has been placed",
      time: "5 min ago",
      read: false,
      type: "order",
    },
    {
      id: 2,
      title: "Low stock alert",
      message: "Teddy Bear stock is running low",
      time: "1 hour ago",
      read: false,
      type: "stock",
    },
    {
      id: 3,
      title: "Payment received",
      message: "Payment of ₹2,500 received",
      time: "2 hours ago",
      read: true,
      type: "payment",
    },
    {
      id: 4,
      title: "New customer registered",
      message: "Rajesh Kumar joined as customer",
      time: "5 hours ago",
      read: true,
      type: "customer",
    },
  ];

  const mobileMenuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: HomeIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      path: "/products",
      name: "Products",
      icon: ShoppingBagIcon,
      color: "from-green-500 to-emerald-600",
    },
    {
      path: "/customers",
      name: "Customers",
      icon: UsersIcon,
      color: "from-yellow-500 to-orange-500",
    },
    {
      path: "/billing",
      name: "Billing",
      icon: CreditCardIcon,
      color: "from-purple-500 to-pink-500",
    },
    {
      path: "/reports",
      name: "Reports",
      icon: ChartBarIcon,
      color: "from-red-500 to-rose-600",
    },
    {
      path: "/settings",
      name: "Settings",
      icon: Cog6ToothIcon,
      color: "from-gray-500 to-gray-600",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check for saved dark mode preference
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      toast.success("Dark mode activated");
    } else {
      document.documentElement.classList.remove("dark");
      toast.success("Light mode activated");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100 dark:bg-gray-900/80 dark:border-gray-800">
        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/*================================= Left Section - Logo & Menu Button ==========================================*/}
            <div className="flex items-center gap-2 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.button>

              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg"
                >
                  <span className="text-xl sm:text-2xl">🎁</span>
                </motion.div>
                <div className="hidden sm:block">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Gift Shop
                  </h1>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                    Complete Retail Solution
                  </p>
                </div>
              </div>
            </div>

            {/*=================================== Search Bar ========================================*/}
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2 w-64 lg:w-96">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm dark:text-white placeholder:text-gray-400"
              />
            </div>

            {/*=================================== Right Section ========================================*/}
            <div className="flex items-center gap-1 sm:gap-2">
              {/*====================================== Mobile Search Button =======================================*/}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </motion.button>

              {/*====================================== Dark Mode Toggle =======================================*/}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </motion.button>

              {/*====================================== Notifications =======================================*/}
              <div className="relative" ref={notificationRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-all dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <BellIcon className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">
                            Notifications
                          </h3>
                          <button className="text-xs text-purple-600 hover:text-purple-700">
                            Mark all as read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${
                              !notification.read
                                ? "bg-purple-50 dark:bg-purple-900/20"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notification.read ? "bg-purple-500" : "bg-gray-300"}`}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/*====================================== Profile Dropdown ====================================================*/}
              <div className="relative" ref={profileRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-500 to-pink-500 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md"
                >
                  <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  <div className="hidden md:block text-left">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate max-w-[100px]">
                      {user.username || "Admin User"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-purple-200">
                      {user.role || "Administrator"}
                    </p>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                            <UserCircleIcon className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                              {user.username || "Admin User"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email || "admin@giftshop.com"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                          👤 My Profile
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                          ⚙️ Settings
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                          ❓ Help & Support
                        </button>
                        <hr className="my-2 border-gray-100 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/*========================== Mobile Search Modal ===============================*/}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white dark:bg-gray-900 shadow-xl md:hidden"
            ref={mobileMenuRef}
          >
            <div className="p-4">
              {/*========================== Search Input ===============================*/}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 mb-4">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none focus:outline-none flex-1 text-sm dark:text-white"
                  autoFocus
                />
                <button onClick={() => setShowMobileMenu(false)}>
                  <XMarkIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/*========================== Quick Links ===============================*/}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                  Quick Navigation
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {mobileMenuItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={({ isActive }) => `
                        flex flex-col items-center gap-1 p-3 rounded-xl transition
                        ${
                          isActive
                            ? `bg-gradient-to-r ${item.color} text-white`
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                        }
                      `}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-xs">{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
