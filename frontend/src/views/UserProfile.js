import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify'

import {ImLink} from "react-icons/im"

export default function UserProfile() {
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
		try {
			let user = await window.contract.get_user({account_id: window.accountId})
			user.personal_data = JSON.parse(user.personal_data)
			setUser(user)
			setLoading(false)
			console.log(user)
		} catch(e) {
			setLoading(false)
			toast.error(String(e.message.match("\".*\"")))
			console.log(e)
		}
    }, [])

    const colorRep = (val) => {
	if (val == 0) {
	    return "text-black"
	}
	else if (val > 0) {
	    return "text-green-400"
	}
	else {
	    return "red"
	}
    }

    return (
        <>
	    {
		loading ? (
		    <div className="h-screen">
				<svg className="spinner" viewBox="0 0 50 50">
					<circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
				</svg>
		    </div>
		) : (
		    <div className="text-[#352E5B] font-bebas-neue mx-8">
		        <div className="flex items-center">
			    <img src={user.personal_data.picture} className="w-32 h-32 rounded-full"/>
			    <div> 
				<div className="text-3xl font-semibold uppercase">Perfil de <span className="text-[#04AADD]">{user.account_id}</span></div>
				<div> reputacion <span className={user.reputation === 0 ? "text-gray-900" : user.reputation > 0 ? "text-green-400" : "text-red"}>{user.reputation}</span></div>
			    </div>
		        </div>
				<div className="flex flex-row">
					<div>
						<div className="text-[#04AADD] text-2xl font-semibold mb-4">Informacion Personal</div>
						<div className="flex flex-row">
							<div className="mr-8 font-semibold text-lg">
							<div>Nombre legal</div>
							<div>Educacion</div>
							<div>Pais</div>
							</div>
								<div className="text-[#04AADD] font-semibold text-lg">
								<div>{user.personal_data.legal_name}</div>
								<div>{user.personal_data.education}</div>
								<div>{user.personal_data.country}</div>
							</div>
						</div>
					</div>
					<div className="ml-8">
						<div className="text-[#04AADD] text-2xl font-semibold mb-4 flex items-center">
							{/* <ImLink className='text-[#352E5B] mr-2'/> */} Links
						</div>
							<div className="mr-8 font-semibold text-lg">
							{
								user.personal_data.links.map((v, i) => {return (
									<div key={i}><a href={v}>{v}</a></div>
								)})
							}
							</div>
					</div>
				</div>
		    </div>
		)	    
	    }
	</>
    )
}
