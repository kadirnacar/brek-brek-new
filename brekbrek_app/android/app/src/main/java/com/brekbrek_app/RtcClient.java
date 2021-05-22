package com.brekbrek_app;

import android.util.Log;

import com.brekbrek_app.utils.Player;
import com.facebook.react.bridge.ReactApplicationContext;

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

    void onAnswerCreated(SessionDescription sessionDescription);
}

public class RtcClient {
    public RtcClient(ReactApplicationContext context) {
        PeerConnectionFactory.InitializationOptions initializationOptions =
                PeerConnectionFactory.InitializationOptions.builder(context)
                        .createInitializationOptions();
        PeerConnectionFactory.initialize(initializationOptions);
        peerConnectionFactory = PeerConnectionFactory.builder().createPeerConnectionFactory();
        List<PeerConnection.IceServer> iceServers = new LinkedList<>();
        iceServers.add(PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer());
        peer = peerConnectionFactory.createPeerConnection(iceServers, peerObserver);
    }

    private List<EventListener> listeners = new ArrayList<EventListener>();
    private PeerConnectionFactory peerConnectionFactory;
    private PeerConnection peer;
    private DataChannel peerDataChannel;
    private static final String TAG = "RtcClient";

    public void addListener(EventListener toAdd) {
        listeners.add(toAdd);
    }

    public void connectPeer() {
        peerDataChannel = peer.createDataChannel("RTCDataChannel", new DataChannel.Init());
        peerDataChannel.registerObserver(dataChannelObserver);
        MediaConstraints constraints = new MediaConstraints();
        peer.createOffer(offerObserver, constraints);
    }

    public void createAnswer(String type, String description) {
        SessionDescription sdp = new SessionDescription(SessionDescription.Type.fromCanonicalForm(type), description);
        peer.setRemoteDescription(answerObserver, sdp);
        MediaConstraints constraints = new MediaConstraints();
        peer.createAnswer(answerObserver, constraints);
    }

    public void setAnswer(String type, String description) {
        SessionDescription sdp = new SessionDescription(SessionDescription.Type.fromCanonicalForm(type), description);
        peer.setRemoteDescription(answerObserver, sdp);
    }

    public void setCandidate(int sdpMLineIndex,
                             String sdpMid,
                             String candidate) {
        IceCandidate iceCandidate = new IceCandidate(sdpMid, sdpMLineIndex, candidate);
        peer.addIceCandidate(iceCandidate);
    }

    public void sendPlay(DataChannel.Buffer buffer) {
        peerDataChannel.send(buffer);
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
            peerDataChannel = dataChannel;
            peerDataChannel.registerObserver(dataChannelObserver);
        }

        @Override
        public void onRenegotiationNeeded() {
            Log.d(TAG, "localPeerConnectionObserver onRenegotiationNeeded()");
        }

        @Override
        public void onAddTrack(RtpReceiver rtpReceiver, MediaStream[] mediaStreams) {

        }
    };
    SdpObserver offerObserver = new SdpObserver() {
        @Override
        public void onCreateSuccess(SessionDescription sessionDescription) {
            peer.setLocalDescription(offerObserver, sessionDescription);
            for (EventListener l : listeners) {
                l.onOfferCreated(sessionDescription);
            }
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
    SdpObserver answerObserver = new SdpObserver() {
        @Override
        public void onCreateSuccess(SessionDescription sessionDescription) {
            peer.setLocalDescription(answerObserver, sessionDescription);
            for (EventListener l : listeners) {
                l.onAnswerCreated(sessionDescription);
            }
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
    DataChannel.Observer dataChannelObserver = new DataChannel.Observer() {

        @Override
        public void onBufferedAmountChange(long l) {

        }

        @Override
        public void onStateChange() {

        }

        @Override
        public void onMessage(DataChannel.Buffer buffer) {
            Player.start();
            byte[] arr = buffer.data.array();
            Log.i("BrekBrek get", String.valueOf(arr.length));
            Player.stream(arr);
//            if (!buffer.binary) {
//                int limit = buffer.data.limit();
//                byte[] datas = new byte[limit];
//                buffer.data.get(datas);
//            }
        }
    };
}
