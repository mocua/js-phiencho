var EWRporta = window.EWRporta || {};

!function($, window, document)
{
	// ################################## --- ###########################################
	
	EWRporta.Countdown = XF.Element.newHandler(
	{
		init: function()
		{
			var $counter = this.$target,
				deadline = new Date($counter.data('datetime')).getTime();
			
			var countdown = setInterval(function ()
			{
				var datetime = new Date().getTime(),
					diff = deadline - datetime,
					days = Math.floor((diff / (1000 * 60 * 60 * 24))),
					hour = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
					mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
					secs = Math.floor((diff % (1000 * 60)) / 1000);
				
				$counter.find('.days .poll').html(+days);
				$counter.find('.hour .poll').html(('0'+hour).slice(-2));
				$counter.find('.mins .poll').html(('0'+mins).slice(-2));
				$counter.find('.secs .poll').html(('0'+secs).slice(-2));
				
				if (days == 0)
				{
					$counter.find('.days').hide();
				
					if (hour == 0)
					{
						$counter.find('.hour').hide();
					}
				}
				
				if (diff < 0)
				{
					clearInterval(countdown);
					$counter.find('.unit').hide();
					$counter.find('.unit.inactive').show();
				}
			}, 1000);
		},
	});
	
	// ################################## --- ###########################################

	XF.Element.register('porta-countdown', 'EWRporta.Countdown');
}
(window.jQuery, window, document);