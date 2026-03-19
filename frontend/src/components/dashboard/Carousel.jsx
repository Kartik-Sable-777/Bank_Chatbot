import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import img1 from "../../assets/banner1.jpg";
import img2 from "../../assets/banner2.jpg";
import img3 from "../../assets/banner3.jpg";

const slides = [
  {
    image: img1,
    title: "Premium Swiss Banking",
    subtitle: "Secure • Transparent • Global",
    button: "Explore Plans",
  },
  {
    image: img2,
    title: "Wealth Management Solutions",
    subtitle: "Grow with Confidence",
    button: "Invest Now",
  },
  {
    image: img3,
    title: "Zero International Fees",
    subtitle: "Bank Beyond Borders",
    button: "Open Account",
  },
];

function Carousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [index]);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIndex((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  return (
    <div className="carousel-wrapper">
      <div
        className="carousel-slide"
        style={{ backgroundImage: `url(${slides[index].image})` }}
      >
        <div className="carousel-overlay">
          <h1>{slides[index].title}</h1>
          <p>{slides[index].subtitle}</p>
          <button className="carousel-cta">
            {slides[index].button}
          </button>
        </div>
      </div>

      <button className="carousel-btn left" onClick={prevSlide}>
        <FiChevronLeft size={20} />
      </button>

      <button className="carousel-btn right" onClick={nextSlide}>
        <FiChevronRight size={20} />
      </button>

      <div className="carousel-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={i === index ? "dot active" : "dot"}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;