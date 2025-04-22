import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import { Toaster, toast } from 'sonner'; // Importing Toaster and toast from sonner
import { CircularProgress } from '@mui/material';

function CourseArchive({courseId}) {
    const token = localStorage.getItem('token');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [archives, setArchives] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [archiveToDelete, setArchiveToDelete] = useState(null);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const menuRef = useRef(null);
  const [isUnarchiveModalOpen, setIsUnarchiveModalOpen] = useState(false);
  const [archiveToUnarchive, setArchiveToUnarchive] = useState(null);

  const toggleDeleteModal = () => setIsDeleteModalOpen(!isDeleteModalOpen);
  const toggleUnarchiveModal = () => setIsUnarchiveModalOpen(!isUnarchiveModalOpen);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchArchives = async () => {
    try {
      setLoading(true); // Start loading
      await delay(1500); // Simulate delay (e.g., 1.5 seconds before making the request)

      const response = await fetch(`http://localhost:8080/api/archive/getbycourseid/${courseId}`,
        {
            headers: {
                // 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
      if (response.ok) {
        const data = await response.json();
        setArchives(data);
        toast.success("Archive Fetched Successfully");
      } else {  
        toast.error("Failed to load archive.");
      }
    } catch (error) {
      console.error("Error fetching archive:", error);
       toast.error("An error occurred while loading archive.");
    } finally {
      setLoading(false); // Stop loading
    }
  };


  useEffect(() => {
    fetchArchives();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/archive/deletearchivedetails/${archiveToDelete.archiveId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      fetchArchives(); // Refresh the list
      toast.success("Archive deleted successfully")
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      toast.error("Error occurred while deleting archive")
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  
  const handleUnarchive = async (archiveId) => {
    const token = localStorage.getItem('token');
    console.log("Unarchiving archive with ID:", archiveId);
    console.log("Token:", token);
    try {
      const response = await axios.put(`http://localhost:8080/api/archive/unarchive/${archiveId}`, {}, {
            headers: {
                // 'Content-Type': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
  
      if (response.status === 200) {
        toast.success("Archive unarchived successfully");
        fetchArchives(); // Fetch updated archives after unarchiving
      } else {
        toast.error("Failed to unarchive archive");
      }
    } catch (error) {
        console.error("Full error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          toast.error(`Unarchive failed: ${error.response.data || 'Unknown error'}`);
        } else if (error.request) {
          // The request was made but no response was received
          toast.error("No response received from server");
        } else {
          // Something happened in setting up the request that triggered an Error
          toast.error("Error setting up the request");
        }
      }
      
  };  

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openArchiveDetailsModal = (archive) => {
    if (selectedArchive) {
      setIsDeleteModalOpen(false); // Close delete modal if any
    }
    setSelectedArchive(archive); // Set selected archive
  };

  const closeArchiveDetailsModal = () => {
    setSelectedArchive(null);
    setArchiveToDelete(null); // Reset archiveToDelete when closing modal
  };

  const handleMenuUnarchive = (archiveId) => {
    // Directly call the unarchive function without opening the modal
    handleUnarchive(archiveId);
    setOpenMenuId(null); // Close the menu
  };

  const handleModalUnarchive = () => {
    handleUnarchive(archiveId);
    closeArchiveDetailsModal(); // Close the modal
  }

  const confirmUnarchive = (archive) => {
    console.log("Unarchiving archive:", archive);
    setArchiveToUnarchive(archive);
    toggleUnarchiveModal();
  };

  const handleConfirmUnarchive = async () => {
    if (archiveToUnarchive) {
      handleUnarchive(archiveToUnarchive.archiveId); // Perform unarchive
      toggleUnarchiveModal();
      closeArchiveDetailsModal() // Close the modal
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-2.5 overflow-auto">
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="grid gap-4">
            {loading ? (
              <div className="flex flex-col justify-center items-center">
                <CircularProgress size={50} color="primary" sx={{marginTop: "40px"}}/>
                <p className="text-center text-gray-500 mb-5 mt-2">Loading archives...</p>
              </div>
            ) : archives.length > 0 ? (
              archives.map((archive) => (
                <div key={archive.archiveId} className="bg-white border rounded-lg p-7 flex justify-between items-center">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => openArchiveDetailsModal(archive)}
                  >
                    <h3 className="font-semibold">{archive.title}</h3>
                    <p className="text-gray-600">Archived: {formatDate(archive.archive_date)}</p>
                  </div>
                  <div className="relative">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full"
                      onClick={() => toggleMenu(archive.archiveId)}
                    >
                      ⋮
                    </button>
                    {openMenuId === archive.archiveId && !selectedArchive && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50 border" ref={menuRef}>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => {
                            setArchiveToDelete(archive);
                            toggleDeleteModal();
                          }}
                        >
                          Delete
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => confirmUnarchive(archive)}
                        >
                          Unarchive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 mb-10 mt-10">No archives available.</p>
            )}
          </div>
        </section>

        {/* Archive Details Modal */}
        {selectedArchive && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeArchiveDetailsModal}
          >
            <div
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()} // Prevent closing the modal when clicking inside
            >
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">{selectedArchive.title}</h3>
                <p className="text-sm text-gray-500">
                  Type: <span className="font-medium">{selectedArchive.type}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Archived on: <span className="font-medium">{formatDate(selectedArchive.archive_date)}</span>
                </p>
              </div>
              <div className="mb-6">
                <p className="text-gray-700">{selectedArchive.description}</p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => confirmUnarchive(selectedArchive)}
                >
                  Unarchive
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 font-medium rounded-md hover:bg-gray-400 transition"
                  onClick={closeArchiveDetailsModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unarchive Confirmation Modal */}
        {isUnarchiveModalOpen && archiveToUnarchive && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">Confirm Unarchive</h2>
              <p>
                Are you sure you want to unarchive the archive:{" "}
                <strong>{archiveToUnarchive.title}</strong>?
              </p>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                  onClick={toggleUnarchiveModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={handleConfirmUnarchive}
                >
                  Unarchive
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && archiveToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p>Are you sure you want to delete the archive: <strong>{archiveToDelete.title}</strong>?</p>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
                  onClick={toggleDeleteModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Toaster richColors position="bottom-right" closeButton/>
    </div>
  );
}

export default CourseArchive;