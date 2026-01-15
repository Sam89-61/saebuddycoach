import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserId } from '../utils/auth';
import WaweEffect from './waveEffect.jsx';


const RadioStep = ({ title, options, name, value, onChange, suffix = '' }) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">{title}</h2>
        <div className="grid grid-cols-1 gap-3">
            {options.map(option => {
                const optValue = typeof option === 'object' ? option.value : option;
                const optLabel = typeof option === 'object' ? option.label : option;
                
                return (
                    <label 
                        key={optValue}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            value == optValue // "==" pour gérer string vs number
                            ? 'border-indigo-600 bg-indigo-50' 
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                    >
                        <input 
                            type="radio" 
                            name={name} 
                            value={optValue} 
                            checked={value == optValue} 
                            onChange={onChange}
                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-lg font-medium text-gray-700">{optLabel}{suffix}</span>
                    </label>
                );
            })}
        </div>
    </div>
);

const CheckboxStep = ({ title, subtitle, options, selectedValues, onToggle }) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">{title}</h2>
        {subtitle && <p className="text-center text-gray-600 text-sm">{subtitle}</p>}
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {options.map(option => (
                <label 
                    key={option}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedValues.includes(option) 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                >
                    <input 
                        type="checkbox" 
                        value={option} 
                        checked={selectedValues.includes(option)} 
                        onChange={(e) => onToggle(e)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-700">{option}</span>
                </label>
            ))}
        </div>
    </div>
);

const NumberStep = ({ title, name, value, onChange, min, max, unit, subtitle }) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">{title}</h2>
        <div className="max-w-xs mx-auto">
            <div className="relative">
                <input 
                    type="number" 
                    min={min} 
                    max={max} 
                    name={name} 
                    value={value} 
                    onChange={onChange}
                    className="w-full px-6 py-4 text-2xl text-center border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder={title}
                    required 
                />
                {unit && <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-xl text-gray-500 font-semibold">{unit}</span>}
            </div>
            {subtitle && <p className="text-sm text-gray-500 text-center mt-2">{subtitle}</p>}
        </div>
    </div>
);


