
import { useRef, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const LeafPath = () => (
  <path 
    d="M12 2c-4.5 0-8 2-10 6 3 4 6.5 6 10 6s7-2 10-6c-2-4-5.5-6-10-6zm0 2c2.5 0 4.5 1.5 4.5 3.5S14.5 11 12 11s-4.5-1.5-4.5-3.5S9.5 4 12 4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" 
    fill="currentColor"
  />
);

interface LeafAnimationProps {
  startAnimation: boolean;
  onComplete: () => void;
}

const LeafAnimation: React.FC<LeafAnimationProps> = ({ 
  startAnimation, 
  onComplete 
}) => {
  const controls = useAnimationControls();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (startAnimation && !hasAnimated.current) {
      hasAnimated.current = true;
      controls.start({
        y: [0, 40],
        x: [0, 10, -5, 5, 0],
        rotate: [0, 5, -3, 2, 0],
        opacity: [1, 0],
        transition: { 
          duration: 1.5,
          ease: [0.16, 1, 0.3, 1]
        }
      }).then(onComplete);
    }
  }, [startAnimation, controls, onComplete]);

  if (!startAnimation) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <motion.svg
        animate={controls}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="text-zen-secondary w-8 h-8"
      >
        <LeafPath />
      </motion.svg>
    </div>
  );
};

export default LeafAnimation;
