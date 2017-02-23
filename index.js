/**
 * Created by molodyko on 14.10.2015.
 */

var SamsonAnimate = {};
(function(Animate){


    var Config = {};

    Config.get = function(key) {
        if (Config.data[key] != null) {
            return Config.data[key];
        } else {
            throw new Error('Key ['+key+'] not found');
        }
    };

    Animate.blocks = [];

    Animate.addOnLoadHandler = function (fn) {
        Animate.onLoadAll = fn;
    };

    Animate.start = function(config) {
        Config.data = config;
        if (Config.get('link-pattern') != null) {
            var target = s('html');
            Animate.init();
            Animate.prepare(target);
        }
    };

    Animate.init = function() {
        var startBlock = s(Config.get('block-item'), s(Config.get('block-base')));
        startBlock.DOMElement.setAttribute('data-id', Link.currentLink());
        startBlock.addClass(Config.get('class-current-block'));
        var result = [];
        for (var i in Config.get('additional-block')) {
            var block = Config.get('additional-block')[i];
            result.push({'html': s(block.id).html(), 'class': block.id});
        }
        Animate.blocks[Link.currentLink()] = result;
    };

    Animate.prepare = function(target) {
        var links = Link.findAnimateLinks(target, Config.get('class-link'), Config.get('link-pattern'));
        setTimeout(function() {
            Animate.loadBlock(links);
        }, 10);
    };

    Animate.loadBlock = function(links, callback) {

        var countRequest = 0;
        for (var i in links) {
            (function(i){

                var link = links[i].link;

                Button.init(links[i]);
                var baseBlock = s(Config.get('block-base'));

                // If block have already exists
                if (callback == undefined) {

                    if (s(Config.get('block-item')+'[data-id="'+link.a('href')+'"]', baseBlock).length > 0) {
                        return;
                    }
                }

                if (link.hasClass(Config.get('class-link-after-load')) && callback == undefined) {
                    countRequest++;
                } else {

                    if (s(Config.get('block-item')+'[data-id="'+link.a('href')+'"]', baseBlock).length > 0) {

                        s(Config.get('block-item')+'[data-id="'+link.a('href')+'"]', baseBlock).remove();
                    }

                    // alert('defrequest');
                    // // console.log(link.attr('class'));
                    //
                    // if (link.hasClass(Config.get('deferred-request'))) {
                    //     alert('defrequest');
                    // }

                    function httpGetAsync(theUrl, callback)
                    {
                        var xmlHttp = new XMLHttpRequest();
                        xmlHttp.onreadystatechange = function() {
                            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                                callback(xmlHttp.responseText);
                        };
                        xmlHttp.open("GET", theUrl, true); // true for asynchronous
                        xmlHttp.send(null);
                    }

                    httpGetAsync(link.a('href'), function(content){
                        if (content != '') {

                            Animate.parseContent(content, links[i]);

                            countRequest++;

                            if (links.length == countRequest) {
                                if (typeof Animate.onLoadAll === 'function') {
                                    Animate.onLoadAll();
                                }
                            }

                            if (typeof callback == 'function') {

                                callback(links);
                            }
                        }
                    });

                    var xh = new XMLHttpRequest()
                }
            })(i);
            //return;
        }
    };

    Animate.parseContent = function(content, link) {
        var wrapper = document.createElement('html');
        var content = s(wrapper).append(content);
        var itemBlock = s(Config.get('block-item'), content);

        var baseBlock = s(Config.get('block-base'));
        if (itemBlock != null && itemBlock.length > 0) {
            if (Config.get('animations')[link['animation']] == null) {
                throw  new Error('Animation ['+link['animation']+'] is not defined');
            }
            if (Config.get('additional-block').length > 0) {
                var result = [];
                for (var i in Config.get('additional-block')) {
                    var block = Config.get('additional-block')[i];
                    var blockContent = s(block.id, content);
                    if (blockContent.length > 0) {
                        result.push({'html': blockContent.html(), 'class': block.id});
                    }
                }
                Animate.blocks[link.link.a('href')] = result;
            }
            var animationClass = Config.get('animations')[link['animation']];
            itemBlock.addClass(animationClass);
            itemBlock.DOMElement.setAttribute('data-id', link.link.a('href'));
            baseBlock.append(itemBlock);
        }
    };

    var Link = {};

    Link.findAnimateLinks = function(target, klass, patterns) {

        try{

            var links = s('a', target);
            var result = [];
            for (var i in links.elements) {
                var link = links.elements[i];
                var href = link.a('href');
                if (href != null) {

                    // If link has animate class
                    if (klass != null) {
                        if (link.hasClass(klass)) {
                            result.push({
                                'link': link,
                                'animation': link.a('data-animation') != null ? link.a('data-animation') : Config.get('default-animation')
                            });
                        }
                    }

                    // If link href matches of pattern
                    if (patterns != null) {
                        for (var j in patterns) {
                            var pattern = patterns[j];
                            if (href.match(pattern.pattern)) {
                                // Find animation class
                                var animation = link.a('data-animation') != null ? link.a('data-animation')
                                    : (pattern.animation != null ? pattern.animation : Config.get('default-animation'));

                                result.push({
                                    'link': link,
                                    'animation': animation
                                });
                            }
                        }
                    }
                }
            }
        } catch (e) {

        }

        return result;
    };

    Link.currentLink = function() {
        return window.location.href.replace(/\/$/, '');
    };

    var Button = {};

    Button.init = function(param) {
        var link = param.link;

        link.unbind('click');
        if (link.hasClass(Config.get('class-link-after-load'))) {
            link.click(function(){
                setTimeout(function(){

                    Loader.show();
                    try{
                        //if (s(Config.get('block-item')+'[data-id="'+link.a('href')+'"]').length == 0) {
                        //link.removeClass(Config.get('class-link-after-load'));
                        Animate.loadBlock([{'link': link, 'animation': 'left'}], function (links) {
                            setTimeout(function () {

                                Loader.hide();

                                onClick(links[0].link);
                                Animate.loader.fire();
                            }, 100);
                        });
                        //} else {
                        //
                        //    Loader.hide();
                        //
                        //    onClick(link);
                        //    Animate.loader.fire();
                        //}
                    } catch(e) {
                        console.log(e);
                    }
                }, 10);
            }, true, true);
            return;
        }

        link.click(function(){

            onClick(link); }, true, true);

        function onClick(link){
            try{

                Animate.loader.fireHandler();

                if (Animate.blocks[link.a('href')] != null) {
                    var inner = Animate.blocks[link.a('href')];
                    for (var i in inner) {

                        var foundBlock = s(inner[i].class, s('html'));

                        foundBlock.html(inner[i].html);
                    }
                }
                var block = s(Config.get('block-item')+'[data-id="'+link.a('href')+'"]');
                var animation = Animate.toggleNextAnimation(block.elements[0]);

                setTimeout(function(){
                    console.log('prepare');
                    Animate.prepare(block);
                    //Animate.loader.fire();
                }, 300);
            } catch(e) {
                console.log(e);
            }
        }
    };

    Animate.toggleCurrentBlock = function(animations) {

        var currentBlock = s(Config.get('block-item')+'.'+Config.get('class-current-block'), Config.get('block-base'));
        currentBlock.removeClass(Config.get('class-current-block'));

        if (animations == 'left') {
            var classAnimation = Config.get('animations')['right'];
        } else {
            var classAnimation = Config.get('animations')['left'];
        }

        //var classAnimation;
        // If set next animation then go to there
        //if (link.a('data-next-animation') != null) {
        //    classAnimation = Config.get('animations')[link.a('data-next-animation')];
        //} else {
        //
        //    // If this is the first block then set it default data animation
        //    var animation = currentBlock.a('data-animation');
        //    classAnimation = animation;
        //    if (animation == null) {
        //
        //        animation = Config.get('start-animation');
        //        classAnimation = Config.get('animations')[animation];
        //        currentBlock.DOMElement.setAttribute('data-animation', classAnimation);
        //    }
        //}
        currentBlock.addClass(classAnimation);
    };

    Animate.toggleNextAnimation = function(block) {
        var animation = Config.get('animations');
        for (var i in animation) {
            var animationClass = animation[i];
            if (block.hasClass(animationClass)) {
                Animate.toggleCurrentBlock(i);
                block.DOMElement.setAttribute('data-animation', animationClass);
                block.removeClass(animationClass);
                block.addClass(Config.get('class-current-block'));
                return i;
            }
        }
        return false;
    };


    Animate.loader = new Object();

    Animate.loader.add = function(func, target){
        if (Animate.loader.functions == null) {
            Animate.loader.functions = [];
        }
        Animate.loader.functions[target] = func;
    };

    Animate.loader.addHandler = function(func, target){
        if (Animate.loader.functionsHandler == null) {
            Animate.loader.functionsHandler = [];
        }
        Animate.loader.functionsHandler[target] = func;
    };

    Animate.loader.fire = function(){
        if (Animate.loader.functions != null) {
            for (var i in Animate.loader.functions) {
                if (s(i).length != 0){

                    Animate.loader.functions[i](s(i));

                    //delete Animate.loader.functions[i];
                }
            }
        }
        console.log('fire');
    };

    Animate.loader.fireHandler = function(){
        if (Animate.loader.functionsHandler != null) {
            for (var i in Animate.loader.functionsHandler) {
                if (s(i).length != 0){

                    Animate.loader.functionsHandler[i](s(i));

                    //delete Animate.loader.functionsHandler[i];
                }
            }
        }
    };

    var Loader = {};

    Loader.hide = function(){
        s('html').removeClass('loader-on');
    };

    Loader.show = function(){
        s('html').addClass('loader-on');
    };

})(SamsonAnimate);
