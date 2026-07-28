#!/usr/bin/env python3
"""
Create a 15-second dark-themed product intro video for Free Claude Code.
Features: fade-in title, hype-style captions, flash transition, CTA.
"""

from pathlib import Path

import numpy as np
from moviepy import (
    AudioFileClip,
    ColorClip,
    CompositeVideoClip,
    ImageClip,
    TextClip,
    concatenate_videoclips,
)


def create_dark_background(width: int = 1920, height: int = 1080) -> ColorClip:
    """Create a dark gradient background."""
    return ColorClip(size=(width, height), color=(10, 10, 15), duration=15)


def create_particles(width: int = 1920, height: int = 1080, num_particles: int = 50) -> list:
    """Create floating particle effects for visual interest."""
    particles = []
    for _ in range(num_particles):
        x = np.random.randint(0, width)
        y = np.random.randint(0, height)
        size = np.random.randint(1, 4)
        opacity = np.random.uniform(0.1, 0.4)
        particles.append((x, y, size, opacity))
    return particles


def create_intro_video() -> None:
    """Main function to create the intro video."""
    WIDTH, HEIGHT = 1920, 1080
    FPS = 30
    DURATION = 15

    # Create output directory
    output_dir = Path(__file__).parent.parent / "videos"
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / "product_intro.mp4"

    print("Creating dark background...")
    background = create_dark_background(WIDTH, HEIGHT)

    # === SCENE 1: Logo/Brand Reveal (0-4s) ===
    print("Creating brand reveal scene...")

    # Title fade-in with glow effect
    title = TextClip(
        text="FREE CLAUDE CODE",
        font_size=80,
        color="white",
        font="Arial-Bold",
        text_align="center",
        size=(WIDTH, 200),
    ).with_duration(4).with_start(0.5)

    # Add fade in effect
    title = title.with_effects([
        lambda clip, t: clip.with_opacity(min(1, t * 2))
    ])

    # Subtitle with delay
    subtitle = TextClip(
        text="AI-Powered Development Assistant",
        font_size=36,
        color=(100, 200, 255),
        font="Arial",
        text_align="center",
        size=(WIDTH, 100),
    ).with_duration(3.5).with_start(1.0)

    subtitle = subtitle.with_effects([
        lambda clip, t: clip.with_opacity(min(1, t * 3))
    ])

    # === SCENE 2: Feature Highlights with Hype Captions (4-10s) ===
    print("Creating feature highlights scene...")

    features = [
        ("🚀  TURBOCHARGE YOUR WORKFLOW", 4.0, 2.0),
        ("⚡  NVIDIA NIM POWERED", 6.0, 2.0),
        ("🎯  ZERO CONFIG SETUP", 8.0, 2.0),
    ]

    feature_clips = []
    for text, start, duration in features:
        clip = TextClip(
            text=text,
            font_size=48,
            color=(255, 255, 100),
            font="Arial-Bold",
            text_align="center",
            size=(WIDTH, 150),
        ).with_duration(duration).with_start(start)

        # Add fade effect
        clip = clip.with_effects([
            lambda clip, t: clip.with_opacity(min(1, t * 4))
        ])
        feature_clips.append(clip)

    # === SCENE 3: Flash Transition (10-11s) ===
    print("Creating flash transition...")

    flash = ColorClip(
        size=(WIDTH, HEIGHT),
        color=(255, 255, 255),
        duration=0.5,
    ).with_start(10.0)

    flash = flash.with_effects([
        lambda clip, t: clip.with_opacity(max(0, 1 - t * 4))
    ])

    # === SCENE 4: CTA (11-15s) ===
    print("Creating CTA scene...")

    cta_title = TextClip(
        text="GET STARTED NOW",
        font_size=64,
        color="white",
        font="Arial-Bold",
        text_align="center",
        size=(WIDTH, 150),
    ).with_duration(4).with_start(11.0)

    cta_title = cta_title.with_effects([
        lambda clip, t: clip.with_opacity(min(1, t * 2))
    ])

    cta_subtitle = TextClip(
        text="github.com/anthropics/free-claude-code",
        font_size=28,
        color=(100, 255, 100),
        font="Arial",
        text_align="center",
        size=(WIDTH, 80),
    ).with_duration(3.5).with_start(11.5)

    cta_subtitle = cta_subtitle.with_effects([
        lambda clip, t: clip.with_opacity(min(1, t * 3))
    ])

    # Add animated CTA button effect
    cta_button_bg = ColorClip(
        size=(400, 80),
        color=(0, 150, 255),
        duration=3.5,
    ).with_start(11.5).with_position(("center", HEIGHT - 200))

    cta_button_bg = cta_button_bg.with_effects([
        lambda clip, t: clip.with_opacity(min(1, t * 3))
    ])

    # === COMPOSE ALL SCENES ===
    print("Composing all scenes...")

    # Create particle layer (visual enhancement)
    particle_layer = ColorClip(size=(WIDTH, HEIGHT), color=(0, 0, 0), duration=DURATION)
    particle_layer = particle_layer.with_opacity(0)

    # Compose all elements
    final_video = CompositeVideoClip(
        [
            background,
            particle_layer,
            title,
            subtitle,
            *feature_clips,
            flash,
            cta_title,
            cta_subtitle,
            cta_button_bg,
        ],
        size=(WIDTH, HEIGHT),
    )

    # Set final duration
    final_video = final_video.with_duration(DURATION)

    # Add fade out at the end
    final_video = final_video.with_effects([
        lambda clip, t: clip.with_opacity(
            1.0 if t < 13 else max(0, (15 - t) / 2)
        )
    ])

    # Export the video
    print(f"Exporting video to {output_path}...")
    final_video.write_videofile(
        str(output_path),
        fps=FPS,
        codec="libx264",
        audio=False,
        preset="medium",
        bitrate="8000k",
        threads=4,
    )

    print(f"✅ Video created successfully: {output_path}")
    print(f"   Duration: {DURATION} seconds")
    print(f"   Resolution: {WIDTH}x{HEIGHT}")
    print(f"   FPS: {FPS}")


if __name__ == "__main__":
    create_intro_video()
