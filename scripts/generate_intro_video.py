#!/usr/bin/env python3
"""Generate an 8-second 1080p animated text video with background music.

Uses Pillow for frame rendering, Python stdlib for audio synthesis,
and FFmpeg for video encoding. Zero new dependencies required.

Usage:
    uv run scripts/generate_intro_video.py
    uv run scripts/generate_intro_video.py --output videos/custom.mp4
    uv run scripts/generate_intro_video.py --no-audio
"""

from __future__ import annotations

import argparse
import contextlib
import math
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

WIDTH = 1920
HEIGHT = 1080
FPS = 60
DURATION = 8.0
TOTAL_FRAMES = int(FPS * DURATION)  # 480

# Colors (RGB tuples)
COLOR_BG_TOP = (10, 14, 39)  # #0a0e27
COLOR_BG_BOTTOM = (26, 30, 62)  # #1a1e3e
COLOR_TEXT = (255, 255, 255)  # white
COLOR_ACCENT = (0, 212, 255)  # #00d4ff cyan
COLOR_GLOW = (0, 180, 240)  # glow blue
COLOR_SUBTITLE = (180, 190, 210)  # light gray-blue
COLOR_PARTICLE = (0, 200, 255)  # cyan particle

# Font resolution cascade (macOS → Linux → Windows → fallback)
FONT_CANDIDATES = [
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
    "C:/Windows/Fonts/arial.ttf",
]

# Chord progression for background music (frequencies in Hz)
# C major → F major → G major → C major
CHORD_PROGRESSION: list[list[float]] = [
    [261.63, 329.63, 392.00],  # C4 E4 G4
    [349.23, 440.00, 523.25],  # F4 A4 C5
    [392.00, 493.88, 587.33],  # G4 B4 D5
    [261.63, 329.63, 392.00],  # C4 E4 G4
]

# ---------------------------------------------------------------------------
# Easing functions
# ---------------------------------------------------------------------------


def ease_out_cubic(t: float) -> float:
    """Ease-out cubic: fast start, slow end."""
    return 1.0 - (1.0 - t) ** 3


def ease_in_cubic(t: float) -> float:
    """Ease-in cubic: slow start, fast end."""
    return t**3


def ease_in_out_sine(t: float) -> float:
    """Ease-in-out sine: smooth acceleration and deceleration."""
    return 0.5 * (1.0 - math.cos(math.pi * t))


def lerp(a: float, b: float, t: float) -> float:
    """Linear interpolation between a and b."""
    return a + (b - a) * t


def clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """Clamp value to [lo, hi]."""
    return max(lo, min(hi, value))


# ---------------------------------------------------------------------------
# Audio generation (pure stdlib)
# ---------------------------------------------------------------------------


def generate_audio(path: Path, duration: float, sample_rate: int = 44100) -> None:
    """Generate a 4-chord ambient progression as a WAV file.

    Uses math.sin + struct.pack + wave — no numpy required.
    """
    num_channels = 2
    sample_width = 2  # 16-bit PCM
    total_samples = int(sample_rate * duration)
    chord_duration = duration / len(CHORD_PROGRESSION)
    fade_in_samples = int(0.2 * sample_rate)
    fade_out_samples = int(0.5 * sample_rate)

    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(num_channels)
        wav_file.setsampwidth(sample_width)
        wav_file.setframerate(sample_rate)

        frames = bytearray()
        for i in range(total_samples):
            t = i / sample_rate
            chord_idx = min(int(t / chord_duration), len(CHORD_PROGRESSION) - 1)
            chord = CHORD_PROGRESSION[chord_idx]

            # Sum sine waves for each note in the chord
            sample_value = 0.0
            for freq in chord:
                # Subtle vibrato for warmth
                vibrato = 1.0 + 0.003 * math.sin(2.0 * math.pi * 5.0 * t)
                sample_value += 0.25 * math.sin(2.0 * math.pi * freq * vibrato * t)

            # Fade-in envelope
            if i < fade_in_samples:
                sample_value *= i / fade_in_samples

            # Fade-out envelope
            remaining = total_samples - i
            if remaining < fade_out_samples:
                sample_value *= remaining / fade_out_samples

            # Clamp and convert to 16-bit PCM
            clamped = max(-0.95, min(0.95, sample_value))
            pcm_value = int(clamped * 32767)
            packed = struct.pack("<h", pcm_value)
            frames.extend(packed * num_channels)  # stereo: same sample L+R

        wav_file.writeframes(bytes(frames))


