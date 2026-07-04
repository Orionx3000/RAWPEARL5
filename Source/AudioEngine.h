#pragma once
#include <JuceHeader.h>

class AudioEngine
{
public:
    AudioEngine() {}
    ~AudioEngine() {}

    void prepareToPlay (double sampleRate, int samplesPerBlock)
    {
        currentSampleRate = sampleRate;
        juce::Logger::writeToLog("AudioEngine ready: " + juce::String(sampleRate) + " Hz");
    }

    void processBlock (juce::AudioBuffer<float>& buffer)
    {
        // DSP logic goes here
        buffer.clear();
    }
    
    void updateState(const juce::String& stateJson)
    {
        juce::Logger::writeToLog("Received state update from WebUI: " + stateJson);
        // Parse JSON and update sequences/ASCII mapping
    }
    
    void play()
    {
        juce::Logger::writeToLog("PLAY triggered from WebUI");
        isPlaying = true;
    }
    
    void stop()
    {
        isPlaying = false;
    }

private:
    double currentSampleRate = 44100.0;
    bool isPlaying = false;
};
