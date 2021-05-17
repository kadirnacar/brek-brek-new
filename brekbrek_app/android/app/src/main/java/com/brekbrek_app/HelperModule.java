package com.brekbrek_app;

import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;

import androidx.annotation.NonNull;

import com.brekbrek_app.utils.Recorder;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeMap;

import org.webrtc.IceCandidate;
import org.webrtc.SessionDescription;

import java.util.HashMap;

public class HelperModule extends ReactContextBaseJavaModule {
    HelperModule(ReactApplicationContext context) {
        super(context);
        HelperModule.context = context;
        HelperModule.peers = new HashMap<String, RtcClient>();
    }

    public static ReactApplicationContext context;
    private static JavaJsModule jsModule;
    private static HashMap<String, RtcClient> peers;

    Intent mServiceIntent;
    private BackgroundCallerService mBackgroundCallerService;

    @NonNull
    @Override
    public String getName() {
        return "HelperModule";
    }

    @SuppressLint("HardwareIds")
    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getDeviceId() {
        return Settings.Secure.getString(getReactApplicationContext().getContentResolver(),
                Settings.Secure.ANDROID_ID);
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getServiceStatus() {
        String status = "stopped";
        if (this.mBackgroundCallerService != null) {
            if (isMyServiceRunning(mBackgroundCallerService.getClass())) {
                status = "running";
            } else {
                status = "stopped";
            }
        }
        return status;
    }

    @ReactMethod
    public void startRecorder() {
        Recorder.start();
    }

    @ReactMethod
    public void stopRecorder() {
        Recorder.stop();
    }

    @ReactMethod
    public void startService(String channelName, String channelId) {
        mBackgroundCallerService = new BackgroundCallerService();
        mServiceIntent = new Intent(HelperModule.context, mBackgroundCallerService.getClass());
        mServiceIntent.putExtra("ChannelName", channelName);
        mServiceIntent.putExtra("ChannelId", channelId);
        if (!isMyServiceRunning(mBackgroundCallerService.getClass())) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                HelperModule.context.startForegroundService(mServiceIntent);
            } else {
                HelperModule.context.startService(mServiceIntent);
            }
        }
    }

    private boolean isMyServiceRunning(Class<?> serviceClass) {
        ActivityManager manager = (ActivityManager) HelperModule.context.getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }

    @ReactMethod
    public void stopService() {
        if (mServiceIntent != null) {
            Recorder.stop();
            HelperModule.context.stopService(mServiceIntent);
        }
    }

    public static void callScript(HashMap msg) {
        WritableNativeMap payload = Arguments.makeNativeMap(msg);
        if (jsModule == null) {
            jsModule = HelperModule.context.getJSModule(JavaJsModule.class);
        }
        jsModule.callScript(payload);
        payload = null;
        msg = null;
    }


    @ReactMethod
    public void createPeer(String peerId) {
        RtcClient peer = HelperModule.peers.get(peerId);
        if (peer == null) {
            peer = new RtcClient(context);
            peer.addListener(new EventListener() {
                @Override
                public void onCandidate(IceCandidate candidate) {
                    HashMap param = new HashMap();
                    param.put("type", "rtc");
                    param.put("peerId", peerId);
                    HashMap data = new HashMap();
                    data.put("type", "candidate");
                    data.put("sdpMLineIndex", candidate.sdpMLineIndex);
                    data.put("sdpMid", candidate.sdpMid);
                    data.put("candidate", candidate.sdp);
                    param.put("data", data);
                    HelperModule.callScript(param);
                }

                @Override
                public void onAnswerCreated(SessionDescription sessionDescription) {

                }

                @Override
                public void onOfferCreated(SessionDescription sessionDescription) {
                    HashMap param = new HashMap();
                    param.put("type", "rtc");
                    param.put("peerId", peerId);
                    HashMap data = new HashMap();
                    data.put("type", String.valueOf(sessionDescription.type));
                    data.put("description", sessionDescription.description);
                    param.put("data", data);
                    HelperModule.callScript(param);
                }
            });
        }
        peer.connectPeer();
    }

    @ReactMethod
    public void createAnswer(String peerId, String type, String description) {
        RtcClient peer = HelperModule.peers.get(peerId);
        if (peer == null) {
            peer = new RtcClient(context);
            peer.addListener(new EventListener() {
                @Override
                public void onCandidate(IceCandidate candidate) {
                    HashMap param = new HashMap();
                    param.put("type", "rtc");
                    param.put("peerId", peerId);
                    HashMap data = new HashMap();
                    data.put("type", "candidate");
                    data.put("sdpMLineIndex", candidate.sdpMLineIndex);
                    data.put("sdpMid", candidate.sdpMid);
                    data.put("candidate", candidate.sdp);
                    param.put("data", data);
                    HelperModule.callScript(param);
                }

                @Override
                public void onAnswerCreated(SessionDescription sessionDescription) {
                    HashMap param = new HashMap();
                    param.put("type", "rtc");
                    param.put("peerId", peerId);
                    HashMap data = new HashMap();
                    data.put("type", String.valueOf(sessionDescription.type));
                    data.put("description", sessionDescription.description);
                    param.put("data", data);
                    HelperModule.callScript(param);
                }

                @Override
                public void onOfferCreated(SessionDescription sessionDescription) {
                }
            });
        }
        peer.createAnswer(type, description);
    }

    @ReactMethod
    public void setAnswer(String peerId, String type, String description) {
        RtcClient peer = HelperModule.peers.get(peerId);
        if (peer != null) {
            peer.setAnswer(type, description);
        }
    }

    @ReactMethod
    public void setCandidate(String peerId,
                             int sdpMLineIndex,
                             String sdpMid,
                             String candidate) {
        RtcClient peer = HelperModule.peers.get(peerId);
        if (peer != null) {
            peer.setCandidate(sdpMLineIndex, sdpMid, candidate);
        }
    }
}
