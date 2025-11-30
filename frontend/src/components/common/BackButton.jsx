import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../../hooks/useSound'; // Adjust path if needed based on your structure
import { useAudio } from '../../context/AudioContext';

const BackButton = () => {
  const navigate = useNavigate();
  const { isMusicEnabled } = useAudio();
  const [playClick] = useSound('click', { volume: 0.5 });

  const handleBack = () => {
    if (isMusicEnabled) playClick();
    navigate('/featured-games');
  };

  return (
    <button
      onClick={handleBack}
      className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 z-50 group shadow-lg flex items-center gap-2"
      title="Back to Menu"
    >
      <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
      <span className="hidden md:inline font-semibold pr-2">Back</span>
    </button>
  );
};

export default BackButton;