package com.creative_clarity.clarity_springboot.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.creative_clarity.clarity_springboot.Entity.GradeEntity;
import com.creative_clarity.clarity_springboot.Repository.CourseRepository;
import com.creative_clarity.clarity_springboot.Repository.GradeRepository;

@Service
public class GradeService {
    
    private static final Logger logger = LoggerFactory.getLogger(GradeService.class);
    
    @Autowired
    GradeRepository grepo;
    
    @Autowired
    CourseRepository courseRepo; 
    
    public GradeService() {
        super();
    }
    
    // Create of CRUD
    public GradeEntity postGradeRecord(GradeEntity grade) {
        try {
            logger.info("Posting grade record: {}", grade);
            if (grade.getCourse() == null || courseRepo.findById(grade.getCourse().getCourseId()).isEmpty()) {
                throw new IllegalArgumentException("Invalid course ID");
            }
            return grepo.save(grade);
        } catch (Exception e) {
            logger.error("Error posting grade record", e);
            throw new RuntimeException("Failed to post grade record", e);
        }
    }
    
    // Read of CRUD
    public List<GradeEntity> getAllGrades() {
        try {
            return grepo.findAll().stream()
                    .filter(grade -> !grade.isDeleted())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching all grades", e);
            throw new RuntimeException("Failed to fetch all grades", e);
        }
    }

    public List<GradeEntity> getAllGradesByCourse(int courseId) {
        logger.info("Fetching grades for courseId: {}", courseId);
        try {
            List<GradeEntity> grades = grepo.findAll().stream()
                    .filter(grade -> grade.getCourse().getCourseId() == courseId && !grade.isDeleted())
                    .collect(Collectors.toList());
            logger.info("Found {} grades for courseId: {}", grades.size(), courseId);
            return grades;
        } catch (Exception e) {
            logger.error("Error fetching grades for courseId: {}", courseId, e);
            throw new RuntimeException("Failed to fetch grades for courseId: " + courseId, e);
        }
    }
    
    // Update of CRUD
    public GradeEntity putGradeDetails(int gradeId, GradeEntity newGradeDetails) {
        try {
            GradeEntity grade = grepo.findById(gradeId).orElseThrow(() -> new NoSuchElementException("Grade " + gradeId + " not found"));
            if (newGradeDetails.getCourse() == null || courseRepo.findById(newGradeDetails.getCourse().getCourseId()).isEmpty()) {
                throw new IllegalArgumentException("Invalid course ID");
            }
            grade.setTotal_points(newGradeDetails.getTotal_points());
            grade.setScore(newGradeDetails.getScore());
            grade.setDateRecorded(newGradeDetails.getDateRecorded());
            grade.setCourse(newGradeDetails.getCourse());
            grade.setAssessment_type(newGradeDetails.getAssessment_type());
            return grepo.save(grade);
        } catch (Exception e) {
            logger.error("Error updating grade details", e);
            throw new RuntimeException("Failed to update grade details", e);
        }
    }
    
    // Delete of CRUD
    public String deleteGrade(int gradeId) {
        try {
            String msg = "";
            if(grepo.findById(gradeId).isPresent()) {
                GradeEntity grade = grepo.findById(gradeId).get();
                grade.setDeleted(true);
                grepo.save(grade);
                msg = "Grade record successfully marked as deleted!";
            } else {
                msg = "Grade ID " + gradeId + " NOT FOUND!";
            }
            return msg;
        } catch (Exception e) {
            logger.error("Error deleting grade", e);
            throw new RuntimeException("Failed to delete grade", e);
        }
    }
}