# ---------------------------------------------------------------------------
# Font resolution
# ---------------------------------------------------------------------------


def resolve_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Find the best available font, falling back to PIL default."""
    for candidate in FONT_CANDIDATES:
        if os.path.exists(candidate):
            try:
                return ImageFont.truetype(candidate, size)
            except OSError, TypeError:
                continue
    # Fallback to PIL default
    return ImageFont.load_default(size)


# ---------------------------------------------------------------------------
# Particle system
# ---------------------------------------------------------------------------


class Particle:
    """A small floating particle for visual decoration."""

    __slots__ = ("alpha", "radius", "vx", "vy", "wobble_phase", "x", "y")

    def __init__(self, x: float, y: float, vx: float, vy: float, radius: float) -> None:
        self.x = x
        self.y = y
        self.vx = vx
        self.vy = vy
        self.radius = radius
        self.alpha = 0.6
        self.wobble_phase = x * 0.01  # unique phase per particle


def init_particles(count: int, width: int, height: int) -> list[Particle]:
    """Create initial particle positions spread across the canvas."""
    particles: list[Particle] = []
    for i in range(count):
        # Spread particles across the width, in the lower 60% of the height
        x = (i / count) * width + (i * 37 % 100)
        y = height * 0.5 + (i * 73 % int(height * 0.4))
        vx = (i % 5 - 2) * 0.3
        vy = -0.8 - (i % 3) * 0.4  # drift upward
        radius = 1.5 + (i % 3) * 0.8
        particles.append(Particle(x, y, vx, vy, radius))
    return particles


def update_particle(p: Particle, frame: int) -> None:
    """Update particle position with sinusoidal wobble."""
    p.x += p.vx + 0.5 * math.sin(0.02 * frame + p.wobble_phase)
    p.y += p.vy


# ---------------------------------------------------------------------------
# Frame rendering
# ---------------------------------------------------------------------------


def render_background(
    frame_num: int, total: int, bg_cache: Image.Image | None
) -> Image.Image:
    """Render gradient background with fade-in from black."""
    if bg_cache is not None:
        return bg_cache.copy()

    # Fade-in over first 1.5 seconds
    fade = clamp(frame_num / (FPS * 1.5))

    img = Image.new("RGB", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)

    for y in range(HEIGHT):
        t = y / HEIGHT
        r = int(lerp(COLOR_BG_TOP[0], COLOR_BG_BOTTOM[0], t) * fade)
        g = int(lerp(COLOR_BG_TOP[1], COLOR_BG_BOTTOM[1], t) * fade)
        b = int(lerp(COLOR_BG_TOP[2], COLOR_BG_BOTTOM[2], t) * fade)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    return img


def render_main_text(
    img: Image.Image,
    frame_num: int,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    text: str,
    alpha: float = 1.0,
) -> None:
    """Render main title text with position animation based on phase."""
    draw = ImageDraw.Draw(img)

    # Phase timing
    intro_end = int(FPS * 1.5)
    outro_start = int(FPS * 6.5)

    # Calculate vertical position with slide-up animation
    if frame_num < intro_end:
        t = ease_out_cubic(clamp(frame_num / intro_end))
        y_pos = int(lerp(600, 380, t))
    elif frame_num >= outro_start:
        t = ease_in_cubic(clamp((frame_num - outro_start) / (FPS * 1.5)))
        y_pos = int(lerp(380, 340, t))
    else:
        # Subtle scale pulse during settle/glow phases
        pulse = 1.0 + 0.02 * math.sin(0.08 * frame_num)
        y_pos = int(380 * pulse)

    # Calculate text opacity
    if frame_num >= outro_start:
        fade = 1.0 - ease_in_cubic(clamp((frame_num - outro_start) / (FPS * 1.5)))
        alpha *= fade

    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    x_pos = (WIDTH - text_w) // 2

    # Draw text with alpha
    text_img = Image.new("RGBA", img.size, (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_img)
    text_color = (*COLOR_TEXT, int(255 * alpha))
    text_draw.text((x_pos, y_pos), text, font=font, fill=text_color)

    img.paste(Image.alpha_composite(img.convert("RGBA"), text_img).convert("RGB"))


def render_glow(
    img: Image.Image,
    frame_num: int,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    text: str,
) -> None:
    """Render multi-layer Gaussian blur glow effect during Phase 3."""
    glow_start = int(FPS * 3.0)
    glow_end = int(FPS * 5.5)

    if frame_num < glow_start or frame_num >= glow_end:
        return

    # Glow intensity peaks in the middle of the phase
    phase_t = (frame_num - glow_start) / (glow_end - glow_start)
    intensity = math.sin(math.pi * phase_t)  # 0 → 1 → 0

    draw = ImageDraw.Draw(img)
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    x_pos = (WIDTH - text_w) // 2
    y_pos = 380

    # Render glow layers
    for blur_radius in [12, 20, 32]:
        glow_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_layer)
        alpha = int(60 * intensity * (1.0 - blur_radius / 40))
        glow_draw.text(
            (x_pos, y_pos),
            text,
            font=font,
            fill=(*COLOR_GLOW, alpha),
        )
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=blur_radius))
        img.paste(Image.alpha_composite(img.convert("RGBA"), glow_layer).convert("RGB"))


def render_particles(
    img: Image.Image,
    particles: list[Particle],
    frame_num: int,
) -> None:
    """Draw and update floating particles."""
    glow_start = int(FPS * 3.0)
    glow_end = int(FPS * 5.5)

    if frame_num < glow_start or frame_num >= glow_end:
        return

    phase_t = (frame_num - glow_start) / (glow_end - glow_start)
    intensity = math.sin(math.pi * phase_t)

    draw = ImageDraw.Draw(img)
    for p in particles:
        update_particle(p, frame_num)
        alpha = int(180 * intensity * p.alpha)
        color = (*COLOR_PARTICLE, alpha)

        # Draw particle as small circle
        x, y = int(p.x) % WIDTH, int(p.y) % HEIGHT
        draw.ellipse(
            [x - p.radius, y - p.radius, x + p.radius, y + p.radius],
            fill=color,
        )


def render_accent_line(img: Image.Image, frame_num: int) -> None:
    """Draw decorative horizontal line that draws from center outward."""
    line_start = int(FPS * 1.5)
    line_end = int(FPS * 3.0)

    if frame_num < line_start:
        return

    draw = ImageDraw.Draw(img)

    # Line draw progress
    if frame_num < line_end:
        t = ease_out_cubic(clamp((frame_num - line_start) / (line_end - line_start)))
    else:
        t = 1.0

    # Pulse brightness during glow phase
    glow_start = int(FPS * 3.0)
    glow_end = int(FPS * 5.5)
    pulse = 1.0
    if glow_start <= frame_num < glow_end:
        phase_t = (frame_num - glow_start) / (glow_end - glow_start)
        pulse = 0.6 + 0.4 * math.sin(math.pi * phase_t)

    line_width = int(400 * t)
    center_x = WIDTH // 2
    y = 480  # below main text

    alpha = int(200 * pulse)
    draw.line(
        [(center_x - line_width, y), (center_x + line_width, y)],
        fill=(*COLOR_ACCENT, alpha),
        width=2,
    )


def render_subtitle(
    img: Image.Image,
    frame_num: int,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
) -> None:
    """Render bottom subtitle text with fade timing."""
    sub_start = int(FPS * 5.5)
    outro_start = int(FPS * 6.5)

    if frame_num < sub_start:
        return

    draw = ImageDraw.Draw(img)

    # Fade in
    if frame_num < outro_start:
        t = clamp((frame_num - sub_start) / (FPS * 1.0))
        alpha = ease_out_cubic(t)
    else:
        # Fade out with rest
        t = ease_in_cubic(clamp((frame_num - outro_start) / (FPS * 1.5)))
        alpha = 1.0 - t

    text = "github.com/Alishahryar1/free-claude-code"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    x_pos = (WIDTH - text_w) // 2
    y_pos = HEIGHT - 160

    text_img = Image.new("RGBA", img.size, (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_img)
    text_color = (*COLOR_SUBTITLE, int(255 * alpha))
    text_draw.text((x_pos, y_pos), text, font=font, fill=text_color)

    img.paste(Image.alpha_composite(img.convert("RGBA"), text_img).convert("RGB"))


def render_frame(
    frame_num: int,
    total: int,
    font_large: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    font_small: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    particles: list[Particle],
    bg_cache: Image.Image | None,
) -> bytes:
    """Render a single frame and return raw RGB bytes."""
    # Background
    img = render_background(frame_num, total, bg_cache)

    # Main text
    render_main_text(img, frame_num, font_large, "FREE CLAUDE CODE")

    # Glow effect
    render_glow(img, frame_num, font_large, "FREE CLAUDE CODE")

    # Accent line
    render_accent_line(img, frame_num)

    # Particles
    render_particles(img, particles, frame_num)

    # Subtitle
    render_subtitle(img, frame_num, font_small)

    return img.tobytes()


# ---------------------------------------------------------------------------
# FFmpeg pipeline
# ---------------------------------------------------------------------------


def encode_video(audio_path: Path | None, output_path: Path, total: int) -> None:
    """Pipe rendered frames to FFmpeg and mux with audio."""
    cmd = [
        "ffmpeg",
        "-y",
        # Video input: raw frames piped via stdin
        "-f",
        "rawvideo",
        "-vcodec",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        str(FPS),
        "-i",
        "pipe:0",
    ]

    # Audio input (if provided)
    if audio_path is not None:
        cmd.extend(["-i", str(audio_path)])

    cmd.extend(
        [
            # Video encoding
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-pix_fmt",
            "yuv420p",
        ]
    )

    if audio_path is not None:
        cmd.extend(
            [
                # Audio encoding
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-shortest",
            ]
        )

    cmd.extend(
        [
            "-movflags",
            "+faststart",
            str(output_path),
        ]
    )

    process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    stdin_stream = process.stdin
    stderr_stream = process.stderr

    try:
        font_large = resolve_font(120)
        font_small = resolve_font(48)
        particles = init_particles(30, WIDTH, HEIGHT)

        # Cache background after first render
        bg_cache: Image.Image | None = None

        for frame_num in range(total):
            if frame_num == 0:
                # Render first frame to create cache
                frame_bytes = render_frame(
                    frame_num, total, font_large, font_small, particles, None
                )
                # Create bg cache from first frame
                bg_cache = Image.frombytes("RGB", (WIDTH, HEIGHT), frame_bytes)
            else:
                frame_bytes = render_frame(
                    frame_num, total, font_large, font_small, particles, bg_cache
                )

            if stdin_stream is not None:
                stdin_stream.write(frame_bytes)

            # Progress indicator
            if (frame_num + 1) % 60 == 0 or frame_num == total - 1:
                pct = (frame_num + 1) / total * 100
                print(
                    f"\r  Rendering: {pct:5.1f}% ({frame_num + 1}/{total} frames)",
                    end="",
                    flush=True,
                )

        print()  # newline after progress

        # Close stdin to signal end of input, then wait for FFmpeg
        if stdin_stream is not None:
            with contextlib.suppress(OSError):
                stdin_stream.close()
        process.wait()
        stderr_bytes = stderr_stream.read() if stderr_stream is not None else b""

        if process.returncode != 0:
            msg = stderr_bytes.decode("utf-8", errors="replace")
            raise RuntimeError(f"FFmpeg failed (exit {process.returncode}):\n{msg}")

    except Exception:
        process.kill()
        raise


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Generate an 8-second 1080p animated text video with audio."
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="videos/intro_video.mp4",
        help="Output MP4 file path (default: videos/intro_video.mp4)",
    )
    parser.add_argument(
        "--no-audio",
        action="store_true",
        help="Skip audio generation (silent video)",
    )
    parser.add_argument(
        "--duration",
        type=float,
        default=DURATION,
        help=f"Video duration in seconds (default: {DURATION})",
    )
    return parser.parse_args()


def main() -> None:
    """Main entry point."""
    args = parse_args()

    # Check FFmpeg availability
    if shutil.which("ffmpeg") is None:
        print("Error: FFmpeg not found. Install it:", file=sys.stderr)
        print("  brew install ffmpeg   (macOS)", file=sys.stderr)
        print("  apt install ffmpeg    (Linux)", file=sys.stderr)
        sys.exit(1)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    total_frames = int(args.duration * FPS)

    print(f"Generating {args.duration}s video at {WIDTH}x{HEIGHT} @ {FPS}fps")
    print(f"  Total frames: {total_frames}")
    print(f"  Output: {output_path}")

    audio_path: Path | None = None

    try:
        # Generate audio
        if not args.no_audio:
            print("  Generating audio...")
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                audio_path = Path(tmp.name)
            generate_audio(audio_path, args.duration)
            print("  Audio generated.")

        # Render frames and encode
        print("  Rendering frames and encoding video...")
        encode_video(audio_path, output_path, total_frames)

        # Report result
        file_size = output_path.stat().st_size
        size_mb = file_size / (1024 * 1024)
        print(f"\nDone! Output: {output_path} ({size_mb:.1f} MB)")

    finally:
        # Cleanup temp audio file
        if audio_path is not None:
            with contextlib.suppress(OSError):
                audio_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
