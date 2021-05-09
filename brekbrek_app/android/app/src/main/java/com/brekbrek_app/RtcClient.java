package com.brekbrek_app;

import android.util.Log;
import org.webrtc.DataChannel;
import org.webrtc.IceCandidate;
import org.webrtc.MediaConstraints;
import org.webrtc.MediaStream;
import org.webrtc.PeerConnection;
import org.webrtc.PeerConnectionFactory;
import org.webrtc.RtpReceiver;
import org.webrtc.SdpObserver;
import org.webrtc.SessionDescription;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

interface EventListener {
    void onCandidate(IceCandidate candidate);
    void onOfferCreated(SessionDescription sessionDescription);
}

public class RtcClient {
    public RtcClient() {
        List<PeerConnection.IceServer> iceServers = new LinkedList<>();
        iceServers.add(PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer());
        peer = peerConnectionFactory.createPeerConnection(iceServers, peerObserver);
        sendChannel = peer.createDataChannel("RTCDataChannel", new DataChannel.Init());
        //sendChannel.registerObserver(localDataChannelObserver);
    }

    private List<EventListener> listeners = new ArrayList<EventListener>();
    private PeerConnectionFactory peerConnectionFactory = PeerConnectionFactory.builder().createPeerConnectionFactory();
    private PeerConnection peer;
    private DataChannel sendChannel;
    private DataChannel receiveChannel;
    private static final String TAG = "RtcClient";

    public void addListener(EventListener toAdd) {
        listeners.add(toAdd);
    }

    public void connectPeer() {
        MediaConstraints constraints = new MediaConstraints();
        peer.createOffer(sessionObserver, constraints);
    }

    public void createAnswer() {
        MediaConstraints constraints = new MediaConstraints();
        peer.createAnswer(sessionObserver, constraints);
    }

    PeerConnection.Observer peerObserver = new PeerConnection.Observer() {
        @Override
        public void onSignalingChange(PeerConnection.SignalingState signalingState) {
            Log.d(TAG, "localPeerConnectionObserver onSignalingChange() " + signalingState.name());
        }

        @Override
        public void onIceConnectionChange(PeerConnection.IceConnectionState iceConnectionState) {
            Log.d(TAG, "localPeerConnectionObserver onIceConnectionChange() " + iceConnectionState.name());
        }

        @Override
        public void onIceConnectionReceivingChange(boolean b) {
            Log.d(TAG, "localPeerConnectionObserver onIceConnectionReceivingChange(): " + b);
        }

        @Override
        public void onIceGatheringChange(PeerConnection.IceGatheringState iceGatheringState) {
            Log.d(TAG, "localPeerConnectionObserver onIceGatheringChange() " + iceGatheringState.name());
        }

        @Override
        public void onIceCandidatesRemoved(IceCandidate[] iceCandidates) {

        }

        @Override
        public void onAddStream(MediaStream mediaStream) {

        }

        @Override
        public void onIceCandidate(IceCandidate iceCandidate) {
            for (EventListener l : listeners) {
                l.onCandidate(iceCandidate);
            }
        }

        @Override
        public void onRemoveStream(MediaStream mediaStream) {

        }

        @Override
        public void onDataChannel(DataChannel dataChannel) {
            Log.d(TAG, "localPeerConnectionObserver onDataChannel()");
        }

        @Override
        public void onRenegotiationNeeded() {
            Log.d(TAG, "localPeerConnectionObserver onRenegotiationNeeded()");
        }

        @Override
        public void onAddTrack(RtpReceiver rtpReceiver, MediaStream[] mediaStreams) {

        }
    };

    SdpObserver sessionObserver = new SdpObserver() {
        @Override
        public void onCreateSuccess(SessionDescription sessionDescription) {
            peer.setLocalDescription(sessionObserver, sessionDescription);
//            for (EventListener l : listeners) {
//                l.onOfferCreated(sessionDescription);
//            }
        }

        @Override
        public void onSetSuccess() {

        }

        @Override
        public void onCreateFailure(String s) {

        }

        @Override
        public void onSetFailure(String s) {

        }
    };
}
