import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Timer as TimerIcon, Play, Pause, RotateCcw, ArrowLeft 
} from 'lucide-react';

const Timer = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('timer'); // 'timer' or 'stopwatch'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      if (mode === 'timer') {
        interval = setInterval(() => {
          setTimeLeft((prevTime) => {
            if (prevTime === 0) {
              clearInterval(interval);
              setIsRunning(false);
              return 0;
            }
            return prevTime - 1;
          });
        }, 1000);
      } else { // stopwatch mode
        interval = setInterval(() => {
          setStopwatchTime(prev => prev + 10);
        }, 10);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatStopwatchTime = (milliseconds) => {
    const mins = Math.floor(milliseconds / 60000);
    const secs = Math.floor((milliseconds % 60000) / 1000);
    const ms = milliseconds % 1000;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'timer') {
      setTimeLeft(25 * 60);
    } else {
      setStopwatchTime(0);
    }
  };

  const switchMode = () => {
    setMode(mode === 'timer' ? 'stopwatch' : 'timer');
    setIsRunning(false);
    setTimeLeft(25 * 60);
    setStopwatchTime(0);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 relative">
      <div className="absolute top-6 left-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <button 
            onClick={switchMode}
            className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition mr-4"
          >
            {mode === 'timer' ? <TimerIcon className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
            <span>{mode === 'timer' ? 'Switch to Stopwatch' : 'Switch to Timer'}</span>
          </button>
        </div>

        <div className="relative">
          {mode === 'timer' ? (
            <div 
              className="text-8xl font-bold mb-8 text-blue-600"
            >
              {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="relative">
              <div 
                className="text-6xl font-bold mb-8 text-blue-600"
              >
                {formatStopwatchTime(stopwatchTime)}
              </div>
            </div>
          )}
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-6">
          <button 
            onClick={toggleTimer}
            className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition shadow-lg"
          >
            {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </button>
          <button 
            onClick={resetTimer}
            className="bg-gray-100 text-gray-700 p-4 rounded-full hover:bg-gray-200 transition shadow-md"
          >
            <RotateCcw className="h-8 w-8" />
          </button>
        </div>

        {mode === 'timer' && (
          <div className="mt-12 flex justify-center space-x-4">
            <button 
              onClick={() => {
                setTimeLeft(25 * 60);
                setIsRunning(false);
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            >
              25 min
            </button>
            <button 
              onClick={() => {
                setTimeLeft(45 * 60);
                setIsRunning(false);
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            >
              45 min
            </button>
            <button 
              onClick={() => {
                setTimeLeft(60 * 60);
                setIsRunning(false);
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            >
              1 hour
            </button>
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="absolute bottom-6 right-6 flex items-center space-x-3">
        <img
          src="/src/assets/images/logoCreativeClarity.png"
          alt="Logo"
          className="h-10"
        />
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
        </span>
      </div>
    </div>
  );
};

export default Timer;
