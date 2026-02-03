package com.civicconnect.backend.model;

public enum EventCategory {
    CLEAN_CITY_DRIVE("Clean City Drive"),
    AWARENESS_WORKSHOP("Awareness Workshop"),
    SOCIAL_CAMPAIGN("Social Campaign"),
    HEALTH_CAMP("Health Camp"),
    TREE_PLANTATION("Tree Plantation"),
    BLOOD_DONATION("Blood Donation"),
    COMMUNITY_MEETING("Community Meeting");

    private final String displayName;

    EventCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
