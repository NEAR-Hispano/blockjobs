import "regenerator-runtime/runtime";
import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./views/Home";
import AboutUs from "./views/AboutUs";
import Docs from "./views/Docs";
import Help from "./views/Help";
import Profile from "./views/Profile";
import DashBoard from "./views/DashBoard";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

import Services from "./views/Services";
import Service from "./views/Service";

import { useGlobalState, setIsUserCreated, setUserProfile } from "./state";
import { getUser } from "./utils";
import Disputes from "./views/Disputes";
import Dispute from "./views/Dispute";
import NotFoundPage from "./views/NotFoundPage";
import ConnectionError from "./views/ConnectionError";

export default function App() {
  const [isUserCreated] = useGlobalState("isUserCreated");
  const [loading, setLoading] = useState(false);

  useEffect(async () => {
    const foo = async () => {
      if (window.walletConnection.isSignedIn()) {
        let user = await getUser(window.accountId);
        if (user) {
          user.personal_data = JSON.parse(user.personal_data);
          setUserProfile(user);
          setIsUserCreated(true);
        } else {
          setIsUserCreated(false);
        }
      }
    };
    await foo();
    setLoading(true);
  }, []);

  return (
    <>
      {loading ? (
        <>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="about_us" element={<AboutUs />} />
            <Route path="docs" element={<Docs />} />
            <Route path="help" element={<Help />} />
            <Route path="profile/:id" element={<Profile />} />

            <Route
              path="dashboard/*"
              element={
                <RequireAuth>
                  <DashBoard />
                </RequireAuth>
              }
            />

            <Route path="services" element={<Services />} />
            <Route path="service/:id" element={<Service />} />

            <Route path="disputes" element={<Disputes />} />
            <Route path="dispute/:id" element={<Dispute />} />
            <Route path="/error" element={<ConnectionError />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </>
      ) : (
        <div className="h-screen">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle
              className="path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="5"
            ></circle>
          </svg>
        </div>
      )}
    </>
  );
}

function RequireAuth({ children }) {
  const [isUserCreated] = useGlobalState("isUserCreated");
  let location = useLocation();

  if (!isUserCreated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
