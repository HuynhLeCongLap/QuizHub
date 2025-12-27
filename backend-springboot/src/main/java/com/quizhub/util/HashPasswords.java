package com.quizhub.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.ArrayList;
import java.util.List;

public class HashPasswords {
    /**
     * Main program for hashing passwords using BCrypt.
     *
     * If no arguments are provided, it will show usage and example hashes.
     */
    public static void main(String[] args) {
        int strength = 10; // default BCrypt strength
        List<String> passwords = new ArrayList<>();

        for (int i = 0; i < args.length; i++) {
            String a = args[i];
            if ("-s".equals(a) || "--strength".equals(a)) {
                if (i + 1 < args.length) {
                    try {
                        strength = Integer.parseInt(args[++i]);
                    } catch (NumberFormatException e) {
                        System.err.println("Invalid strength value: " + args[i]);
                        printUsageAndExit();
                    }
                } else {
                    System.err.println("Missing value for " + a);
                    printUsageAndExit();
                }
            } else if ("-h".equals(a) || "--help".equals(a)) {
                printUsageAndExit();
            } else {
                passwords.add(a);
            }
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(strength);

        if (passwords.isEmpty()) {
            System.out.println("No passwords provided. Usage shown below.\n");
            printUsage();
            System.out.println();
            System.out.println("Examples:");
            System.out.println("1: " + encoder.encode("1"));
            System.out.println("123456: " + encoder.encode("123456"));
            System.out.println("admin123: " + encoder.encode("admin123"));
        } else {
            for (String p : passwords) {
                System.out.println(p + ": " + encoder.encode(p));
            }
        }
    }

    private static void printUsage() {
        System.out.println("Usage: java com.quizhub.util.HashPasswords [-s N|--strength N] password [password ...]");
        System.out.println("  -s, --strength N   BCrypt log rounds (work factor). Default: 10");
        System.out.println("  -h, --help         Show this help message");
    }

    private static void printUsageAndExit() {
        printUsage();
        System.exit(1);
    }
}
