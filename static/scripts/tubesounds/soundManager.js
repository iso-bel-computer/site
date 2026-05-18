
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
            'waterloo-city':   ["C4", "E4", "G4"],
            'hammersmith-city':["D4", "F#4", "A5"],
            'metropolitan':    ["E5", "G#5", "B5"],
            'central':         ["F#5", "A#5", "C#5"],
            'district':        ["G#5", "C5", "D#5"],
            'circle':          ["A#5", "D5", "F5"],
            'bakerloo':        ["C6", "E6", "G6"],
            'northern':        ["D6", "F#6", "A6"],
            'victoria':        ["E6", "G#6", "B6"],
            'jubilee':         ["F#6", "A#6", "C#6"],
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
            'waterloo-city': "C4",
            'hammersmith-city': "D4",
            'metropolitan': "E4",
            'central': "F#4",
            'district': "G#4",
            'circle': "A#5",
            'bakerloo': "C5",
            'northern': "D5",
            'victoria': "E5",
            'jubilee': "F#5",
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

        // this.kickLoop = new Tone.Loop((time) => {
        //     this.kick.triggerAttackRelease("C1", "8n", time);
        // }, "4n").start(0);

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
