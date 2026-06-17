package com.doan.ProFit.controller.client;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ClientController {
    @RequestMapping("/home")
    public String client() {
        return "client/index";
    }
}
