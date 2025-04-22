import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  Target, 
  List, 
  CheckCircle 
} from 'lucide-react';

const NewStudySession = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studyGoal, setStudyGoal] = useState('');
  const [duration, setDuration] = useState(25);

  const subjects = [
    { name: 'Mathematics', icon: Target, color: 'text-blue-600' },
    { name: 'Science', icon: BookOpen, color: 'text-green-600' },
    { name: 'History', icon: List, color: 'text-purple-600' },
    { name: 'Literature', icon: CheckCircle, color: 'text-red-600' }
  ];

  const durationOptions = [
    { label: '25 min', value: 25 },
    { label: '45 min', value: 45 },
    { label: '1 hour', value: 60 }
  ];

  const handleStartSession = () => {
    // TODO: Implement study session start logic
    console.log('Starting study session', { subject: selectedSubject, goal: studyGoal, duration });
    navigate('/timer');
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 relative">
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </div>

      <div className="w-full max-w-2xl px-6">
        <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
          New Study Session
        </h1>

        {/* Subject Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Select Subject
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject.name}
                onClick={() => setSelectedSubject(subject.name)}
                className={`
                  p-4 rounded-lg transition duration-200 
                  ${selectedSubject === subject.name 
                    ? `bg-blue-100 ${subject.color}`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
                  flex flex-col items-center justify-center space-y-2
                `}
              >
                <div className={`
                  h-12 w-12 rounded-full flex items-center justify-center
                  ${selectedSubject === subject.name 
                    ? 'bg-white' : 'bg-white'}
                `}>
                  <subject.icon className={`h-6 w-6 ${subject.color}`} />
                </div>
                <span className="text-sm font-medium">{subject.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Study Goal */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Set Your Study Goal
          </h2>
          <textarea
            value={studyGoal}
            onChange={(e) => setStudyGoal(e.target.value)}
            placeholder="What do you want to accomplish in this study session?"
            className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>

        {/* Duration Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Session Duration
          </h2>
          <div className="flex space-x-4">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setDuration(option.value)}
                className={`
                  px-4 py-2 rounded-lg transition duration-200
                  ${duration === option.value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start Session Button */}
        <div className="text-center">
          <button
            onClick={handleStartSession}
            disabled={!selectedSubject || !studyGoal}
            className={`
              px-8 py-3 rounded-full text-lg font-semibold transition duration-200
              ${(selectedSubject && studyGoal)
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            Start Study Session
          </button>
        </div>
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

export default NewStudySession;