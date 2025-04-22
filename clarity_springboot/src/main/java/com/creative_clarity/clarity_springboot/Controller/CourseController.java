package com.creative_clarity.clarity_springboot.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.creative_clarity.clarity_springboot.Entity.CourseEntity;
import com.creative_clarity.clarity_springboot.Service.CourseService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/course")
public class CourseController {
	@Autowired
	CourseService cserv;
	
	@GetMapping("/print")
	public String print() {
		return "Hello, Course";
	}
	
	//Create of CRUD
	@PostMapping("/postcourserecord")
	public CourseEntity postCourseRecord(@RequestBody CourseEntity course) {
		return cserv.postCourseRecord(course);
	}

	//Read of CRUD
	@GetMapping("/getallcourse")
	public List<CourseEntity> getAllCourses(){
		return cserv.getAllCourses();
	}

	//GET COURSE BY USER ID
	@GetMapping("/getcourse/{userId}")
	public List<CourseEntity> getCourseByUserId(@PathVariable int userId){
		return cserv.findByUserId(userId);
	}
	
	@GetMapping("{courseId}")
	public ResponseEntity<CourseEntity> getCourseById(@PathVariable int courseId) {
		Optional<CourseEntity> course = cserv.getCourseById(courseId);
		return course.map(ResponseEntity::ok) // If course is found, return 200 OK with the course
					.orElse(ResponseEntity.notFound().build()); // If not found, return 404
	}
			
	//Update of CRUD
	@PutMapping("/putcoursedetails/{courseId}")
	public CourseEntity putCourseDetails(@PathVariable int courseId, @RequestBody CourseEntity newCourseDetails) {
		return cserv.putCourseDetails(courseId, newCourseDetails);
	}
		
	//Delete of CRUD
	@DeleteMapping("/deletecoursedetails/{courseId}")
	public String deleteCourse(@PathVariable int courseId) {
		return cserv.deleteCourse(courseId);
	}
}