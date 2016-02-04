window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
    if (loaded) {
        initializeCastApi();
    } else {
        console.log(errorInfo);
    }
};

var session = null;
var currentMediaURL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
var currentMedia = null;
function onRequestSessionSuccess(e) {
    session = e;
    var mediaInfo = new chrome.cast.media.MediaInfo(currentMediaURL);
    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
    mediaInfo.contentType = 'video/mp4';

    mediaInfo.metadata.title = 'Awesome Video';
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    function onMediaDiscovered(how, media){
        currentMedia = media;
        media.addUpdateListener(function(){
            console.log('media status changed');
        });
    }

    function onMediaError(e) {
        console.log('media failed to load');
    }

    session.loadMedia(
        request,
        onMediaDiscovered.bind(this, 'loadMedia'),
        onMediaError
    );

}
function onLaunchError(e) {
    console.log('session request failed')
}
document.querySelector('#castIcon').onclick =  function(){
    chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError);
};

document.querySelector('#stopCast').onclick =  function(){
    session.stop(function(){console.log('cast stopped successfully')}, function(){});
};


function initializeCastApi() {
    var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
    function sessionListener(e) {
        session = e;
        if (session.media.length != 0) {
            console.log('media discovered in session');
        }
        session.addUpdateListener(function(){
            if (session.status !== chrome.cast.SessionStatus.CONNECTED) {
                console.log('SessionListener: Session disconnected');
            }
        });
    }
    function receiverListener(e) {
        if(e===chrome.cast.ReceiverAvailability.AVAILABLE){
            console.log('receiver available');
        }
    }
    var apiConfig = new chrome.cast.ApiConfig(
        sessionRequest,
        sessionListener,
        receiverListener
    );

    function onInitSuccess() {
        console.log('cast api initialized');
    }
    function onError(e){
        console.log('cast api failed to initialize');
    }

    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}