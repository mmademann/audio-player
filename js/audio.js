var isMobile = false;
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    isMobile = true;
}

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

        var track       = this.GetFirstTrack();
        
        this.audio      = new Audio('music/'+track+'.ogg','music/'+track+'.mp3');

        this.audio.type = this.audio.canPlayType('audio/mpeg;') 
                          ? 'audio/mpeg' : 'audio/ogg';
        
        this.audio.src  = this.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+track+'.mp3' : 'music/'+track+'.ogg';

        this.audio.load();

        this.events();      
    },

    GetFirstTrack : function(){

        var firstTrack  = this.meta
                            .find('a').eq(0)
                            .addClass('on'),

            trackName   = firstTrack.data('name');

        return trackName;
    },

    events : function(){

        var self    = SOUND;

        var events = isMobile ? 
                    'touchend' : 
                    'click';

        this.boss
            .on(events, '.play', this.play)
            .on(events, '.pause', this.pause)
            .on(events, '.track', this.change)
            .on(events, '#stop', this.stop)   
            .on(events, '#volume', this.volume);

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

        this.audio.addEventListener('timeupdate', this.tickTock);
        this.audio.addEventListener('loadedmetadata', this.loadMeta);
        this.audio.addEventListener('ended', this.ended);               
        this.audio.addEventListener('loadeddata', this.loaded);
    },

    change : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND;

        self.meta
            .find('a.track')
            .removeClass('on');

        $(this).addClass('on');

        var name = $(this).data('name');

        self.track(name);
    },

    track : function(name){

        var self = SOUND;        

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
        self.getCurrentTime(0);  
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
            currSound   = self.meta.find('.on').removeClass('on'),
            nextSound   = currSound.next();

        if (!nextSound.length) {
            nextSound = self.meta.find('a').eq(0);
        }
        var name = nextSound.addClass('on').data('name');

        self.track(name);
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

    loadMeta : function(e) {
        var self = SOUND;
        self.duration = this.duration;
    },

    loaded : function(e) {
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
