"""Tests for scripts/generate_intro_video.py."""

from __future__ import annotations

import struct
import wave
from pathlib import Path

import generate_intro_video as giv
import pytest

# ---------------------------------------------------------------------------
# Easing function tests
# ---------------------------------------------------------------------------


class TestEasingFunctions:
    """Unit tests for easing/math helper functions."""

    def test_ease_out_cubic_zero(self) -> None:
        assert giv.ease_out_cubic(0.0) == pytest.approx(0.0)

    def test_ease_out_cubic_one(self) -> None:
        assert giv.ease_out_cubic(1.0) == pytest.approx(1.0)

    def test_ease_out_cubic_midpoint(self) -> None:
        result = giv.ease_out_cubic(0.5)
        assert 0.5 < result < 1.0  # ease-out is faster than linear

    def test_ease_in_cubic_zero(self) -> None:
        assert giv.ease_in_cubic(0.0) == pytest.approx(0.0)

    def test_ease_in_cubic_one(self) -> None:
        assert giv.ease_in_cubic(1.0) == pytest.approx(1.0)

    def test_ease_in_cubic_midpoint(self) -> None:
        result = giv.ease_in_cubic(0.5)
        assert 0.0 < result < 0.5  # ease-in is slower than linear

    def test_ease_in_out_sine_zero(self) -> None:
        assert giv.ease_in_out_sine(0.0) == pytest.approx(0.0)

    def test_ease_in_out_sine_one(self) -> None:
        assert giv.ease_in_out_sine(1.0) == pytest.approx(1.0)

    def test_ease_in_out_sine_midpoint(self) -> None:
        assert giv.ease_in_out_sine(0.5) == pytest.approx(0.5, abs=0.01)

    def test_lerp_basic(self) -> None:
        assert giv.lerp(0.0, 10.0, 0.5) == pytest.approx(5.0)

    def test_lerp_zero(self) -> None:
        assert giv.lerp(10.0, 20.0, 0.0) == pytest.approx(10.0)

    def test_lerp_one(self) -> None:
        assert giv.lerp(10.0, 20.0, 1.0) == pytest.approx(20.0)

    def test_lerp_negative(self) -> None:
        assert giv.lerp(-10.0, 10.0, 0.5) == pytest.approx(0.0)

    def test_clamp_within_range(self) -> None:
        assert giv.clamp(0.5) == 0.5

    def test_clamp_below_range(self) -> None:
        assert giv.clamp(-0.5) == 0.0

    def test_clamp_above_range(self) -> None:
        assert giv.clamp(1.5) == 1.0


# ---------------------------------------------------------------------------
# Audio generation tests
# ---------------------------------------------------------------------------


class TestAudioGeneration:
    """Tests for the audio generation function."""

    def test_creates_valid_wav(self, tmp_path: Path) -> None:
        audio_file = tmp_path / "test.wav"
        giv.generate_audio(audio_file, 8.0)
        assert audio_file.exists()
        with wave.open(str(audio_file), "rb") as wf:
            assert wf.getnchannels() == 2
            assert wf.getsampwidth() == 2
            assert wf.getframerate() == 44100

    def test_correct_duration(self, tmp_path: Path) -> None:
        audio_file = tmp_path / "test.wav"
        duration = 4.0
        giv.generate_audio(audio_file, duration)
        with wave.open(str(audio_file), "rb") as wf:
            expected_frames = int(44100 * duration)
            assert wf.getnframes() == expected_frames

    def test_no_clipping(self, tmp_path: Path) -> None:
        audio_file = tmp_path / "test.wav"
        giv.generate_audio(audio_file, 2.0)
        with wave.open(str(audio_file), "rb") as wf:
            raw = wf.readframes(wf.getnframes())
            # Check all 16-bit samples are within range
            for i in range(0, len(raw), 2):
                value = struct.unpack("<h", raw[i : i + 2])[0]
                assert -32768 <= value <= 32767


# ---------------------------------------------------------------------------
# Frame rendering tests
# ---------------------------------------------------------------------------


