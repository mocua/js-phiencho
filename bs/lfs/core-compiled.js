jQuery.expr[":"].regex=function(d,c,b){c=b[3].split(",");var a=/^(data|css):/;b=c[0].match(a)?c[0].split(":")[0]:"attr";a=c.shift().replace(a,"");return(new RegExp(c.join("").replace(/^\s+|\s+$/g,""),"ig")).test(jQuery(d)[b](a))};
!function(d,c,b){XF.LFS=XF.Element.newHandler({options:{updateInterval:15,updateLink:"/index.php?lfs/tab",differentTimeout:600,pollUnfocused:!1,widgetKey:"",widgetId:0},groups:[],prevTypeWindow:"",isActiveWindow:!0,init:function(){var a=this;this.groups=[];this.$target.find(".tabGroup").each(function(){a.groups.push(new XF.LFSGroup(a,d(this)))});this.$target.find(".js-refreshButton").click(XF.proxy(this,"refresh"));0!==this.options.updateInterval&&(this.updateInterval=setInterval(XF.proxy(this,"update"),
1E3*this.options.updateInterval));this.$sound=this.$target.find(".js-sound");d(b).on("lfs:refresh",XF.proxy(this,"update"))},refresh:function(a){this.update(a,!0)},update:function(a,c,e){(b.hasFocus()||this.options.pollUnfocused)&&d.each(this.groups,function(a,b){b.updateLock||b.update(c,e)})},playSoundIfHas:function(){"true"!==XF.Cookie.get("lfs_mute_"+this.options.widgetId)&&this.$sound.length&&this.$sound[0].play()}});XF.Element.register("lfs","XF.LFS")}(window.jQuery,window,document);

!function(c,g,f){XF.LFSGroup=XF.create({options:{groupId:"",carouselInterval:0},lfs:null,tabs:null,$target:null,ajaxData:{},updateLock:!1,__construct:function(a,b,e){this.options=XF.applyDataOptions(this.options,b.data(),e);this.lfs=a;this.$target=b;this.$groupContent=b.find(".tabGroup-content");this.$groupScroller=b.find(".tabGroup-scroller");this.$content=b.find(".content");this.defineScrollPaginator();this.options.carouselInterval&&setInterval(XF.proxy(this,"switchToNextTab"),1E3*this.options.carouselInterval);
this.tabs=new XF.LFSTabs(a,this,b.find("ul.tabs"));c(f).on("lfs_ajax_extend-"+this.options.groupId,XF.proxy(this,"extendAjaxData"));XF.Cookie.get("lfs_ajax_"+this.options.groupId)&&(this.ajaxData=XF.Cookie.get("lfs_ajax_"+this.options.groupId))},defineScrollPaginator:function(){this.paginator=new XF.LFSScrollPaginator(this,this.$groupScroller)},resetScroll:function(){this.$groupScroller.scrollTop(0)},update:function(a,b){this.startUpdating(a);this.tabs.selectedTab.loadData(XF.proxy(this,"endUpdating"),
!1,b)},$scrollerLoadingSpinner:null,startUpdating:function(a){this.updateLock=!0;a&&(this.$groupContent.addClass("is-updating"),this.$scrollerLoadingSpinner=this.getLoadingSpinner().appendTo(this.$groupScroller))},endUpdating:function(){this.updateLock=!1;this.$groupContent.removeClass("is-updating");this.$scrollerLoadingSpinner&&this.$scrollerLoadingSpinner.remove()},loading:function(){this.$content.html("");this.getLoadingSpinner().appendTo(this.$groupScroller)},switchToNextTab:function(){this.tabs.next().select()},
clearDifferentTimeout:null,replaceContent:function(a,b,e,c){var d=!1;0<a.html().replace(" ","").length&&(this.$content.find("*:regex(data-xf-init, [a-zA-z]*tooltip)").trigger("tooltip:hide"),e||this.markDifferentItems(a)&&this.lfs.playSoundIfHas(),this.$content=a.filter(".content").replaceAll(this.$content),XF.activate(this.$content),c&&a.filter(".js-lfsPageNav").length&&(a.filter(".js-lfsPageNav").replaceAll(this.paginator.$pageNav),this.paginator.reloadContent()),this.clearDifferentTimeout&&clearTimeout(this.clearDifferentTimeout),
this.clearDifferentTimeout=setTimeout(XF.proxy(this,"clearDifferentItems"),this.lfs.options.differentTimeout),d=!0);this.$groupScroller.find(".js-loader").remove();"function"==typeof b&&b.call(null,d)},markDifferentItems:function(a){var b=this.$content.find(".structItem--lfsItem");a=a.find(".structItem--lfsItem");a.each(function(){var a=c(this),d=b.filter("#"+a.attr("id"));d&&d.data("date")===a.data("date")||a.addClass("structItem--different")});return 0<a.filter(".structItem--different").length},
clearDifferentItems:function(){this.$content.find(".structItem--different").removeClass("structItem--different")},getLoadingSpinner:function(){return c('<div class="loader-block js-loader"><div class="loader"><div></div><div></div></div></div>')},extendAjaxData:function(a,b){this.ajaxData=c.extend(!0,this.ajaxData,b);XF.Cookie.set("lfs_ajax_"+this.options.groupId,JSON.stringify(b));this.update()}})}(window.jQuery,window,document);

