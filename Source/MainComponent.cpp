#include "MainComponent.h"
#include "BinaryData.h"

std::optional<juce::WebBrowserComponent::Resource> resourceProvider(const juce::String& urlStr)
{
    juce::String path = urlStr.upToFirstOccurrenceOf("?", false, false).upToFirstOccurrenceOf("#", false, false);
    if (path.startsWithIgnoreCase("https://juce.backend/")) path = path.substring(21);
    if (path.startsWithIgnoreCase("http://localhost/")) path = path.substring(17);
    if (path.startsWithChar('/')) path = path.substring(1);
    
    juce::File logFile("D:\\App Creation\\webview_debug.txt");
    logFile.appendText("REQUESTED URL: " + urlStr + " | PATH: " + path + "\n");
    
    // Serve index.html for root or empty
    if (path.isEmpty() || path == "index.html")
    {
        path = "index.html";
    }
    
    // Remove leading slash if any
    if (path.startsWithChar('/')) {
        path = path.substring(1);
    }
    
    int size = 0;
    const char* dataPtr = BinaryData::getNamedResource(path.toRawUTF8(), size);
    
    if (dataPtr != nullptr && size > 0)
    {
        std::vector<std::byte> data;
        auto* raw = (const std::byte*)dataPtr;
        data.assign(raw, raw + size);
        
        juce::String mimeType = "application/octet-stream";
        if (path.endsWithIgnoreCase(".html")) mimeType = "text/html";
        else if (path.endsWithIgnoreCase(".js")) mimeType = "application/javascript";
        else if (path.endsWithIgnoreCase(".css")) mimeType = "text/css";
        else if (path.endsWithIgnoreCase(".svg")) mimeType = "image/svg+xml";
        else if (path.endsWithIgnoreCase(".png")) mimeType = "image/png";
        else if (path.endsWithIgnoreCase(".ttf")) mimeType = "font/ttf";
        else if (path.endsWithIgnoreCase(".woff2")) mimeType = "font/woff2";
        
        logFile.appendText(" -> SERVING AS " + mimeType + ", size: " + juce::String(size) + "\n");
        return {{ std::move(data), mimeType }};
    }
    
    logFile.appendText(" -> NOT FOUND IN BINARY DATA\n");
    return {};
}

MainComponent::MainComponent()
{
    juce::WebBrowserComponent::Options options;
    options = options.withBackend(juce::WebBrowserComponent::Options::Backend::webview2);
    options = options.withNativeIntegrationEnabled(true);
    options = options.withResourceProvider(resourceProvider, juce::String("http://localhost"));

    options = options.withNativeFunction("syncState", [this](const juce::Array<juce::var>& args, juce::WebBrowserComponent::NativeFunctionCompletion completion) {
        if (args.size() > 0) {
            juce::String stateJson = args[0].toString();
            audioEngine.updateState(stateJson);
        }
        completion(juce::var());
    });

    options = options.withNativeFunction("play", [this](const juce::Array<juce::var>& args, juce::WebBrowserComponent::NativeFunctionCompletion completion) {
        audioEngine.play();
        completion(juce::var());
    });

    options = options.withNativeFunction("saveFile", [](const juce::Array<juce::var>& args, juce::WebBrowserComponent::NativeFunctionCompletion completion) {
        if (args.size() < 1) { completion(juce::var(false)); return; }
        juce::String content = args[0].toString();

        auto chooser = std::make_shared<juce::FileChooser>(
            "Save RAWPEARL5 State",
            juce::File::getSpecialLocation(juce::File::userDocumentsDirectory).getChildFile("RAWPEARL5_STATE.json"),
            "*.json"
        );

        chooser->launchAsync(juce::FileBrowserComponent::saveMode | juce::FileBrowserComponent::warnAboutOverwriting,
            [chooser, content, completion](const juce::FileChooser&) mutable
            {
                auto result = chooser->getResult();
                if (result != juce::File{})
                {
                    result.replaceWithText(content);
                    completion(juce::var(true));
                }
                else
                {
                    completion(juce::var(false));
                }
            });
    });

    options = options.withNativeFunction("loadFile", [](const juce::Array<juce::var>& args, juce::WebBrowserComponent::NativeFunctionCompletion completion) {
        auto chooser = std::make_shared<juce::FileChooser>(
            "Load RAWPEARL5 State",
            juce::File::getSpecialLocation(juce::File::userDocumentsDirectory),
            "*.json"
        );

        chooser->launchAsync(juce::FileBrowserComponent::openMode,
            [chooser, completion](const juce::FileChooser&) mutable
            {
                auto result = chooser->getResult();
                if (result != juce::File{})
                {
                    auto content = result.loadFileAsString();
                    completion(juce::var(content.toStdString()));
                }
                else
                {
                    completion(juce::var());
                }
            });
    });

    webComponent = std::make_unique<juce::WebBrowserComponent>(options);
    addAndMakeVisible(webComponent.get());

    audioEngine.prepareToPlay(44100.0, 512);

    juce::File initLogFile("D:\\App Creation\\webview_root.txt");
    initLogFile.appendText("MAINCOMPONENT INIT STARTED\n");

    juce::String rootUrl = juce::WebBrowserComponent::getResourceProviderRoot();
    initLogFile.appendText("ROOT URL: " + rootUrl + "\n");

    // Append a timestamp to bypass WebView2's aggressive cache
    juce::String cacheBusterUrl = rootUrl + (rootUrl.endsWith("/") ? "" : "/") + "?t=" + juce::String(juce::Time::currentTimeMillis());
    webComponent->goToURL(cacheBusterUrl);

    setSize(1354, 1015);  // 15% larger than previous default
}

MainComponent::~MainComponent()
{
}

void MainComponent::paint (juce::Graphics& g)
{
    g.fillAll (juce::Colour(0xff000000));
}

void MainComponent::resized()
{
    if (webComponent) {
        webComponent->setBounds(getLocalBounds());
    }
}
