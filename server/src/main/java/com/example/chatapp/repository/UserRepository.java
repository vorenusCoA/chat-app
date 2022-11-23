package com.example.chatapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.chatapp.model.User;

public interface UserRepository extends JpaRepository<User, String> {

}
