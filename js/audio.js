var isMobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
}

var SOUND = {

    inProg      : false,
    outer       : $('#outer'),
    progress    : $('#progress'),
    control     : $('#control'),
    volume      : $('#volume'),
    spinner     : $('#spinner'),
    tracks      : $('#tracks'),
    meta        : $('#meta'),

    init : function(){

        this.progress.slider();  

        var track       = this.getFirstTrack();
        
        this.audio      = new Audio('music/'+track+'.ogg','music/'+track+'.mp3');

        this.audio.type = this.audio.canPlayType('audio/mpeg;') 
                          ? 'audio/mpeg' : 'audio/ogg';
        
        this.audio.src  = this.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+track+'.mp3' : 'music/'+track+'.ogg';

        this.audio.load();

        this.events();
    },

    events : function(){

        this.outer
            .off('click')
            .on('click', '.play', this.play)
            .on('click', '.pause', this.pause)
            .on('click', '.track', this.nextTrack)
            .on('click', '.s-next', this.nextTrack)
            .on('click', '.s-prev', this.prevTrack)
            .on('click', '.volume', this.volume);

        $(window).keypress(this.spacebar);

        if (isMobile) {          

            this.progress
                .on('touchmove', this.slide)
                .on('touchend', this.slide)
                .on('touchend', this.mouseUp)
                .on('touchstart', 'a', this.mouseDown);

        } else {           

            this.progress
                .on('slide', this.slide)
                .on('mouseup', this.slide)
                .on('mouseup', this.mouseUp)
                .on('mousedown', 'a', this.mouseDown);
        }

        this.audio.addEventListener('canplay', this.loadedData);
        this.audio.addEventListener('timeupdate', this.timeUpdate);
        this.audio.addEventListener('loadedmetadata', this.loadedMeta);
        this.audio.addEventListener('ended', this.ended);               
    },

    setSource : function(name){

        var self = SOUND;        

        self.audio.src  = self.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+name+'.mp3' : 'music/'+name+'.ogg';
        
        self.audio.load();
    },

    getFirstTrack : function(){
        return this.tracks.find('a').eq(0).addClass('on').data('name');
    },

    clearActives : function(){
        this.tracks.find('a').removeClass('on');        
    },    

    showState : function(state){
        var on  = state == 'play' ? 'play'  : 'pause',
            off = state == 'play' ? 'pause' : 'play';

        this.control.addClass(on).removeClass(off);
    },

    spacebar : function(e){
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

    play : function(e){
        try{e.preventDefault()}catch(e){}            
        
        var self = SOUND;

        self.showState('pause');
        self.audio.play();
    },

    pause : function(e){
        try{e.preventDefault()}catch(e){}   

        var self = SOUND;

        self.showState('play');
        self.audio.pause();        
    },    

    stop : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND;

        self.showState('play');
        self.audio.pause();
        self.audio.currentTime = 0;
        self.progress.slider('option', 'value', 0);
        self.setCurrentTime(0);  
    },

    volume : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND;

        if ($(this).is('.mute')) {
            self.audio.volume = 0;
        } else {
            self.audio.volume = 1;
        }
        
        $(this).toggleClass('mute');        
    },

    mouseDown : function() {
        var self = SOUND;

        self.audio.pause();
        self.showState('play');
    },

    mouseUp : function() {
        var self = SOUND;

        self.audio.play();
        self.showState('pause');
    },

    slide : function(e) {
        var self  = SOUND,
            value = self.progress.slider('option', 'value');

        self.setCurrentTime(value);
        self.lastTime = value;
        self.audio.currentTime = value;
    },

    ended : function() {
        var self = SOUND;
        self.nextTrack();
    },

    toggleSpinner : function() {
        this.meta.find('.time').toggle();
        this.spinner.toggle();
    },

    resetProgress : function() {
        this.toggleSpinner();
        this.setTrackName();
        this.progress.slider('option', 'max', self.duration);        
        this.progress.slider('option', 'value', 0);
        this.setCurrentTime(0);          
    },    

    nextTrack : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND,
            currSound = self.tracks.find('.on').removeClass('on'),
            nextSound = $(this).is('.track') ? $(this) : currSound.next();

        self.resetProgress();

        if (!nextSound.length) {
            nextSound = self.tracks.find('a.track').eq(0);
        }

        nextSound.addClass('on');

        var name = nextSound.data('name');

        self.setSource(name);
    },

    prevTrack : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND,
            currSound = self.tracks.find('.on').removeClass('on'),
            prevSound = currSound.prev();

        self.resetProgress();            
        
        if (!prevSound.length) {
            prevSound = self.tracks.find('a:last-child');
        }

        prevSound.addClass('on');

        var name = prevSound.data('name');

        self.setSource(name);
    },

    setTrackName : function(){
        var title = this.tracks.find('.on').text();
        this.meta.find('.name').text(title);
    },

    setCurrentTime : function(value){
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

    timeUpdate : function() {
        var self = SOUND,
            secs = parseInt(self.audio.currentTime, 10);

        if (self.audio.paused || secs == self.lastTime){
            return false;
        }
        
        self.setCurrentTime(secs);
        self.progress.slider('option', 'value', secs);        
    },

    loadedMeta : function() {
        SOUND.duration = this.duration;
    },

    loadedData : function() {
        var self = SOUND,
            secs = parseInt(self.audio.currentTime, 10);

        if (secs == self.lastTime || self.inProg){
            return false;
        }

        self.inProg = true;

        self.showState('pause');
        self.resetProgress();
        self.audio.play();

        if (!self.isMobile){
            setTimeout(function(){self.inProg = false}, 100);
        }
    }
}

$(document).ready(function() {
    SOUND.init();
});