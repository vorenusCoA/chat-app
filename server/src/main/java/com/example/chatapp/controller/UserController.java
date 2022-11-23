package com.example.chatapp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.chatapp.model.User;
import com.example.chatapp.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

	private final UserService userService;
	
	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/user")
	public List<User> getAll() {
		return this.userService.findAll();
	}
}
