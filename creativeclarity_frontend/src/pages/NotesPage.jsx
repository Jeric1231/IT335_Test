import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Folder, Edit3, Trash2, Save, X, BookOpen, Calendar, CheckSquare, User, LogOut, AlignLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import SideBar from '../components/Sidebar';
import { toast } from 'sonner';

axios.defaults.baseURL = 'http://localhost:8080'; // Add this line


const NotesPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.userId;
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    subject: subjects.length > 0 ? subjects[0].courseName : '',
    userId: currentUserId,
    lastModified: new Date().toISOString()
  });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    document.title = 'My Notes';
    const fetchNotes = async () => {
      if (currentUserId && token) {
        try {
          const response = await axios.get(`/api/note/getusernotes?userId=${currentUserId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setNotes(response.data);
        } catch (error) {
          console.error('Error fetching notes:', error);
        }
      }
    };
    const fetchSubjects = async () => {
      try{
        const response = await axios.get('/api/course/getcourse/' + currentUserId, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setSubjects(response.data);
      }catch(error){
        console.error('Error fetching subjects:', error);
      }
    }
    fetchNotes();
    fetchSubjects();
  }, [currentUserId, token]);

  // const handleAddSubject = () => {
  //   const trimmedSubject = newSubjectName.trim();
  //   if (trimmedSubject && !subjects.includes(trimmedSubject)) {
  //     const updatedSubjects = [...subjects, trimmedSubject];
  //     setSubjects(updatedSubjects);
  //     setNewSubjectName('');
  //     setShowAddSubjectModal(false);
  //   }
  // };

  const filteredNotes = notes.filter(note => {
    const matchesUser = note.userId === currentUserId;
    const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUser && matchesSubject && matchesSearch;
  });

  const handleNewNote = () => {
    setShowNewNoteForm(true);
    setEditingNoteId(null);
    setNewNote({
      title: '',
      content: '',
      subject: subjects.length > 0 ? subjects[0].courseName : '',
      userId: currentUserId,
      lastModified: new Date().toISOString()
    });
  };

  const handleSaveNote = async () => {
    if (!currentUserId) return;
    console.log('New note to save:', newNote);
    try {
      const noteToSave = {
        ...newNote,
        userId: currentUserId,
        created_at: newNote.id ? undefined : new Date(),
        lastModified: new Date()
      };

      if (editingNoteId !== null) {
        const response = await axios.put(`/api/note/putnotedetails?noteId=${editingNoteId}`, noteToSave, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setNotes(notes.map(note => 
          note.noteId === editingNoteId ? response.data : note
        ));
      } else {
        const response = await axios.post('/api/note/postnoterecord', noteToSave, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setNotes([...notes, response.data]);
      }
      
      setShowNewNoteForm(false);
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleEditNote = (note) => {
    setNewNote(note);
    setEditingNoteId(note.noteId);
    setShowNewNoteForm(true);
  };

  const handleDeleteNote = async (noteId) => {
    const token = localStorage.getItem('token');
    console.log('Note to be deleted: ', noteId)
    try {
      await axios.delete(`/api/note/deletenotedetails/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setNotes(notes.filter(note => note.noteId !== noteId));
      toast.success('Note Deleted successfully!')
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
  };

  const closeNoteDetailsModal = () => {
    setSelectedNote(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 h-screen flex-shrink-0 bg-white shadow-lg fixed">
      <SideBar 
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab} />
      </div>

      <div className="flex-1 ml-64">
        <div className="h-full p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-8 w-2 bg-blue-600 rounded-full"></div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  My Notes
                </h1>
              </div>
              <p className="text-gray-500 ml-5">
                Organize and manage your study notes
              </p>
            </div>
            <button
              onClick={handleNewNote}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>New Note</span>
            </button>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-500">Subjects</h3>
                    <button
                      onClick={() => setShowAddSubjectModal(true)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSubject('All')}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                        selectedSubject === 'All'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Folder className="h-4 w-4" />
                      <span>All Notes</span>
                    </button>
                    {subjects.map(subject => (
                      <button
                        key={subject.courseId}
                        onClick={() => setSelectedSubject(subject.courseName)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                          selectedSubject === subject
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Folder className="h-4 w-4" />
                        <span>{subject.courseName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {showAddSubjectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-6 w-96">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Add New Subject</h2>
                      <button
                        onClick={() => setShowAddSubjectModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Enter subject name"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        // onClick={handleAddSubject}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Add Subject
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-9">
              {showNewNoteForm ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {editingNoteId ? 'Edit Note' : 'New Note'}
                    </h2>
                    <button
                      onClick={() => setShowNewNoteForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Note title"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={newNote.subject}
                      onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject.courseName}>{subject.courseName}</option>
                      ))}
                    </select>
                    <textarea
                      placeholder="Write your note here..."
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      rows="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSaveNote}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Save className="h-5 w-5" />
                      <span>Save Note</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotes.map(note => (
                    <div 
                      key={note.noteId} 
                      onClick={() => handleNoteClick(note)}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">{note.title}</h3>
                            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              {note.subject}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNote(note);
                              }}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.noteId);
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {note.content}
                        </p>
                        <div className="text-xs text-gray-400">
                          Last modified: {new Date(note.lastModified).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Note Details Modal */}
          {selectedNote && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
                <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{selectedNote.title}</h2>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded-full mt-2 inline-block">
                      {selectedNote.subject}
                    </span>
                  </div>
                  <button 
                    onClick={closeNoteDetailsModal}
                    className="hover:bg-blue-500 p-2 rounded-full transition"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <AlignLeft className="h-4 w-4 mr-2" />
                    <span>
                      Last modified: {new Date(selectedNote.lastModified).toLocaleString()}
                    </span>
                  </div>
                  <div className="prose max-w-none text-gray-800">
                    {selectedNote.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

NotesPage.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default NotesPage;