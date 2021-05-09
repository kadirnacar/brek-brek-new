package com.brekbrek_app.utils;

import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.os.Bundle;
import android.os.ResultReceiver;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import android.view.KeyEvent;

import androidx.media.VolumeProviderCompat;

import com.brekbrek_app.HelperModule;

import java.util.HashMap;

public class VolumeKeyController {

    private MediaSessionCompat mMediaSession;
    private final Context mContext;

    public VolumeKeyController(Context context) {
        mContext = context;
    }

    private void createMediaSession() {
        mMediaSession = new MediaSessionCompat(mContext, "Tag");

        mMediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS
                | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS | MediaSessionCompat.FLAG_HANDLES_QUEUE_COMMANDS);
        mMediaSession.setPlaybackState(
                new PlaybackStateCompat.Builder().setState(PlaybackStateCompat.STATE_PLAYING, 0, 1.0f).build());
        mMediaSession.setPlaybackToRemote(getVolumeProvider());
        mMediaSession.setActive(true);
    }

    int state = 0;

    private VolumeProviderCompat getVolumeProvider() {
        return new VolumeProviderCompat(VolumeProviderCompat.VOLUME_CONTROL_RELATIVE, 100, 100) {
            @Override
            public void onAdjustVolume(int direction) {
                if (direction == 0) {
                    state = 0;
                    Recorder.stop();
                } else if (direction != state) {
                    state = direction;
                    Recorder.start();
                }
            }
        };
    }

    public void setActive(boolean active) {
        if (mMediaSession != null) {
            mMediaSession.setActive(active);
            return;
        }
        createMediaSession();
    }

    public void destroy() {
        if (mMediaSession != null) {
            mMediaSession.release();
        }
    }
}