!function(f,h,k){XF.LFSTabs=XF.create({options:{isMenu:!1},lfs:null,group:null,$target:null,tabList:[],selectedTab:null,$menuTab:null,$settingButton:null,__construct:function(a,d,c,b){"undefined"===typeof b&&(b={});this.options=XF.applyDataOptions(this.options,c.data(),b);this.tabList=[];var e=this;this.lfs=a;this.group=d;this.$target=c;c.find(".tab:not(.menu-open)").each(function(){e.tabList.push(new XF.LFSTab(e.lfs,e,f(this)))});this.options.isMenu&&(this.$menuTab=c.find(".tab.menu-open"));this.$settingButton=
this.$target.closest(".tabs-container").find(".js-settingButton");this.selectedTab||this.first().select()},selectTab:function(a){this.selectedTab=a;this.$settingButton&&this.$settingButton.length&&(this.$settingButton.toggleClass("is-active",a.options.canSetting).data("href",a.options.settingHref),XF.Click.getElementHandler(this.$settingButton,"overlay").loadUrl=a.options.settingHref)},remove:function(a){a=this.indexOf(a);-1!==a&&(this.tabList[a].$target.remove(400),this.tabList.splice(a,1),this.first().select())},
first:function(){return this.tabList[0]},next:function(){var a=this.indexOf(this.selectedTab)+1;return"undefined"!==typeof this.tabList[a]?this.tabList[a]:this.first()},indexOf:function(a){return this.tabList.indexOf(a)}});XF.LFSTab=XF.create({options:{tabId:"",canSetting:!1,settingHref:""},lfs:null,tabs:null,$target:null,selected:!1,cache:{},__construct:function(a,d,c,b){"undefined"===typeof b&&(b={});this.options=XF.applyDataOptions(this.options,c.data(),b);this.lfs=a;this.tabs=d;this.$target=c.click(XF.proxy(this,
"select"));c.is(".is-selected")&&(this.selected=!0,this.tabs.selectTab(this),this.cache={content:f(this.tabs.group.$groupScroller.html())})},loadData:function(a,d,c){var b=this,e=f.extend(!0,this.tabs.group.ajaxData,{tab_id:this.options.tabId}),g=this.cache;XF.ajax("GET",this.lfs.options.updateLink,e,function(e){e.html&&e.html.content&&XF.setupHtmlInsert(e.html,function(a){f.isEmptyObject(g)?b.cache={content:a}:g.content=a;b.tabs.group.replaceContent(a,function(a){a||b.tabs.remove(this)},d,c)});"function"===
typeof a&&a.call(null)},{global:!1})},select:function(){if(this.tabs.group.updateLock)return this;var a=this,d=this.tabs.selectedTab;if(d){if(d===this)return this;d.deselect()}this.tabs.group.updateLock=!0;this.tabs.options.isMenu&&this.tabs.$menuTab.find(".title").text(a.$target.find(".title").text());this.$target.addClass("is-selected");this.selected=!0;this.tabs.selectTab(this);XF.Cookie.set("lfs_group_"+this.tabs.group.options.groupId+"_selected_tab",this.options.tabId);f.isEmptyObject(this.cache)?
this.tabs.group.loading():this.tabs.group.replaceContent(this.cache.content,null,!0,!0);this.loadData(function(){a.tabs.group.updateLock=!1;a.tabs.group.resetScroll()},!0,!0);return this},deselect:function(){this.$target.removeClass("is-selected");this.tabs.group.paginator.clearAppend()},isSelected:function(){return this.selected}})}(window.jQuery,window,document);

