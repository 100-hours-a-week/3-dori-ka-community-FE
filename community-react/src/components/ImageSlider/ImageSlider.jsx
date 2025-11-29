import { useEffect, useState } from "react";
import "./ImageSlider.css";

export default function ImageSlider({ images }) {
    const [current, setCurrent] = useState(0);

    if (!images || images.length === 0) return null;

    const prevSlide = () => {
        setCurrent((current - 1 + images.length) % images.length);
    };

    const nextSlide = () => {
        setCurrent((current + 1) % images.length);
    };

    return (
        <section className="image-slider-section">
            <button className="slider-btn left" onClick={prevSlide}>
                &lt;
            </button>

            <div className="image-slider">
                {images.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        className={i === current ? "active" : ""}
                        alt={`post-img-${i}`}
                    />
                ))}
            </div>

            <button className="slider-btn right" onClick={nextSlide}>
                &gt;
            </button>
        </section>
    );
}