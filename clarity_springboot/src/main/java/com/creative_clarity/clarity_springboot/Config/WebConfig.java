package com.creative_clarity.clarity_springboot.Config;

import java.io.File;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import jakarta.annotation.PostConstruct;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${file.upload-dir}")
    private String uploadDir;

    @SuppressWarnings("null")
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow CORS for specific URL pattern (e.g., /api/course)
        registry.addMapping("/api/**")  // Allow CORS on all API endpoints
                .allowedOrigins("http://localhost:5173")  // Allow only from this origin
                .allowedMethods("GET", "POST", "PUT", "DELETE")  // Allowed HTTP methods
                .allowedHeaders("*")  // Allow all headers
                .allowCredentials(true);  // Allow credentials (cookies, authorization headers)
    }
    
    @PostConstruct
    public void init() {
        // Create absolute path for upload directory
        File uploadDirectory = new File(uploadDir);
        if (!uploadDirectory.isAbsolute()) {
            uploadDirectory = new File(System.getProperty("user.dir"), uploadDir);
        }
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }
        // Update uploadDir to absolute path
        this.uploadDir = uploadDirectory.getAbsolutePath();
        System.out.println("Upload directory initialized at: " + this.uploadDir);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String locationPath = "file:" + uploadDir + File.separator;
        System.out.println("Configuring resource handler with path: " + locationPath);
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(locationPath)
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS))
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
    }
}
