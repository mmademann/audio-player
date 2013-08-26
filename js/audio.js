var isMobile = false;

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
}

var SOUND = SOUND || {

    'mLoaded'     : false,
    'inProg'      : false,
    'outer'       : $('#outer'),
    'progress'    : $('#progress'),
    'control'     : $('#control'),
    'volume'      : $('#volume'),
    'spinner'     : $('#spinner'),
    'tracks'      : $('#tracks'),
    'meta'        : $('#meta'),

    'init' : function(){

        // initialize the slider
        this.progress.slider();

        var track       = this.getFirstTrack();
        
        // create the audio element
        this.audio = new Audio('music/'+track+'.ogg','music/'+track+'.mp3');

        this.audio.type = this.audio.canPlayType('audio/mpeg;') 
                          ? 'audio/mpeg' : 'audio/ogg';
        
        this.audio.src  = this.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+track+'.mp3' : 'music/'+track+'.ogg';

        // bind events
        this.events();
    },

    'events' : function(){

        // click events for player controls
        this.outer
            .off('click')
            .on('click', '.play', this.play)
            .on('click', '.pause', this.pause)
            .on('click', '.track', this.nextTrack)
            .on('click', '.s-next', this.nextTrack)
            .on('click', '.s-prev', this.prevTrack)
            .on('click', '.volume', this.volume);

        // spacebar plays & pauses
        $(window).keypress(this.spacebar);

        // different slider events for mobile
        if (isMobile) {          

            this.progress
                .on('touchmove', this.slide)
                .on('touchend', this.slide)
                .on('touchend', this.scrubUp)
                .on('touchstart', 'a', this.scrubDown);

        } else {           

            this.progress
                .on('slide', this.slide)
                .on('mouseup', this.slide)
                .on('mouseup', this.scrubUp)
                .on('mousedown', 'a', this.scrubDown);
        }

        // add listeners to the audio element
        // this.audio.addEventListener('loadedmetadata', this.loadedMeta);
        // this.audio.addEventListener('canplaythrough', this.canPlayThrough);
        this.audio.addEventListener('ended', this.ended);               
        this.audio.addEventListener('timeupdate', this.timeUpdate);

        // load the audio
        this.audio.load();

        // use interval to check readystate since
        // canplay & canplaythrough act differently

        // alert('got here');
        this.readyInterval = '';
        this.readyInterval = setInterval(this.checkLoadedState, 500);
    },

    'checkLoadedState' : function() {
        var self  = SOUND,
            ready = self.audio.readyState;

        if (ready == 4) {
            clearInterval(self.readyInterval);
            alert('interval');
            if (isMobile) {self.mobileLoad()}
            else {self.canPlayThrough()}
        }
    },

    'play' : function(e){
        try{e.preventDefault()}catch(e){}            
        
        var self = SOUND;

        self.showState('pause');
        self.audio.play();
    },

    'pause' : function(e){
        try{e.preventDefault()}catch(e){}   

        var self = SOUND;

        self.showState('play');
        self.audio.pause();        
    },    

    'stop' : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND;

        self.showState('play');
        self.audio.pause();
        self.audio.currentTime = 0;
        self.progress.slider('option', 'value', 0);
        self.setCurrentTime(0);  
    },

    'volume' : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND;

        if ($(this).is('.mute')) {
            self.audio.volume = 0;
        } else {
            self.audio.volume = 1;
        }
        
        $(this).toggleClass('mute');        
    },

    // mousedown or touchstart for scrubber
    'scrubDown' : function() {
        var self = SOUND;

        self.audio.pause();
        self.showState('play');
    },

    // mouseup or touchend for slider
    'scrubUp' : function() {
        var self = SOUND;

        self.audio.play();
        self.showState('pause');
    },

    // moving the slider
    'slide' : function(e) {
        var self  = SOUND,
            value = self.progress.slider('option', 'value');

        self.setCurrentTime(value);
        self.lastTime = value;
        self.audio.currentTime = value;
    },

    // listen for the end of a track
    // and then skip to the next song
    'ended' : function() {
        var self = SOUND;
        self.nextTrack();
    },

    // reveal loading spinner
    'showSpinner' : function() {
        this.meta.find('.time').hide();
        this.spinner.show();
    },

    // hide loading spinner
    'hideSpinner' : function() {
        this.meta.find('.time').show();
        this.spinner.hide();
    },

    // bring the slider back to 0
    'resetSlider' : function() {
        this.progress.slider('option', 'max', this.duration);        
        this.progress.slider('option', 'value', 0);
        this.setCurrentTime(0);          
    },  

    // skip to the next track
    'nextTrack' : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND,
            currSound = self.tracks.find('.on'),
            nextSound = $(this).is('.track') ? $(this) : currSound.next();

        // if the current track is the last on the list
        // the next track should be the first on the list
        if (!nextSound.length) {
            nextSound = self.tracks.find('a.track').eq(0);
        }

        currSound.removeClass('on');
        nextSound.addClass('on');

        // visual loading
        self.setTrackName();
        self.showSpinner();
        self.resetSlider();        

        var name = nextSound.data('name');

        // now change the audio src
        self.setSource(name);
    },

    // skip to the previous track
    'prevTrack' : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND,
            currSound = self.tracks.find('.on'),
            prevSound = currSound.prev();       

        // if the current track is the first on the list
        // the previous track should be the last on the list            
        if (!prevSound.length) {
            prevSound = self.tracks.find('a:last-child');
        }
        
        currSound.removeClass('on');
        prevSound.addClass('on');

        // visual loading
        self.setTrackName();
        self.showSpinner();
        self.resetSlider();        

        var name = prevSound.data('name');

        // now change the audio src
        self.setSource(name);
    },

    // swap out the audio file
    'setSource' : function(name){
        var self = SOUND;        

        self.audio.src  = self.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+name+'.mp3' : 'music/'+name+'.ogg';
        
        self.audio.load();

        self.readyInterval = setInterval(self.checkLoadedState, 500);        
    },

    // toggle between play and pause buttons
    'showState' : function(state){
        var on  = state == 'play' ? 'play'  : 'pause',
            off = state == 'play' ? 'pause' : 'play';

        this.control.addClass(on).removeClass(off);
    },

    // display the track name
    'setTrackName' : function(){
        var title = this.tracks.find('.on').text();
        this.meta.find('.name').text(title);
    },

    // update the time ticker
    'setCurrentTime' : function(value){
        var time    = value,
            hours   = Math.floor(time / 3600);
            time    = time - hours * 3600,
            minutes = Math.floor(time / 60),
            seconds = time - minutes * 60;

        if (minutes < 10){
            minutes = '0'+minutes;
        }

        if (seconds < 10){
            seconds = '0'+seconds;
        }

        this.meta.find('.time').text(minutes+':'+seconds);        
    },    

    // fetch the name of the first track
    'getFirstTrack' : function(){
        return this.tracks.find('a').eq(0).data('name');
    },

    // shortcut for playing/pausing
    'spacebar' : function(e){
        var self = SOUND;        

        if (e.which === 32) {
            var isPlaying = !self.audio.paused;
            if (isPlaying) {
                self.pause();
            } else {
                self.play();
            }
        }
    },

    // listen for audio time changes
    'timeUpdate' : function() {
        var self = SOUND,
            secs = parseInt(self.audio.currentTime, 10);

        if (self.audio.paused || secs == self.lastTime){
            return false;
        }
        
        self.setCurrentTime(secs);
        self.progress.slider('option', 'value', secs);        
    },

    // listen for meta data to load
    'loadedMeta' : function() {
        this.duration = this.audio.duration;
    },

    // load mobile, just show the controls since
    // we dont know when the audio canPlayThrough
    'mobileLoad' : function(){
        this.loadedMeta();
        this.setTrackName();
        this.resetSlider();
        this.hideSpinner();
    },

    // listen for the audio to load fully
    'canPlayThrough' : function() {
        var self = SOUND;

        // show the pause button, display the track name,
        // bring the slider to 0, hide the loader, and play
        // self.showState('pause');
        self.loadedMeta();
        self.setTrackName();
        self.resetSlider();
        self.hideSpinner();
        self.play();
    }
}

SOUND.init();

$(document).ready(function(){
    // SOUND.init();
});