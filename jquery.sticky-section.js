/*
 * Sticky-section plugin
 * 
 * Makes an element stick within the bounds of its parent container
 */
var stickyTray = (function ($, window) {
    var $sticker, $stickWrap, $container, settings = {};
    
    // Updates the position of the sticky element within its container
    var updatePosition = function() {
        var scrollTop = $(window).scrollTop();
        var startStick = $container.offset().top - settings.yOffset;
        var stopStick = $container.height() - $stickWrap.height() + startStick;
        
        // manually set width if window has resized and height of container has changed
        $stickWrap.css("width", $sticker.width());
        
        // if sticky region exceeds height of window and autodetect is on, don't stick so user can scroll
        if ($stickWrap.height() + settings.yOffset > $(window).height() && settings.autoDetect === true) {
            $stickWrap.css({position: '', top: ''});
        } else {
            if (scrollTop < startStick) {
                // remove sticky behavior
                $stickWrap.css({position: '', top: ''});
            } else if (scrollTop >= startStick && scrollTop <= stopStick) {
                // position sticky element in $container
                $stickWrap.css({position: "fixed", top: settings.yOffset});
            } else if (scrollTop > stopStick) {
                // position sticky element at bottom of $container
                $stickWrap.css({position: "absolute", top: stopStick - startStick});
            }
        }
    };
    
    /**
     * Initializes sticky behavior on one element
     * @param element   The item to stick
     * @param conatainer    the bounding container element
     * @param yOffset   optional offset value, useful if other sticky elements exist above element
     */
    function init(element, options) {
        $sticker = $(element);
        $container = $sticker.parent();
        settings = $.extend({ yOffset: 0, autoDetect: false }, options);

        if ($sticker.height() < $container.height()) {
            // wrap contents of sticker
            $sticker.css("position", "relative");
            $sticker.wrapInner('<div class="sticky-wrap"></div>');
            $stickWrap = $(".sticky-wrap", $sticker);
            $stickWrap.css({ position: 'relative', width: '100%'});
            
            $(window).on("scroll.stickify", updatePosition);
            $(window).on("resize.stickify", updatePosition);
            
            updatePosition();   
        }
    }
    
    // Remove sticky behavior
    function destroy() {
        $(window).off("scroll.stickify");
        $(window).off("resize.stickify");
        $sticker.css({position: '', width: '', top: ''});
        $("*:first", $stickWrap).unwrap();
    }
    
    return {
        init: init,
        destroy: destroy
    }
    
    
})(jQuery, window);