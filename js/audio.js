/*


*   HTML5 Audio Player
*   Date: 08/26/2013
*   @author: Mike Mademann


*/


var isMobile = false;
// some things are just different on mobile
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
}

var SOUND = SOUND || {
    
    'progress'    : false,
    'control'     : $('#control'),
    'spinner'     : $('#spinner'),
    'tracks'      : $('#tracks'),
    'outer'       : $('#outer'),
    'seek'        : $('#seek'),
    'meta'        : $('#meta'),

    'initialize' : function(){

        // initialize the slider
        this.seek.slider();

        // grab the name of the first track
        var name = this.getFirstTrack();
        
        // create the audio element
        this.audio = new Audio('music/'+name+'.ogg','music/'+name+'.mp3');

        // now set the audio src
        this.setSource(name);

        // visually setup the player
        this.playerSetup();

        // bind events
        this.events();
    },

    'events' : function(){

        // click events
        this.outer
            .off('click')
            .on('click', '.pause', this.pause)
            .on('click', '.play', this.nextTrack)
            .on('click', '.track', this.nextTrack)
            .on('click', '.s-next', this.nextTrack)
            .on('click', '.s-prev', this.prevTrack)
            .on('click', '.volume', this.volume);

        // spacebar plays & pauses
        $(window).keypress(this.spacebar);

        // different slider events for mobile
        if (isMobile) {          

            this.seek
                .on('touchmove', this.slide)
                .on('touchend', this.slide)
                .on('touchend', this.scrubUp)
                .on('touchstart', 'a', this.scrubDown);

        } else {           

            this.seek
                .on('slide', this.slide)
                .on('mouseup', this.slide)
                .on('mouseup', this.scrubUp)
                .on('mousedown', 'a', this.scrubDown);
        }

        // add listeners to the audio
        this.audio.addEventListener('ended', this.ended);               
        this.audio.addEventListener('timeupdate', this.timeUpdate);
        this.audio.addEventListener('loadedmetadata', this.loadedMeta);
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
            value = self.seek.slider('option', 'value');

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
        this.seek.slider('option', 'max', this.duration);
        this.seek.slider('option', 'range', 'min');           
        this.seek.slider('option', 'value', 0);
        this.setCurrentTime(0);          
    },  

    // skip to the next track
    'nextTrack' : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND,
            currSound = self.tracks.find('.on'),
            nextSound = $(this).is('.track') ? $(this) : currSound.next();

        // play button merely plays the track
        // from wherever it was paused
        if ($(this).is('.play')) {
            self.play();
            return;
        }      

        // if the current track is the last
        // the next track should be the first
        if (!nextSound.length) {
            nextSound = self.tracks.find('a.track').eq(0);
        }

        currSound.removeClass('on');
        nextSound.addClass('on');

        // visual loading
        self.seek.slider('disable');
        self.setTrackName();
        self.showSpinner();
        self.resetSlider();        

        var name = nextSound.data('name');

        // now change the audio src
        self.changeTrack(name);
    },

    // skip to the previous track
    'prevTrack' : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND,
            currSound = self.tracks.find('.on'),
            prevSound = currSound.prev();       

        // if the current track is the first
        // the previous track should be the last           
        if (!prevSound.length) {
            prevSound = self.tracks.find('a:last-child');
        }
        
        currSound.removeClass('on');
        prevSound.addClass('on');

        // visual loading
        self.seek.slider('disable');        
        self.setTrackName();
        self.showSpinner();
        self.resetSlider();        

        var name = prevSound.data('name');

        // now change the audio src
        self.changeTrack(name);
    },

    // handle track changing
    'changeTrack' : function(name){

        // set the new audio src
        this.setSource(name);         

        // let the user skip through tracks rapidly
        if (this.progress) {
            return;
        }
        this.progress = true;

        // wait until the readystate is HAVE_ENOUGH_DATA (4)
        this.interval = setInterval(this.checkReadyState, 500);        
    },    

    // set the audio src & type
    'setSource' : function(name){

        // set the audio type
        this.audio.type = this.audio.canPlayType('audio/mpeg;') 
                          ? 'audio/mpeg' : 'audio/ogg';

        // set the audio src
        this.audio.src  = this.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+name+'.mp3' : 'music/'+name+'.ogg';                          
        
        // load the file
        this.audio.load();     
    },

    // canplay & canplaythrough differ across browsers
    // so set an interval to check the readystate instead
    // wait until the readystate is 4 (HAVE_ENOUGH_DATA)
    // and then beging playing
    'checkReadyState' : function() {
        var self  = SOUND,
            ready = self.audio.readyState;

        if (ready == 4) {          
            clearInterval(self.interval);
            self.interval = '';
            self.readyToPlay();
        }
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

    // listen for time updates
    'timeUpdate' : function() {
        var self = SOUND,
            secs = parseInt(self.audio.currentTime, 10);

        if (self.audio.paused || secs == self.lastTime){
            return false;
        }
        
        self.setCurrentTime(secs);
        self.seek.slider('option', 'value', secs);     
    },

    // listen for meta data to load
    'loadedMeta' : function() {
        var self = SOUND;
        self.duration = this.duration;
        self.seek.slider('option', 'max', self.duration);        
    },

    // setup the player
    'playerSetup' : function(){
        this.setTrackName();
        this.resetSlider();
        this.hideSpinner();
    },

    // when the audio is fully loaded
    'readyToPlay' : function() {

        // display the track name, bring the 
        // slider to 0, hide the spinner, & play
        this.setTrackName();
        this.resetSlider();
        this.seek.slider('enable');
        this.hideSpinner();
        this.play();
        this.progress = false;
    }
}

$(document).ready(function(){
    SOUND.initialize();
});