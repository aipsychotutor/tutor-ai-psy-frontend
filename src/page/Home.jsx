import React, { useState } from "react";
import {useNavigate} from "react-router-dom";

function Home() {
    const [nama, setNama] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) =>{
        e.preventDefault();
        if(nama.trim() !== ""){
            navigate("/dashboard", {state: {nama}});
        }
    }

    return(
        <main className="grid md:grid-cols-2 h-screen w-screen font-sans">
            <div className="flex flex-col justify-center items-center p-8 text-center md:text-left">
                <div className="grid w-full max-w-md">
                    {/* Header */}
                    <div className="mb-12 md:w-[600px] lg:w-[764px]">
                        <h1 className="text-7xl lg:text-9xl font-bold text-white tracking-tighter">
                            CommuLab
                        </h1>
                        <h3 className="text-2xl lg:text-3xl text-gray-300 mt-2 mb-4">
                            Belajar komunikasi, siap hadapi pasien.
                        </h3>

                        <form onSubmit ={handleSubmit} className="grid grid-cols-3 gap-2">
                            <input 
                                type="text"
                                placeholder="Ketik nama Anda..."
                                onChange={(e) => setNama(e.target.value)}
                                value={nama}
                                className="col-span-2 bg-white-700 text- placeholder-gray-400 rounded-3xl px-4 py-3 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                            />
            
                            <button 
                                type="submit"
                                className="bg-yellow-500 text-white font-semibold rounded-3xl hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition duration-300"
                            >
                                Mulai
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div className='hidden md:flex justify-end items-end overflow-hidden relative'>
                <img 
                    src="/images/icon.png" 
                    alt="Ilustrasi medis dekoratif"
                    className="absolute right-0 bottom-0 w-3/4 h-3/4 object-contain"
                />
            </div>
        </main>
    );
}
 
export default Home;