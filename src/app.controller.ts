import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getHello(@Res() res: Response) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Auth-Pro Intro</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background-color: #0f172a;
                  color: #f8fafc;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
              }
              .container {
                  text-align: center;
                  padding: 40px;
                  background: #1e293b;
                  border-radius: 12px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #38bdf8;
                  margin-bottom: 20px;
              }
              p {
                  margin-bottom: 30px;
                  color: #cbd5e1;
              }
              .btn {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #0ea5e9;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: bold;
                  transition: background-color 0.3s;
              }
              .btn:hover {
                  background-color: #0284c7;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Welcome to Auth-Pro</h1>
              <p>A personal authentication, email, and storage microservice.</p>
              <a href="/api" class="btn">View Swagger Documentation</a>
          </div>
      </body>
      </html>
    `;
    res.type('text/html').send(html);
  }
}
