package com.example.chatapp.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.chatapp.model.User;
import com.example.chatapp.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class LoginController {

    private final UserService userService;

    public LoginController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public User save(@RequestBody User user) {

        Optional<User> userOpt = this.userService.findById(user.getUsername());
        if (userOpt.isPresent()) {
            // We don't allow to login a user with the same name as an already present user
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
            return this.userService.save(user);
        }

    }
}
