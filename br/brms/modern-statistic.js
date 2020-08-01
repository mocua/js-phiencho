/* Copyright (c) 2018 Brivium (http://brivium.com)
 * Author: Brivium
 * Addon: ModernStatistic
 * Version: 3.0.0
 * Released under the Brivium License Agreement: http://brivium.com/pages/terms-of-use/
 */

/** @param {jQuery} $ jQuery Object */
!function($, window, document)
{
	XF.BRMSContainer = XF.Element.newHandler({
		options: {
		},

		$clone: null,
		created: false,

		init: function()
		{
			$container = this.$target;
			this.$container = $container;
			var $previewType = $container.attr('data-previewType'),
				$allowCusItemLimit = parseInt($container.attr('data-allowCusItemLimit')),
				$allowCusLayout = parseInt($container.attr('data-allowCusLayout')),
				$useLimit = $container.attr('data-useLimit'),
				$entryLimit = $container.attr('data-entryLimit'),
				$navPosition = $container.attr('data-navPosition'),
				$updateIntervalTime = parseInt($container.attr('data-updateInterval')),
				$modernStatisticId = parseInt($container.attr('data-modernStatisticId'));
			this.$containerClass = 'BRMSContainer ';
			if($container.hasClass('BRMSContainerDark')){
				this.$containerClass = 'BRMSContainer BRMSContainerDark ';
			}
			this.$previewType = $previewType;
			this.$allowCusItemLimit = $allowCusItemLimit;
			this.$allowCusLayout = $allowCusLayout;
			this.$entryLimit = $entryLimit;
			this.$navPosition = $navPosition;
			this.$updateIntervalTime = $updateIntervalTime;
			this.$modernStatisticId = $modernStatisticId;
			this.$hardReload = false;

			var self = this;

			//this.init();
			var $customLayout = XF.Cookie.get("brmsLayoutChange"+$modernStatisticId);
			if($allowCusLayout && $customLayout){
				$container.removeClass('brmsTopTabs brmsRightTabs brmsLeftTabs')
				$container.addClass($customLayout);
			}
			if($useLimit && parseInt($useLimit)>0){
				this.$entryLimit = $useLimit;
				$container.attr('data-entryLimit', $useLimit);
			}else if(this.$allowCusItemLimit && XF.Cookie.get("brmsNumberEntry"+$modernStatisticId)){
				this.$entryLimit = XF.Cookie.get("brmsNumberEntry"+$modernStatisticId);
				$container.attr('data-entryLimit', this.$entryLimit);
			}
			var $numberNav = $container.find('ul.brmsTabNav > li').length-2;
			$container.find('ul.brmsTabNav > li:first').addClass('first');
			$container.find('ul.brmsTabNav > li:eq('+$numberNav+')').addClass('last');
			$container.find('ul.brmsTabNav > li > a, .brmsTabNavHidden  ul.brmsDropdownMenu  > li > a').click(XF.proxy(self, 'navTabTriggerHandle'));

			this.showTab($container.find(".brmsTabContent:first").data('content'));
			this.updateInterval();

			$container.find('.brmsNumberEntry').click(XF.proxy(self, 'numberEntryChangeHandle'));
			$container.find('.brmsLayoutChange').click(XF.proxy(self, 'layoutChangeHandle'));
			$container.find('.brmsRefresh').click(XF.proxy(self, 'refreshHandle'));

			this.responsiveInit();
			$(window).resize(XF.proxy(self, 'responsiveInit'));

			$container.find(".brmsDropdownToggle").hover(function (e) {
				var $drMenu = $(this).find('ul.brmsDropdownMenu');
				$drMenu.show();
				if ( $drMenu.offset().left+ $drMenu.width() > $container.width() ) {
					$drMenu.addClass('edge');
				} else {
					$drMenu.removeClass('edge');
				}
				if($drMenu.css('display') != 'none' && $drMenu.offset().left<=0){
					$drMenu.css({'left':0});
				}
			},function (e) {
				var $drMenu = $(this).find('ul.brmsDropdownMenu');
				$(this).find('ul.brmsDropdownMenu').hide();
				if ($drMenu.offset().left+ $drMenu.width() > $container.width() ) {
					$drMenu.addClass('edge');
				} else {
					$drMenu.removeClass('edge');
				}
				if($drMenu.css('display') != 'none' && $drMenu.offset().left<=0){
					$drMenu.css({'left':0});
				}
			});
			$container.find(".brmsDropdownToggle").click(function (e) {
				$(this).find('ul.brmsDropdownMenu').toggle();
			});
		},

		navTabTriggerHandle: function(e)
		{
			e.preventDefault();
			var $container = this.$container;
			var $handleBtn = $(e.target);

			if(!$handleBtn.attr('data-content')){
				$handleBtn = $handleBtn.closest('a');
			}
			var $liParent = $handleBtn.closest('li');
			if($liParent && !$liParent.hasClass('current')){
				$container.find('ul.brmsTabNav > li , .brmsTabNavHidden  ul.brmsDropdownMenu  > li').removeClass('current');
				$handleBtn.closest('li').addClass('current');
				var $contentClass = $handleBtn.attr('data-content');
				if($container.find('.'+$contentClass).find('.brmsIcoLoader').length){
					this.getStatistics($handleBtn.attr('data-tabid'), 0);
				}
				$container.find('.brmsTabContent').hide().removeClass('current');
				$container.find('.'+$contentClass).fadeIn(100).addClass('current');
				this.responsiveInit();
			}
		},

		numberEntryChangeHandle: function(e)
		{
			e.preventDefault();
			var $container = this.$container;
			var $handleBtn = $(e.target);
			var $limit = $handleBtn.attr('data-limit');

			if($limit){
				this.$entryLimit = $limit;
				$container.attr('data-entryLimit',$limit);
				XF.Cookie.set("brmsNumberEntry"+this.$modernStatisticId, $limit);
				this.resetInterval();
				this.$hardReload = 1;
				this.runInterval();
				this.$hardReload = false;
			}
		},

		layoutChangeHandle: function(e)
		{
			e.preventDefault();
			var $container = this.$container;
			var $handleBtn = $(e.target);
			var $layout = $handleBtn.attr('data-layout');
			var self = this;
			if($layout){
				if(!$container.hasClass($layout)){
					$container.removeClass('brmsTopTabs brmsRightTabs brmsLeftTabs')
					$container.addClass($layout);
				}
				XF.Cookie.set("brmsLayoutChange"+this.$modernStatisticId, $layout);
				self.responsiveInit();
			}
		},

		refreshHandle: function(e)
		{
			e.preventDefault();
			var $handleBtn = $(e.target);
			if(!$handleBtn.hasClass('disable')){
				this.resetInterval();
				this.$hardReload = 1;
				$handleBtn.addClass('disable');
				this.runInterval();
				this.$hardReload = false;
			}
		},

		getStatistics: function($tabId, $limit)
		{
			var $container = this.$container;
			var $modernStatisticId = this.$modernStatisticId;
			var self = this;
			if(!$limit){
				$limit = self.$entryLimit;
			}
			// loadding ajax
			XF.ajax(
				'post', XF.canonicalizeUrl('index.php?brms-statistics/load-tab'),
				{
					tab_id: $tabId,
					modern_statistic_id: $modernStatisticId,
					hard_reload: self.$hardReload,
					limit: $limit
				},
				XF.proxy(self, 'showResult'),
				{cache: false}
			).always(function() { self.$entryLimit = 0; });
			/*XenForo.ajax(
				$loadUrl,
				{
					tab_id: $tabId,
					modern_statistic_id: $modernStatisticId,
					hard_reload: self.$hardReload,
					limit: $limit
				},  XF.proxy(self, 'showResult'),
				{cache: false}
			);*/
		},

		showResult: function(data)
		{
			var $container = this.$container;
			var self = this;
			if (data.errors || data.exception)
			{
				return;
			}

			var self = this;
			XF.setupHtmlInsert(data.tabContentHtml, function($html, container, onComplete)
			{
				if($html){
					self.$container.find('.brmsTabContent_'+data.tabId).html($html);
				}else{
					self.$container.find('.brmsTabContent_'+data.tabId).html('');
				}
				onComplete();
				XF.activate($container);

				self.$container.find('.brmsRefresh').removeClass('disable');
				self.responsiveInit();
				//console.log('Mordern Statistic Loaded');
			});

			if(data.limit){
				$container.attr('data-entryLimit',data.limit);
				//self.$entryLimit = data.limit;
			}
			// remove comment if you want to see this addon run time
			//	console.log('Brivium ModernStatistic Runtim: ' + data.pageTime);
		},

		showTab: function($tab)
		{
			var $container = this.$container;
	  		var $tabId;
			if(!$tab){
				$container.find('ul.brmsTabNav > li.current a').trigger("click");
				$tabId = $container.find('ul.brmsTabNav > li.current a').attr('data-content').replace('brmsTabContent_', '');
			}else{
				$container.find("ul.brmsTabNav > li > a[data-content='" + $tab + "']").trigger("click");
				$tabId = $tab.replace('brmsTabContent_', '');
			}
		},

		runInterval: function()
		{
			var $container = this.$container;
			var self = this;
			self.getStatistics(
				$container.find('li.brmlShow.current a').data('tabid'),
				self.$entryLimit
			);
		},

		updateInterval: function()
		{
			if(!this.$brmsActive){
				var $container = this.$container;
				var $brmsInterval = this.$updateIntervalTime;
				var self = this;
				if ($brmsInterval > 0) {
					this.$brmsActive = window.setInterval(function(){
						//console.log('Mordern Statistic Update ' + $brmsInterval + 's');
						self.getStatistics(
							$container.find('ul.brmsTabNav > li.current a').data('tabid'),
							self.$entryLimit
						);
					}, $brmsInterval * 1000);
					return this.$brmsActive;
				}
			}
		},

		clearInterval: function()
		{
			window.clearInterval(this.$brmsActive);
			this.$brmsActive = false;
			this.$updateIntervalTime = 0;
			return;
		},

		resetInterval: function()
		{
			this.clearInterval();
			this.updateInterval();
		},

		responsiveInit: function()
		{
			var $container = this.$container;
			if(!$container.find('.brmsTabContent.current').length)
			{
				return;
			}
			var $brmsLayoutList = $container.find('.brmsLayoutList');
			if($container.hasClass('brmsTopTabs')){
				var $tabNavWidth = 0;
				var $calWidth = $container.find('.brmsStatisticHeader').width() - $container.find('.brmsConfigList').width() - 75;
				var $showHiddenMenu = false;
				$container.find('.brmsTabNav > li.brmlShow').each(function(){
					var $same = $container.find('.brmsTabNavHidden li:eq('+$(this).index()+')');
					if(($tabNavWidth+$(this).width())<= $calWidth){
						$tabNavWidth = $tabNavWidth + $(this).width();
						$(this).css({'display':'block'});
						if($same.hasClass('current')){
							$(this).addClass('current');
							$same.removeClass('current');
						}
						$same.css({'display':'none'});
					}else{
						$showHiddenMenu = true;
						$(this).css({'display':'none'});
						if($(this).hasClass('current')){
							$(this).removeClass('current');
							$same.addClass('current');
						}
						$same.css({'display':'block'});
					}
				});
				var $brmsTabNavHiddenMenu = $container.find('.brmsTabNavHiddenMenu');
				if($showHiddenMenu){
					$brmsTabNavHiddenMenu.show();
				}else{
					$brmsTabNavHiddenMenu.hide();
				}
				if($container.width() > 480){
					if(XF.Cookie.get("brmsLayoutChange"+this.$modernStatisticId) && !$container.hasClass(XF.Cookie.get("brmsLayoutChange"+this.$modernStatisticId))){
						$container.attr('class',this.$containerClass+XF.Cookie.get("brmsLayoutChange"+this.$modernStatisticId));
					}
					$brmsLayoutList.css({'display':'inline-block'});
				}else{
					$brmsLayoutList.css({'display':'none'});
				}
			}else{
				if($container.width()<=480){
					$container.attr('class',this.$containerClass+' brmsTopTabs');
					$brmsLayoutList.css({'display':'none'});
				}
			}

			var $itemStast = $container.find('.brmsTabContent.current ol li.itemStast');
			if($container.find('.brmsTabContent.current').width()<550){
				if($itemStast.hasClass('itemUser') || $itemStast.hasClass('itemProfilePost')){
					$itemStast.find('.itemDetail.itemSubDetail').hide();
					$itemStast.find('.itemTitle').css({'max-width':'75%'});
					if($container.find('.brmsTabContent.current').width()<350){
						$itemStast.find('.itemDetail.itemDetailMain span').hide();
						$itemStast.find('.itemDetail.itemDetailMain').css({'width':'50px'});
						$itemStast.find('.itemDetail.itemDetailMain.itemDate').css({'width':'90px'});
						$itemStast.find('.itemTitle').css({'max-width':'85%'});
					}else{
						$itemStast.find('.itemDetail.itemDetailMain span, .itemDetail.itemDetailMain strong').show();
						$itemStast.find('.itemDetail.itemDetailMain').css({'width':'200px'});
						$itemStast.find('.itemTitle').css({'max-width':'75%'});
					}
				}else{
					$itemStast.find('.itemDetail').hide();
					$itemStast.find('.itemTitle').css({'max-width':'90%'});
					if($container.find('.brmsTabContent.current').width()<350){
						$itemStast.find('.prefix').hide();
					}else{
						$itemStast.find('.prefix').show();
					}
				}
			}else{
				$itemStast.find('.prefix').show();
				$itemStast.find('.itemDetail').show();
				$itemStast.find('.itemTitle').css({'width':'auto'});
				$itemStast.find('.itemDetail.itemDetailMain span').show();
				$itemStast.find('.itemDetail.itemDetailMain').css({'width':'150px'});
				$itemStast.find('.itemDetail.itemDetailMain.itemDate').css({'width':'200px'});

				var $stastWidth = parseInt($itemStast.width()*0.33);
				var $itemTitleWidth = $itemStast.find('.itemTitle').width();
				$itemStast.find('.itemSubDetail').each(function(index){
					if($(this).css('display') == 'none'){
						if(($itemTitleWidth - 150) > $stastWidth){
							$itemStast.find('.itemSubDetail:eq('+index+')').show();
						}
					}else{
						if($itemTitleWidth < $stastWidth){
							$itemStast.find('.itemSubDetail:eq('+index+')').hide();
						}
					}
				});
			}
		},

		getText: function(name, def)
		{
			var xfStatisticLang = BRMSLANG.xf;
			return xfStatisticLang[name] || def;
		}
	});

	XF.BRMSTooltip = XF.Element.newHandler({
		options: {
		},

		$parent: null,

		init: function()
		{
			this.$parent = this.$target.closest('.BRMSToolTip')
			var self = this;
			this.$parent.hover(XF.proxy(self, 'showTooltip'), XF.proxy(self, 'hideTooltip'));
		},

		showTooltip: function()
		{
			var tooltip = this.$parent.find('.tooltip');
			if(!tooltip.length){
				tooltip = $(this.toolTips());
				tooltip.insertBefore(this.$target);
			}
			tooltip.addClass('show');
		},

		hideTooltip: function()
		{
			var tooltip = this.$parent.find('.tooltip');
			if(tooltip.length){
				tooltip.removeClass('show');
			}
		},

		toolTips: function()
		{
			let content;
			var $data = this.$target;
			if($data.attr("data-kind")=='resource' && $data.attr("data-box")){
				content = '<div>['+this.getText('brms_category')+'] : <b>' +
				$data.attr("data-box") + '</b></div><ul class="listInline listInline--bullet"><li>'+this.getText('brms_download')+': <b>' +
				$data.attr("data-download") + '</b> </li><li>'+this.getText('brms_update')+': <b>' +
				$data.attr("data-update") + '</b> </li><li>'+this.getText('brms_review')+': <b>' +
				$data.attr("data-review") + '</b> </li><li>'+this.getText('brms_rating')+': <b>' +
				$data.attr("data-vote") + '</b> </li></ul></div>';
			}else if($data.attr("data-box")){
				content = '<div>['+this.getText('brms_forum')+'] : <b>' +
				$data.attr("data-box") + '</b></div><ul class="listInline listInline--bullet"><li>'+this.getText('brms_views')+': <b>' +
				$data.attr("data-view") + '</b> </li><li>'+this.getText('brms_replies')+': <b>' +
				$data.attr("data-rep") + '</b> </li><li>'+this.getText('brms_likes')+': <b>' +
				$data.attr("data-like") + '</b> </li></ul></div>';
			}
			if(content){
				return '<div class="tooltip tooltip--basic tooltip--top" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-content">'+content+'</div></div>';
			}
		},

		getText: function(name, def)
		{
			var xfStatisticLang = XF.phrases;
			return xfStatisticLang[name] || def;
		}
	});

	XF.Element.register('brms-container', 'XF.BRMSContainer');
	XF.Element.register('brms-tooltip', 'XF.BRMSTooltip');
}
(jQuery, window, document);