package com.divinecompass.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class NotificationActionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        Log.d("NotificationReceiver", "Action received: " + action);

        //if (PersistentNotificationService.ACTION_STOP.equals(action)) {
            //Intent serviceIntent = new Intent(context, PersistentNotificationService.class);
           // context.stopService(serviceIntent);
       // } else if (PersistentNotificationService.ACTION_REFRESH.equals(action)) {
            // Optional: Trigger a refresh logic here. 
            // For now, we just restart the service with the same/default text
         //   Intent serviceIntent = new Intent(context, PersistentNotificationService.class);
         //   serviceIntent.putExtra("title", "Refreshing...");
          //  serviceIntent.putExtra("body", "Updating status...");
          //  context.startService(serviceIntent);
       // }
    }
}
