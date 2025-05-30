#include <com_brekbrek_1app_utils_OpusDecoder.h>
#include "opus/include/opus.h"
#include <malloc.h>

JNIEXPORT jint JNICALL
Java_com_brekbrek_1app_utils_OpusDecoder_nativeInitDecoder(JNIEnv *env, jobject thiz,
                                                               jint sampling_rate,
                                                               jint number_of_channels) {
    int size;
    int error;

    size = opus_decoder_get_size(number_of_channels);
    OpusDecoder* dec = malloc(size);
    error = opus_decoder_init(dec, sampling_rate, number_of_channels);

    if (error) {
        free(dec);
    } else {
        jclass cls = (*env)->GetObjectClass(env, thiz);
        jfieldID fid = (*env)->GetFieldID(env, cls, "address", "J");
        (*env)->SetLongField(env, thiz, fid, (jlong)dec);
    }

    return error;
}

JNIEXPORT jint JNICALL
Java_com_brekbrek_1app_utils_OpusDecoder_nativeDecodeShorts(JNIEnv *env, jobject thiz,
                                                                jbyteArray in, jshortArray out,
                                                                jint frames) {
    jclass cls = (*env)->GetObjectClass(env, thiz);
    jfieldID fid = (*env)->GetFieldID(env, cls, "address", "J");
    OpusDecoder* dec = (OpusDecoder*)((*env)->GetLongField(env, thiz, fid));

    jint inputArraySize = (*env)->GetArrayLength(env, in);

    jbyte* encodedData = (*env)->GetByteArrayElements(env, in, 0);
    jshort* decodedData = (*env)->GetShortArrayElements(env, out, 0);
    int samples = opus_decode(dec, (const unsigned char *) encodedData, inputArraySize,
                              decodedData, frames, 0);
    (*env)->ReleaseByteArrayElements(env,in,encodedData,JNI_ABORT);
    (*env)->ReleaseShortArrayElements(env,out,decodedData,0);

    return samples;
}

JNIEXPORT jint JNICALL
Java_com_brekbrek_1app_utils_OpusDecoder_nativeDecodeBytes(JNIEnv *env, jobject thiz,
                                                               jbyteArray in, jbyteArray out,
                                                               jint frames) {
    jclass cls = (*env)->GetObjectClass(env, thiz);
    jfieldID fid = (*env)->GetFieldID(env, cls, "address", "J");
    OpusDecoder* dec = (OpusDecoder*)((*env)->GetLongField(env, thiz, fid));

    jint inputArraySize = (*env)->GetArrayLength(env, in);

    jbyte* encodedData = (*env)->GetByteArrayElements(env, in, 0);
    jbyte* decodedData = (*env)->GetByteArrayElements(env, out, 0);
    int samples = opus_decode(dec, (const unsigned char *) encodedData, inputArraySize,
                              (opus_int16 *) decodedData, frames, 0);
    (*env)->ReleaseByteArrayElements(env,in,encodedData,JNI_ABORT);
    (*env)->ReleaseByteArrayElements(env,out,decodedData,0);

    return samples;
}

JNIEXPORT jboolean JNICALL
Java_com_brekbrek_1app_utils_OpusDecoder_nativeReleaseDecoder(JNIEnv *env, jobject thiz) {
    jclass cls = (*env)->GetObjectClass(env, thiz);
    jfieldID fid = (*env)->GetFieldID(env, cls, "address", "J");
    OpusDecoder* enc = (OpusDecoder*)((*env)->GetLongField(env, thiz, fid));
    free(enc);
    (*env)->SetLongField(env, thiz, fid, (jlong)NULL);
    return 1;
}

