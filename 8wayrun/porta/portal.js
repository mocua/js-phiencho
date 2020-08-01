var EWRporta = window.EWRporta || {};

!function($, window, document)
{
	// ################################## --- ###########################################
	
	EWRporta.Upload = XF.Element.newHandler(
	{
		$upload: null,
		
		init: function()
		{
			$upload = this.$target.find('input[name=upload]');
			$upload.on('change', $upload, $.proxy(this, 'filecheck'));
		},
		
		filecheck: function()
		{
			if (XF.config.uploadMaxFilesize > 0 && $upload[0].files[0].size > XF.config.uploadMaxFilesize)
			{
				XF.alert(XF.phrase('file_too_large_to_upload'));
				$upload.val('');
			}
		},
	});
	
	// ################################## --- ###########################################
	
	EWRporta.Masonry = XF.Element.newHandler(
	{
		init: function()
		{
			var $grid = this.$target.masonry(
			{
				itemSelector: '.porta-article-item',
			});
			
			$grid.imagesLoaded().progress( function()
			{
				$grid.masonry('layout');
			});
			
			if (window.twttr)
			{
				twttr.ready(XF.proxy(function(twttr)
				{
					twttr.events.bind('loaded', function (event)
					{
						setTimeout(function()
						{
							$grid.masonry('layout');
						}, 1000);
					});

				}, this));
			}
		},
	});
	
	// ################################## --- ###########################################
	
	EWRporta.Infinite = XF.Element.newHandler(
	{
		init: function()
		{
			$grid = this.$target;
			
			var $scroller = $grid.infiniteScroll({
				outlayer: $grid.data('masonry'),
				button: '.porta-article-button',
				append: '.porta-article-item',
				hideNav: '.porta-article-pager',
				path: '.porta-article-pager .pageNav-jump--next',
				status: '.porta-article-status',
				history: $grid.data('history') ? 'replace' : false,
			});
			
			$scroller.on('last.infiniteScroll', function()
			{
				$('.porta-article-status').hide();
				$('.porta-article-loader').hide();
			});
			
			if ($grid.data('click'))
			{
				if ($grid.data('after'))
				{
					$scroller.on('load.infiniteScroll', function onPageLoad()
					{
						if ($scroller.data('infiniteScroll').loadCount == $grid.data('after'))
						{
							$('.porta-article-loader').show();
							$scroller.infiniteScroll('option', { loadOnScroll: false });
							$scroller.off('load.infiniteScroll', onPageLoad);
						}
					});
				}
				else
				{
					$('.porta-article-loader').show();
					$scroller.infiniteScroll('option', { loadOnScroll: false });
				}
			}
		},
	});
	
	// ################################## --- ###########################################
	
	EWRporta.Features = XF.Element.newHandler(
	{
		init: function()
		{
			var $slider = this.$target,
				players = [],
				ytDeferred = $.Deferred();
				
			if ($slider.data('relocate'))
			{
				$slider.detach().insertBefore($slider.data('relocate'));
			}
			
			$.getScript('https://www.youtube.com/player_api');
			window.onYouTubeIframeAPIReady = function()
			{
				ytDeferred.resolve(window.YT);
			};
	
			ytDeferred.done(function()
			{
				$slider.find('.porta-features-media').each(function()
				{
					var slide = $(this).data('slide');
					var index = 'youTube' + slide;
					var $elem = $slider.find('.feature-' + slide);
					
					$elem.addClass('has-media');
					
					players[index] = new YT.Player(index,
					{
						videoId: $(this).data('media'),
						width: "100%",
						height: "100%",
						playerVars:
						{
							playlist: $(this).data('media'),
							enablejsapi: 1,
							autoplay: 0,
							controls: 0,
							showinfo: 0,
							disablekb: 1,
							modestbranding: 1,
							cc_load_policy: 0,
							iv_load_policy: 3,
							loop: 1,
							rel: 0,
							fs: 0
						},
						events:
						{
							onReady: function(e)
							{
								e.target.mute();
								
								$elem.find('.bx-unmute').click(function(v)
								{
									v.preventDefault();
									e.target.unMute();
									bxSlider.stopAuto();
								
									$elem.find('.bx-unmute').addClass('active');
									$elem.find('.bx-mute').removeClass('active');
								});
								$elem.find('.bx-mute').click(function(v)
								{
									v.preventDefault();
									e.target.mute();
									
									$elem.find('.bx-mute').addClass('active');
									$elem.find('.bx-unmute').removeClass('active');
								});
							}
						}
					});
				});
			});
			
			var bxProgressStart = function()
			{
				$slider.find('.bx-progress').stop().css({ width: '0%' }).animate({ width: '100%' },
				{
					duration: ($slider.data('auto') - ($slider.data('speed') / 2)),
					easing: 'linear'
				});
			}
			var bxProgressStop = function()
			{
				$slider.find('.bx-progress').stop().animate({ width: '0%' },
				{
					duration: ($slider.data('speed') / 2),
					easing: 'linear',
					complete: function ()
					{
						$slider.find('.bx-progress').hide();
					}
				});
			}
			var bxProgressShow = function()
			{
				$slider.find('.bx-progress').show();
				bxProgressStart();
			}
			
			var bxSlider = $slider.find('.porta-features-container').bxSlider(
			{
				autoHover: true,
				autoDelay: 4000,
				auto: $slider.data('auto'),
				mode: $slider.data('mode'),
				speed: $slider.data('speed'),
				pause: $slider.data('auto'),
				pager: $slider.data('pager') ? true : false,
				controls: $slider.data('controls') ? true : false,
				autoControls: $slider.data('autocontrols') ? true : false,
				onAutoChange: function(auto)
				{
					auto ? bxProgressShow() : bxProgressStop();
				},
				onSlideBefore: function(slide, oldIndex, newIndex)
				{
					newPlayer = 'youTube' + (newIndex + 1);
					if (newPlayer in players)
					{
						players[newPlayer].playVideo();
					}
					bxProgressStart();
				},
				onSlideAfter: function(slide, oldIndex, newIndex)
				{
					oldPlayer = 'youTube' + (oldIndex + 1);
					if (oldPlayer in players)
					{
						players[oldPlayer].stopVideo();
					}
				},
				onSliderLoad: function(newIndex)
				{
					setTimeout(function()
					{
						newPlayer = "youTube" + (newIndex + 1);
						if (newPlayer in players)
						{
							players[newPlayer].playVideo();
						}
					}, 4000);
				},
			});
		},
	});
	
	// ################################## --- ###########################################
	
	EWRporta.Showtext = XF.Click.newHandler(
	{
		eventNameSpace: 'EWRportaShowtext',
		
		click: function(e)
		{
			e.preventDefault();
			$('.porta-block-hide').hide();
			$('.porta-block-show').slideDown();
		},
	});
	
	// ################################## --- ###########################################

	XF.Element.register('porta-upload', 'EWRporta.Upload');
	XF.Element.register('porta-masonry', 'EWRporta.Masonry');
	XF.Element.register('porta-infinite', 'EWRporta.Infinite');
	XF.Element.register('porta-features', 'EWRporta.Features');
	
	XF.Click.register('porta-showtext', 'EWRporta.Showtext');
}
(window.jQuery, window, document);