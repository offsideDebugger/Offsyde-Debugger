"use client"
import AuditEmptyIcon from "@/components/desktop";
import { useResponseDataStore,useSelectedRoutesStore } from "../state/urlState";
import { useState } from "react";

export default function Forensics() {
 
    const [loadingTest, setLoadingTest] = useState(false);
    const responseData = useResponseDataStore(state => state.responseData);
    const userRoutes = responseData?.data?.routes || [];
    
    const selectedRoutes = useSelectedRoutesStore(state => state.selectedRoutes);
    const setSelectedRoutes = useSelectedRoutesStore(state => state.setSelectedRoutes);


    //select functions
    function toggleSelect(route: string) {
        if (selectedRoutes.includes(route)) {
            setSelectedRoutes(selectedRoutes.filter(r => r !== route));
        } else {
            setSelectedRoutes([...selectedRoutes, route]);
        }
    }

      const handleSelectAll = () => {
        if (selectedRoutes.length === userRoutes.length) {
            setSelectedRoutes([]);
        } else {
            setSelectedRoutes([...userRoutes]);
        }
    };


    //endgame
    return <div>
        <div className="grid grid-cols-1 h-screen md:grid-cols-[350px_1fr]">
            <aside className="overflow-y-auto overflow-x-hidden">
                <div className="sticky top-0 flex justify-center items-center p-8 border-b border-neutral-800 backdrop-blur-md">
                    <button className="px-10 py-3 text-white text-[14px] font-medium bg-neutral-700 rounded-full transition-all cursor-pointer hover:bg-neutral-600" onClick={handleSelectAll} >Select All</button>
                </div>
                {userRoutes.length===0 && <div className="flex justify-center items-center p-4 h-full text-neutral-500 text-[20px]">No routes found</div>}
                <ul>
                    {userRoutes.map((route, i) => (
                        <li key={i} className={`flex items-center justify-start h-16 px-4 text-[16px] border-b border-neutral-800 transition-all hover:z-10 hover:scale-x-105 hover:cursor-pointer ${
                            selectedRoutes.includes(route) 
                                ? 'bg-white text-neutral-900' 
                                : 'text-neutral-400 hover:bg-neutral-800'
                        }`}
                        onClick={() => toggleSelect(route)}
                        >
                            <span>{route}</span>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="overflow-y-auto flex">
                <div className="flex flex-col justify-center items-center ml-auto p-4 min-h-full w-full">
                    <div>
                        <AuditEmptyIcon size={350} iconColor="#494848ff" accentColor="#494848ff" />
                    </div>
                    <div className="text-center">
                        <h1 className="mb-2 text-5xl font-bold text-neutral-200">No Audits Yet</h1>
                        <p className="text-lg text-neutral-400">Select routes from the left panel to start auditing.</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
}