import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Profile from './Profile';
import MyServices from '../views/MyServices';
import Disputes from '../views/Disputes';

import {ImProfile} from "react-icons/im"
import {RiSuitcaseFill} from "react-icons/ri"
import {MdHowToVote} from "react-icons/md"

export default function DashBoard() {
	const navigate = useNavigate()
	const location = useLocation()
	
	let [selectedLeftSize, setSelectedLeftSize] = useState(0)
	
	const leftSize = ["profile", "services", "disputes"]
	const leftSizeIcons = [<ImProfile/>, <RiSuitcaseFill/>, <MdHowToVote/>]

	useEffect(() => {
		for (let index = 0; index < leftSize.length; index++) {
			let match = location.pathname == `/dashboard/${leftSize[index]}`
			if(match) {
				setSelectedLeftSize(index)
				break
			} 
		}
	}, [location])

    return (
	<div className="flex">
	    <div className="min-w-[100px] min-h-screen h-auto bg-[#F8F7FF]">
			{
				["Profile", "Services", "Disputes"].map((v, i) => {return (
					<div className="flex justify-between" key={i}>
						<button onClick={() => {
								setSelectedLeftSize(i)
								navigate(`/dashboard/${leftSize[i]}`)
							}}
							className={selectedLeftSize == i
								? "text-[#352E5B] border-violet-600 border-r-2 text-left py-4 pl-6 w-full pr-14" :
								"text-[#A5A2B8] text-left py-4 pl-6 w-full pr-14"
							}
						>
							<div className="flex items-center">
								<span className="mr-2">{leftSizeIcons[i]}</span>{v}
							</div>
						</button>
					</div>
				)})
			}
		</div>
		<Routes>
            <Route 	path="/profile" 	element={<Profile />}/>
            <Route 	path="/services" 	element={<MyServices />}/>
            <Route 	path="/disputes" 	element={<Disputes />}/>
        </Routes>
	</div>
    )
}
