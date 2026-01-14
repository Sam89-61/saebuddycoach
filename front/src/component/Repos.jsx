import React, { useState, useEffect } from 'react'

function Repos({ nextExo, restTime, nextExoName }) {
    const [timeLeft, setTimeLeft] = useState(restTime);
    const isFinished = timeLeft <= 0;

    useEffect(() => {
        if (isFinished) return;
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [isFinished]);

    // Format pour affichage MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className="text-center p-10 w-full">
            <h2 className="text-3xl font-bold mb-8 text-white">Repos</h2>
            
            <div className="text-[5rem] font-bold text-white mb-8 leading-none">
                {displayTime}
            </div>

            <div className="mb-8 text-white text-lg">
                <p>À suivre : <strong className="font-bold">{nextExoName}</strong></p>
            </div>

            <button 
                className="bg-white text-indigo-600 px-12 py-4 text-lg rounded-full font-bold hover:bg-gray-50 transition-all duration-200 active:scale-95 min-w-[200px]"
                onClick={nextExo}
            >
                {isFinished ? "suite" : "Passer le repos"}
            </button>
        </div>
    );
}

export default Repos;