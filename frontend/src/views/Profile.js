import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom';

import { getUser } from '../utils';
import UserProfile from '../components/UserProfile';

import {FaEdit} from "react-icons/fa"

export default function Profile() {
    let [loading, setLoading] = useState(true)
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
			setLoading(false)
		}
    }, [])

	const handleOnEnableEdit = () => {
		console.log("Editar")
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
						<div className="absolute right-0 hover:cursor-pointer">
							<FaEdit size={24} color='#881337' onClick={handleOnEnableEdit}/>
						</div>
						<UserProfile user={user}/>
					</div>
				)	    
			}
			{/* <div className="border-2 rounded-lg px-6 py-4 w-full mt-4">
				Estadisticas
			</div> */}
	</div>
    )
}
