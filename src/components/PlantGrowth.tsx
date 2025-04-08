
import { useState, useEffect } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { motion } from 'framer-motion';
import { Leaf, Flower } from 'lucide-react';

// Represents a single leaf or flower in the plant
const PlantElement = ({ 
  type, 
  position, 
  delay, 
  status 
}: { 
  type: 'leaf' | 'flower', 
  position: number, 
  delay: number, 
  status: 'growing' | 'falling' | 'stable' 
}) => {
  const variants = {
    growing: {
      opacity: [0, 1],
      scale: [0.6, 1],
      y: [10, 0],
      rotate: [type === 'leaf' ? -10 : -20, type === 'leaf' ? 0 : 10],
      transition: { 
        duration: 1.5, 
        delay: delay,
        ease: [0.34, 1.56, 0.64, 1] // Spring-like easing
      }
    },
    falling: {
      opacity: [1, 0],
      y: [0, 20],
      rotate: [0, type === 'leaf' ? 15 : 30],
      transition: { 
        duration: 1.2,
        delay: delay * 0.3,
        ease: "easeIn"
      }
    },
    stable: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: type === 'leaf' ? 0 : 10
    }
  };

  const leftPosition = 50 + (position - 4) * 15; // Offset from center
  const yPosition = Math.abs(position - 4) * 5; // Higher at the sides

  return (
    <motion.div
      className="absolute"
      initial="growing"
      animate={status}
      variants={variants}
      style={{
        left: `${leftPosition}%`,
        bottom: `${30 + yPosition}%`,
        color: type === 'leaf' ? 'var(--color-primary)' : 'var(--color-secondary)',
        zIndex: position
      }}
    >
      {type === 'leaf' ? (
        <Leaf className="h-5 w-5 text-zen" style={{ transform: `rotate(${(position - 4) * 20}deg)` }} />
      ) : (
        <Flower className="h-5 w-5 text-zen-secondary" style={{ transform: `rotate(${(position - 4) * 10}deg)` }} />
      )}
    </motion.div>
  );
};

const PlantGrowth = () => {
  const { tasks, getConsistencyStreak } = useTaskContext();
  const [plantState, setPlantState] = useState<{
    leaves: number;
    flowers: number;
    status: 'growing' | 'falling' | 'stable';
  }>({
    leaves: 0,
    flowers: 0,
    status: 'stable'
  });

  // Calculate plant growth based on task completion
  useEffect(() => {
    const streak = getConsistencyStreak();
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;
    const completionRate = totalCount > 0 ? completedCount / totalCount : 0;
    
    // Calculate leaves (0-5) based on total tasks
    const maxLeaves = 5;
    const newLeaves = Math.min(maxLeaves, Math.floor(totalCount / 2));
    
    // Calculate flowers (0-3) based on completion streak
    const newFlowers = Math.min(3, Math.floor(streak / 2));

    // Determine if growing or falling
    let newStatus: 'growing' | 'falling' | 'stable' = 'stable';
    
    if (newLeaves > plantState.leaves || newFlowers > plantState.flowers) {
      newStatus = 'growing';
    } else if (newLeaves < plantState.leaves || newFlowers < plantState.flowers) {
      newStatus = 'falling';
    }

    if (newStatus !== 'stable' || newLeaves !== plantState.leaves || newFlowers !== plantState.flowers) {
      setPlantState({
        leaves: newLeaves,
        flowers: newFlowers,
        status: newStatus
      });
    }
  }, [tasks, getConsistencyStreak, plantState.leaves, plantState.flowers]);

  // Reset status to stable after animations complete
  useEffect(() => {
    if (plantState.status !== 'stable') {
      const timer = setTimeout(() => {
        setPlantState(prev => ({ ...prev, status: 'stable' }));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [plantState.status]);

  return (
    <div className="relative h-28 w-full mt-4 mb-6">
      {/* Stem */}
      <div className="absolute left-1/2 bottom-0 w-1 h-20 -ml-0.5 bg-zen-secondary/70 rounded-full" />
      
      {/* Ground/pot */}
      <div className="absolute left-1/2 bottom-0 w-10 h-3 -ml-5 bg-zen-accent/50 rounded-full" />
      
      {/* Leaves */}
      {Array.from({ length: plantState.leaves }).map((_, i) => (
        <PlantElement 
          key={`leaf-${i}`} 
          type="leaf" 
          position={i} 
          delay={i * 0.1} 
          status={plantState.status}
        />
      ))}
      
      {/* Flowers */}
      {Array.from({ length: plantState.flowers }).map((_, i) => (
        <PlantElement 
          key={`flower-${i}`} 
          type="flower" 
          position={i + 1} 
          delay={(i + plantState.leaves) * 0.1} 
          status={plantState.status}
        />
      ))}
    </div>
  );
};

export default PlantGrowth;
