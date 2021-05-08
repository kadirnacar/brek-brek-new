package com.brekbrek_app;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.brekbrek_app.utils.Recorder;
import com.brekbrek_app.utils.VolumeKeyController;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class HelperModule extends ReactContextBaseJavaModule {
    HelperModule(ReactApplicationContext context) {
        super(context);
        HelperModule.context = context;
    }

    public static ReactApplicationContext context;
    Intent mServiceIntent;
    private BackgroundCallerService mBackgroundCallerService;

    @NonNull
    @Override
    public String getName() {
        return "HelperModule";
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getDeviceId() {
        String deviceId = Settings.Secure.getString(getReactApplicationContext().getContentResolver(),
                Settings.Secure.ANDROID_ID);
        return deviceId;
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getServiceStatus() {
        String status = "stopped";
        if (this.mBackgroundCallerService != null) {
            if (isMyServiceRunning(mBackgroundCallerService.getClass()) == true) {
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
    public void startService(String channelName) {
        mBackgroundCallerService = new BackgroundCallerService();
        mServiceIntent = new Intent(HelperModule.context, mBackgroundCallerService.getClass());
        mServiceIntent.putExtra("ChannelName", channelName);
        if (!isMyServiceRunning(mBackgroundCallerService.getClass())) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                HelperModule.context.startForegroundService(mServiceIntent);
            } else {
                HelperModule.context.startService(mServiceIntent);
            }
        }
        callScript("start Service", null, 0);
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
            HelperModule.context.stopService(mServiceIntent);
        }
        callScript("stop Service", null, 0);
    }

    public static void callScript(String msg, @Nullable byte[] data, @Nullable int size) {
        WritableMap payload = Arguments.createMap();
        // Put data to map
        payload.putString("message", msg);
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("getMessage", payload);
    }
}
