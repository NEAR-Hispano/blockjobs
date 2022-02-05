import React from 'react'

export default function UserProfile({ user }) {

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
        <div className="text-[#352E5B] font-bebas-neue">
            <div className="md:flex mb-4 shadow-lg rounded-xl w-auto">
                <img src={user.personal_data.picture} className="w-32 h-32 md:w-48 md:h-auto md:rounded md:rounded-bl-xl md:rounded-tl-xl rounded-full mr-4 object-cover " />
                <div className="p-3">
                    <div className="text-3xl font-semibold uppercase text-[#04AADD] mb-2">{user.account_id}</div>
                    <div className="flex items-center h-full">
                        <div>
                            <div className="font-semibold"> Reputacion: <span className={user.reputation === 0 ? "text-gray-900" : user.reputation > 0 ? "text-green-400" : "text-red"}>{user.reputation}</span></div>
                            <div className="flex flex-row whitespace-pre-wrap font-semibold">
                                <div>Roles:</div>
                                {
                                    user.roles.map((v, i) => {
                                        return (
                                            <div key={v}
                                                className={v === "Judge" ? "text-green-400" : v === "Admin" ? "text-[#04AADD]" : ""}
                                            > {v}</div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row flex-wrap">
                <div className="mt-8 mx-4 shadow-lg border-2 border-[#27C0EF] p-3 rounded-lg">
                    <div className="text-[#04AADD] text-2xl font-semibold mb-2">Informacion Personal</div>
                    <div className="flex flex-row">
                        <div className="mr-8 font-semibold text-lg">
                            <div>Nombre legal</div>
                            <div>Educacion</div>
                            <div>Pais</div>
                            <div>Correo</div>
                        </div>
                        <div className="text-[#047fdd] font-semibold text-lg">
                            <div>{user.personal_data.legal_name}</div>
                            <div>{user.personal_data.education}</div>
                            <div>{user.personal_data.country}</div>
                            <div>{user.personal_data.email}</div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 mx-4 shadow-lg border-2 border-[#27C0EF] p-3 rounded-lg">
                    <div className="text-[#04AADD] text-2xl font-semibold mb-2 flex items-center">
                        {/* <ImLink className='text-[#352E5B] mr-2'/> */} Links
                    </div>
                    <div className="mr-8 font-semibold text-lg">
                        <ul class='list-outside list-disc ml-6'>
                            {
                                user.personal_data.links.map((v, i) => {
                                    return (
                                        <li className="text-red-500" key={i}>
                                            <a href={v}>{v}</a>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                    </div>

                </div>
                <div className="mt-8 mx-4 shadow-lg border-2 border-[#27C0EF] p-3 rounded-lg">
                    <div>
                        <div className="text-[#04AADD] text-2xl font-semibold mb-2">Bio</div>
                        <div className="font-semibold text-lg">
                            <div>{user.personal_data.bio}</div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 mx-4 shadow-lg border-2 border-[#27C0EF] p-3 rounded-lg">
                    <div className="text-[#04AADD] text-2xl font-semibold mb-2">Idiomas</div>
                    <div className="font-semibold text-lg whitespace-pre-wrap">
                        <div className="flex flex-row">
                            <div className="mr-8 font-semibold text-lg">
                                {
                                    user.personal_data.idioms.map((v, i) => {
                                        return (
                                            <div key={i}>{v.idiom}</div>
                                        )
                                    })
                                }
                            </div>

                            <div className="text-[#047fdd] font-semibold text-lg">

                            {
                                user.personal_data.idioms.map((v, i) => {
                                    return (
                                            <div key={i}>({v.level})</div>
                                        )
                                    }
                                )
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}
