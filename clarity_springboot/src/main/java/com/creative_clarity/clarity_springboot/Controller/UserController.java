package com.creative_clarity.clarity_springboot.Controller;

import java.security.Principal;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.creative_clarity.clarity_springboot.Entity.UserEntity;
import com.creative_clarity.clarity_springboot.Service.UserService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@RestController
@RequestMapping("api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
	
	private static final Logger logger = LoggerFactory.getLogger(UserController.class);

	@Autowired
	UserService userv;

	@Value("${jwt.secret}")
	private String jwtSecret;

	@Value("${jwt.expiration}")
	private Long jwtExpiration;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
	
	@GetMapping("/print")
	public String print() {
		return "Hello, User";
	}

    @GetMapping("/")
    public ResponseEntity<String> home() {
        return ResponseEntity.ok("API is running on port 8080.");
    }

	@PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            logger.info("Login attempt for email: {}", email);

            // Find user by email
            UserEntity user = userv.findByEmail(email);
            if (user == null) {
                logger.warn("No user found with email: {}", email);
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password"));
            }

            // Check password
            if (!passwordEncoder.matches(password, user.getPassword())) {
                logger.warn("Invalid password for email: {}", email);
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password"));
            }

            // Generate JWT token
            String token = generateToken(user);
            logger.info("Successfully generated token for user: {}", email);

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", getUserResponseMap(user));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Login error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    private Map<String, Object> getUserResponseMap(UserEntity user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("userId", user.getUserId());
        userMap.put("email", user.getEmail());
        userMap.put("username", user.getUsername());
        userMap.put("firstName", user.getFirstName() != null ? user.getFirstName() : "Student");
        userMap.put("lastName", user.getLastName() != null ? user.getLastName() : "");
        userMap.put("institution", user.getInstitution() != null ? user.getInstitution() : "");
        userMap.put("role", user.getRole() != null ? user.getRole() : "");
        userMap.put("academicLevel", user.getAcademicLevel() != null ? user.getAcademicLevel() : "");
        userMap.put("majorField", user.getMajorField() != null ? user.getMajorField() : "");
        
        // Add the full URL for the profile picture
        String profilePicturePath = user.getProfilePicturePath();
        if (profilePicturePath != null && !profilePicturePath.isEmpty()) {
            // Ensure the path starts with a forward slash
            if (!profilePicturePath.startsWith("/")) {
                profilePicturePath = "/" + profilePicturePath;
            }
            userMap.put("profilePicture", "http://localhost:8080" + profilePicturePath);
        } else {
            userMap.put("profilePicture", ""); // or your default profile picture URL
        }
        
        return userMap;
    }

    private String generateToken(UserEntity user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .setSubject(Long.toString(user.getUserId()))
            .setIssuedAt(new Date())
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    // OAuth2 login
    @GetMapping("/oauth2/user")
    public ResponseEntity<?> getOAuth2User(Principal principal) {
        try {
            if (principal == null) {
                logger.error("Principal is null in OAuth2 authentication");
                return ResponseEntity.status(401)
                    .body(Collections.singletonMap("error", "Not authenticated"));
            }

            if (!(principal instanceof OAuth2AuthenticationToken)) {
                logger.error("Principal is not an OAuth2AuthenticationToken");
                return ResponseEntity.status(401)
                    .body(Collections.singletonMap("error", "Invalid authentication type"));
            }

            OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) principal;
            OAuth2User oauth2User = token.getPrincipal();
            String email;
            String name;

            logger.info("OAuth2 User Attributes: {}", oauth2User.getAttributes());
            
            // Handle different OAuth2 providers
            if ("github".equals(token.getAuthorizedClientRegistrationId())) {
                // For GitHub: try to get email, fallback to login@github.com if not available
                email = oauth2User.getAttribute("email");
                if (email == null || email.isEmpty()) {
                    String login = oauth2User.getAttribute("login");
                    email = login + "@github.com";
                    logger.info("Using generated email for GitHub user: {}", email);
                }
                
                // Get name or use login as fallback
                name = oauth2User.getAttribute("name");
                if (name == null || name.isEmpty()) {
                    name = oauth2User.getAttribute("login");
                }
            } else {
                // For other providers (Google, Facebook)
                email = oauth2User.getAttribute("email");
                name = oauth2User.getAttribute("name");
                
                if (email == null) {
                    logger.error("Email not provided by OAuth2 provider: {}", 
                        token.getAuthorizedClientRegistrationId());
                    return ResponseEntity.status(400)
                        .body(Collections.singletonMap("error", 
                            "Email not provided by OAuth2 provider"));
                }
            }

            // Find or create user
            UserEntity user = userv.findByEmail(email);
            if (user == null) {
                logger.info("Creating new user from OAuth2 login: {}", email);
                
                user = new UserEntity();
                user.setEmail(email);
                user.setUsername(email);
                user.setPassword(passwordEncoder.encode("oauth2user")); // Set a default password
                user.setCreated_at(new Date());
                
                // Set name
                if (name != null) {
                    String[] nameParts = name.split(" ", 2);
                    user.setFirstName(nameParts[0]);
                    if (nameParts.length > 1) {
                        user.setLastName(nameParts[1]);
                    }
                }
                
                // Set default values for required fields
                user.setPhoneNumber("");
                user.setInstitution("");
                user.setRole("");
                user.setAcademicLevel("");
                user.setMajorField("");
                
                user = userv.postUserRecord(user);
            }

            // Generate JWT token
            String jwtToken = generateToken(user);

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("user", Map.of(
                "userId", user.getUserId(),
                "email", user.getEmail(),
                "username", user.getUsername(),
                "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                "lastName", user.getLastName() != null ? user.getLastName() : "",
                "institution", user.getInstitution() != null ? user.getInstitution() : "",
                "role", user.getRole() != null ? user.getRole() : "",
                "academicLevel", user.getAcademicLevel() != null ? user.getAcademicLevel() : "",
                "majorField", user.getMajorField() != null ? user.getMajorField() : "",
                "picture", user.getProfilePicturePath() != null ? user.getProfilePicturePath() : "" 
            ));

            logger.info("Principal class: {}", principal.getClass().getName());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Detailed OAuth2 error: ", e);
            return ResponseEntity.status(500)
                .body(Map.of(
                    "error", "Authentication failed",
                    "details", e.getMessage(),
                    "stackTrace", Arrays.toString(e.getStackTrace())
                ));
        }
    }
	
	//Create of CRUD
	@PostMapping("/postuserrecord")
    public ResponseEntity<?> postStudentRecord(@RequestBody UserEntity user) {
        try {
            logger.info("Received registration request for email: {}", user.getEmail());
            
            // Validate required fields
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }
            if (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty()) {
                return ResponseEntity.badRequest().body("Phone number is required");
            }
            
            // Encrypt the password before saving
            String encryptedPassword = passwordEncoder.encode(user.getPassword());
            user.setPassword(encryptedPassword);
            
            // Set username and created_at
            user.setUsername(user.getEmail());
            user.setCreated_at(new Date());

            // Initialize profile fields with default values
            user.setFirstName(user.getFirstName() != null ? user.getFirstName() : "");
            user.setLastName(user.getLastName() != null ? user.getLastName() : "");
            user.setInstitution(user.getInstitution() != null ? user.getInstitution() : "");
            user.setRole(user.getRole() != null ? user.getRole() : "");
            user.setAcademicLevel(user.getAcademicLevel() != null ? user.getAcademicLevel() : "");
            user.setMajorField(user.getMajorField() != null ? user.getMajorField() : "");
            
            UserEntity savedUser = userv.postUserRecord(user);
            
            // Don't send the encrypted password back in the response
            savedUser.setPassword(null);
            
            return ResponseEntity.ok(savedUser);
            
        } catch (Exception e) {
            logger.error("Error creating user: ", e);
            return ResponseEntity.badRequest()
                .body("Error creating user: " + e.getMessage());
        }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserEntity updatedUserDetails, @RequestParam("userId") int userId) {
        try {
            logger.info("Received profile update request for user: {}", userId);

            // Validate user
            UserEntity user = userv.findById(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            // Update user details
            user.setFirstName(updatedUserDetails.getFirstName());
            user.setLastName(updatedUserDetails.getLastName());
            user.setInstitution(updatedUserDetails.getInstitution());
            user.setRole(updatedUserDetails.getRole());
            user.setAcademicLevel(updatedUserDetails.getAcademicLevel());
            user.setMajorField(updatedUserDetails.getMajorField());

            // Save updated user
            UserEntity updatedUser = userv.postUserRecord(user);

            return ResponseEntity.ok(getUserResponseMap(updatedUser));

        } catch (Exception e) {
            logger.error("Error updating profile: ", e);
            return ResponseEntity.status(500).body(Map.of("error", "Profile update failed: " + e.getMessage()));
        }
    }

    @PostMapping("/setup-profile")
    public ResponseEntity<?> setupProfile(@RequestBody Map<String, String> profileData) {
        try {
            // Log the received data
            logger.info("Received profile data: {}", profileData);
            
            if (profileData == null || profileData.isEmpty()) {
                logger.error("Profile data is empty");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "No profile data provided"));
            }
    
            // Get the most recently created user
            List<UserEntity> users = userv.getAllUsers();
            if (users.isEmpty()) {
                logger.error("No users found in database");
                return ResponseEntity.status(404)
                    .body(Map.of("error", "No users found"));
            }
            
            // Get the most recent user
            UserEntity user = users.stream()
                .max((u1, u2) -> u1.getCreated_at().compareTo(u2.getCreated_at()))
                .orElseThrow(() -> new RuntimeException("No users found"));
            
            logger.info("Found user to update: {}", user.getEmail());
    
            // Update profile fields with null checks
            if (profileData.containsKey("firstName")) {
                user.setFirstName(profileData.get("firstName"));
            }
            if (profileData.containsKey("lastName")) {
                user.setLastName(profileData.get("lastName"));
            }
            if (profileData.containsKey("institution")) {
                user.setInstitution(profileData.get("institution"));
            }
            if (profileData.containsKey("role")) {
                user.setRole(profileData.get("role"));
            }
            if (profileData.containsKey("academicLevel")) {
                user.setAcademicLevel(profileData.get("academicLevel"));
            }
            if (profileData.containsKey("majorField")) {
                user.setMajorField(profileData.get("majorField"));
            }
            
            UserEntity updatedUser = userv.postUserRecord(user);
            logger.info("Successfully updated user: {}", updatedUser.getEmail());
            
            // Generate new token
            String token = generateToken(updatedUser);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("userId", updatedUser.getUserId());
            response.put("email", updatedUser.getEmail());
            response.put("username", updatedUser.getUsername());
            response.put("firstName", updatedUser.getFirstName());
            response.put("lastName", updatedUser.getLastName());
            response.put("institution", updatedUser.getInstitution());
            response.put("role", updatedUser.getRole());
            response.put("academicLevel", updatedUser.getAcademicLevel());
            response.put("majorField", updatedUser.getMajorField());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error during profile setup: ", e);
            logger.error("Stack trace: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Profile setup failed: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot1")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            logger.info("Email verification attempt for: {}", email);

            // Find user by email
            UserEntity user = userv.findByEmail(email);
            
            if (user == null) {
                logger.warn("No user found with email: {}", email);
                return ResponseEntity.status(404)
                    .body(Map.of("error", "Email not found"));
            }

            // Email exists
            logger.info("Email verification successful for: {}", email);
            return ResponseEntity.ok()
                .body(Map.of("message", "Email verified successfully"));

        } catch (Exception e) {
            logger.error("Email verification error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Email verification failed: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot2")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            
            logger.info("Password reset attempt for email: {}", email);

            // Validate inputs
            if (email == null || email.isEmpty() || newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email and new password are required"));
            }

            // Find user by email
            UserEntity user = userv.findByEmail(email);
            if (user == null) {
                logger.warn("No user found with email: {}", email);
                return ResponseEntity.status(404)
                    .body(Map.of("error", "User not found"));
            }

            // Encrypt the new password
            String encryptedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encryptedPassword);
            
            // Save the updated user
            userv.postUserRecord(user);

            logger.info("Password reset successful for email: {}", email);
            return ResponseEntity.ok()
                .body(Map.of("message", "Password reset successful"));

        } catch (Exception e) {
            logger.error("Password reset error: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Password reset failed: " + e.getMessage()));
        }
    }

	//Read of CRUD
	@GetMapping("/getallusers")
	public List<UserEntity> getAllUsers(){
		return userv.getAllUsers();
	}
		
	//Update of CRUD
	@PutMapping("/putuserdetails")
	public UserEntity putUserDetails(@RequestParam int userId, @RequestBody UserEntity newUserDetails) {
		return userv.putUserDetails(userId, newUserDetails);
	}
		
	//Delete of CRUD
	@DeleteMapping("/deleteuserdetails/{userId}")
	public String deleteUser(@PathVariable int userId) {
		return userv.deleteUser(userId);
	}
}