package com.brekbrek_app.utils;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.util.Log;

import com.brekbrek_app.HelperModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.oney.WebRTCModule.ThreadUtils;
import com.oney.WebRTCModule.WebRTCModule;

import java.nio.ByteBuffer;
import java.util.HashMap;

public class Recorder {
    private static AudioRecord audioRecord;
    private static Thread recordingThread;
    private static int SAMPLE_RATE = 16000;
    private static int FRAME_SIZE = 960;
        private static OpusEncoder opusEncoder;
//    private static SpeexEncoder speexEncoder;
    private static final int NUM_CHANNELS = 1;
    private static boolean isRecording;
    private static int minBufSize;
    private static ReactApplicationContext context;
    private static WebRTCModule rtcModule;
    private static boolean isInit = false;

    public static void init(ReactApplicationContext cntx) {
        if (isInit == true) {
            return;
        }
        isInit = true;
        context = cntx;
        isRecording = false;
//        speexEncoder = new SpeexEncoder(FrequencyBand.ULTRA_WIDE_BAND, 10);
//        FRAME_SIZE = speexEncoder.getFrameSize();
        Log.i("BrekBrek", "init recorder " + SAMPLE_RATE + " : " + FRAME_SIZE);
        minBufSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT);

        audioRecord = new AudioRecord(MediaRecorder.AudioSource.MIC, SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT, minBufSize);

//        NoiseSuppressor ns;
//        AcousticEchoCanceler aec;
//
//        if (NoiseSuppressor.isAvailable()) {
//            ns = NoiseSuppressor.create(audioRecord.getAudioSessionId());
//            if (ns != null) {
//                ns.setEnabled(true);
//            }
//        }
//
//        if (AcousticEchoCanceler.isAvailable()) {
//            aec = AcousticEchoCanceler.create(audioRecord.getAudioSessionId());
//            if (aec != null) {
//                aec.setEnabled(true);
//            }
//        }
        if (rtcModule == null) {
            rtcModule = context.getNativeModule(WebRTCModule.class);
        }
        recordingThread = new Thread(Recorder::recording, "RecordingThread");
        opusEncoder = new OpusEncoder();
        opusEncoder.init(SAMPLE_RATE, NUM_CHANNELS, OpusEncoder.OPUS_APPLICATION_AUDIO);
    }

    public static void start() {
        audioRecord.startRecording();
        if (recordingThread.isAlive()) {
            recordingThread.interrupt();
        }
        recordingThread = new Thread(Recorder::recording, "RecordingThread");

        recordingThread.start();
        isRecording = true;
    }

    public static void stop() {
        if (audioRecord != null) {
            audioRecord.stop();
        }
        if (recordingThread != null) {
            recordingThread.interrupt();
        }
        isRecording = false;
    }

    private static void recording() {
        short[] inBuf = new short[FRAME_SIZE];
        byte[] encBuf = new byte[FRAME_SIZE];

        while (isRecording) {

            int to_read = inBuf.length;
            Log.i("BrekBrek", "recorder.read inBuf " + inBuf.length);
            int offset = 0;
            while (isRecording && to_read > 0 && audioRecord != null) {
                int read = audioRecord.read(inBuf, offset, to_read);

                Log.i("BrekBrek", "recorder.read audio " + read);
                if (read < 0) {
                    HashMap param = new HashMap();
                    param.put("error", "recorder.read() returned error " + read);
                    Log.i("BrekBrek", "recorder.read() returned error " + read);

                    HelperModule.callScript(param);
                    break;
                }
                to_read -= read;
                offset += read;
            }

            if (isRecording) {
                try {
                    Log.i("BrekBrek", "encode start buffer");
                    int encoded = opusEncoder.encode(inBuf, FRAME_SIZE, encBuf);
//                    byte[] enc = speexEncoder.encode(inBuf);
                    Log.i("BrekBrek", String.valueOf(encoded));
//                    Log.i("BrekBrek", String.format("encoded:%d", encoded));
                    if (encoded > 0) {
                        rtcModule.dataChannelSendAllStream(ByteBuffer.wrap(encBuf, 0, encoded));
                    }
                } catch (Exception ex) {
                    Log.i("BrekBrek", ex.getMessage());

                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }
        }
    }
}