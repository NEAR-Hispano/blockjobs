import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom';

import {FaEdit} from "react-icons/fa"

import { getUser } from '../utils';
import UserProfile from '../components/UserProfile';
import DialogUserCreator from "../components/DialogUserCreator"

// import userTestData from "../../assets/userTestData.json"

export default function Profile() {
    let [loading, setLoading] = useState(true)
	let [isOpen, setIsOpen] = useState(false)
	let [enableEdit, setEnableEdit] = useState(false)
    let [user, setUser] = useState()

    const params = useParams();
	
    useEffect(async ()=>{

		let userNearId = null 
		if (params.id) {
			userNearId = params.id
		}
		else {
			userNearId = window.accountId
		}

		console.log(userNearId)
		let user = await getUser(window.accountId)
		if (user) {
			user.personal_data = JSON.parse(user.personal_data)
			setUser(user)
			setLoading(false)
			console.log(user)
		}
		else {
			// setUser(userTestData)
			// setLoading(false)
		}
	}, [])

    function closeModal() {
		setIsOpen(false)
		setEnableEdit(false)
    }

    function openModal() {
		setEnableEdit(true)
        setIsOpen(true)
    }

    return (
        <div className="m-8">
			{
				loading ? (
					<div className="h-screen">
						<svg className="spinner" viewBox="0 0 50 50">
							<circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
						</svg>
					</div>
				) : (
					<div className="relative">
						<div className="absolute -right-10 -top-6 hover:cursor-pointer rounded-full p-2 bg-[#04AADD] flex items-center justify-center transition ease-in-out hover:scale-110 duration-300">
							<FaEdit className="" size={"23px"} color='#ffffff' onClick={openModal}/>
						</div>
						<UserProfile user={user}/>
					</div>
				)	    
  			}
			{
				enableEdit ? (
					<DialogUserCreator isOpen={isOpen} closeModal={closeModal} user={user}/>
				) : (<></>)
			}
	</div>
    )
}
