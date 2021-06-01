package com.brekbrek_app.utils;

import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.util.Log;

import com.brekbrek_app.HelperModule;
import com.oney.WebRTCModule.ThreadUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class Player {
    private static AudioTrack audioTrack;
    private static Thread playingThread;
    private static final int SAMPLE_RATE = 48000;
    private static final int FRAME_SIZE = 960;
    private static OpusDecoder opusDecoder;
    private static final int NUM_CHANNELS = 1;
    private static int minBufSize;
    private static boolean isPlaying;
    private static boolean isInit = false;

    public static void init() {
        if (isInit == true) {
            return;
        }
        isInit = true;
        isPlaying = false;
        minBufSize = AudioTrack.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT);

        audioTrack = new AudioTrack(AudioManager.STREAM_MUSIC, SAMPLE_RATE, AudioFormat.CHANNEL_OUT_MONO,
                AudioFormat.ENCODING_PCM_16BIT, minBufSize, AudioTrack.MODE_STREAM);

        destination = new ArrayList<>();
        opusDecoder = new OpusDecoder();
        opusDecoder.init(SAMPLE_RATE, NUM_CHANNELS);
    }

    public static void start() {
        if (isPlaying == false) {
            isPlaying = true;
            if (audioTrack != null && audioTrack.getPlayState() == AudioTrack.STATE_INITIALIZED) {
                audioTrack.play();
            }
            playingThread = new Thread(Player::playing, "PlayingThread");
            playingThread.start();
        }
    }

    public static void stop() {
        isPlaying = false;
        if (playingThread != null) {
            playingThread.interrupt();
        }
        if (audioTrack != null) {
            audioTrack.stop();
        }
        if (destination != null) {
            destination.clear();
        }
    }

    static List<byte[]> destination;

    public static void stream(byte[] array) {
        if (destination == null) {
            destination = new ArrayList<>();
        }
        destination.add(array);
    }

    private static void playing() {
        while (isPlaying && audioTrack != null && audioTrack.getPlayState() == AudioTrack.PLAYSTATE_PLAYING) {
            if (destination != null && destination.size() > 0) {
                byte[] data = destination.get(0);
                if (data != null && data.length > 0) {
                    try {
                        short[] outBuf = new short[FRAME_SIZE * 2];
                        int decoded = opusDecoder.decode(data, outBuf, FRAME_SIZE);
                        if (decoded > 0) {
                            audioTrack.write(outBuf, 0, decoded);
                        }
                    } catch (Exception ex) {

                    }
                }
                try {
                    if (destination != null && destination.size() > 0) {
                        destination.remove(0);
                    }
                } catch (Exception ex) {

                }
            }
        }
    }
}

