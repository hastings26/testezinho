# Áudio do Contract Gossip (Gemini TTS)

Gera um MP3 por episódio com vozes do Gemini, mais `audio/manifest.js` com o início de cada fala.
O app usa o MP3 quando ele existe (com destaque da fala atual e toque para pular) e, se não existir,
volta para a voz do navegador.

```bash
cd milene/tools
npm install
GEMINI_API_KEY=sua-chave npm run podcasts        # todos os episódios
GEMINI_API_KEY=sua-chave node generate-podcasts.mjs ep2   # só um
npm run podcasts:mock                            # teste sem API
```

- Crie a chave em Google AI Studio (aistudio.google.com → Get API key).
- Modelo padrão: `gemini-2.5-flash-preview-tts`. Para trocar, use `GEMINI_TTS_MODEL=...`.
- Vozes e direção de cada personagem: objeto `VOICES` no topo do script.
- Cada fala fica em `.cache/`. Se você editar um episódio em `content-gossip.js`, só as falas alteradas são geradas de novo.
- Depois de gerar, faça commit de `milene/audio/*.mp3` e `milene/audio/manifest.js`.
