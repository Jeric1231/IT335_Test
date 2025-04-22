package com.creative_clarity.clarity_springboot.Config;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.creative_clarity.clarity_springboot.Entity.UserEntity;
import com.creative_clarity.clarity_springboot.Service.UserService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()  // Allow all requests
            )
            
            // .authorizeHttpRequests(auth -> auth
            //     .requestMatchers(
            //         "/api/user/login",
            //         "/api/user/postuserrecord",
            //         "/api/user/forgot1",
            //         "/api/user/forgot2",
            //         "/api/user/upload-profile-picture",
            //         "/oauth2/**",
            //         "/login/**",
            //         "/api/user/setup-profile",
            //         "/uploads/**",
            //         "/api/uploads/**", // Ensure this line is included to permit access to uploads
            //         "api/archive/**"
            //     ).permitAll()
            //     .requestMatchers("/api/user/update-profile").authenticated()
            //     .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll() // Explicitly permit GET requests to uploads
            //     .requestMatchers(HttpMethod.OPTIONS, "/api/archive/**").permitAll() // Allow OPTIONS requests for CORS preflight
            //     .requestMatchers(HttpMethod.PUT, "/api/archive/unarchive/**").authenticated() // Ensure PUT requests to unarchive are authenticated
            //     .anyRequest().authenticated()
            //     )
            // .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            // .oauth2Login(oauth2 -> oauth2
            //     .userInfoEndpoint(userInfo -> userInfo
            //         .userService(this.oauth2UserService())
            //     )
            //     .successHandler(oauth2AuthenticationSuccessHandler())
            // )
            // .exceptionHandling(e -> e
            //     .authenticationEntryPoint((request, response, authException) -> {
            //         logger.error("Unauthorized error: {}", authException.getMessage());
            //         response.sendError(HttpStatus.UNAUTHORIZED.value(), authException.getMessage());
            //     })
            // )
            ;
            
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173")); // Your frontend URL
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private String generateToken(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        UserEntity user = userService.findByEmail(email);
        return generateToken(user);
    }

    private String generateToken(UserEntity user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 86400000); // 24 hours
        
        String userId = String.valueOf(user.getUserId()); // Convert ID to string
    
        return Jwts.builder()
            .setSubject(userId) // Use ID instead of email
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }


    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        
        return request -> {
            OAuth2User oauth2User = delegate.loadUser(request);
            String registrationId = request.getClientRegistration().getRegistrationId();
            
            String email = null;
            String name = null;
            String profilePicture = null;
            
            try {
                // Extract user details based on provider
                switch (registrationId) {
                    case "github":
                        email = oauth2User.getAttribute("email");
                        if (email == null) {
                            String login = oauth2User.getAttribute("login");
                            email = login + "@github.com";
                        }
                        name = oauth2User.getAttribute("name") != null 
                            ? oauth2User.getAttribute("name") 
                            : oauth2User.getAttribute("login");
                        profilePicture = oauth2User.getAttribute("avatar_url");
                        break;
                    
                    case "facebook":
                        email = oauth2User.getAttribute("email");
                        name = oauth2User.getAttribute("name");
                        profilePicture = oauth2User.getAttribute("picture.data.url");
                        break;
                    
                    default: // Google and others
                        email = oauth2User.getAttribute("email");
                        name = oauth2User.getAttribute("name");
                        profilePicture = oauth2User.getAttribute("picture");
                        break;
                }

                // Validate email
                if (email == null || email.isEmpty()) {
                    throw new OAuth2AuthenticationException("No email provided");
                }

                // Create or update user
                UserEntity user = userService.findByEmail(email);
                if (user == null) {
                    user = new UserEntity();
                    user.setEmail(email);
                    user.setUsername(email);
                    user.setPassword(passwordEncoder().encode("oauth2user"));
                    user.setCreated_at(new Date());
                    
                    // Set name
                    if (name != null) {
                        String[] nameParts = name.split(" ", 2);
                        user.setFirstName(nameParts[0]);
                        if (nameParts.length > 1) {
                            user.setLastName(nameParts[1]);
                        }
                    }

                    // Set profile picture
                    if (profilePicture != null) {
                        user.setProfilePicturePath(profilePicture);
                    }
                    
                    // Set default values for required fields
                    user.setPhoneNumber("");
                    user.setInstitution("");
                    user.setRole("");
                    user.setAcademicLevel("");
                    user.setMajorField("");
                    
                    userService.postUserRecord(user);
                }

                // Create a custom OAuth2User that includes our user details
                Map<String, Object> attributes = new HashMap<>(oauth2User.getAttributes());
                attributes.put("userId", user.getUserId());
                attributes.put("firstName", user.getFirstName());
                attributes.put("lastName", user.getLastName());
                attributes.put("profilePicturePath", user.getProfilePicturePath());

                return new DefaultOAuth2User(
                    oauth2User.getAuthorities(), 
                    attributes, 
                    registrationId.equals("github") ? "login" : "email"
                );
            } catch (Exception e) {
                logger.error("OAuth2 User Service Error: ", e);
                throw new OAuth2AuthenticationException(new OAuth2Error("authentication_failed"), e.getMessage(), e);
            }
        };
    }
    @Bean
    public AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String email = oauth2User.getAttribute("email");
            
            try {
                UserEntity user = userService.findByEmail(email);
                if (user == null) {
                    logger.error("No user found for email: " + email);
                    response.sendRedirect("http://localhost:5173/login?error=no_user");
                    return;
                }
                
                String token = generateToken(user);
                logger.info("Generated token for user: " + email);

                // Ensure clean, single redirect
                // response.sendRedirect(
                //     String.format("http://localhost:5173/oauth2/redirect?token=%s", token)
                // );
                response.sendRedirect(
                String.format("http://localhost:5173/oauth2/redirect?token=%s&userId=%s&email=%s", 
                    token, 
                    user.getUserId(), 
                    URLEncoder.encode(email, StandardCharsets.UTF_8)
                )
            );
            } catch (Exception e) {
                logger.error("Error in OAuth2 success handler", e);
                response.sendRedirect("http://localhost:5173/login?error=auth_failed");
            }
        };
    }
}