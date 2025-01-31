import { Controller, Post, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { IaService } from './ia.service';

@Controller('chat')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Get()
  async getChat(@Res() res: Response) {
    try {
      res.send(`
        <html>
          <head>
            <title>Chat IA</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 20px auto;
                padding: 20px;
                background: #f5f5f5;
              }
              .response {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .message {
                margin: 10px 0;
                padding: 10px;
                border-radius: 4px;
              }
            </style>
            <script>
              document.addEventListener('DOMContentLoaded', () => {
                const responseDiv = document.getElementById('response');
                const eventSource = new EventSource('/chat/stream');

                eventSource.onmessage = (event) => {
                  if (responseDiv) {
                    const text = event.data;
                    responseDiv.textContent += text;
                  }
                };

                eventSource.onerror = () => {
                  eventSource.close();
                };
              });
            </script>
          </head>
          <body>
            <h1>Respuesta del Chat:</h1>
            <div class="response">
              <div class="message system">
                <strong>System:</strong> You are a helpful assistant
              </div>
              <div class="message user">
                <strong>User:</strong> Hola
              </div>
              <div class="message assistant">
                <strong>AI:</strong>
                <div id="response"></div>
              </div>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error en el controlador:', error);
      res.status(500).send('Error: ' + error.message);
    }
  }

  @Get('stream')
  async streamChat(@Res() res: Response) {
    return this.iaService.processChatStream(res);
  }
}
