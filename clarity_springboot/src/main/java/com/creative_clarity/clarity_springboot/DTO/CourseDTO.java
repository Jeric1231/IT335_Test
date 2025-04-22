package com.creative_clarity.clarity_springboot.DTO;

public class CourseDTO {
    private int courseId;
    private String courseName;
    private String code;
    private String semester;
    private String academicYear;

    // Constructors
    public CourseDTO() {}

    public CourseDTO(int courseId, String courseName, String code, String semester, String academicYear) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.code = code;
        this.semester = semester;
        this.academicYear = academicYear;
    }

    // Getters and setters
    public int getCourseId() {
        return courseId;
    }

    public void setCourseId(int courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }
}