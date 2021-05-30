package com.brekbrek_app.utils;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.media.audiofx.AcousticEchoCanceler;
import android.media.audiofx.NoiseSuppressor;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.brekbrek_app.HelperModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.oney.WebRTCModule.WebRTCModule;

import java.nio.ByteBuffer;
import java.util.Arrays;
import java.util.HashMap;

public class Recorder {
    private static AudioRecord audioRecord;
    private static Thread recordingThread;
    private static Thread encodingThread;
    private static final int SAMPLE_RATE = 48000;
    private static int FRAME_SIZE = 960;
    private static OpusEncoder opusEncoder;
    private static final int NUM_CHANNELS = 1;
    private static boolean isRecording;
    private static int minBufSize;
    private static ReactApplicationContext context;

    public static void init(ReactApplicationContext cntx) {
        context = cntx;
        isRecording = false;
        minBufSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT);

        audioRecord = new AudioRecord(MediaRecorder.AudioSource.MIC, SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT, minBufSize);

        NoiseSuppressor ns;
        AcousticEchoCanceler aec;

        if (NoiseSuppressor.isAvailable()) {
            ns = NoiseSuppressor.create(audioRecord.getAudioSessionId());
            if (ns != null) {
                ns.setEnabled(true);
            }
        }

        if (AcousticEchoCanceler.isAvailable()) {
            aec = AcousticEchoCanceler.create(audioRecord.getAudioSessionId());
            if (aec != null) {
                aec.setEnabled(true);
            }
        }

        opusEncoder = new OpusEncoder();
        opusEncoder.init(SAMPLE_RATE, NUM_CHANNELS, OpusEncoder.OPUS_APPLICATION_AUDIO);
    }

    public static void start() {
        audioRecord.startRecording();
        recordingThread = new Thread(Recorder::recording, "RecordingThread");
        recordingThread.start();
        isRecording = true;

        HashMap param = new HashMap();
        param.put("type", "record");
        param.put("status", 1);
        HelperModule.callScript(param);
    }

    public static void stop() {
        if (audioRecord != null) {
            audioRecord.stop();
        }
        if (recordingThread != null) {
            recordingThread.interrupt();
        }
        recordingThread = null;

        if (isRecording) {
            HashMap param = new HashMap();
            param.put("type", "record");
            param.put("status", 0);
            HelperModule.callScript(param);
        }
        isRecording = false;
        System.gc();
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private static void recording() {
        byte[] inBuf = new byte[FRAME_SIZE * NUM_CHANNELS * 2];
        byte[] encBuf = new byte[FRAME_SIZE];

        while (isRecording) {

            int to_read = inBuf.length;
            int offset = 0;
            while (isRecording && to_read > 0 && audioRecord != null) {
                int read = audioRecord.read(inBuf, offset, to_read);
                if (read < 0) {
                    HashMap param = new HashMap();
                    param.put("error", "recorder.read() returned error " + read);
                    HelperModule.callScript(param);
                    break;
                }
                to_read -= read;
                offset += read;
            }

            if (isRecording) {
                try {
                    int encoded = opusEncoder.encode(inBuf, FRAME_SIZE, encBuf);
                    if (encoded > 0) {
                        byte[] data = Arrays.copyOf(encBuf, encoded);
                        context.getNativeModule(WebRTCModule.class).dataChannelSendAllStream(data);
                    }

                } catch (Exception ex) {
                } catch (Throwable throwable) {
                    throwable.printStackTrace();
                }
            }
        }
    }
}