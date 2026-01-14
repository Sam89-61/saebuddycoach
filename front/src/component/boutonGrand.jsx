import './style/bouton.css';

const BoutonProg = ({href,img,name}) => {

    return (
        <button onClick={() => window.location.href = href}>
            <span className="btn-label">{name}</span>
            <div className="btn-image"><img src={img} alt={`${name} Icon`} /></div>
        </button>
    );
};

export default BoutonProg;