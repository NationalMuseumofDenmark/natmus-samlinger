var Q = require('q');
var _ = require('lodash');
var keystone = require('collections-online/plugins/keystone').module;

var Page = keystone.list('Page');
var MenuItem = keystone.list('Menu item');

module.exports = function(done) {
  var pages = [
    new Page.model({
      title: 'Om os',
      slug: 'om-os',
      state: 'published',
      content: 'En side om os'
    }).save(),
    new Page.model({
      title: 'Rettigheder og brug',
      slug: 'rettigheder',
      state: 'published',
      content: 'En side om rettigheder og brug'
    }).save(),
    new Page.model({
      title: 'Kontakt',
      slug: 'kontakt',
      state: 'published',
      content: 'En side om hvordan vi kan kontaktes'
    }).save(),
    new Page.model({
      title: 'Hjælp',
      slug: 'hjælp',
      state: 'published',
      content: 'Her kan du få hjælp ...'
    }).save()
  ];

  Q.all(_.values(pages)).then(function(createPages) {
    pages = {};
    createPages.forEach((page) => {
      pages[page.slug] = page;
    });

    var menuItems = [
      // Footer:
      // - Om os
      // - Rettigheder og brug
      // - Kontakt
      // - Hvad er kbhbilleder?
      new MenuItem.model({
        title: 'Om os',
        page: pages['om-os']._id,
        placement: 'footer',
        order: 1
      }).save(),
      new MenuItem.model({
        title: 'Rettigheder og brug',
        page: pages['rettigheder-og-brug']._id,
        placement: 'footer',
        order: 2
      }).save(),
      new MenuItem.model({
        title: 'Kontakt',
        page: pages['kontakt']._id,
        placement: 'footer',
        order: 3
      }).save(),

      new MenuItem.model({
        title: 'Nationalmuseets Samlinger Online',
        link: '/',
        placement: 'main',
        order: 1
      }).save(),
      new MenuItem.model({
        title: 'Avanceret søgning',
        link: '/?q',
        placement: 'main',
        order: 2
      }).save(),
      new MenuItem.model({
        title: 'Hjælp',
        page: pages['hjaelp']._id,
        placement: 'main',
        order: 3
      }).save(),
      new MenuItem.model({
        title: 'Om Nationalmuseets Samlinger Online',
        page: pages['om-os']._id,
        placement: 'main',
        order: 4
      }).save(),
      new MenuItem.model({
        title: 'Kontakt',
        page: pages['kontakt']._id,
        placement: 'main',
        order: 5
      }).save()
    ];
    return Q.all(menuItems);
  }).then(function() {
    done();
  }, console.error);
};
