import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

interface PropertyCarouselProps {
  images: string[];
  title: string;
}

const PropertyCarousel = ({ images, title }: PropertyCarouselProps) => {
  return (
    <Carousel showThumbs={false} showStatus={false} infiniteLoop useKeyboardArrows>
      {images.map((image, index) => (
        <div key={index}>
          <img src={image} alt={title} className="w-full h-80 object-cover" />
        </div>
      ))}
    </Carousel>
  );
};

export default PropertyCarousel;