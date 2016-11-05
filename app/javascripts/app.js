let Search = {
  init() {
    moment.locale('fr');
    this.search = instantsearch({
      appId: 'O3F8QXYK6R',
      apiKey: '36caf26b37562229d205f0eeceeac37f',
      indexName: 'humantalks',
      urlSync: true,
    });

    this.showMoreTemplates = {
      inactive:'<a class="db tr purple mr2 mt1 pointer">Voir plus »</a>',
      active:'<a class="db tr purple mr2 mt1 pointer">« Voir moins</a>'
    }

    this.websiteUrl = 'https://pixelastic.github.io/humantalks/';

    this.addSearchBoxWidget();
    this.addStatsWidget();
    this.addSpeakersWidget();
    this.addLocationsWidget();
    this.addHitsWidget();
    this.addPaginationWidget();

    this.search.start();
  },
  cloudinary(url, options) {
    if (!url) {
      return url;
    }
    let baseUrl = 'https://res.cloudinary.com/pixelastic-humantalks/image/fetch/';
    let stringOptions = [];

    // Handle common Cloudinary options
    if (options.width) {
      stringOptions.push(`w_${options.width}`);
    }
    if (options.height) {
      stringOptions.push(`h_${options.height}`);
    }
    if (options.quality) {
      stringOptions.push(`q_${options.quality}`);
    }
    if (options.crop) {
      stringOptions.push(`c_${options.crop}`);
    }
    if (options.radius) {
      stringOptions.push(`r_${options.radius}`);
    }
    if (options.format) {
      stringOptions.push(`f_${options.format}`);
    }
    if (options.colorize) {
      stringOptions.push(`e_colorize:${options.colorize}`);
    }
    if (options.grayscale) {
      stringOptions.push(`e_grayscale`);
    }
    if (options.color) {
      stringOptions.push(`co_rgb:${options.color}`);
    }
    if (options.gravity) {
      stringOptions.push(`g_${options.gravity}`);
    }

    // Fix remote urls
    url = url.replace(/^\/\//, 'http://');

    return `${baseUrl}${stringOptions.join(',')}/${url}`;
  },
  transformItem(data) {
// <!--Todo:-->
// <!--Lien sur le logo de clear all-->
// <!--RWD petit écran un résultat par ligne-->
    
    // Various urls
    let videoUrl = data.video;
    let slidesUrl = data.slides;
    let meetupUrl = data.meetup;
    let hasVideo = !!videoUrl;
    let hasSlides = !!slidesUrl;

    // Title
    let title = Search.getHighlightedValue(data, 'title');
    // Default link goes to video, fallback on slides or meetup page
    let titleLink = videoUrl;
    if (!titleLink) {
      titleLink = slidesUrl;
    }
    if (!titleLink) {
      titleLink = meetupUrl;
    }

    // Description
    let description = data._snippetResult.description.value;
    description = description.replace(' …', '…');


    // Thumbnail
    let thumbnail = data.thumbnail;
    if (!thumbnail) {
      thumbnail = `${Search.websiteUrl}/img/default.png`;
    }
    let thumbnailLink = meetupUrl;
    if (hasSlides) {
      thumbnailLink = slidesUrl;
    } else if (hasVideo) {
      thumbnailLink = videoUrl;
    }

    // Authors
    let authors = _.map(data.authors, (author, index) => {
      if (!author.picture) {
        author.picture = `${Search.websiteUrl}/img/default-speaker.png`;
      }
      let picture = Search.cloudinary(author.picture, {
        height: 50,
        width: 50,
        quality: 90,
        crop: 'scale',
        radius: 'max',
        format: 'auto'
      });

      let link = '#';
      if (author.twitter) {
        link = `https://twitter.com/${author.twitter}`
      }
      return {
        plainName: author.name,
        highlightedName: data._highlightResult.authors[index].name.value,
        link,
        picture
      }
    });

    // Date
    let readableDate = _.capitalize(moment(data.date, 'YYYY-MM-DD').format('DD MMMM YYYY'));

    // Location
    let locationName = data.location;
    let locationLogo = `${Search.websiteUrl}${data.location_logo}`;
    let readableLocation = locationName;
    if (locationLogo) {
      let logoPicture = Search.cloudinary(locationLogo, {
        height: 20,
        quality: 90,
        crop: 'scale',
        format: 'auto'
      });
      readableLocation = `<img class="v-textbottom" src="${logoPicture}" alt="${locationName}" />`
    }
    


    let displayedData = {
      title,
      titleLink,
      description,
      thumbnail,
      thumbnailLink,
      hasVideo,
      videoUrl,
      hasSlides,
      slidesUrl,
      meetupUrl,
      authors,
      readableDate,
      readableLocation
    }

    return displayedData;
  },
  getHighlightedValue(object, property) {
    if (!_.has(object, `_highlightResult.${property}.value`)) {
      return object[property];
    }
    return object._highlightResult[property].value;
  },
  addSearchBoxWidget() {
    this.search.addWidget(
      instantsearch.widgets.searchBox({
        container: '#js-searchbar',
        wrapInput: false,
        placeholder: 'Rechercher un thème, un speaker, un lieu'
      })
    );
  },
  addStatsWidget() {
    this.search.addWidget(
      instantsearch.widgets.stats({
        container: '#js-stats',
        templates: {
          body: (options) => {
            return `${options.nbHits} résultats trouvés en ${options.processingTimeMS}ms`
          }
        }
      })
    );
  },
  addSpeakersWidget() {
    this.search.addWidget(
      instantsearch.widgets.refinementList({
        container: '#js-speakers',
        attributeName: 'authors.name',
        operator: 'or',
        sortBy: ['isRefined', 'count:desc', 'name:asc'],
        cssClasses: {
          root: '',
          item: '',
          label: 'db relative pointer pa1 hover-purple',
          count: 'absolute right-0 top-0 mr1 br-pill bg-black-20 purple pa1 f6',
          active: 'b purple',
          checkbox: 'dn'
        },
        templates: {
          'header': '<h3 class="title f2 no-b ma0 purple">Speakers</h3>'
        },
        limit: 10,
        showMore: {
          limit: 20,
          templates: Search.showMoreTemplates
        }
      })
    );
  },
  addLocationsWidget() {
    this.search.addWidget(
      instantsearch.widgets.refinementList({
        container: '#js-locations',
        attributeName: 'location',
        operator: 'or',
        sortBy: ['isRefined', 'count:desc', 'name:asc'],
        cssClasses: {
          root: '',
          item: '',
          label: 'db relative pointer pa1 hover-purple',
          count: 'absolute right-0 top-0 mr1 br-pill bg-black-20 purple pa1 f6',
          active: 'b purple',
          checkbox: 'dn'
        },
        templates: {
          'header': '<h3 class="title f2 no-b ma0 purple">Lieux</h3>'
        },
        limit: 10,
        showMore: {
          limit: 20,
          templates: Search.showMoreTemplates
        }
      })
    );
  },
  addHitsWidget() {
    let hitTemplate = $('#js-template-hits').html();
    let noResults = $('#js-template-noresults').html();
    this.search.addWidget(
      instantsearch.widgets.hits({
        container: '#js-hits',
        hitsPerPage: 20,
        cssClasses: {
          root: 'flex-row-wrap mb3',
          item: 'flex-auto flex'
        },
        templates: {
          item: hitTemplate,
          empty: noResults
        },
        transformData: {
          item: Search.transformItem
        }
      })
    );

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
  addPaginationWidget() {
    this.search.addWidget(
      instantsearch.widgets.pagination({
        container: '#js-pagination',
        cssClasses: {
          root: 'flex-row-nowrap justify-center',
          item: 'flex-none flex mh1 bg-purple pa0 shadow-4',
          link: 'white db pa2 link hover-bg-blue',
          active: 'underline b'
        },
        labels: {
          previous: '‹ Précédent',
          next: 'Suivant ›'
        },
        showFirstLast: false
      })
    );
  }
};

export default Search;