!function(c,d,e){XF.LFSScrollPaginator=XF.create({options:{append:"",filter:""},$append:null,loading:!1,__construct:function(a,b){this.options=XF.applyDataOptions(this.options,b.data());this.group=a;this.$target=b;this.init()},init:function(){this.loadPageNav();if(this.$pageNav.length&&(this.loadElements(),this.$target.on("scroll",XF.proxy(this,"onScroll")).on("lfs:group-content-updated",XF.proxy(this,"reloadContent")),this.$target.height()!==this.$target.get(0).scrollHeight))this.onScroll()},loadPageNav:function(){this.$pageNav=
this.$target.find(".js-lfsPageNav").first()},loadElements:function(){this.$append=this.$target.find(this.options.append);this.detectPageParams()},reloadContent:function(){this.loadPageNav();this.$pageNav.length&&this.loadElements()},currentPage:0,lastPage:0,detectPageParams:function(){this.currentPage=parseInt(this.$pageNav.find(".pageNav-page--current").find("a").text(),10);this.lastPage=parseInt(this.$pageNav.find(".pageNav-page").last().find("a").text(),10)},onScroll:function(){!this.isBottom()||
this.isLastPage()||this.group.updateLock||this.load()},load:function(){this.loading||(this.loading=!0,this.appendLoadingSpinner(),this.sendRequest(this.$pageNav.find(".pageNav-page--current").next().find("a").attr("href")))},requestUrl:"",sendRequest:function(a){this.requestUrl=a;XF.ajax("GET",a,{},XF.proxy(this,"appendHtml"))},appendHtml:function(a){if(a.hasItems){var b=this;XF.setupHtmlInsert(a.html,function(a){b.$pageNav.html(a.filter(".js-lfsPageNav").first().html());b.detectPageParams();b.clearLoadingSpinner();
XF.activate(b.$append.append(a.filter(b.options.filter)))})}else this.lastPage=this.currentPage,this.clearLoadingSpinner();this.loading=!1},clearAppend:function(){this.$append&&this.$append.length&&this.$append.html("")},isBottom:function(){return this.$target.scrollTop()+this.$target.height()>=this.$target.get(0).scrollHeight-1},isLastPage:function(){return this.currentPage===this.lastPage},appendLoadingSpinner:function(){this.$target.append(this.getLoadingSpinner()).scrollTop(this.$target.get(0).scrollHeight)},
clearLoadingSpinner:function(){this.$target.find(".js-loadingSpinner").remove()},getLoadingSpinner:function(){return c('<div class="page-loading-spinner js-loadingSpinner"><div class="spins"><div></div><div></div><div></div><div></div></div></div>')}})}(window.jQuery,window,document);

!function(a,c,b){XF.LFSSubmitRefresh=XF.Element.newHandler({init:function(){this.$target.on("submit",function(){setTimeout(function(){a(b).trigger("lfs:refresh",[!0])},150)})}});XF.Element.register("lfs-submit-refresh","XF.LFSSubmitRefresh")}(window.jQuery,window,document);

!function(b,d,c){XF.LFSAjaxDataReplacerClick=XF.Click.newHandler({eventNameSpace:"XFLFSAjaxDataReplacerClick",options:{name:"",val:"",groupId:""},init:function(){},click:function(){if(this.options.groupId&&this.options.name&&this.options.val){var a={};a[this.options.name]=this.options.val;b(c).trigger("lfs_ajax_extend-"+this.options.groupId,[a])}}});XF.LFSMuteClick=XF.Click.newHandler({eventNameSpace:"XFLFSMuteClick",options:{widgetId:0},init:function(){},click:function(){this.$target.toggleClass("is-muted");
XF.Cookie.set("lfs_mute_"+this.options.widgetId,this.$target.hasClass("is-muted"))}});XF.Click.register("lfs-ajax-data-replacer","XF.LFSAjaxDataReplacerClick");XF.Click.register("lfs-mute","XF.LFSMuteClick")}(window.jQuery,window,document);