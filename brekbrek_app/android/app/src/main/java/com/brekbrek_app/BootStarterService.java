package com.brekbrek_app;

import android.app.ActivityManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class BootStarterService extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (!isMyServiceRunning(context)) {
            Intent serviceIntent = new Intent(context, BBNotificationService.class);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
        }
    }

    private boolean isMyServiceRunning(Context context) {
        ActivityManager manager = (ActivityManager) context.getSystemService(context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (BBNotificationService.class.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }
}
