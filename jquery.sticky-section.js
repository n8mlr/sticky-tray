/*
 * Sticky-section plugin
 * 
 * Makes an element stick within the bounds of a container
 * TODO
 *  - test when sticky area is larger than container
 */
var stickify = (function ($, window) {
    var $sticker, $container, $startStick, stopStick;
    
    // Updates the position of the sticky element within its container
    var updatePosition = function() {
        var scrollTop = $(window).scrollTop();
        
        // recalculate stop stick if the window has resized and height of container has changed
        stopStick = $container.height() - $sticker.height() + startStick;
        
        if (scrollTop < startStick) {
            // remove sticky behavior
            $sticker.css({position: 'static', top: ''});
        } else if (scrollTop >= startStick && scrollTop <= stopStick) {
            // position sticky element in $container
            $sticker.css({position: "absolute", width: "100%", top: scrollTop - startStick});
        } else if (scrollTop > stopStick) {
            // position sticky element at bottom of $container
            $sticker.css({position: "absolute", width: "100%", top: stopStick - startStick});
        }
    };
    
    /**
     * Initializes sticky behavior on one element
     * @param element   The item to stick
     * @param conatainer    the bounding container element
     * @param yOffset   optional offset value, useful if other sticky elements exist above element
     */
    function init(element, container, yOffset) {
        $sticker = $(element);
        $container = $(container);
        
        // float the element so we can calculate the height including collapsed margins of children
        $sticker.wrap('<div class="sticky-wrap" style="position:relative; float: left"></div>');
        
        if ($sticker.parent().height() < $container.height()) {
            // Scroll value when sticky behavior will begin
            startStick = $container.offset().top - (yOffset || 0);
            
            // Scroll value when sticky behavior will stop
            stopStick = $container.height() - $sticker.height() + startStick;
            
            $(window).on("scroll.stickify", updatePosition);
            $(window).on("resize.stickify", updatePosition);
            
            console.log("StartStick", startStick, "StopStick", stopStick);
            
            updatePosition();   
        } else {
            // no sticky behavior needed
            $sticker.unwrap();
        }
    }
    
    // Remove sticky behavior
    function destroy() {
        $(window).off("scroll.stickify");
        $(window).off("resize.stickify");
        $sticker.css({position: 'static', width: 'auto', top: ''});
        $sticker.unwrap();
    }
    
    return {
        init: init,
        destroy: destroy
    }
    
    
})(jQuery, window);