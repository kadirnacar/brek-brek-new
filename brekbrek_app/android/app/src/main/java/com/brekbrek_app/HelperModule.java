package com.brekbrek_app;

import android.content.Context;
import android.provider.Settings;
import android.telephony.TelephonyManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class HelperModule extends ReactContextBaseJavaModule {
    HelperModule(ReactApplicationContext context) {
        super(context);
    }

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
}
