import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Clock, CheckSquare, Bell, User, LogOut, School, PanelsTopLeft, FileText } from 'lucide-react';

const SideBar = ( {onLogout, activeTab, setActiveTab}) => {
  //const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
              <img
                src="/src/assets/images/logoCreativeClarity.png"
                alt="Logo"
                className="h-12"
              />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
                  CreativeClarity
                </h1>
              </div>
            </div>
          
          
          <nav className="space-y-2">
            <button 
              onClick={() => {
                setActiveTab('overview')
                navigate('/dashboard')
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PanelsTopLeft className="h-5 w-5" />
              <span>Overview</span>
            </button>

            <button 
              onClick={() =>{
                setActiveTab('courses')
                navigate('/courses')
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'courses' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span>Courses</span>
            </button>
          
            <button 
              onClick={() =>{
                setActiveTab('notes')
                navigate('/notes')
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'notes' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>Notes</span>
            </button>
            <button 
              onClick={() =>{
                setActiveTab('profile')
                navigate('/user-profile')
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>
          </nav>
        </div>
        
        <button 
          onClick={onLogout}
          className="absolute bottom-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-red-600 transition"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
  );
};

export default SideBar; 