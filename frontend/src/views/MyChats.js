import React, { useEffect, useState } from "react";
import {
  fireStore,
  auth,
  singInFirebaseAnonymously,
  firebaseApp,
} from "../firebase";
import { collection, query, getDocs } from "firebase/firestore";
import {
  useCollectionData,
  useCollection,
} from "react-firebase-hooks/firestore";
import Chat from "../components/Chat";

export default function MyChats() {
  const [salas, setSalas] = useState(null);
  const [selectedSala, setSelectedSala] = useState(0);

  const salasRef = collection(fireStore, "salas");
  const q = query(salasRef);
  const [salasDoc] = useCollection(q, { idField: "id" });

  useEffect(async () => {
    if (salasDoc) {
      let services = [];

      salasDoc.forEach((doc) => {
        const id = doc.id.split("&");

        if (window.accountId == id[1] || window.accountId == id[2]) {
          const service = {
            id: Number(id[0]),
            creator_id: id[1],
            actual_owner: id[2],
          };
          services.push(service);
        }
      });

      setSalas(services);
    }
  }, [salasDoc]);

  return (
    <div className="max-h-screen w-full">
      {salas ? (
        <div className="flex h-full">
          <div className="min-w-[180px] max-w-[180px] max-h-screen overflow-y-auto">
            {salas.map((v, i) => {
              return (
                <div className="flex justify-between" key={i}>
                  <button
                    onClick={() => {
                      setSelectedSala(i);
                    }}
                    className={
                      selectedSala == i
                        ? "text-[#352E5B] text-left py-4 pl-6 w-full pr-8 border-b-2 "
                        : "text-[#A5A2B8] text-left py-4 pl-6 w-full pr-8 border-b-2 transition ease-in-out hover:text-[#352E5B] duration-300"
                    }
                  >
                    <div className="">{`Servicio ID ${v.id}`}</div>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="w-full">
            <Chat service={salas[selectedSala]} />
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
