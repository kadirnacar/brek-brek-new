package com.brekbrek_app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.brekbrek_app.utils.VolumeKeyController;

public class BackgroundCallerService extends Service {

    VolumeKeyController mVolumeKeyController;

    public BackgroundCallerService() {
        super();
    }

    private Notification notification;
    private NotificationCompat.Builder notificationBuilder;

    @Override
    public void onCreate() {
        super.onCreate();

        String CHANNEL_ID = "";
        NotificationChannel channel = null;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            channel = new NotificationChannel("brekbrek_app",
                    "BrekBrek",
                    NotificationManager.IMPORTANCE_HIGH);

            channel.setImportance(NotificationManager.IMPORTANCE_NONE);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            ((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE)).createNotificationChannel(channel);
            CHANNEL_ID = "brekbrek_app";
        }

        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, 0);

        this.notificationBuilder = new NotificationCompat.Builder(getApplicationContext(), CHANNEL_ID)
                .setContentTitle("BrekBrek")
                .setOngoing(true)
                .setSmallIcon(R.drawable.ic_stat_name)
                .setLargeIcon(BitmapFactory.decodeResource(getApplicationContext().getResources(),
                        R.mipmap.ic_launcher))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setContentIntent(pendingIntent);
        this.notification = this.notificationBuilder.build();

        startForeground(1, this.notification);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);
        this.mVolumeKeyController = new VolumeKeyController(getApplicationContext());
        this.mVolumeKeyController.setActive(true);
        String channelName = intent.getExtras().getString("ChannelName");
        if(!channelName.isEmpty()) {
            this.notificationBuilder.setContentText(channelName);
            this.notification = this.notificationBuilder.build();
            startForeground(1, this.notification);
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        this.mVolumeKeyController.destroy();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
