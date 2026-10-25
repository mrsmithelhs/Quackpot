/**
 * @file bundled-synth.js
 * Reproducibly compiled from src/audio/synth.mjs
 * Git Revision: 042f120
 * Source SHA-256: 98572e98263e750ba632988b6f768fefcfa5eb52487a7f0c57a849912d24c22d
 * Generated: 2026-10-25T22:09:15.499Z
 *
 * DO NOT EDIT DIRECTLY. Re-generate via:
 * node reports/development/plan-18-audio-sources-and-credits/build-audition.mjs
 */
var DuckSynth = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	// src/audio/synth.mjs
	/**
	* @file synth.mjs
	* Zero-dependency Web Audio synthesizer for text-stored sound parameters.
	* Implements the three quack audition candidates per Plan 04 refinement conditions:
	* - QUACK_A_CONTROL (Baseline unchanged control)
	* - QUACK_B_SYNTH_ADSR (Parameter-only articulated revision)
	* - QUACK_C_FORMANT_NOISE (Small source-filter graph with parallel formants & breath noise)
	*/
	var QUACK_A_CONTROL = Object.freeze({
		id: "QUACK_A_CONTROL",
		name: "Candidate A: Baseline Control",
		treatment: "control",
		waveform: "sawtooth",
		frequency: 340,
		pitchBend: -140,
		attack: .02,
		decay: .12,
		sustain: .05,
		release: .08,
		modulationFreq: 22,
		modulationDepth: 35,
		gain: .15
	});
	var QUACK_SHORT = QUACK_A_CONTROL;
	var QUACK_B_SYNTH_ADSR = Object.freeze({
		id: "QUACK_B_SYNTH_ADSR",
		name: "Candidate B: Articulated ADSR",
		treatment: "param_only",
		waveform: "sawtooth",
		frequency: 380,
		pitchBend: -40,
		attack: .005,
		decay: .06,
		sustain: .15,
		release: .04,
		modulationFreq: 0,
		modulationDepth: 0,
		gain: .14
	});
	var QUACK_C_FORMANT_NOISE = Object.freeze({
		id: "QUACK_C_FORMANT_NOISE",
		name: "Candidate C: Source-Filter Formant & Breath",
		treatment: "source_filter",
		waveform: "sawtooth",
		frequency: 300,
		pitchBend: -30,
		attack: .01,
		decay: .08,
		sustain: .05,
		release: .06,
		formant1Freq: 750,
		formant1Q: 3,
		formant1Gain: .85,
		formant2Freq: 1600,
		formant2Q: 3.5,
		formant2Gain: .65,
		noiseDuration: .015,
		noiseGain: .12,
		gain: .15
	});
	var QUACK_CANDIDATES = Object.freeze({
		QUACK_A_CONTROL,
		QUACK_B_SYNTH_ADSR,
		QUACK_C_FORMANT_NOISE
	});
	var VALID_WAVEFORMS = Object.freeze([
		"sawtooth",
		"triangle",
		"sine",
		"square"
	]);
	var VALID_TREATMENTS = Object.freeze([
		"control",
		"param_only",
		"source_filter"
	]);
	/**
	* Validates audio parameters against safe, conservative, finite quack-scale ranges.
	* Throws explicit descriptive Error on any non-finite, missing, or out-of-range value.
	*
	* Parameter bounds (tailored for short cartoon quack synthesis):
	* - waveform: 'sawtooth' | 'triangle' | 'sine' | 'square'
	* - frequency: 20 Hz to 4000 Hz
	* - pitchBend: -2000 Hz to 2000 Hz (and frequency + pitchBend >= 20 Hz)
	* - attack: 0.001s to 0.5s
	* - decay: 0.001s to 1.0s
	* - sustain: 0.0 to 1.0 (ratio)
	* - release: 0.001s to 1.0s
	* - total duration (attack + decay + release): <= 2.0s
	* - gain: > 0 to 1.0 (AudioParam master gain coefficient)
	* - modulationFreq: 0 to 100 Hz
	* - modulationDepth: 0 to 500 Hz
	* - formant1Freq: 50 to 3000 Hz
	* - formant1Q: 0.1 to 20.0
	* - formant1Gain: 0.0 to 2.0
	* - formant2Freq: 100 to 6000 Hz
	* - formant2Q: 0.1 to 20.0
	* - formant2Gain: 0.0 to 2.0
	* - noiseDuration: 0.001s to 0.2s
	* - noiseGain: 0.0 to 1.0
	*
	* @param {Object} params 
	* @returns {Object} validated params
	*/
	function validateSoundParams(params = {}) {
		if (!params || typeof params !== "object") throw new TypeError("Sound params must be a non-null object");
		const treatment = params.treatment || (params.formant1Freq !== void 0 ? "source_filter" : "control");
		if (!VALID_TREATMENTS.includes(treatment)) throw new Error(`Invalid treatment "${treatment}". Supported: ${VALID_TREATMENTS.join(", ")}`);
		const waveform = params.waveform || "sawtooth";
		if (!VALID_WAVEFORMS.includes(waveform)) throw new Error(`Invalid waveform "${waveform}". Supported: ${VALID_WAVEFORMS.join(", ")}`);
		const frequency = Number(params.frequency ?? 340);
		if (!Number.isFinite(frequency) || frequency < 20 || frequency > 4e3) throw new RangeError(`Invalid frequency "${params.frequency}". Must be a finite number between 20 and 4000 Hz.`);
		const pitchBend = Number(params.pitchBend ?? 0);
		if (!Number.isFinite(pitchBend) || pitchBend < -2e3 || pitchBend > 2e3) throw new RangeError(`Invalid pitchBend "${params.pitchBend}". Must be a finite number between -2000 and 2000 Hz.`);
		if (frequency + pitchBend < 20) throw new RangeError(`Invalid ending frequency (${frequency + pitchBend} Hz). Must end at >= 20 Hz.`);
		const attack = Number(params.attack ?? .02);
		if (!Number.isFinite(attack) || attack < .001 || attack > .5) throw new RangeError(`Invalid attack "${params.attack}". Must be a finite number between 0.001 and 0.5 seconds.`);
		const decay = Number(params.decay ?? .12);
		if (!Number.isFinite(decay) || decay < .001 || decay > 1) throw new RangeError(`Invalid decay "${params.decay}". Must be a finite number between 0.001 and 1.0 seconds.`);
		const sustain = Number(params.sustain ?? .05);
		if (!Number.isFinite(sustain) || sustain < 0 || sustain > 1) throw new RangeError(`Invalid sustain "${params.sustain}". Must be a finite ratio between 0.0 and 1.0.`);
		const release = Number(params.release ?? .08);
		if (!Number.isFinite(release) || release < .001 || release > 1) throw new RangeError(`Invalid release "${params.release}". Must be a finite number between 0.001 and 1.0 seconds.`);
		const totalDuration = attack + decay + release;
		if (totalDuration > 2) throw new RangeError(`Total duration (${totalDuration.toFixed(3)}s) exceeds conservative quack limit of 2.0s.`);
		const gain = Number(params.gain ?? .15);
		if (!Number.isFinite(gain) || gain <= 0 || gain > 1) throw new RangeError(`Invalid gain "${params.gain}". Must be a finite number between 0.001 and 1.0.`);
		const modulationFreq = Number(params.modulationFreq ?? 0);
		if (!Number.isFinite(modulationFreq) || modulationFreq < 0 || modulationFreq > 100) throw new RangeError(`Invalid modulationFreq "${params.modulationFreq}". Must be a finite number between 0 and 100 Hz.`);
		const modulationDepth = Number(params.modulationDepth ?? 0);
		if (!Number.isFinite(modulationDepth) || modulationDepth < 0 || modulationDepth > 500) throw new RangeError(`Invalid modulationDepth "${params.modulationDepth}". Must be a finite number between 0 and 500 Hz.`);
		const formant1Freq = Number(params.formant1Freq ?? 750);
		if (!Number.isFinite(formant1Freq) || formant1Freq < 50 || formant1Freq > 3e3) throw new RangeError(`Invalid formant1Freq "${params.formant1Freq}". Must be a finite number between 50 and 3000 Hz.`);
		const formant1Q = Number(params.formant1Q ?? 3);
		if (!Number.isFinite(formant1Q) || formant1Q < .1 || formant1Q > 20) throw new RangeError(`Invalid formant1Q "${params.formant1Q}". Must be a finite number between 0.1 and 20.0.`);
		const formant1Gain = Number(params.formant1Gain ?? .85);
		if (!Number.isFinite(formant1Gain) || formant1Gain < 0 || formant1Gain > 2) throw new RangeError(`Invalid formant1Gain "${params.formant1Gain}". Must be a finite number between 0.0 and 2.0.`);
		const formant2Freq = Number(params.formant2Freq ?? 1600);
		if (!Number.isFinite(formant2Freq) || formant2Freq < 100 || formant2Freq > 6e3) throw new RangeError(`Invalid formant2Freq "${params.formant2Freq}". Must be a finite number between 100 and 6000 Hz.`);
		const formant2Q = Number(params.formant2Q ?? 3.5);
		if (!Number.isFinite(formant2Q) || formant2Q < .1 || formant2Q > 20) throw new RangeError(`Invalid formant2Q "${params.formant2Q}". Must be a finite number between 0.1 and 20.0.`);
		const formant2Gain = Number(params.formant2Gain ?? .65);
		if (!Number.isFinite(formant2Gain) || formant2Gain < 0 || formant2Gain > 2) throw new RangeError(`Invalid formant2Gain "${params.formant2Gain}". Must be a finite number between 0.0 and 2.0.`);
		const noiseDuration = Number(params.noiseDuration ?? .015);
		if (!Number.isFinite(noiseDuration) || noiseDuration < .001 || noiseDuration > .2) throw new RangeError(`Invalid noiseDuration "${params.noiseDuration}". Must be a finite number between 0.001 and 0.2 seconds.`);
		const noiseGain = Number(params.noiseGain ?? .12);
		if (!Number.isFinite(noiseGain) || noiseGain < 0 || noiseGain > 1) throw new RangeError(`Invalid noiseGain "${params.noiseGain}". Must be a finite number between 0.0 and 1.0.`);
		return {
			id: params.id || params.name || "CUSTOM_SOUND",
			name: params.name || "CUSTOM_SOUND",
			treatment,
			waveform,
			frequency,
			pitchBend,
			attack,
			decay,
			sustain,
			release,
			modulationFreq,
			modulationDepth,
			gain,
			formant1Freq,
			formant1Q,
			formant1Gain,
			formant2Freq,
			formant2Q,
			formant2Gain,
			noiseDuration,
			noiseGain
		};
	}
	/**
	* Generates an AudioBuffer containing deterministic pseudo-random white noise.
	* Strictly bounds duration (0.001 to 0.5s) and sample rate to avoid unbounded allocations.
	* Uses an isolated linear congruential generator (LCG) seed to ensure 100% reproducible
	* audition noise completely decoupled from game simulation PRNG.
	* @param {AudioContext} ctx
	* @param {number} durationSeconds
	* @param {number} [seed=12345]
	* @returns {AudioBuffer|null}
	*/
	function createDeterministicNoiseBuffer(ctx, durationSeconds, seed = 12345) {
		if (!ctx || typeof ctx.createBuffer !== "function") return null;
		if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds) || durationSeconds < .001 || durationSeconds > .5) throw new RangeError(`Invalid noise duration ${durationSeconds}. Must be a finite number between 0.001 and 0.5 seconds.`);
		const sampleRate = ctx.sampleRate || 44100;
		if (typeof sampleRate !== "number" || !Number.isFinite(sampleRate) || sampleRate <= 0 || sampleRate > 192e3) throw new RangeError(`Invalid sampleRate ${sampleRate}. Must be a positive finite number <= 192000.`);
		if (seed !== void 0 && (typeof seed !== "number" || !Number.isFinite(seed) || seed < 0)) throw new TypeError("Seed must be a non-negative finite number");
		const length = Math.max(1, Math.floor(sampleRate * durationSeconds));
		const buffer = ctx.createBuffer(1, length, sampleRate);
		const channelData = buffer.getChannelData(0);
		let state = Math.floor(seed);
		for (let i = 0; i < length; i++) {
			state = (state * 1664525 + 1013904223) % 4294967296;
			channelData[i] = state / 4294967296 * 2 - 1;
		}
		return buffer;
	}
	/**
	* Calculates total sound duration from ADSR parameters.
	* @param {Object} params 
	* @returns {number} duration in seconds
	*/
	function calculateDuration(params) {
		const p = validateSoundParams(params);
		return p.attack + p.decay + p.release;
	}
	var activeContext = null;
	/**
	* Safely obtains or resumes an AudioContext under a user gesture.
	* Returns null if Web Audio is unsupported (silent fallback).
	* @param {Object} [customAudioContextClass] Optional injectable constructor for testing
	* @returns {AudioContext|null}
	*/
	function getOrCreateAudioContext(customAudioContextClass) {
		const ContextClass = customAudioContextClass || (typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null);
		if (!ContextClass) return null;
		try {
			if (!activeContext || activeContext.state === "closed") activeContext = new ContextClass();
			return activeContext;
		} catch (err) {
			return null;
		}
	}
	/**
	* Resets the active audio context (useful for test isolation).
	*/
	function resetAudioContextForTesting() {
		if (activeContext) {
			try {
				if (typeof activeContext.close === "function") activeContext.close();
			} catch (_) {}
			activeContext = null;
		}
	}
	/**
	* Plays a synthesized sound from text parameters.
	* Supports Candidate A (control), Candidate B (parameter-only), and Candidate C (source-filter).
	* @param {Object} [rawParams=QUACK_SHORT] 
	* @param {Object} [options={}] Options including optional injectable audio context for tests
	* @returns {Promise<{ played: boolean, reason?: string, duration?: number, candidateId?: string }>}
	*/
	async function playSynthesizedSound(rawParams = QUACK_SHORT, options = {}) {
		const params = validateSoundParams(rawParams);
		const ctx = options.audioContext || getOrCreateAudioContext(options.AudioContextClass);
		if (!ctx) return {
			played: false,
			reason: "audio_context_unsupported",
			fallback: "silent"
		};
		try {
			if (ctx.state === "suspended" && typeof ctx.resume === "function") await ctx.resume();
			if (ctx.state !== "running") return {
				played: false,
				reason: "audio_context_suspended",
				fallback: "silent"
			};
			const now = ctx.currentTime;
			const { treatment, attack, decay, sustain, release, frequency, pitchBend, gain, modulationFreq, modulationDepth, formant1Freq, formant1Q, formant1Gain, formant2Freq, formant2Q, formant2Gain, noiseDuration, noiseGain } = params;
			const totalDuration = attack + decay + release;
			const masterGain = ctx.createGain();
			masterGain.gain.setValueAtTime(1e-4, now);
			masterGain.gain.linearRampToValueAtTime(gain, now + attack);
			masterGain.gain.linearRampToValueAtTime(gain * sustain, now + attack + decay);
			masterGain.gain.exponentialRampToValueAtTime(1e-4, now + totalDuration);
			masterGain.connect(ctx.destination);
			const carrier = ctx.createOscillator();
			carrier.type = params.waveform;
			carrier.frequency.setValueAtTime(frequency, now);
			carrier.frequency.linearRampToValueAtTime(Math.max(20, frequency + pitchBend), now + totalDuration);
			if (treatment === "source_filter") {
				const sumBus = ctx.createGain();
				sumBus.gain.setValueAtTime(1, now);
				carrier.connect(sumBus);
				const noiseBuffer = createDeterministicNoiseBuffer(ctx, noiseDuration, 42424);
				if (noiseBuffer && typeof ctx.createBufferSource === "function") {
					const noiseSource = ctx.createBufferSource();
					noiseSource.buffer = noiseBuffer;
					const noiseGainNode = ctx.createGain();
					noiseGainNode.gain.setValueAtTime(noiseGain, now);
					noiseGainNode.gain.linearRampToValueAtTime(1e-4, now + noiseDuration);
					noiseSource.connect(noiseGainNode);
					noiseGainNode.connect(sumBus);
					noiseSource.start(now);
					noiseSource.stop(now + noiseDuration + .01);
				}
				if (typeof ctx.createBiquadFilter === "function") {
					const f1 = ctx.createBiquadFilter();
					f1.type = "bandpass";
					f1.frequency.setValueAtTime(formant1Freq, now);
					f1.Q.setValueAtTime(formant1Q, now);
					const f1Gain = ctx.createGain();
					f1Gain.gain.setValueAtTime(formant1Gain, now);
					sumBus.connect(f1);
					f1.connect(f1Gain);
					f1Gain.connect(masterGain);
					const f2 = ctx.createBiquadFilter();
					f2.type = "bandpass";
					f2.frequency.setValueAtTime(formant2Freq, now);
					f2.Q.setValueAtTime(formant2Q, now);
					const f2Gain = ctx.createGain();
					f2Gain.gain.setValueAtTime(formant2Gain, now);
					sumBus.connect(f2);
					f2.connect(f2Gain);
					f2Gain.connect(masterGain);
				} else sumBus.connect(masterGain);
			} else {
				let modulator = null;
				if (modulationFreq > 0 && modulationDepth > 0) {
					modulator = ctx.createOscillator();
					modulator.type = "sine";
					modulator.frequency.setValueAtTime(modulationFreq, now);
					const modGain = ctx.createGain();
					modGain.gain.setValueAtTime(modulationDepth, now);
					modGain.gain.linearRampToValueAtTime(modulationDepth * .2, now + totalDuration);
					modulator.connect(modGain);
					modGain.connect(carrier.frequency);
					modulator.start(now);
					modulator.stop(now + totalDuration + .05);
				}
				carrier.connect(masterGain);
			}
			carrier.start(now);
			carrier.stop(now + totalDuration + .05);
			return {
				played: true,
				candidateId: params.id || params.name,
				name: params.name,
				duration: totalDuration,
				gain: params.gain,
				treatment: params.treatment
			};
		} catch (err) {
			return {
				played: false,
				reason: "playback_error",
				error: err.message,
				fallback: "silent"
			};
		}
	}
	exports.QUACK_A_CONTROL = QUACK_A_CONTROL;
	exports.QUACK_B_SYNTH_ADSR = QUACK_B_SYNTH_ADSR;
	exports.QUACK_CANDIDATES = QUACK_CANDIDATES;
	exports.QUACK_C_FORMANT_NOISE = QUACK_C_FORMANT_NOISE;
	exports.QUACK_SHORT = QUACK_SHORT;
	exports.calculateDuration = calculateDuration;
	exports.createDeterministicNoiseBuffer = createDeterministicNoiseBuffer;
	exports.getOrCreateAudioContext = getOrCreateAudioContext;
	exports.playSynthesizedSound = playSynthesizedSound;
	exports.resetAudioContextForTesting = resetAudioContextForTesting;
	exports.validateSoundParams = validateSoundParams;
	return exports;
})({});
