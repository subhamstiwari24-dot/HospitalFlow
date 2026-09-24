package com.hospitalflow.backend;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @MessageMapping("/queue")
    @SendTo("/topic/queue")
    public String queueUpdate(String message) {
        return message;
    }
}