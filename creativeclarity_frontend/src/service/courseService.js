import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/course';

// Create course
export const createCourse = async (courseData) => {
    try {
        const response = await axios.post(`${BASE_URL}/postcourserecord`, courseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get all courses
export const getAllCourses = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/getallcourse`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update course
export const updateCourse = async (courseId, courseData) => {
    try {
        const response = await axios.put(`${BASE_URL}/putcoursedetails/${courseId}`, courseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete course
export const deleteCourse = async (courseId) => {
    try {
        const response = await axios.delete(`${BASE_URL}/deletecoursedetails/${courseId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
