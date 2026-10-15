import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/api/live' });

// Live API WebSocket connection for gemini-3.8-live
wss.on('connection', async (clientWs: WebSocket, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const skill = url.searchParams.get('skill') || 'General Skill Coaching';
  const role = url.searchParams.get('role') || 'peer tutor';

  if (!apiKey) {
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message: 'GEMINI_API_KEY is not configured on the server.',
      })
    );
    return;
  }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
        systemInstruction: `You are an encouraging, skilled campus peer tutor in SkillSwap. The student is practicing "${skill}". Speak concisely, naturally, and warmly in a conversational dialogue. Keep responses short and punchy (1-3 sentences) suitable for interactive spoken voice exchanges. If practicing a language like Spanish, speak in Spanish with helpful English hints when requested.`,
      },
      callbacks: {
        onmessage: (message: any) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio, text }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turn_complete' }));
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live API Error:', err);
          clientWs.send(
            JSON.stringify({
              type: 'error',
              message: err.message || 'Live session error occurred.',
            })
          );
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'connected', skill, model: 'gemini-3.8-live' }));

    clientWs.on('message', (data: Buffer | string) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.text) {
          session.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err: any) {
        console.error('Error routing realtime input:', err);
      }
    });

    clientWs.on('close', () => {
      try {
        session?.close?.();
      } catch (e) {
        // ignore
      }
    });
  } catch (err: any) {
    console.error('Failed to initialize gemini-3.8-live session:', err);
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message: err.message || 'Failed to start Live session with gemini-3.8-live',
      })
    );
  }
});

// REST Fallback endpoint for voice/text exchange
app.post('/api/voice-practice', async (req, res) => {
  try {
    const { message, skill, voice = 'Zephyr' } = req.body;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `[Skill: ${skill || 'General'}] User said: "${message}". Respond as an interactive peer tutor in 1-2 spoken sentences.`,
            },
          ],
        },
      ],
      systemInstruction: 'You are a friendly campus peer tutor in SkillSwap. Keep your reply conversational, spoken-style, and under 40 words.',
    });

    const replyText = response.text || 'Great question! Let us practice this together.';

    // Generate spoken audio using gemini-3.8-flash-lite-tts
    let base64Audio = null;
    try {
      const audioResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: replyText }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice as any },
            },
          },
        },
      });
      base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr) {
      console.warn('TTS generation fallback:', ttsErr);
    }

    res.json({
      text: replyText,
      audio: base64Audio,
      model: 'gemini-3.8-live / flash',
    });
  } catch (err: any) {
    console.error('Voice practice API error:', err);
    res.status(500).json({ error: err.message || 'Voice API error' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, () => {
    console.log(`SkillSwap full-stack server running on http://localhost:${port}`);
  });
}

startServer();
