package com.creative_clarity.clarity_springboot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ClaritySpringbootApplication {
	public static void main(String[] args) {
		SpringApplication.run(ClaritySpringbootApplication.class, args);
	}
}
