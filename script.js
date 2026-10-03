const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

const micButton =
    document.getElementById("micButton");

const copyButton =
    document.getElementById("copyButton");

const clearButton =
    document.getElementById("clearButton");

const visualizer =
    document.getElementById("visualizer");

const status =
    document.getElementById("status");

const finalText =
    document.getElementById("finalText");

const interimText =
    document.getElementById("interimText");

const textBox =
    document.getElementById("textBox");

const language =
    document.getElementById("language");

const browserMessage =
    document.getElementById("browserMessage");

let recognition = null;
let recording = false;
let shouldRestart = false;
let transcript = "";

if (!SpeechRecognition) {

    status.textContent = "NOT SUPPORTED";

    browserMessage.textContent =
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.";

    micButton.disabled = true;

} else {

    recognition = new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = language.value;

    recognition.maxAlternatives = 1;

    recognition.onstart = function () {

        recording = true;

        status.textContent = "LISTENING";

        visualizer.classList.add("active");

        micButton.classList.add("recording");

        micButton.setAttribute(
            "aria-label",
            "Stop recording"
        );

        if (
            finalText.textContent.trim() ===
            "Tap the microphone to start transcribing..."
        ) {
            finalText.textContent = "";
        }
    };

    recognition.onresult = function (event) {

        let currentInterim = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const result =
                event.results[i];

            const text =
                result[0].transcript;

            if (result.isFinal) {

                transcript += text + " ";

            } else {

                currentInterim += text;

            }
        }

        finalText.textContent =
            transcript;

        interimText.textContent =
            currentInterim;

        textBox.scrollTop =
            textBox.scrollHeight;
    };

    recognition.onerror = function (event) {

        if (event.error === "not-allowed") {

            status.textContent =
                "MICROPHONE BLOCKED";

            browserMessage.textContent =
                "Microphone permission is blocked. Allow microphone access from your browser settings.";

            recording = false;

            shouldRestart = false;

        } else if (
            event.error === "service-not-allowed"
        ) {

            status.textContent =
                "SERVICE BLOCKED";

            browserMessage.textContent =
                "Speech recognition service is blocked by this browser.";

            recording = false;

            shouldRestart = false;

        } else if (
            event.error === "audio-capture"
        ) {

            status.textContent =
                "MIC NOT FOUND";

            browserMessage.textContent =
                "No microphone was detected.";

            recording = false;

            shouldRestart = false;

        } else if (
            event.error === "network"
        ) {

            status.textContent =
                "NETWORK ERROR";

            browserMessage.textContent =
                "Speech recognition needs an available network connection.";

        } else if (
            event.error === "no-speech"
        ) {

            status.textContent =
                "NO SPEECH";

        } else {

            status.textContent =
                "ERROR";
        }

        updateUI();
    };

    recognition.onend = function () {

        visualizer.classList.remove("active");

        if (
            shouldRestart &&
            recording
        ) {

            setTimeout(function () {

                try {

                    recognition.start();

                } catch (error) {

                    console.log(error);

                }

            }, 300);

        } else {

            recording = false;

            updateUI();

        }
    };
}

function updateUI() {

    if (recording) {

        micButton.classList.add("recording");

        visualizer.classList.add("active");

        micButton.setAttribute(
            "aria-label",
            "Stop recording"
        );

    } else {

        micButton.classList.remove("recording");

        visualizer.classList.remove("active");

        micButton.setAttribute(
            "aria-label",
            "Start recording"
        );
    }
}

function startRecording() {

    if (!recognition) {
        return;
    }

    recognition.lang =
        language.value;

    recording = true;

    shouldRestart = true;

    browserMessage.textContent = "";

    status.textContent =
        "STARTING";

    updateUI();

    try {

        recognition.start();

    } catch (error) {

        console.log(error);

    }
}

function stopRecording() {

    recording = false;

    shouldRestart = false;

    updateUI();

    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {

            console.log(error);

        }
    }

    status.textContent =
        "READY";
}

micButton.addEventListener(
    "click",
    function () {

        if (recording) {

            stopRecording();

        } else {

            startRecording();

        }
    }
);

copyButton.addEventListener(
    "click",
    async function () {

        const text =
            transcript.trim();

        if (!text) {

            status.textContent =
                "NOTHING TO COPY";

            setTimeout(
                function () {

                    if (!recording) {

                        status.textContent =
                            "READY";

                    }

                },
                1500
            );

            return;
        }

        try {

            if (
                navigator.clipboard &&
                window.isSecureContext
            ) {

                await navigator.clipboard
                    .writeText(text);

            } else {

                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.value =
                    text;

                textarea.style.position =
                    "fixed";

                textarea.style.left =
                    "-9999px";

                document.body.appendChild(
                    textarea
                );

                textarea.focus();

                textarea.select();

                document.execCommand(
                    "copy"
                );

                textarea.remove();
            }

            status.textContent =
                "COPIED";

            setTimeout(
                function () {

                    if (!recording) {

                        status.textContent =
                            "READY";

                    }

                },
                1500
            );

        } catch (error) {

            status.textContent =
                "COPY FAILED";

        }
    }
);

clearButton.addEventListener(
    "click",
    function () {

        transcript = "";

        finalText.textContent = "";

        interimText.textContent = "";

        textBox.scrollTop = 0;

        status.textContent =
            "CLEARED";

        setTimeout(
            function () {

                if (!recording) {

                    finalText.textContent =
                        "Tap the microphone to start transcribing...";

                    status.textContent =
                        "READY";

                }

            },
            800
        );
    }
);

language.addEventListener(
    "change",
    function () {

        if (!recognition) {
            return;
        }

        const wasRecording =
            recording;

        if (wasRecording) {

            stopRecording();

        }

        recognition.lang =
            language.value;

        if (wasRecording) {

            setTimeout(
                function () {

                    startRecording();

                },
                400
            );
        }
    }
);

if (SpeechRecognition) {

    status.textContent =
        "READY";

}

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.hidden &&
            recording
        ) {

            stopRecording();

        }
    }
);