package com.brekbrek_app;

import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.WritableMap;

public interface JavaJsModule extends JavaScriptModule {
    void callScript(WritableMap message);
}
