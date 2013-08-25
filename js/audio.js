var isMobile = false;
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
}

var SOUND = {

    pageLoad    : true,
    theboss     : $('#theboss'),
    progress    : $('#progress'),
    control     : $('#control'),
    volume      : $('#volume'),
    stop        : $('#stop'),
    meta        : $('#meta'),
    time        : $('#time'),

    init : function(){

        this.progress.slider();  

        var track       = this.firstTrack();
        
        this.audio      = new Audio('music/'+track+'.ogg','music/'+track+'.mp3');

        this.audio.type = this.audio.canPlayType('audio/mpeg;') 
                          ? 'audio/mpeg' : 'audio/ogg';
        
        this.audio.src  = this.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+track+'.mp3' : 'music/'+track+'.ogg';

        // this.audio.load();

        this.addEvents();
    },

    addEvents : function(){

        this.theboss
            .on('click', '.play', this.play)
            .on('click', '.pause', this.pause)
            .on('click', '.track', this.changeSong)
            // .on('click', '.prev', this.prevTrack)
            .on('click', '#stop', this.stop)
            .on('click', '#volume', this.volume);

        $('#buttons').on('click', '.next', this.nextTrack);

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

        this.audio.addEventListener('timeupdate', this.tickTock);
        this.audio.addEventListener('loadedmetadata', this.loadMeta);
        this.audio.addEventListener('ended', this.ended);               
        this.audio.addEventListener('loadeddata', this.loaded);
    },

    firstTrack : function(){

        var name = this.meta
                        .find('a')
                        .eq(0)
                        .addClass('on')
                        .data('name');

        return name;
    },    

    changeSong : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND;

        self.clearActives();

        var name = $(this).addClass('on').data('name');

        self.setSource(name);
    },

    clearActives : function(e){
        this.meta
            .find('a.track')
            .removeClass('on');        
    },

    setSource : function(name){

        var self = SOUND;        

        self.audio.src  = self.audio.canPlayType('audio/mpeg;') 
                          ? 'music/'+name+'.mp3' : 'music/'+name+'.ogg';
        
        // self.audio.load();
    },

    showState : function(state){

        var on  = 'pause', 
            off = 'play';

        if (state == 'play') {
            on  = 'play';
            off = 'pause';
        }

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
            value = self.progress.slider('option', 'value');

        self.getCurrentTime(value);
        self.lastTime = value;
        self.audio.currentTime = value;
    },

    ended : function() {

        var self = SOUND;

        self.nextTrack();
    },

    nextTrack : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND,

            currSound = self.meta.find('.on').removeClass('on'),
            nextSound = currSound.next();

        if (!nextSound.length) {
            nextSound = self.meta.find('a.track').eq(0);
        }

        nextSound.addClass('on');

        var name = nextSound.data('name');

        alert('new3');
        alert(name);

        self.setSource(name);
    },

    prevTrack : function(e){
        try{e.preventDefault()}catch(e){}

        var self = SOUND,

            currSound = self.meta.find('.on').removeClass('on'),
            prevSound = currSound.prev();
        
        if (!prevSound.length) {
            prevSound = self.meta.find('a:last-child');
        }

        prevSound.addClass('on');

        var name = prevSound.data('name');

        self.setSource(name);
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

        var self = SOUND,
            secs = parseInt(self.audio.currentTime, 10);

        if (secs == self.lastTime){
            // return false;
        }

        self.showState('pause');        
        self.progress.slider('option', 'max', self.duration);
        self.progress.slider('option', 'value', 0);
        self.audio.play();
    }
}


$(document).ready(function() {

    SOUND.init();

});