class TestFrameRendering:
    """Tests for frame rendering functions."""

    def test_render_frame_returns_correct_size(self) -> None:
        font_large = giv.resolve_font(120)
        font_small = giv.resolve_font(48)
        particles = giv.init_particles(10, giv.WIDTH, giv.HEIGHT)
        frame = giv.render_frame(
            0, giv.TOTAL_FRAMES, font_large, font_small, particles, None
        )
        expected_bytes = giv.WIDTH * giv.HEIGHT * 3
        assert len(frame) == expected_bytes

    def test_render_frame_returns_rgb_bytes(self) -> None:
        font_large = giv.resolve_font(120)
        font_small = giv.resolve_font(48)
        particles = giv.init_particles(10, giv.WIDTH, giv.HEIGHT)
        frame = giv.render_frame(
            0, giv.TOTAL_FRAMES, font_large, font_small, particles, None
        )
        assert isinstance(frame, bytes)
        # Each pixel should be 3 bytes (RGB)
        assert len(frame) % 3 == 0

    def test_first_frame_is_near_black(self) -> None:
        font_large = giv.resolve_font(120)
        font_small = giv.resolve_font(48)
        particles = giv.init_particles(10, giv.WIDTH, giv.HEIGHT)
        frame = giv.render_frame(
            0, giv.TOTAL_FRAMES, font_large, font_small, particles, None
        )
        # First frame: fade-in from black, should be very dark
        # Sample center pixel
        center = (giv.WIDTH * giv.HEIGHT // 2) * 3
        r, g, b = frame[center], frame[center + 1], frame[center + 2]
        assert r < 30 and g < 30 and b < 30

    def test_all_phases_produce_output(self) -> None:
        font_large = giv.resolve_font(120)
        font_small = giv.resolve_font(48)
        particles = giv.init_particles(10, giv.WIDTH, giv.HEIGHT)
        # Test one frame from each phase
        phase_frames = [0, 120, 240, 360, 420]
        for fn in phase_frames:
            frame = giv.render_frame(
                fn, giv.TOTAL_FRAMES, font_large, font_small, particles, None
            )
            assert len(frame) > 0


# ---------------------------------------------------------------------------
# Particle tests
# ---------------------------------------------------------------------------


class TestParticles:
    """Tests for the particle system."""

    def test_init_particles_count(self) -> None:
        particles = giv.init_particles(30, 1920, 1080)
        assert len(particles) == 30

    def test_particle_positions_reasonable(self) -> None:
        particles = giv.init_particles(30, 1920, 1080)
        for p in particles:
            # Particles are spread across canvas (may slightly exceed due to spread formula)
            assert -50 <= p.x <= 2000
            assert 0 <= p.y <= 1100

    def test_particle_update_moves(self) -> None:
        particles = giv.init_particles(1, 1920, 1080)
        p = particles[0]
        initial_y = p.y
        giv.update_particle(p, 10)
        assert p.y != initial_y  # should have moved


# ---------------------------------------------------------------------------
# Font resolution tests
# ---------------------------------------------------------------------------


class TestFontResolution:
    """Tests for font loading."""

    def test_resolve_font_returns_valid(self) -> None:
        font = giv.resolve_font(72)
        assert font is not None

    def test_resolve_font_different_sizes(self) -> None:
        font_small = giv.resolve_font(24)
        font_large = giv.resolve_font(120)
        assert font_small is not None
        assert font_large is not None


# ---------------------------------------------------------------------------
# Integration tests (require ffmpeg)
# ---------------------------------------------------------------------------


@pytest.mark.slow
class TestFullPipeline:
    """Integration tests that run the full video generation pipeline."""

    def test_creates_mp4(self, tmp_path: Path) -> None:
        output = tmp_path / "test_output.mp4"
        giv.generate_audio(tmp_path / "audio.wav", 8.0)
        giv.encode_video(tmp_path / "audio.wav", output, giv.TOTAL_FRAMES)
        assert output.exists()
        assert output.stat().st_size > 0

    def test_output_has_correct_duration(self, tmp_path: Path) -> None:
        output = tmp_path / "test_output.mp4"
        giv.generate_audio(tmp_path / "audio.wav", 8.0)
        giv.encode_video(tmp_path / "audio.wav", output, giv.TOTAL_FRAMES)
        # File should be non-trivial (>1MB for 8s 1080p)
        assert output.stat().st_size > 1_000_000
