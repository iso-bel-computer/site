
export class soundManager {
    constructor() {
        this.init = false;
        this.lastBPM = 30
        this.kickLoop = null
        this.loopVelocity = 0.3
        this.stationAudioData = stationData // passed from backend by tag on html

        this.chorus = new Tone.Chorus({
            frequency: 3,
            delayTime: 2.5,
            depth: 0.7,
            wet: 0
        }).start();

        this.reverb = new Tone.Reverb({
            decay: 10,      // very long tail
            preDelay: 0.1,  // gap before reflections start, adds sense of distance
            wet: 0
        });

        this.tunnelDelay = new Tone.FeedbackDelay({
            delayTime: 0.08,   // short delay, like reflections off close walls
            feedback: 0.4,     // how much feeds back
            wet: 0
        });

        this.chorus.connect(this.tunnelDelay);
        this.tunnelDelay.connect(this.reverb)
        this.reverb.connect(Tone.Destination);

        this.plopConfig = {
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
        };

        this.lfo = new Tone.LFO({
            frequency: "1n",
            min: 0.8,
            max: 1
        }).connect(this.reverb.wet);

        this.lfo.start();

        this.lines = ['waterloo-city', 'hammersmith-city', 'metropolitan', 'central',
                    'district', 'circle', 'bakerloo', 'northern', 'victoria', 'jubilee'];

        this.arrivalSynths = {};
        this.arrivalPanners = {};
        this.lines.forEach(line => {
            const synth = new Tone.PolySynth(Tone.Synth, this.plopConfig);
            this.arrivalPanners[line] = new Tone.Panner(0).connect(this.reverb); // panner → reverb
            synth.connect(this.arrivalPanners[line]); // synth → panner
            this.arrivalSynths[line] = synth;
        });

        this.startLoop();
    }
    playArrivalSynth(line, station) {
        if (!this.init) return;

        const lineChords = {
            'waterloo-city':   ["C3", "E3", "G3"],
            'hammersmith-city':["D3", "F#3", "A3"],
            'metropolitan':    ["E3", "G#3", "B3"],
            'central':         ["F#3", "A#3", "C#4"],
            'district':        ["G#3", "C4", "D#4"],
            'circle':          ["A#3", "D4", "F4"],
            'bakerloo':        ["C4", "E4", "G4"],
            'northern':        ["D4", "F#4", "A4"],
            'victoria':        ["E4", "G#4", "B4"],
            'jubilee':         ["F#4", "A#4", "C#5"],
        };

        const synth = this.arrivalSynths[line];
        const chord = lineChords[line];
        let pan = this.stationAudioData[station]?.pan
        if (pan === undefined) {pan = 1}
        const normalizedPan = (parseFloat(pan) / 50) - 1;
        if (!synth || !chord) return;

        this.arrivalPanners[line].pan.value = normalizedPan;
        synth.volume.value = -16 + Math.random() * 6;
        synth.triggerAttackRelease(chord, "4n", Tone.Transport.nextSubdivision("16n") + 0.05, 0.5);
    }
    playDepartureSynth(line) {

        if (!this.init) return;

        const lineNotes = {
            'waterloo-city': "C2",
            'hammersmith-city': "D2",
            'metropolitan': "E2",
            'central': "F#2",
            'district': "G#2",
            'circle': "A#3",
            'bakerloo': "C3",
            'northern': "D3",
            'victoria': "E3",
            'jubilee': "F#3",
        };

        const synth = this.arrivalSynths[line];
        const note = lineNotes[line];
        if (!synth || !note) return;

        synth.volume.value = -8 + Math.random() * 4;
        synth.triggerAttackRelease(note, "12n", Tone.Transport.nextSubdivision("16n") + 0.05, 0.5);

    }

    startLoop() {
        if (this.kickLoop) return; // prevent duplicates



        this.kick = new Tone.MembraneSynth({
            pitchDecay: 0.02,   // shorter = punchier
            octaves: 6,         // strong pitch drop
            oscillator: { type: "sine" },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0,
                release: 0.1
            }
        })

        this.kickdistortion = new Tone.Distortion(0.4);
        this.kickcompressor = new Tone.Compressor({
            threshold: -10,
            ratio: 4,
            attack: 0.01,
            release: 0.2
        });

        this.kick.chain(this.kickdistortion, this.kickcompressor, Tone.Destination);

        this.kickLoop = new Tone.Loop((time) => {
            this.kick.triggerAttackRelease("C1", "8n", time);
        }, "4n").start(0);

        this.transport = Tone.getTransport();
        if (this.transport.state !== "started") {
            this.transport.start();
        }
        this.transport.bpm.rampTo(130, 1);
    }

    updateBPM(bpm) {

        const maxBPM = 150
        const minBPM = 80
        if (bpm < minBPM) {bpm = minBPM}
        if (bpm > maxBPM) {bpm = maxBPM}

        if (bpm < this.lastBPM) {bpm = (this.lastBPM + bpm) / 2}

        this.transport.bpm.rampTo(bpm, 10);


    }

    updateKickDrive(drive) {

        const trainsForMaxDrive = 150
        const normalized = Math.min(
            Math.max(drive / trainsForMaxDrive, 0),
            1
        );
        // Map BPM to velocity (0.3 → 1)
        this.loopVelocity = 0.1 + (normalized * 0.7);
    }
}
