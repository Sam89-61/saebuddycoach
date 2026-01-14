import React from 'react';

const Carrousel = ({ images }) => {
    return (
        <div className="container-image">
            <div className="scroll-image">
                {images.map((image) => (
                    <div key={image.id} className="item">
                        <img src={image.src} alt={image.alt}/>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Carrousel;