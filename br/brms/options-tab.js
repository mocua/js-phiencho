
/** @param {jQuery} $ jQuery Object */
!function($, window, document)
{
	"use strict";

	XF.BRMSFieldAdder = XF.Element.newHandler({
		options: {
			incrementFormat: null,
			remaining: -1
		},

		$clone: null,
		created: false,

		init: function()
		{
			this.$clone = this.$target.clone();
			this.$clone.find('input:not(:checkbox), select, textarea').val('').prop("disabled", false);

			var self = this;
			this.$target.on('keypress change', function(e)
			{
				if ($(e.target).prop('readonly'))
				{
					return;
				}

				self.$target.off(e);
				self.create();
			});
		},

		create: function()
		{
			if (this.created)
			{
				return;
			}

			this.created = true;

			if (this.options.remaining == 0)
			{
				return;
			}

			var incrementFormat = this.options.incrementFormat;
			if (this.options.incrementFormat)
			{
				var incrementRegex = new RegExp('^' + XF.regexQuote(incrementFormat).replace('\\{counter\\}', '(\\d+)'));

				this.$clone.find('input, select, textarea').each(function()
				{
					var $this = $(this),
						name = $this.attr('name');

					name = name.replace(incrementRegex, function(prefix, counter)
					{
						return incrementFormat.replace('{counter}', parseInt(counter, 10) + 1);
					});

					$this.attr('name', name);
				});
			}

			if (this.options.remaining > 0)
			{
				this.$clone.attr('data-remaining', this.options.remaining - 1);
			}

			this.$clone.insertAfter(this.$target);

			XF.activate(this.$clone);
			XF.layoutChange();
		}
	});

	XF.BRMSTab = XF.Element.newHandler({

		options: {
		},

		$tabKind: null,
		$tabHeader: null,

		init: function()
		{
			var self = this;
			this.$target.find('.tabKind').change(XF.proxy(self, 'rebuilHeader'));
			this.$target.find('.tabType').change(XF.proxy(self, 'rebuilHeader'));
			this.$target.find('.collapse-button, .tabHeader').click(XF.proxy(self, 'collapseTab'));

			this.$target.on('collapse-tab', XF.proxy(self, 'collapseTab'));
			this.$tabHeader = this.$target.find('.block-formSectionHeader .tabHeader');
			this.$tabKind = this.$target.find('select.tabKind');

			this.$target.find('.hiddenSelector').change(function(){
				var $outer = $(this).closest('.hideParent');
				if($(this).val()){
					$outer.find(' > .hiddenContainer').addClass('active').hide();
					$outer.find(' > .hiddenContainer.hiddenContainer_'+$(this).val()).show();
				}else{
					$outer.find('.hiddenContainer').hide();
				}
			});
			this.rebuilHeader();
			this.hiddenSelectorTrigger();
		},

		collapseTab: function(e, options)
		{
			e.preventDefault();
			if(options){
				var collapse = (options && options.collapse);
				if(!collapse){
					this.$target.removeClass('collapsed');
				}else{
					this.$target.addClass('collapsed');
				}
			}else{
				if(this.$target.hasClass('collapsed')){
					this.$target.removeClass('collapsed');
				}else{
					this.$target.addClass('collapsed');
				}
			}
		},

		hiddenSelectorTrigger: function()
		{
			var $outer, currentVal;
			this.$target.find('.hiddenSelector').each(function(){
				$outer = $(this).closest('.hideParent');
				currentVal = $(this).val();
				if(currentVal){
					$outer.find(' > .hiddenContainer').addClass('active').hide();
					$outer.find(' > .hiddenContainer.hiddenContainer_'+ currentVal).removeClass('active').show();
				}else{
					$outer.find(' > .hiddenContainer').addClass('active').hide();
				}
			});
		},

		rebuilHeader: function()
		{
			var $tabKind = this.$tabKind,
				tapType, tapKind;
			var $tabType = this.$target.find('.hiddenContainer_'+ $tabKind.val() +' select.tabType');
			tapType = $tabType.find('option:selected').text();
			tapKind = $tabKind.find('option:selected').text();
			if($tabKind.val()){
				this.$tabHeader.text(tapKind + ' - ' + tapType);
			}else{
				this.$tabHeader.text(tapKind);
			}
		}
	});

	XF.BRMSAddTab = XF.Click.newHandler({
		eventNameSpace: 'BRMSAddTab',
		options: {
		},

		$clone: null,
		$cartUrl: null,

		init: function()
		{
		},

		click: function(e)
		{
			e.preventDefault();
			this.$clone = $('.listTabs').find('.brmsTab').last().clone();
			this.$clone.find('input:not(:checkbox), select, textarea').val('').prop("disabled", false);
			this.$clone.find('.inputNumber-button').remove();
			this.$clone.find('.js-numberBoxTextInput').val(0);
			var $newTab = this.$clone;
			var nextCounter = $('.listTabs').find('.brmsTab').length+1;
			$newTab.find('*[name]').each(function()
			{
				var self = $(this);
				self.attr('name', self.attr('name').replace(/\[(\d+)\]/, '[' + nextCounter + ']'));
			});
			$newTab.find('label').removeAttr('for');
			$newTab.find("input[name*='display_order']").val(nextCounter);
			$newTab.find('*[id]').each(function()
			{
				var self = $(this);
				self.removeAttr('id');
				self.xfUniqueId();
			});
			$newTab.appendTo($('.listTabs'));

			XF.activate($newTab);
			XF.layoutChange();
		}
	});

	XF.BRMSCollapse = XF.Click.newHandler({
		eventNameSpace: 'BRMSCollapse',
		options: {
		},

		$allTabContent: null,

		init: function()
		{
			this.$allTabContent = $('.listTabs').find('.brmsTab > .block-body');
		},

		click: function(e)
		{
			e.preventDefault();
			if(this.$target.hasClass('collapsed')){
				this.$target.removeClass('collapsed');
				$('.brmsTab').trigger('collapse-tab', {collapse: false});
			}else{
				this.$target.addClass('collapsed');
				$('.brmsTab').trigger('collapse-tab', {collapse: true});
			}
		}
	});

	XF.Element.register('brms-field-adder', 'XF.BRMSFieldAdder');
	XF.Element.register('brms-tab', 'XF.BRMSTab');
	XF.Click.register('brms-add-tab', 'XF.BRMSAddTab');
	XF.Click.register('brms-collapse', 'XF.BRMSCollapse');

}
(jQuery, window, document);