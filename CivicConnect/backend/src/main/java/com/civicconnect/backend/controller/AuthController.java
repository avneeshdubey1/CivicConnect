package com.civicconnect.backend.controller;

import com.civicconnect.backend.dto.LoginDto;
import com.civicconnect.backend.dto.RegisterDto;
import com.civicconnect.backend.model.User;
import com.civicconnect.backend.repository.UserRepository;
import com.civicconnect.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDto registerDto, BindingResult bindingResult) {
        // 0. CHECK VALIDATION
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        System.out.println("--- DEBUG REGISTER START ---");
        System.out.println("Attempting to register user: " + registerDto.getUsername());
        System.out.println("Raw Password received: " + registerDto.getPassword());

        try {
            // 1. Check if Username exists
            if (userRepository.findByUsername(registerDto.getUsername()).isPresent()) {
                System.out.println("Result: Username exists.");
                return ResponseEntity.badRequest().body(Map.of("message", "Username already exists!"));
            }

            // 2. Check if Email exists (NEW CODE)
            if (userRepository.findByEmail(registerDto.getEmail()).isPresent()) {
                System.out.println("Result: Email exists.");
                return ResponseEntity.badRequest().body(Map.of("message", "Email already registered!"));
            }

            User user = new User();
            user.setUsername(registerDto.getUsername());
            user.setEmail(registerDto.getEmail());
            user.setMobileNumber(registerDto.getMobileNumber());
            user.setRole("Citizen");

            // ENCRYPT
            String encodedPassword = passwordEncoder.encode(registerDto.getPassword());
            System.out.println("Encoded Password to save: " + encodedPassword);
            user.setPassword(encodedPassword);

            userRepository.save(user);
            System.out.println("--- DEBUG REGISTER SUCCESS ---");
            return ResponseEntity.ok(Map.of("message", "User registered successfully"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        System.out.println("--- DEBUG LOGIN START ---");
        System.out.println("Login attempt for: " + loginDto.getUsername());
        System.out.println("Raw Password received: " + loginDto.getPassword());

        try {
            // 1. Manually check user in DB to see what is stored
            Optional<User> userOpt = userRepository.findByUsername(loginDto.getUsername());
            if (userOpt.isEmpty()) {
                System.out.println("Result: User NOT FOUND in database.");
                return ResponseEntity.status(401).body(Map.of("message", "User not found"));
            }

            User dbUser = userOpt.get();
            System.out.println("Found User in DB ID: " + dbUser.getId());
            System.out.println("DB Stored Hash: " + dbUser.getPassword());

            // 2. Check if passwords match manually
            boolean matches = passwordEncoder.matches(loginDto.getPassword(), dbUser.getPassword());
            System.out.println("Does Raw Password match DB Hash? " + matches);

            if (!matches) {
                System.out.println("Result: PASSWORD MISMATCH (401)");
                return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials (debug mismatch)"));
            }

            // 3. If manual check passes, proceed with standard Auth
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword()));

            String token = jwtUtil.generateToken(loginDto.getUsername(), dbUser.getRole());

            System.out.println("--- DEBUG LOGIN SUCCESS ---");
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("role", dbUser.getRole());
            response.put("username", dbUser.getUsername());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("EXCEPTION during login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of("message", "Invalid username or password"));
        }
    }
}