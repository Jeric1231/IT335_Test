package com.creative_clarity.clarity_springboot.Entity;

import java.util.Date;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;

@Entity
public class UserEntity {
	
  @Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int userId;
	
	private String username;
	private String email;
	private String phoneNumber;
	private String password;
	private Date created_at;

	// new profile fields
	@Column(name = "first_name")
	private String firstName;
	@Column(name = "last_name")
	private String lastName;
	private String institution;
	private String role;

	@Column(name = "academic_level")
	private String academicLevel;
	@Column(name = "major_field")
	private String majorField;
	
	@OneToMany(fetch = FetchType.EAGER, mappedBy = "user", cascade = CascadeType.ALL)
  @JsonManagedReference
  // @Fetch(FetchMode.JOIN)
  private List<CourseEntity> courses = new ArrayList<>();
	
  @Column(name = "profile_picture_path")
    private String profilePicturePath;

	public UserEntity() {
		
	}

	public UserEntity(String username, String email, String phoneNumber, String password, Date created_at,
                   String firstName, String lastName, String institution, String role, 
                   String academicLevel, String majorField) {
    this.username = username;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.password = password;
    this.created_at = created_at;
    this.firstName = firstName;
    this.lastName = lastName;
    this.institution = institution;
    this.role = role;
    this.academicLevel = academicLevel;
    this.majorField = majorField;
  }

	public int getUserId() {
    return userId;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getProfilePicturePath() {
    return profilePicturePath;
}

  public void setProfilePicturePath(String profilePicturePath) {
      this.profilePicturePath = profilePicturePath;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhoneNumber() {
    return phoneNumber;
  }

  public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Date getCreated_at() {
    return created_at;
  }

  public void setCreated_at(Date created_at) {
    this.created_at = created_at;
  }

  // New getters and setters for profile fields
  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getInstitution() {
    return institution;
  }

  public void setInstitution(String institution) {
    this.institution = institution;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public String getAcademicLevel() {
    return academicLevel;
  }

  public void setAcademicLevel(String academicLevel) {
    this.academicLevel = academicLevel;
  }

  public String getMajorField() {
    return majorField;
  }

  public void setMajorField(String majorField) {
    this.majorField = majorField;
  }

  public List<CourseEntity> getCourses() {
    return courses;
  }

  public void setCourses(List<CourseEntity> courses) {
    this.courses = courses;
  }
}