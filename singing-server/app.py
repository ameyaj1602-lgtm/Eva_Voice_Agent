import gradio as gr
from transformers import AutoProcessor, BarkModel
import torch
import scipy.io.wavfile
import tempfile
import numpy as np

print("Loading Bark model (singing-capable TTS)...")
processor = AutoProcessor.from_pretrained("suno/bark-small")
model = BarkModel.from_pretrained("suno/bark-small").to("cpu")
print("Model loaded!")

# Voice presets
VOICES = {
    "English Female": "v2/en_speaker_9",
    "English Male": "v2/en_speaker_6",
    "Hindi Female": "v2/hi_speaker_0",
    "Hindi Male": "v2/hi_speaker_1",
}

def generate_audio(text, voice, mode):
    """Generate speech or singing from text.
    For singing: wrap lyrics in ♪ symbols.
    Example: ♪ Twinkle twinkle little star ♪
    """
    try:
        voice_preset = VOICES.get(voice, "v2/en_speaker_9")

        # Add singing markers if in singing mode
        if mode == "Singing":
            if "♪" not in text:
                text = f"♪ {text} ♪"

        inputs = processor(text, voice_preset=voice_preset, return_tensors="pt")

        with torch.no_grad():
            audio_array = model.generate(**inputs, do_sample=True, fine_temperature=0.4, coarse_temperature=0.8)

        audio_array = audio_array.cpu().numpy().squeeze()

        # Normalize
        audio_array = audio_array / np.max(np.abs(audio_array)) * 0.9

        sample_rate = model.generation_config.sample_rate

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            scipy.io.wavfile.write(f.name, rate=sample_rate, data=(audio_array * 32767).astype(np.int16))
            return f.name

    except Exception as e:
        raise gr.Error(f"Generation failed: {str(e)}")

demo = gr.Interface(
    fn=generate_audio,
    inputs=[
        gr.Textbox(label="Text or Lyrics", placeholder="Type text to speak, or lyrics to sing...", lines=3),
        gr.Dropdown(choices=list(VOICES.keys()), value="English Female", label="Voice"),
        gr.Radio(choices=["Speaking", "Singing"], value="Speaking", label="Mode"),
    ],
    outputs=gr.Audio(label="Generated Audio"),
    title="Eva Voice & Singing Engine",
    description="Text-to-speech AND text-to-singing. For singing, select 'Singing' mode. Powered by Bark AI.",
    flagging_mode="never",
)

demo.queue(default_concurrency_limit=1)
demo.launch(show_error=True)