function Form() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        sex: '', age: '', poids: '', taille: '', niveau: '', frequence: 1,
        problemes_medical: [], problemes_physique: [], date_fin: 90, matos: [],
        objectif: '', regime_alimentaire: 'Omnivore', allergies: [],
        jour_disponible: [], heure_disponible: '18:00'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e, field) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            let currentList = prev[field] || [];
            if (checked) {
                if (value === "Aucun") return { ...prev, [field]: ["Aucun"] };
                currentList = currentList.filter(item => item !== "Aucun");
                return { ...prev, [field]: [...currentList, value] };
            } else {
                return { ...prev, [field]: currentList.filter(item => item !== value) };
            }
        });
    };

    const nextStep = () => { setStep(prev => prev + 1); }
    const prevStep = () => { setStep(prev => Math.max(1, prev - 1)); }

    const canNext = () => {
        const f = formData;
        switch (step) {
            case 2: return !!f.sex;
            case 3: return !!f.age;
            case 4: return !!f.poids;
            case 5: return !!f.taille;
            case 6: return !!f.niveau;
            case 7: return !!f.frequence;
            case 11: return !!f.objectif;
            case 12: return f.jour_disponible.length >= f.frequence;
            default: return true;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = localStorage.getItem('token');
        const userId = getUserId();

        if (!token || !userId) {
            setError("Session expirée. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        try {
            const profilPayload = {
                id_utilisateur: parseInt(userId),
                age: parseInt(formData.age),
                poids: parseFloat(formData.poids),
                taille: parseFloat(formData.taille),
                sexe: formData.sex,
                niveau: formData.niveau === "Avancer" ? "Avancé" : formData.niveau,
                frequence: parseInt(formData.frequence),
                jour_disponible: formData.jour_disponible,
                heure_disponible: formData.heure_disponible,
                categorie_objectif: formData.objectif,
                date_fin: parseInt(formData.date_fin),
                equipement: formData.matos.length > 0 ? formData.matos : ["Aucun"],
                conditions_medicales: (formData.problemes_medical.includes("Aucun") || !formData.problemes_medical.length) ? [] : formData.problemes_medical,
                condition_physique: (formData.problemes_physique.includes("Aucun") || !formData.problemes_physique.length) ? [] : formData.problemes_physique,
                regime_alimentaire: formData.regime_alimentaire,
                restrictions_alimentaires: formData.allergies
            };

            const response = await fetch('/api/profil/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(profilPayload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erreur création profil");

            // Génération
            const genResponse = await fetch(`/api/programme/generate/${data.data.id_profil}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!genResponse.ok) throw new Error("Erreur génération programme");

            alert("Profil créé et programme généré avec succès !");
            navigate("/");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Rendu dynamique du contenu ---
    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div className="text-center space-y-6 py-8 animate-fade-in">
                        <div className="flex justify-center mb-6">
                            <img src="../../media/logo.svg" alt="Logo" className="h-24 w-24 object-cover" />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Bienvenue sur BuddyCoach</h2>
                        <p className="text-lg text-gray-600">Êtes-vous prêt à commencer votre transformation ?</p>
                        <button type="button" onClick={nextStep} className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                            Commencer l'aventure 🚀
                        </button>
                    </div>
                );
            case 2: return <RadioStep title="Quel est votre sexe ?" name="sex" value={formData.sex} options={["Homme", "Femme", "Autre"]} onChange={handleChange} />;
            case 3: return <NumberStep title="Quel est votre âge ?" name="age" value={formData.age} min="10" max="100" subtitle="Entre 10 et 100 ans" onChange={handleChange} />;
            case 4: return <NumberStep title="Votre poids ?" name="poids" value={formData.poids} min="30" max="300" unit="kg" subtitle="Entre 30 et 300 kg" onChange={handleChange} />;
            case 5: return <NumberStep title="Votre taille ?" name="taille" value={formData.taille} min="100" max="250" unit="cm" subtitle="Entre 100 et 250 cm" onChange={handleChange} />;
            case 6: return <RadioStep title="Quel est votre niveau sportif ?" name="niveau" value={formData.niveau} options={["Débutant", "Intermédiaire", "Avancer"]} onChange={handleChange} />;
            case 7: return <RadioStep title="Fréquence d'entraînement souhaitée" name="frequence" value={formData.frequence} options={[1, 2, 3, 4, 5]} suffix=" fois / semaine" onChange={handleChange} />;
            case 8: return <CheckboxStep title="Problèmes médicaux particuliers" selectedValues={formData.problemes_medical} options={['Problèmes cardiaques', 'Asthme', 'Hypertension', "Aucun"]} onToggle={(e) => handleCheckboxChange(e, 'problemes_medical')} />;
            case 9: return <CheckboxStep title="Problèmes physiques particuliers" selectedValues={formData.problemes_physique} options={["Douleur au dos", "Douleurs aux jambes", "Douleur aux bras", "Douleurs aux épaules", "Douleurs pectorales", "Aucun"]} onToggle={(e) => handleCheckboxChange(e, 'problemes_physique')} />;
            case 10: return <CheckboxStep title="Équipements disponibles" subtitle="Sélectionnez tous les équipements que vous possédez" selectedValues={formData.matos} options={["Haltères", "Barre", "Banc", "Salle de sport"]} onToggle={(e) => handleCheckboxChange(e, 'matos')} />;
            case 11: return <RadioStep title="Votre objectif principal" name="objectif" value={formData.objectif} options={["Perte de poids", "Prise de masse"]} onChange={handleChange} />;
            case 12: 
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Jours d'entraînement</h2>
                        <div className={`text-center p-3 rounded-lg ${formData.jour_disponible.length < formData.frequence ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                            <p className="font-semibold">Objectif : {formData.frequence} jour{formData.frequence > 1 ? 's' : ''} / semaine</p>
                            <p>Sélectionnés : {formData.jour_disponible.length} jour{formData.jour_disponible.length > 1 ? 's' : ''}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(option => (
                                <label key={option} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.jour_disponible.includes(option) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}>
                                    <input type="checkbox" value={option} checked={formData.jour_disponible.includes(option)} onChange={(e) => handleCheckboxChange(e, 'jour_disponible')} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                    <span className="ml-3 text-lg font-medium text-gray-700">{option}</span>
                                </label>
                            ))}
                        </div>
                        {formData.jour_disponible.length < formData.frequence && (
                            <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-lg">⚠️ Veuillez sélectionner encore {formData.frequence - formData.jour_disponible.length} jour(s)</p>
                        )}
                    </div>
                );
            case 13: 
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Heure d'entraînement préférée</h2>
                        <div className="max-w-xs mx-auto">
                            <input type="time" name="heure_disponible" value={formData.heure_disponible} onChange={handleChange} className="w-full px-6 py-4 text-2xl text-center border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>
                );
            case 14: return <RadioStep title="Durée du programme" name="date_fin" value={formData.date_fin} options={[{val:90, lbl:"90 jours (3 mois)"}, {val:180, lbl:"180 jours (6 mois)"}, {val:360, lbl:"360 jours (1 an)"}].map(o => ({value: o.val, label: o.lbl}))} onChange={handleChange} />;
            case 15: return <RadioStep title="Régime alimentaire" name="regime_alimentaire" value={formData.regime_alimentaire} options={["Omnivore", "Végétarien", "Végan"]} onChange={handleChange} />;
            case 16: return <CheckboxStep title="Allergies alimentaires" subtitle="Sélectionnez toutes vos allergies" selectedValues={formData.allergies} options={["Lactose", "Gluten", "Noix", "Aucun"]} onToggle={(e) => handleCheckboxChange(e, 'allergies')} />;
            case 17:
                return (
                    <div className="text-center space-y-6 py-8 animate-fade-in">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">C'est parti !</h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">Vous avez fourni toutes les informations nécessaires. Cliquez sur le bouton ci-dessous pour générer votre programme.</p>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl z-10">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Étape {step} sur 17</span>
                        <span className="text-sm font-medium text-indigo-600">{Math.round(((step - 1) / 16) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 16) * 100}%` }} />
                    </div>
                </div>

                <form className="bg-white rounded-2xl shadow-xl p-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    {renderStepContent()}

                    {/* Navigation */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200">
                                ← Retour
                            </button>
                        )}
                        {step < 17 && (
                            <button type="button" onClick={nextStep} disabled={!canNext()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100">
                                Suivant →
                            </button>
                        )}
                        {step === 17 && (
                            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">
                                {loading ? 'Génération...' : '🚀 Générer mon programme'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <WaweEffect />
        </main>
    );
}

export default Form;