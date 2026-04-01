import os
os.environ["COQUI_TOS_AGREED"] = "1"

import gradio as gr
import tempfile
import asyncio
import edge_tts

# Available voices - high quality neural voices
VOICES = {
    "en-female-1": "en-US-JennyNeural",
    "en-female-2": "en-US-AriaNeural",
    "en-female-3": "en-GB-SoniaNeural",
    "en-male-1": "en-US-GuyNeural",
    "en-male-2": "en-US-ChristopherNeural",
    "en-male-3": "en-GB-RyanNeural",
    "hi-female": "hi-IN-SwaraNeural",
    "hi-male": "hi-IN-MadhurNeural",
    "es-female": "es-ES-ElviraNeural",
    "fr-female": "fr-FR-DeniseNeural",
    "de-female": "de-DE-KatjaNeural",
    "ja-female": "ja-JP-NanamiNeural",
    "ko-female": "ko-KR-SunHiNeural",
    "zh-female": "zh-CN-XiaoxiaoNeural",
    "ar-male": "ar-SA-HamedNeural",
    "pt-female": "pt-BR-FranciscaNeural",
}

VOICE_LIST = list(VOICES.keys())

async def generate_speech(text, voice_name, rate="+0%", pitch="+0Hz"):
    voice_id = VOICES.get(voice_name, "en-US-JennyNeural")
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        output_path = f.name
    communicate = edge_tts.Communicate(text, voice_id, rate=rate, pitch=pitch)
    await communicate.save(output_path)
    return output_path

def speak(text, voice_name, rate, pitch):
    if not text:
        return None
    rate_str = f"+{int(rate)}%" if rate >= 0 else f"{int(rate)}%"
    pitch_str = f"+{int(pitch)}Hz" if pitch >= 0 else f"{int(pitch)}Hz"
    return asyncio.run(generate_speech(text, voice_name, rate_str, pitch_str))

demo = gr.Interface(
    fn=speak,
    inputs=[
        gr.Textbox(label="Text to speak", placeholder="Enter text for Eva to say...", lines=3),
        gr.Dropdown(choices=VOICE_LIST, value="en-female-1", label="Voice"),
        gr.Slider(-50, 50, value=0, step=5, label="Speed (%)"),
        gr.Slider(-50, 50, value=0, step=5, label="Pitch (Hz)"),
    ],
    outputs=gr.Audio(label="Generated speech"),
    title="Eva Voice Engine",
    description="High-quality neural text-to-speech with 16+ voices across 10 languages. Free, fast, unlimited.",
    flagging_mode="never",
)

demo.launch()
