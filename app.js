(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var unalias = function(alias, loaderPath) {
    var result = aliases[alias] || aliases[alias + '/index.js'];
    return result || alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from ' + '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("javascripts/app", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Search = {
  init: function init() {
    moment.locale('fr');
    this.search = instantsearch({
      appId: 'O3F8QXYK6R',
      apiKey: '36caf26b37562229d205f0eeceeac37f',
      indexName: 'humantalks',
      urlSync: true
    });

    this.showMoreTemplates = {
      inactive: '<a class="ais-show-more ais-show-more__inactive">Voir plus</a>',
      active: '<a class="ais-show-more ais-show-more__active">Voir moins</a>'
    };

    this.websiteUrl = 'https://pixelastic.github.io/humantalks/';

    // this.search.on('render', this.onRender);

    this.addSearchBoxWidget();
    // this.addStatsWidget();
    // this.addTagsWidget();
    // this.addAuthorsWidget();
    // this.addTypeWidget();
    // this.addRessourcesWidget();
    // this.addYearWidget();
    this.addHitsWidget();
    // this.addPaginationWidget();

    this.search.start();
  },

  // onRender() {
  //   // Enable lazyloading of images below the fold
  //   let hits = $('.hit');
  //   function onVisible(hit) {
  //     $(hit).addClass('hit__inViewport');
  //   }
  //   _.each(hits, (hit) => {
  //     inViewport(hit, {offset: 50}, onVisible);
  //   });
  // },
  // // Check if the specified facet value is currently refined
  // isRefined(facetName, facetValue) {
  //   let facetRefinements = Search.search.helper.getRefinements(facetName);
  //   return !!_.find(facetRefinements, { value: facetValue });
  // },
  cloudinary: function cloudinary(url, options) {
    if (!url) {
      return url;
    }
    var baseUrl = 'https://res.cloudinary.com/pixelastic-humantalks/image/fetch/';
    var stringOptions = [];

    // Handle common Cloudinary options
    if (options.width) {
      stringOptions.push('w_' + options.width);
    }
    if (options.height) {
      stringOptions.push('h_' + options.height);
    }
    if (options.quality) {
      stringOptions.push('q_' + options.quality);
    }
    if (options.crop) {
      stringOptions.push('c_' + options.crop);
    }
    if (options.radius) {
      stringOptions.push('r_' + options.radius);
    }
    if (options.format) {
      stringOptions.push('f_' + options.format);
    }
    if (options.colorize) {
      stringOptions.push('e_colorize:' + options.colorize);
    }
    if (options.grayscale) {
      stringOptions.push('e_grayscale');
    }
    if (options.color) {
      stringOptions.push('co_rgb:' + options.color);
    }
    if (options.gravity) {
      stringOptions.push('g_' + options.gravity);
    }

    // Fix remote urls
    url = url.replace(/^\/\//, 'http://');

    return '' + baseUrl + stringOptions.join(',') + '/' + url;
  },
  transformItem: function transformItem(data) {
    // <!--Todo:-->
    // <!--Facetting sur les speakers dans la sidebar-->
    // <!--Facetting sur les lieux dans la sidebar-->
    // <!--Facetting sur la date dans la sidebar-->
    // <!--Facetting sur les lieux/speakers/évenement dans les hits-->
    // <!--Pagination-->
    // <!--Lien sur le logo de clear all-->
    // <!--RWD petit écran un résultat par ligne-->

    // Title
    var title = Search.getHighlightedValue(data, 'title');

    // Description
    var description = data._snippetResult.description.value;
    description = description.replace(' …', '…');

    // Various urls
    var videoUrl = data.video;
    var slidesUrl = data.slides;
    var meetupUrl = data.meetup;
    var hasVideo = !!videoUrl;
    var hasSlides = !!slidesUrl;

    // Thumbnail
    var thumbnail = data.thumbnail;
    if (!thumbnail) {
      thumbnail = Search.websiteUrl + '/img/default.png';
    }
    var thumbnailLink = meetupUrl;
    if (hasSlides) {
      thumbnailLink = slidesUrl;
    } else if (hasVideo) {
      thumbnailLink = videoUrl;
    }

    // Authors
    var authors = _.map(data.authors, function (author, index) {
      if (!author.picture) {
        author.picture = Search.websiteUrl + '/img/default-speaker.png';
      }
      var picture = Search.cloudinary(author.picture, {
        height: 50,
        width: 50,
        quality: 90,
        grayscale: true,
        crop: 'scale',
        radius: 'max',
        format: 'auto'
      });

      var link = '#';
      if (author.twitter) {
        link = 'https://twitter.com/' + author.twitter;
      }
      return {
        plainName: author.name,
        highlightedName: data._highlightResult.authors[index].name.value,
        link: link,
        picture: picture
      };
    });

    // Date
    var readableDate = _.capitalize(moment(data.date, 'YYYY-MM-DD').format('DD MMMM YYYY'));

    // Location
    var locationName = data.location;
    var locationLogo = '' + Search.websiteUrl + data.location_logo;
    var readableLocation = locationName;
    if (locationLogo) {
      var logoPicture = Search.cloudinary(locationLogo, {
        height: 20,
        quality: 90,
        crop: 'scale',
        format: 'auto'
      });
      readableLocation = '<img class="v-textbottom" src="' + logoPicture + '" alt="' + locationName + '" />';
    }

    var displayedData = {
      title: title,
      description: description,
      thumbnail: thumbnail,
      thumbnailLink: thumbnailLink,
      hasVideo: hasVideo,
      videoUrl: videoUrl,
      hasSlides: hasSlides,
      slidesUrl: slidesUrl,
      meetupUrl: meetupUrl,
      authors: authors,
      readableDate: readableDate,
      readableLocation: readableLocation
    };

    return displayedData;
    // // All items are defered loading their images until in viewport, except
    // // the 4 first
    // let inViewport = false;
    // if (Search.lazyloadCounter === undefined || Search.lazyloadCounter < 4) {
    //   inViewport = true;
    // }
    // Search.lazyloadCounter++;


    // // Ressources
    // let video = _.get(data, 'ressources.video');
    // let slides = _.get(data, 'ressources.slides');

    // // Thumbnail
    // let thumbnail = data.thumbnail;
    // if (thumbnail) {
    //   if (_.startsWith(thumbnail, './img')) {
    //     thumbnail = `https://pixelastic.github.io/parisweb/${thumbnail}`;
    //   }
    //   thumbnail = Search.cloudinary(thumbnail, {
    //     quality: 90,
    //     format: 'auto'
    //   });
    // }
    // let thumbnailLink = video || slides;


    // // Tags
    // let tags = _.map(data.tags, (tag, index) => {
    //   return {
    //     plainValue: tag,
    //     highlightedValue: data._highlightResult.tags[index].value,
    //     isRefined: Search.isRefined('tags', tag),
    //   }
    // });

    // let displayData = {
    //   uuid: data.objectID,
    //   inViewport,
    //   isConference,
    //   isWorkshop,
    //   title: Search.getHighlightedValue(data, 'title'),
    //   url: data.url,
    //   description,
    //   year: data.year,
    //   thumbnail,
    //   thumbnailLink,
    //   video,
    //   slides,
    //   tags,
    //   authors,
    //   objectID: data.objectID
    // };

    // return displayData;
  },
  getHighlightedValue: function getHighlightedValue(object, property) {
    if (!_.has(object, '_highlightResult.' + property + '.value')) {
      return object[property];
    }
    return object._highlightResult[property].value;
  },
  addSearchBoxWidget: function addSearchBoxWidget() {
    this.search.addWidget(instantsearch.widgets.searchBox({
      container: '#js-searchbar',
      wrapInput: false,
      placeholder: 'Rechercher un thème, un speaker, un lieu'
    }));
  },
  addStatsWidget: function addStatsWidget() {
    this.search.addWidget(instantsearch.widgets.stats({
      container: '#stats'
    }));
  },
  addTagsWidget: function addTagsWidget() {
    this.search.addWidget(instantsearch.widgets.refinementList({
      container: '#tags',
      attributeName: 'tags',
      operator: 'and',
      limit: 10,
      showMore: {
        limit: 20,
        templates: Search.showMoreTemplates
      }
    }));
  },
  addAuthorsWidget: function addAuthorsWidget() {
    this.search.addWidget(instantsearch.widgets.refinementList({
      container: '#authors',
      attributeName: 'authors.name',
      operator: 'or',
      sortBy: ['isRefined', 'name:asc', 'count:desc'],
      limit: 10,
      showMore: {
        limit: 20,
        templates: Search.showMoreTemplates
      }
    }));
  },
  addTypeWidget: function addTypeWidget() {
    this.search.addWidget(instantsearch.widgets.refinementList({
      container: '#type',
      attributeName: 'type'
    }));
  },
  addRessourcesWidget: function addRessourcesWidget() {
    this.search.addWidget(instantsearch.widgets.refinementList({
      container: '#ressources',
      attributeName: 'availableRessources',
      operator: 'and'
    }));
  },
  addYearWidget: function addYearWidget() {
    this.search.addWidget(instantsearch.widgets.rangeSlider({
      container: '#year',
      attributeName: 'year',
      tooltips: {
        format: _.parseInt
      },
      pips: false,
      step: 1
    }));
  },
  addHitsWidget: function addHitsWidget() {
    var hitTemplate = $('#js-template-hits').html();
    var noResults = $('#js-template-noresults').html();
    this.search.addWidget(instantsearch.widgets.hits({
      container: '#js-hits',
      hitsPerPage: 10,
      cssClasses: {
        root: 'flex-row-wrap mb3 debu',
        item: 'flex-auto w-50 flex'
      },
      templates: {
        item: hitTemplate,
        empty: noResults
      },
      transformData: {
        item: Search.transformItem
      }
    }));

    // // Allow user to further select/deselect facets directly in the hits
    // let hitContainer = $('#hits');
    // hitContainer.on('click', '.js-facet-toggle', (event) => {
    //   var target = $(event.currentTarget);
    //   var facetName = target.data('facet-name');
    //   var facetValue = target.data('facet-value');
    //   Search.search.helper.toggleRefinement(facetName, facetValue).search();
    //   target.toggleClass('hit-facet__isRefined');
    // });
  },
  addPaginationWidget: function addPaginationWidget() {
    this.search.addWidget(instantsearch.widgets.pagination({
      container: '#pagination',
      labels: {
        previous: '‹ Précédent',
        next: 'Suivant ›'
      },
      showFirstLast: false
    }));
  }
};

exports.default = Search;

});

