"""Reproduce the synthetic transport WAV; never place this file in reviewer context."""
import math
import struct
import sys
import wave

rate = 16000
samples = []
for frequency in (440.0, 660.0, 330.0):
    for index in range(int(rate * 0.36)):
        envelope = min(1.0, index / (rate * 0.015), (rate * 0.36 - index) / (rate * 0.015))
        samples.append(int(10000 * envelope * math.sin(2 * math.pi * frequency * index / rate)))
    samples.extend([0] * int(rate * 0.14))
with wave.open(sys.argv[1], 'wb') as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(rate)
    output.writeframes(struct.pack('<%dh' % len(samples), *samples))
