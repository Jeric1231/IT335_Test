package com.creative_clarity.clarity_springboot.Service;

import java.util.List;
import java.util.NoSuchElementException;

import javax.naming.NameNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.creative_clarity.clarity_springboot.Entity.UserEntity;
import com.creative_clarity.clarity_springboot.Repository.UserRepository;

@Service
public class UserService {

	@Autowired
	UserRepository urepo;

	@Value("${app.upload.dir}")
  private String uploadDir;
	
	public UserService() {
		super();
	}

	public UserEntity findByEmail(String email) {
		return urepo.findByEmail(email);
	}
	
	//Create of CRUD
	public UserEntity postUserRecord(UserEntity user) {
		return urepo.save(user);
	}

	//find by ID
	public UserEntity findById(int userId) {
		return urepo.findById(userId).get();
	}
	
	//Read of CRUD
	public List<UserEntity> getAllUsers(){
		return urepo.findAll();
	}
	
	//Update of CRUD
	@SuppressWarnings("finally")
	public UserEntity putUserDetails (int userId, UserEntity newUserDetails) {
		UserEntity user = new UserEntity();
		
		try {
			user = urepo.findById(userId).get();
			
			user.setUsername(newUserDetails.getUsername());
			user.setEmail(newUserDetails.getEmail());
			user.setPassword(newUserDetails.getPassword());
			user.setCreated_at(newUserDetails.getCreated_at());
			user.setFirstName(newUserDetails.getFirstName());
			user.setLastName(newUserDetails.getLastName());
			user.setInstitution(newUserDetails.getInstitution());
			user.setRole(newUserDetails.getRole());
			user.setAcademicLevel(newUserDetails.getAcademicLevel());
			user.setMajorField(newUserDetails.getMajorField());
		}catch(NoSuchElementException nex){
			throw new NameNotFoundException("User "+ userId +"not found");
		}finally {
			return urepo.save(user);
		}
	}
	
	//Delete of CRUD
	public String deleteUser(int userId) {
		String msg = "";
		
		if(urepo.findById(userId).isPresent()) {
			urepo.deleteById(userId);
			msg = "User record successfully deleted!";
		}else {
			msg = "User ID "+ userId +" NOT FOUND!";
		}
		return msg;
	}
}