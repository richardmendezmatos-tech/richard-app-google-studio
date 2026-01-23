package com.richard.live.infrastructure.web;

import com.richard.live.service.internal.PlaceholderServiceImpl;

public class PlaceholderController {
    // Only Infra can see Service
    private final PlaceholderServiceImpl service = new PlaceholderServiceImpl();
}
