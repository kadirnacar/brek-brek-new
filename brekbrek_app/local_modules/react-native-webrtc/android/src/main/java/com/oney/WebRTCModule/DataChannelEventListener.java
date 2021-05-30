package com.oney.WebRTCModule;

import org.webrtc.DataChannel;

public interface DataChannelEventListener {
    void onDataMessage(DataChannel.Buffer buffer);
}
