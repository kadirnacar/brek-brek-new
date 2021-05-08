package com.brekbrek_app;

import android.provider.Settings;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
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
    VolumeKeyController mVolumeKeyController;

    public static ReactApplicationContext context;

    @NonNull
    @Override
    public String getName() {
        return "HelperModule";
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getDeviceId() {
        String deviceId = Settings.Secure.getString(getReactApplicationContext().getContentResolver(),
                Settings.Secure.ANDROID_ID);

        this.mVolumeKeyController = new VolumeKeyController(context);
        this.mVolumeKeyController.setActive(true);
        return deviceId;
    }


    public static void callScript(String msg, @Nullable byte[] data, @Nullable int size) {
        WritableMap payload = Arguments.createMap();
        // Put data to map
        payload.putString("message", msg);
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("getMessage", payload);
    }
}
