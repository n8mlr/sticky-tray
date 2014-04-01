/**
 * Sticky tray
 */
(function($, window) {
    'use strict';
    
    var instances = [],
        numInstances = 0,
        settings = {};
        
    var PRE_SCROLL  = 'preSrcoll',
        MID_SCROLL  = 'midScroll',
        POST_SCROLL = 'postScroll';
        
    /**
     * Creates elements necessary to plugin
     */
    function decorateTray(tray) {
        var $tray = $(tray),
            $wrapper;

        $tray.css("position", "relative");
        $tray.wrapInner('<div class="sticky-wrap"></div>');
        $wrapper = $(".sticky-wrap", $tray);
        $wrapper.css({
                width: $tray.width(), 
                position: 'relative',
                '-webkit-transform': 'translateZ(0)'
        });
        return $tray;
    }
    
    /**
     * Positions a tray element
     * @param trayId (int)
     */
    function positionTray(trayId) {
        var scrollTop = $(window).scrollTop();
        var t = instances[trayId];
        
        t.startStick = t.parent.offset().top - settings.yOffset;
        t.stopStick = t.parent.height() - t.child.height() + t.startStick;
        
        // if sticky region exceeds height of window and autodetect is on, don't stick so user can scroll
        if (settings.autoDetect === true && t.child.height() + settings.yOffset > $(window).height()) {
            t.child.css({ position: '', top: ''});
            t.tray.css('padding-top', '');
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
                if (t.state !== POST_SCROLL) {
                    // position sticky element at bottom of $container
                    t.child.css({position: "absolute", top: t.stopStick - t.startStick});
                    t.state = POST_SCROLL;    
                }
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
    }
    
    /**
     * Build or destroy stickyTray instances
     *
     * @param command (Object|null)
     *      initializes new plugin. Accepts options
     *          yOffset(int): amount of additional y-padding to apply to sticky element
     *          autoDetect(bool): when true, elements whose content would be invisible in the user's
     *              browser is not made sticky
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
                    t.startStick = t.parent.offset().top - settings.yOffset;
                    t.stopStick = t.parent.height() - t.child.height() + t.startStick;
                    if ($(window).scrollTop() > t.stopStick) {
                        t.child.css({position: "absolute", top: t.stopStick - t.startStick});
                    }
                    positionTray(i);
                 });
            }, 50);
            $(window).on("resize.stickyTray", resizeTray);
            
            return this.each(function(index, el) {
                // Initialize each instance
                var $tray = decorateTray(el);
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
            numInstances = 0;
            instances = [];
        }
    };
}(jQuery, window));