package com.brekbrek_app;

import android.annotation.SuppressLint;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;

import com.brekbrek_app.utils.Player;
import com.oney.WebRTCModule.DataChannelEventListener;
import com.oney.WebRTCModule.WebRTCModule;

import androidx.annotation.NonNull;

import com.brekbrek_app.utils.Recorder;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeMap;

import java.util.HashMap;

public class HelperModule extends ReactContextBaseJavaModule {

    HelperModule(ReactApplicationContext context) {
        super(context);
        HelperModule.context = context;
    }

    public static ReactApplicationContext context;
    private static JavaJsModule jsModule;

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
        return Settings.Secure.getString(HelperModule.context.getContentResolver(),
                Settings.Secure.ANDROID_ID);
    }

    @ReactMethod
    public void stopPlay() {
        Player.stop();
    }

    @ReactMethod
    public void startPlay() {
        Player.start();
    }

    @ReactMethod
    public void stopRecord() {
        Recorder.stop();
    }

    @ReactMethod
    public void startRecord() {
        Recorder.start();
    }

    @ReactMethod
    public void registerPlayerListener() {
        context.getNativeModule(WebRTCModule.class).addAllDataChannelMessageListener("player", new DataChannelEventListener() {
            @Override
            public void onDataMessage(org.webrtc.DataChannel.Buffer buffer) {
                byte[] bytes;
                if (buffer.data.hasArray()) {
                    bytes = buffer.data.array();
                } else {
                    bytes = new byte[buffer.data.remaining()];
                    buffer.data.get(bytes);
                }
                Player.stream(bytes);
            }
        });
    }

    @ReactMethod
    public String getServiceStatus() {
        String status = "stopped";
        if (mBackgroundCallerService != null) {
            if (isMyServiceRunning(mBackgroundCallerService.getClass())) {
                status = "running";
            } else {
                status = "stopped";
            }
        }
        return status;
    }

    @ReactMethod
    public void startService(String channelName, String channelId) {
        Recorder.init(HelperModule.context);
        Player.init();
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
            Player.stop();
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

    public static void sendData() {

    }
}
