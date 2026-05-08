
import { Star } from 'lucide-react';

function StarRating({ className = "" }) {
  return (
    <div className = {`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key = {i} className = "w-5 h-5 text-[var(--color-rating-dim)]" />
      ))}
    </div>
  );
}

export default StarRating;
