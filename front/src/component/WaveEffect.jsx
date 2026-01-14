import "./style/waveEffect.css";
import { useEffect, useState } from "react";

function WaveEffect() {
    const [Wsize, setWSize] = useState(window.innerWidth);
    
    useEffect(() => {
        const handleResize = () => {
            setWSize(window.innerWidth);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            {Wsize <= 739 ? (
                <div className="fixed bottom-0 left-0 w-full z-0 pointer-events-none m-0 p-0">
                    <svg
                        width="100%"
                        height="100%"
                        id="svg"
                        viewBox="0 0 1440 690"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transition duration-300 ease-in-out delay-150"
                    >
                        <path
                            d="M 0,700 L 0,175 C 138.17857142857144,160.78571428571428 276.3571428571429,146.57142857142858 404,158 C 531.6428571428571,169.42857142857142 648.7499999999999,206.5 754,198 C 859.2500000000001,189.5 952.6428571428573,135.42857142857142 1065,124 C 1177.3571428571427,112.57142857142858 1308.6785714285713,143.78571428571428 1440,175 L 1440,700 L 0,700 Z"
                            stroke="none"
                            strokeWidth="0"
                            fill="#6366f1"
                            fillOpacity="0.53"
                            className="transition-all duration-300 ease-in-out delay-150 path-0"
                        />
                        <path
                            d="M 0,700 L 0,408 C 114.42857142857142,443.17857142857144 228.85714285714283,478.35714285714283 337,474 C 445.14285714285717,469.64285714285717 547,425.75000000000006 663,419 C 779,412.24999999999994 909.1428571428571,442.6428571428571 1041,447 C 1172.857142857143,451.3571428571429 1306.4285714285716,429.67857142857144 1440,408 L 1440,700 L 0,700 Z"
                            stroke="none"
                            strokeWidth="0"
                            fill="#6366f1"
                            fillOpacity="1"
                            className="transition-all duration-300 ease-in-out delay-150 path-1"
                        />
                    </svg>
                </div>
            ) : (
                <div className="fixed bottom-0 left-0 w-full h-60 -z-0 pointer-events-none m-0 p-0">
                <svg
                    width="100%"
                    height="100%"
                    id="svg"
                    viewBox="0 0 1440 690"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition duration-300 ease-in-out delay-150"
                    preserveAspectRatio="none"
                >
                    <path 
                        d="M 0,700 L 0,175 C 138.17857142857144,160.78571428571428 276.3571428571429,146.57142857142858 404,158 C 531.6428571428571,169.42857142857142 648.7499999999999,206.5 754,198 C 859.2500000000001,189.5 952.6428571428573,135.42857142857142 1065,124 C 1177.3571428571427,112.57142857142858 1308.6785714285713,143.78571428571428 1440,175 L 1440,700 L 0,700 Z"
                        stroke="none" 
                        strokeWidth="0" 
                        fill="#6366f1" 
                        fillOpacity="0.53" 
                        className="transition-all duration-300 ease-in-out delay-150 path-0"
                    />
                    <path 
                        d="M 0,700 L 0,408 C 114.42857142857142,443.17857142857144 228.85714285714283,478.35714285714283 337,474 C 445.14285714285717,469.64285714285717 547,425.75000000000006 663,419 C 779,412.24999999999994 909.1428571428571,442.6428571428571 1041,447 C 1172.857142857143,451.3571428571429 1306.4285714285716,429.67857142857144 1440,408 L 1440,700 L 0,700 Z"
                        stroke="none" 
                        strokeWidth="0" 
                        fill="#6366f1" 
                        fillOpacity="1" 
                        className="transition-all duration-300 ease-in-out delay-150 path-1"
                    />
                </svg>
                </div>
            )}
        </>
    );
}

export default WaveEffect;