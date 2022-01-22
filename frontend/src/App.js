import 'regenerator-runtime/runtime'
import React, { useMemo } from 'react'
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './views/Home'
import AboutUs from './views/AboutUs';
import Docs from './views/Docs';
import Help from './views/Help';
import Profile from './views/Profile';
import DashBoard from './views/DashBoard';

import NavBar from './components/NavBar'
import Footer from './components/Footer'

import countryList from 'react-select-country-list'
import Services from './views/Services';
import Service from './views/Service';

// import { fbConfig } from './Firebase';

// fbConfig();

export default function App() {
    const options = useMemo(() => countryList().getData(), [])
    return (
        <>
            <NavBar countriesData={options}/>
            <Routes>
                <Route path="/" element={ <Home />} />
                <Route path="about_us" element={<AboutUs />} />
                <Route path="docs" element={<Docs />}/>
                <Route path="help" element={<Help />}/>
                <Route path="profile/:id" element={<Profile />}/>
                
                <Route path="dashboard/*" element={
                        <RequireAuth>
                            <DashBoard />
                        </RequireAuth>
                    }
                />
                
                <Route path="services" element={<Services />}/>
                <Route path="service/:id" element={<Service />}/>
            </Routes>
            <Footer/>
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
    )
}

function RequireAuth({ children }) {
    let location = useLocation();
  
    if (!window.accountId) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  
    return children;
  }