import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import './style/VideoEvent.css';

const VideoEvent = () => {
    const { id: roomId } = useParams();
    const navigate = useNavigate();
    const [peers, setPeers] = useState([]);
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const userStream = useRef();

    // Fonction pour créer un flux fictif si pas de caméra (pour le test)
    const getMockStream = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Mode Test : Pas de caméra", 100, 240);
        
        const stream = canvas.captureStream(10); // 10 FPS
        
        // Ajouter une piste audio vide pour éviter les erreurs simple-peer
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const dst = oscillator.connect(audioCtx.createMediaStreamDestination());
        oscillator.start();
        const audioTrack = dst.stream.getAudioTracks()[0];
        stream.addTrack(audioTrack);
        
        return stream;
    };

    useEffect(() => {
        // Récupérer le pseudo ou ID de l'utilisateur
        const user = JSON.parse(localStorage.getItem('user')) || { pseudo: 'Anonyme', id_utilisateur: Math.random() };

        socketRef.current = io('/', { path: '/socket.io' });

        // MODE TEST : On utilise un MockStream au lieu de getUserMedia
        const startSession = (stream) => {
            setLoading(false);
            userStream.current = stream;
            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }

            socketRef.current.emit('join-room', roomId, user.id_utilisateur);

            // On reçoit la liste des utilisateurs déjà présents
            socketRef.current.on('all-users', users => {
                console.log("Participants déjà là:", users);
                const newPeers = [];
                users.forEach(socketId => {
                    const peer = createPeer(socketId, socketRef.current.id, stream);
                    const peerObj = { peerID: socketId, peer };
                    peersRef.current.push(peerObj);
                    newPeers.push(peerObj);
                });
                setPeers(newPeers);
            });

            // Quand quelqu'un d'autre nous envoie son signal
            socketRef.current.on('user-joined', payload => {
                console.log("Nouvel arrivant:", payload.callerID);
                
                // Éviter les doublons
                setPeers(prev => {
                    if (prev.find(p => p.peerID === payload.callerID)) return prev;
                    
                    const peer = addPeer(payload.signal, payload.callerID, stream);
                    const peerObj = { peerID: payload.callerID, peer };
                    peersRef.current.push(peerObj);
                    return [...prev, peerObj];
                });
            });

            // Réception de la réponse finale pour établir le P2P
            socketRef.current.on('receiving-returned-signal', payload => {
                console.log("Signal reçu de retour de:", payload.id);
                const item = peersRef.current.find(p => p.peerID === payload.id);
                if (item) {
                    item.peer.signal(payload.signal);
                }
            });

            socketRef.current.on('user-disconnected', socketId => {
                console.log("Participant déconnecté:", socketId);
                
                // Nettoyage de l'objet Peer
                const peerObj = peersRef.current.find(p => p.peerID === socketId);
                if (peerObj) {
                    try { peerObj.peer.destroy(); } catch(e) {}
                }
                
                // Mise à jour de la liste
                peersRef.current = peersRef.current.filter(p => p.peerID !== socketId);
                setPeers(prev => prev.filter(p => p.peerID !== socketId));
            });
        };

        // On bypass l'accès caméra réel pour votre test
        const mockStream = getMockStream();
        startSession(mockStream);

        return () => {
            if (userStream.current) {
                userStream.current.getTracks().forEach(track => track.stop());
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomId]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            if (socketRef.current) {
                socketRef.current.emit('sending-signal', { userToSignal, callerID, signal });
            }
        });

        peer.on('error', err => {
            console.warn('Erreur Peer (Create):', err.message);
        });

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on('signal', signal => {
            if (socketRef.current) {
                socketRef.current.emit('returning-signal', { signal, callerID });
            }
        });

        peer.on('error', err => {
            console.warn('Erreur Peer (Add):', err.message);
        });

        peer.signal(incomingSignal);

        return peer;
    }

    const toggleAudio = () => {
        if (!userStream.current || !userStream.current.getAudioTracks()[0]) return;
        const enabled = userStream.current.getAudioTracks()[0].enabled;
        userStream.current.getAudioTracks()[0].enabled = !enabled;
        setAudioMuted(!enabled === false);
    };

    const toggleVideo = () => {
        if (!userStream.current || !userStream.current.getVideoTracks()[0]) return;
        const enabled = userStream.current.getVideoTracks()[0].enabled;
        userStream.current.getVideoTracks()[0].enabled = !enabled;
        setVideoMuted(!enabled === false);
    };

    const leaveRoom = () => {
        navigate('/');
    };

    return (
        <div className="video-room-container">
            {loading && (
                <div className="loading-overlay">
                    <h2>Configuration de la caméra...</h2>
                </div>
            )}
            
            <div className="video-header">
                <h2>Événement Direct #{roomId}</h2>
                <div>Participants: {peers.length + 1}</div>
            </div>

            <div className="video-grid">
                {/* Ma vidéo */}
                <div className="video-container">
                    <video muted ref={userVideo} autoPlay playsInline />
                    <div className="user-label">Moi {videoMuted && '(Caméra Off)'} {audioMuted && '(Mute)'}</div>
                </div>

                {/* Vidéos des autres */}
                {peers.map((peerObj, index) => (
                    <Video key={index} peer={peerObj.peer} />
                ))}
            </div>

            <div className="video-controls">
                <button 
                    className={`control-btn mute ${audioMuted ? 'active' : ''}`} 
                    onClick={toggleAudio}
                    title={audioMuted ? "Activer micro" : "Couper micro"}
                >
                    {audioMuted ? '🔇' : '🎤'}
                </button>
                
                <button 
                    className={`control-btn mute ${videoMuted ? 'active' : ''}`} 
                    onClick={toggleVideo}
                    title={videoMuted ? "Activer caméra" : "Couper caméra"}
                >
                    {videoMuted ? '📷' : '📹'}
                </button>

                <button 
                    className="control-btn leave" 
                    onClick={leaveRoom}
                    title="Quitter l'événement"
                >
                    📞
                </button>
            </div>
        </div>
    );
};

// Composant pour la vidéo d'un autre participant
const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        });
    }, [props.peer]);

    return (
        <div className="video-container">
            <video playsInline autoPlay ref={ref} />
            <div className="user-label">Participant</div>
        </div>
    );
};

export default VideoEvent;
