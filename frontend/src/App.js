import 'regenerator-runtime/runtime'
import React, { useMemo } from 'react'
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './views/Home'
import AboutUs from './views/AboutUs';
import Docs from './views/Docs';
import Help from './views/Help';
import UserProfile from './views/UserProfile';
import DashBoard from './views/DashBoard';

import NavBar from './components/NavBar'
import Footer from './components/Footer'

import countryList from 'react-select-country-list'

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
                <Route path="profile/:id" element={<UserProfile />}/>
                <Route path="dashboard/*" element={<DashBoard />} />
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
