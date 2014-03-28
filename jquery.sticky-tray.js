/**
 * Sticky tray
 */
(function($, window) {
    
    var instances = [],
        numInstances = 0,
        settings = {};
        
    var PRE_SCROLL = 'preSrcoll',
        MID_SCROLL = 'midScroll',
        POST_SCROLL = 'postScroll';
        
    
    function makeTray(tray) {
        var $tray = $(tray),
            $wrapper;

        $tray.css("position", "relative");
        $tray.wrapInner('<div class="sticky-wrap"></div>');
        $wrapper = $(".sticky-wrap", $tray);
        $wrapper.css({width: $tray.width(), position: 'relative'});
        return $tray;
    }
    
    function positionTray(trayId) {
        var scrollTop = $(window).scrollTop();
        var t = instances[trayId];
        
        t.startStick = t.parent.offset().top - settings.yOffset;
        t.stopStick = t.parent.height() - t.child.height() + t.startStick;
        
        // if sticky region exceeds height of window and autodetect is on, don't stick so user can scroll
        if (t.child.height() + settings.yOffset > $(window).height() && settings.autoDetect === true) {
            t.child.css({position: '', top: ''});
        } else {
            if (scrollTop < t.startStick) {
                if (t.state !== PRE_SCROLL) {
                    t.child.css({position: '', top: ''});
                    t.tray.css('padding-top', '');
                    t.state = PRE_SCROLL;    
                }
                
            } else if (scrollTop >= t.startStick && scrollTop <= t.stopStick) {
                if (t.state !== MID_SCROLL) {
                    // position sticky element in $container
                    t.tray.css('padding-top', t.child.height());
                    t.child.css({position: "fixed", top: settings.yOffset});
                    t.state = MID_SCROLL;
                }
                
            } else if (scrollTop > t.stopStick) {
                // position sticky element at bottom of $container
                t.child.css({position: "absolute", top: t.stopStick - t.startStick});
                t.state = POST_SCROLL;    
            }
        }
        instances[trayId] = t;
    }
    
    function debounce(func, wait, immediate) {
    	var timeout;
    	return function() {
    		var context = this, args = arguments;
    		clearTimeout(timeout);
    		timeout = setTimeout(function() {
    			timeout = null;
    			if (!immediate) func.apply(context, args);
    		}, wait);
    		if (immediate && !timeout) func.apply(context, args);
    	};
    };
    
    /**
     * Main initializer for plugin
     *
     * @param command (Object|null)
     *      initializes new plugin
     * @param command (Object|string)
     *      when equal to 'destroy', removes plugin instances
     */
    $.fn.stickyTray = function(command) {
        if (typeof command === "object" || command === undefined) {
            var defaults = {
                yOffset: 0,
                autoDetect: false
            };
            settings = $.extend(defaults, command);
            
            // 
            $(window).on("scroll.stickyTray", function() {
                 $.each(instances, function(i) {
                    positionTray(i);
                });
            });
            
            // Debounce window resizing and update sticky container
            var resizeTray = debounce(function() {
                 $.each(instances, function(i) {
                    var t = instances[i];
                    t.child.width(t.tray.width());
                    positionTray(i);
                 });
            }, 50);
            $(window).on("resize.stickyTray", resizeTray);
            
            return this.each(function(index, el) {
                // Initialize each instance
                var $tray = makeTray(el);
                instances[numInstances++] = {
                    startStick: 0,
                    stopStick: 0,
                    state: "",
                    tray: $tray,
                    parent: $tray.parent(),
                    child: $tray.find(".sticky-wrap")
                };
                positionTray(instances.length - 1);
            });
            
        } else if (command === "destroy") {
            $(window).off("scroll.stickyTray");
            $(window).off("resize.stickyTray");

            $.each(instances, function(i) {
                var t = instances[i];
                t.tray.css({position: '', 'padding-top': ''});
                $("*:first", t.child).unwrap();
            });
            numInstaces = 0;
            instances = [];
        }
    };
}(jQuery, window));