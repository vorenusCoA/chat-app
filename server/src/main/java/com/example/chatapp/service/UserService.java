package com.example.chatapp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.chatapp.model.User;
import com.example.chatapp.repository.UserRepository;

@Service
public class UserService {

	private final UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public User save(User user) {
		return this.userRepository.save(user);
	}

	public Optional<User> findById(String username) {
		return this.userRepository.findById(username);
	}

	public List<User> findAll() {
		return this.userRepository.findAll();
	}

	public void delete(User user) {
		this.userRepository.delete(user);
	}
}
