
export class soundManager {
    constructor() {
        this.init = false;
        this.lastBPM = 30

        const chorus = new Tone.Chorus({
            frequency: 3,
            delayTime: 2.5,
            depth: 0.7,
            wet: 0.5
        }).start();

        const reverb = new Tone.Reverb({
            decay: 10,      // very long tail
            preDelay: 0.1,  // gap before reflections start, adds sense of distance
            wet: 0.6
        });

        const tunnelDelay = new Tone.FeedbackDelay({
            delayTime: 0.08,   // short delay, like reflections off close walls
            feedback: 0.4,     // how much feeds back
            wet: 0.3
        });

        chorus.connect(tunnelDelay);
        tunnelDelay.connect(reverb)
        reverb.connect(Tone.Destination);

        const plopConfig = {
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
        };

        const lfo = new Tone.LFO({
            frequency: "16n",
            min: 0.8,
            max: 1
        }).connect(reverb.wet);

        lfo.start();

        const lines = ['waterloo-city', 'hammersmith-city', 'metropolitan', 'central',
                    'district', 'circle', 'bakerloo', 'northern', 'victoria', 'jubilee'];

        this.arrivalSynths = {};
        lines.forEach(line => {
            const synth = new Tone.PolySynth(Tone.Synth, plopConfig);
            synth.connect(chorus); // each synth feeds into the shared effects chain
            this.arrivalSynths[line] = synth;
        });

        this.startLoop();
    }
    playArrivalSynth(line) {
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
        if (!synth || !chord) return;

        synth.volume.value = -16 + Math.random() * 6;
        synth.triggerAttackRelease(chord, "4n", Tone.Transport.nextSubdivision("16n"));
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
        synth.triggerAttackRelease(note, "12n", Tone.Transport.nextSubdivision("16n"));

    }

    startLoop() {

        console.log('playing loop')

        // create two monophonic synths
        const synthA = new Tone.FMSynth({
            harmonicity: 1.5,
            modulationIndex: 10,
            oscillator: { type: "sine" },
            envelope: {
                attack: 0.01,
                decay: 0.2,
                sustain: 0.4,
                release: 0.8
            },
            modulation: { type: "square" },
            modulationEnvelope: {
                attack: 0.01,
                decay: 0.2,
                sustain: 0.2,
                release: 0.8
            }
        });

        const synthB = new Tone.AMSynth({
            harmonicity: 2,
            oscillator: { type: "sawtooth" },
            envelope: {
                attack: 0.005,
                decay: 0.1,
                sustain: 0.3,
                release: 0.5
            }
        });
        const filter = new Tone.Filter(400, "lowpass");
        const reverb = new Tone.Reverb({
            decay: 15,
            wet: 0.3
        });

        Tone.Transport.scheduleRepeat((time) => {
            filter.frequency.rampTo(
                Math.random() * 800 + 200,
                2
            );
        }, "2n");

        synthA.chain(filter, reverb, Tone.Destination);
        synthB.chain(filter, reverb, Tone.Destination);

        //play a note every quarter-note
        const loopA = new Tone.Loop((time) => {
            synthA.triggerAttackRelease("C1", "8n", time);
        }, "4n").start(0);
        //play another note every off quarter-note, by starting it "8n"
        const loopB = new Tone.Loop((time) => {
            synthB.triggerAttackRelease("E1", "8n", time);
        }, "4n").start("8n");
        const loopC = new Tone.Loop((time) => {
            synthB.triggerAttackRelease("G1", "8n", time);
        }, "4n").start("16n");

        // all loops start when the Transport is started
        Tone.getTransport().start();
    }

    updateLoopBPM(bpm) {

        const maxBPM = 180
        const minBPM = 30
        if (bpm < minBPM) {bpm = minBPM}
        if (bpm > maxBPM) {bpm = maxBPM}

        if (bpm < this.lastBPM) {bpm = (this.lastBPM + bpm) / 2}

        console.log(bpm)

        Tone.getTransport().bpm.rampTo(bpm, 1);

    }
}
