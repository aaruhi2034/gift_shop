import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CubeIcon,
  TruckIcon,
  DocumentTextIcon,
  GiftIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const Sidebar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: HomeIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      path: "/products",
      name: "Products",
      icon: GiftIcon,
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
  ];

  const bottomItems = [
    {
      path: "/",
      name: "Settings",
      icon: Cog6ToothIcon,
      color: "from-gray-500 to-gray-600",
    },
  ];

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const sidebarVariants = {
    open: {
      width: isMobile ? "100%" : 256,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      width: isMobile ? 0 : 80,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const overlayVariants = {
    visible: { opacity: 1, display: "block" },
    hidden: { opacity: 0, display: "none" },
  };

  return (
    <>
      {/*================================= Mobile Overlay =======================================*/}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={sidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 shadow-2xl z-40 overflow-hidden ${
          isMobile ? "top-0" : "top-16"
        }`}
      >
        <div className="h-full flex flex-col">
          {/*=========================== Sidebar Header ===============================*/}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
                  <GiftIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg text-gray-800 dark:text-white">
                  Gift Shop
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          )}

          {/*=========================== Menu Items ===================*/}
          <div className="flex-1 py-4 sm:py-6 overflow-y-auto">
            {/*============================ Main Menu ================================*/}
            <div className="mb-4">
              {!isMobile && !sidebarOpen && (
                <div className="px-4 mb-4">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center mx-auto">
                    <GiftIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}

              {(sidebarOpen || isMobile) && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
                  Main Menu
                </p>
              )}

              {menuItems.map((item, index) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 mx-2 my-1 rounded-xl transition-all duration-200 group relative
                    ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  <item.icon
                    className={`h-5 w-5 transition-all ${!sidebarOpen && !isMobile && "group-hover:scale-110"}`}
                  />
                  {(sidebarOpen || isMobile) && (
                    <span className="font-medium text-sm sm:text-base">
                      {item.name}
                    </span>
                  )}

                  {/*==================== Tooltip for collapsed desktop sidebar ======================*/}
                  {!sidebarOpen && !isMobile && hoveredItem === item.path && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg"
                    >
                      {item.name}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
                        <div className="border-8 border-transparent border-r-gray-900"></div>
                      </div>
                    </motion.div>
                  )}
                </NavLink>
              ))}
            </div>

            {/*======================== Bottom Menu Items =====================*/}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
              {(sidebarOpen || isMobile) && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
                  Settings
                </p>
              )}

              {bottomItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 mx-2 my-1 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {(sidebarOpen || isMobile) && (
                    <span className="font-medium text-sm sm:text-base">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          {/*=========================== Sidebar Footer ===============================*/}
          {(sidebarOpen || isMobile) && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    admin@giftshop.com
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/*========================================= Mobile Menu Button ====================================*/}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-200"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
