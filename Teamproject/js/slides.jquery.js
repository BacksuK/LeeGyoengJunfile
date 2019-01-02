
(function($){
	$.fn.slides = function( option ) {

		// override defaults with specified option
		option = $.extend( {}, $.fn.slides.option, option );

		return this.each(function(){
			
			// wrap slides in control container, make sure slides are block level
			$('.' + option.container, $(this)).children().wrapAll('<div class="slides_control"/>').children().css({
				display:'block'
			});
			
			var elem = $(this),
				control = $('.slides_control',elem),
				total = control.children().size(),
				width = control.children().outerWidth(),
				height = control.children().outerHeight(),
				start = option.start - 1,
				effect = option.effect.indexOf(',') < 0 ? option.effect : option.effect.replace(' ', '').split(',')[0],
				paginationEffect = option.effect.indexOf(',') < 0 ? effect : option.effect.replace(' ', '').split(',')[1],
				next = 0, prev = 0, number = 0, current = 0, loaded, active, clicked, position, direction;	
					
			// set width based on slide width 맨위 가로길이 slides의 css
			elem.css({ 
				width:'100%',
					left:0,
					height:'300%'
			});
			
			// make sure overflow is hidden slide_container의 css
			$('.' + option.container, elem).css({
				overflow: 'hidden',
					width:'70%',
					height:'100%',
					'margin-left':'17%',
				// fix for ie
				position: 'relative'
			});


			control.css({
				
				position: 'relative',
				// size of control 3 x slide width
				// set height to slide height
				height: '400',
				// center control to slide
				left: -width
				
			});
			

			// set css for slides 슬라이드 박스내의 이미지들의 영구적용 css	
			control.children().css({
				position: 'absolute',
				top: 0, 
				left: width,
				zIndex: 0,
				display: 'none'
			 });
			

			// checks if image is loaded 필요
			if (option.preload && control.children()[0].tagName=='IMG') {
				// adds preload image
				elem.css({
					background: 'url(' + option.preloadImage + ') no-repeat 50% 50%'
				});
				
				// gets image src, with cache buster
				var img = $('img:eq(' + start + ')', elem).attr('src') + '?' + (new Date()).getTime();
				
				// checks if image is loaded
				$('img:eq(' + start + ')', elem).attr('src', img).load(function() {
					// once image is fully loaded, fade in
					$(this).fadeIn(option.fadeSpeed,function(){
						$(this).css({
							zIndex: 5
						});
						// removes preload image
						elem.css({
							background: ''
						});
						// let the script know everything is loaded
						loaded = true;
					});
				});
			} else {
				// if no preloader fade in start slide
				control.find(':eq(' + start + ')').fadeIn(option.fadeSpeed,function(){
					// let the script know everything is loaded
					loaded = true;
				});
			}
			



			// generate pagination 필요함
			if (option.generatePagination) {
				// create unordered list
				elem.append('<ul class='+ option.paginationClass +'></ul>');
				// for each slide create a list item and link
				control.children().each(function(){
					$('.' + option.paginationClass, elem).append('<li style="list-style : none; margin-top:5%; width:20%; height:20%; float: left;"><a rel='+ number +' href="#" onclick="code'+number+'()">'+"<img src="+"'img/l"+(number+1)+".png'>"+'</a></li>');
					number++;
				});
			}



			// add current class to start slide pagination
			$('.' + option.paginationClass + ' li a:eq('+ start +')', elem).parent().addClass('current');
			// click handling 
			$('.' + option.paginationClass + ' li a', elem ).click(function(){
				// pause slideshow
				if (option.play) {
					 pause();
				};
				// get clicked, pass to animate function					
				clicked = $(this).attr('rel');
				// if current slide equals clicked, don't do anything
				if (current != clicked) {
					animate('pagination', paginationEffect, clicked);
				}
				return false;
			});
		
			if (option.play) {
				// set interval
				playInterval = setInterval(function() {
					animate('next', effect);
				}, option.play);
				// store interval id
				elem.data('interval',playInterval);
			};
			


			// animate slides 애니메이션 슬라이드
			function animate(direction, effect, clicked) {
				if (!active && loaded) {
					active = true;
					switch(direction) {
						case 'next':
							// change current slide to previous
							prev = current;
							// get next from current + 1
							next = current + 1;
							// if last slide, set next to first slide
							next = total === next ? 0 : next;
							// set position of next slide to right of previous
							position = width*2;
							// distance to slide based on width of slides
							direction = -width*2;
							// store new current slide
							current = next;
						break;
						case 'prev':
							// change current slide to previous
							prev = current;
							// get next from current - 1
							next = current - 1;
							// if first slide, set next to last slide
							next = next === -1 ? total-1 : next;								
							// set position of next slide to left of previous
							position = 0;								
							// distance to slide based on width of slides
							direction = 0;		
							// store new current slide
							current = next;
						break;
						case 'pagination':
							// get next from pagination item clicked, convert to number
							next = parseInt(clicked,10);
							// get previous from pagination item with class of current
							prev = $('.' + option.paginationClass + ' li.current a', elem).attr('rel');
							// if next is greater then previous set position of next slide to right of previous
							if (next > prev) {
								position = width*2;
								direction = -width*2;
							} else {
							// if next is less then previous set position of next slide to left of previous
								position = 0;
								direction = 0;
							}
							// store new current slide
							current = next;
						break;
					}
					
					// fade animation
					if (effect === 'fade') {
						// fade animation with crossfade
						if (option.crossfade) {
							// put hidden next above current
							control.children(':eq('+ next +')', elem).css({
								zIndex: 10
							// fade in next
							}).fadeIn(option.fadeSpeed, function(){
								// hide previous
								control.children(':eq('+ prev +')', elem).css({
									display: 'none',
									zIndex: 0
								});
								// reset z index
								$(this).css({
									zIndex: 0
								});
								// end of animation
								active = false;
							});
						} else {
							// fade animation with no crossfade
							control.children(':eq('+ prev +')', elem).fadeOut(option.fadeSpeed,function(){
								// animate to new height
								if (option.autoHeight) {
									control.animate({
										// animate container to height of next
										height: control.children(':eq('+ next +')', elem).outerHeight()
									}, option.autoHeightSpeed,
									// fade in next slide
									function(){
										control.children(':eq('+ next +')', elem).fadeIn(elem.data('slides').fadeSpeed);
									});
								} else {
								// if fixed height
									control.children(':eq('+ next +')', elem).fadeIn(option.fadeSpeed,function(){
										// fix font rendering in ie, lame
										if($.browser.msie) {
											$(this).get(0).style.removeAttribute('filter');
										}
									});
								}									
								// end of animation
								active = false;
							});
						}
					// slide animation
					} else {
						// move next slide to right of previous
						control.children(':eq('+ next +')').css({
							left: position,
							display: 'block'
						});
						// animate to new height
						if (option.autoHeight) {
							control.animate({
								left: direction,
								height: control.children(':eq('+ next +')').outerHeight()
							},option.slideSpeed,function(){
								control.css({
									left: -width
								});
								control.children(':eq('+ next +')').css({
									left: width,
									zIndex: 5
								});
								// reset previous slide
								control.children(':eq('+ prev +')').css({
									left: width,
									display: 'none',
									zIndex: 0
								});
								// end of animation
								active = false;
							});
						// if fixed height 높이 수정
						} else {
							// animate control
							control.animate({
								left: direction
							},option.slideSpeed,function(){
								// after animation reset control position
								control.css({
									left: -width
								});
								// reset and show next
								control.children(':eq('+ next +')').css({
									left: width,
									zIndex: 5
								});
								// reset previous slide
								control.children(':eq('+ prev +')').css({
									left: width,
									display: 'none',
									zIndex: 0
								});
								// end of animation
								active = false;
							});
						}
					}
					// set current state for pagination
					if (option.pagination) {
						// remove current class from all
						$('.'+ option.paginationClass +' li.current', elem).removeClass('current');
						// add current class to next
						$('.'+ option.paginationClass +' li a:eq('+ next +')', elem).parent().addClass('current');
					}
				}
			}; // end animate function
		});
	};
	
	// default options
	$.fn.slides.option = {
		preload: false, // boolean, Set true to preload images in an image based slideshow
		container: 'slides_container', // string, Class name for slides container. Default is "slides_container"
		pagination: true, // boolean, If you're not using pagination you can set to false, but don't have to
		generatePagination: true, // boolean, Auto generate pagination
		paginationClass: 'pagination', // string, Class name for pagination
		fadeSpeed: 100, // number, Set the speed of the fading animation in milliseconds
		slideSpeed: 300, // number, Set the speed of the sliding animation in milliseconds
		start: 1, // number, Set the speed of the sliding animation in milliseconds
		effect: 'slide', // string, '[next/prev], [pagination]', e.g. 'slide, fade' or simply 'fade' for both
		crossfade: false, // boolean, Crossfade images in a image based slideshow
		randomize: false, // boolean, Set to true to randomize slides
		play: 0, // number, Autoplay slideshow, a positive number will set to true and be the time between slide animation in milliseconds
		pause: 0, // number, Pause slideshow on click of next/prev or pagination. A positive number will set to true and be the time of pause in milliseconds
		hoverPause: false, // boolean, Set to true and hovering over slideshow will pause it
		autoHeight: false, // boolean, Set to true to auto adjust height
		autoHeightSpeed: 350, // number, Set auto height animation time in milliseconds
		bigTarget: false // boolean, Set to true and the whole slide will link to next slide on click
	};
	
	// Randomize slide order on load 쓸모없지만 지우지못함
	$.fn.randomize = function(callback) {
		function randomizeOrder() { return(Math.round(Math.random())-0.5); }
			return($(this).each(function() {
			var $this = $(this);
			var $children = $this.children();
			var childCount = $children.length;
			if (childCount > 1) {
				$children.hide();
				var indices = [];
				for (i=0;i<childCount;i++) { indices[indices.length] = i; }
				indices = indices.sort(randomizeOrder);
				$.each(indices,function(j,k) { 
					var $child = $children.eq(k);
					var $clone = $child.clone(true);
					$clone.show().appendTo($this);
					if (callback !== undefined) {
						callback($child, $clone);
					}
				$child.remove();
			});
			}
		}));
	};
})(jQuery);