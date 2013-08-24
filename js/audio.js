
var SOUND = {

    boss        : $('#boss'),
    progress    : $('#progress'),
    control     : $('#control'),
    volume      : $('#volume'),
    stop        : $('#stop'),
    meta        : $('#meta'),
    time        : $('#time'),

    init : function(){

        this.progress.slider();        

        var firstTrack  = this.meta.find('a').eq(0).addClass('on'),
            trackName   = firstTrack.data('name');
        
        this.audio      = new Audio('music/'+trackName+'.ogg','music/'+trackName+'.mp3');

        this.audio.type = this.audio.canPlayType('audio/mpeg;') 
                          ? 'audio/mpeg' : 'audio/ogg';
        
        this.audio.src  = this.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+trackName+'.mp3' : 'music/'+trackName+'.ogg';

        this.audio.addEventListener('timeupdate', this.tickTock);
        // this.audio.addEventListener('loadedmetadata', this.metaReady);
        this.audio.addEventListener('loadedmetadata', this.metaReady);
        this.audio.addEventListener('canplaythrough', this.canPlay);
        this.audio.addEventListener('ended', this.ended);                    

        this.events();
    },    

    events : function(){

        var self = SOUND;

        self.boss
            .on('click', '.play', self.play)
            .on('click', '.pause', self.pause)
            .on('click', '.track', self.track)
            .on('click', '#stop', self.stop)   
            .on('click', '#volume', self.volume);

        self.progress
            .on('slide', self.slide)
            .on('mouseup', self.slide)
            .on('mouseup', self.mouseUp)
            .on('mousedown', 'a', self.mouseDown);
    },

    track : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND,
            name = $(this).data('name');

        self.meta.find('a.track').removeClass('on');

        $(this).addClass('on');
        
        self.audio.src  = self.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+name+'.mp3' : 'music/'+name+'.ogg';
        
        self.audio.load();
    },

    showState : function(state){

        var on = 'pause', off = 'play';

        if (state == 'play') {
            on  = 'play';
            off = 'pause';
        }

        this.control.addClass(on).removeClass(off);
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

    mouseDown : function(e) {
        var self = SOUND;
        self.audio.pause();
        self.showState('play');
    },

    mouseUp : function(e) {
        var self = SOUND;        
        self.audio.play();
        self.showState('pause');
    },

    slide : function(e) {

        var self  = SOUND,
            value = self.progress.slider('option', 'value'),
            round = parseInt(Math.round(value, 10));

        self.getCurrentTime(value);
        self.lastTime = round;
        self.audio.currentTime = value;
    },

    ended : function(e) {
        var self        = SOUND,
            currSound   = self.meta.find('.on'),
            nextSound   = currSound.next();

        if (!nextSound.length) {
            nextSound = self.meta.find('a').eq(0);
        }

        nextSound.click();
    },    

    getCurrentTime : function(value){
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

        this.time.find('span').text(minutes+':'+seconds);        
    },

    tickTock : function(e) {
        var self = SOUND,
            secs = parseInt(self.audio.currentTime, 10);

        if (self.audio.paused || secs == self.lastTime){
            return false;
        }
        
        self.getCurrentTime(secs);
        self.progress.slider('option', 'value', secs);        
    },

    metaReady : function(e) {
        var self = SOUND;
        self.duration = this.duration;
    },

    canPlay : function() {
        var self = SOUND;
        self.showState('pause');        
        self.progress.slider('option', 'max', self.duration);
        self.progress.slider('option', 'value', 0);        
        self.audio.play();
    }
}

$(document).ready(function() {
    SOUND.init();
});
