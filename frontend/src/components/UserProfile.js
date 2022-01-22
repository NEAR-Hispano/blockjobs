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
            <div className="flex items-center mb-4">
                <img src={user.personal_data.picture} className="w-32 h-32 rounded-full mr-4 object-cover" />
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
                            user.personal_data.links.map((v, i) => {
                                return (
                                    <div key={i}><a href={v}>{v}</a></div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}
