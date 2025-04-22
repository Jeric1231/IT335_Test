package com.creative_clarity.clarity_springboot.Config;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class FileStorageConfig {
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${file.max-size:5242880}") // 5MB default
    private long maxFileSize;
    
    @Value("${file.allowed-types:image/jpeg,image/png,image/gif}")
    private String[] allowedTypes;
    
    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory!", e);
        }
    }

    @Bean
    public File createUploadDirectory() {
        File uploadDir = new File("clarity_springboot/uploads");
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        return uploadDir;
    }

    public String getUploadDir() {
      return uploadDir;
    }

    public boolean isValidFileType(String contentType) {
      return Arrays.asList(allowedTypes).contains(contentType);
    }

    public long getMaxFileSize() {
      return maxFileSize;
  }
}