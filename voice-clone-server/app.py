import os
os.environ["COQUI_TOS_AGREED"] = "1"

import torch
_original_load = torch.load
torch.load = lambda *args, **kwargs: _original_load(*args, **{**kwargs, 'weights_only': False})

import gradio as gr
import spaces
from TTS.api import TTS
import tempfile

# Load model on CPU at startup (downloads the 1.8GB model)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

@spaces.GPU
def clone_and_speak(text, audio_file, language="en"):
    if not text or not audio_file:
        return None

    # Move model to GPU when ZeroGPU provides it
    device = "cuda" if torch.cuda.is_available() else "cpu"
    tts.to(device)

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
    flagging_mode="never",
)

demo.launch()
