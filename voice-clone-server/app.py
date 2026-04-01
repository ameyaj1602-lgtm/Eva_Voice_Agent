import os
os.environ["COQUI_TOS_AGREED"] = "1"

import torch
# Fix: PyTorch 2.11+ defaults weights_only=True, TTS needs False
_original_load = torch.load
torch.load = lambda *args, **kwargs: _original_load(*args, **{**kwargs, 'weights_only': False})

import gradio as gr
from TTS.api import TTS
import tempfile

device = "cpu"
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)

def clone_and_speak(text, audio_file, language="en"):
    if not text or not audio_file:
        return None
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        output_path = f.name
    tts.tts_to_file(text=text, speaker_wav=audio_file, language=language, file_path=output_path)
    return output_path

demo = gr.Interface(
    fn=clone_and_speak,
    inputs=[
        gr.Textbox(label="Text to speak", placeholder="Enter text for Eva to say..."),
        gr.Audio(label="Voice sample (upload or record)", type="filepath"),
        gr.Dropdown(choices=["en", "hi", "es", "fr", "de", "it", "pt", "pl", "tr", "ru", "nl", "cs", "ar", "zh-cn", "ja", "ko"], value="en", label="Language"),
    ],
    outputs=gr.Audio(label="Cloned voice output"),
    title="Eva Voice Cloner",
    description="Upload a voice sample and enter text. Eva will speak in that voice.",
    allow_flagging="never",
)

demo.launch()
