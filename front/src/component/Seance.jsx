import React from "react";

function Seance({ exercice, exerciceIndex, totalExos, currentSerie, isAlreadyDone, onExoFini }) {
    const isLastSerie = Number(currentSerie) >= Number(exercice.series);

    return (
        <div className="flex flex-col bg-white rounded-2xl p-8 shadow-[0_4px_15px_rgba(0,0,0,0.1)] text-center w-full">
            <div className="mb-5">
                <span className="text-gray-500 text-sm uppercase tracking-widest font-semibold">
                    Exercice {exerciceIndex} / {totalExos}
                </span>
                <h2 className="text-gray-800 text-4xl font-bold mt-2.5 mb-2.5">
                    {exercice.nom_exercice}
                </h2>
            </div>

            <div className="flex justify-around my-5 bg-gray-50 p-4 rounded-xl">
                <div className="text-center">
                    <strong className="block text-3xl font-bold text-indigo-600 transition-transform duration-300">
                        {currentSerie} / {exercice.series}
                    </strong>
                    <span className="text-gray-500 text-sm">Séries</span>
                </div>
                <div className="text-center">
                    <strong className="block text-2xl font-bold text-indigo-600">
                        {exercice.repetitions}
                    </strong>
                    <span className="text-gray-500 text-sm">Répétitions</span>
                </div>
            </div>

            <div className="text-left text-gray-500 leading-relaxed mb-5 bg-white p-2.5">
                <h3 className="font-bold text-gray-700 mb-2">Consignes :</h3>
                <p className="mb-2">
                    {exercice.description_exo || exercice.description || "Aucune description disponible."}
                </p>
                {exercice.notes && (
                    <p className="text-sm italic text-gray-600">
                        Note: {exercice.notes}
                    </p>
                )}
            </div>

            {/* Image */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden my-4 bg-gray-50">
                <img 
                    src={'https://homeworkouts.org/wp-content/uploads/anim-air-squat.gif'} 
                    alt={exercice.nom_exercice}
                    className="w-full h-auto object-cover"
                />
            </div>

            {/* Bouton d'action */}
            <button
                className={`
                    w-4/5 max-w-xs mx-auto px-6 py-4 rounded-full 
                    font-bold text-lg transition-all duration-200
                    ${isAlreadyDone 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98 cursor-pointer'
                    }
                `}
                onClick={!isAlreadyDone ? onExoFini : undefined}
                disabled={isAlreadyDone}
            >
                {isAlreadyDone ? "Séance déjà réalisée ✅" : (isLastSerie ? "Exercice Terminé" : "Série Terminée")}
            </button>
        </div>
    );
}

export default Seance;