const search = {
  index: {},
  results: [],
  DOM: {
    bar: new mdc.textField.MDCTextField(document.getElementById('search_bar')),
    list: document.getElementById('search_results')
  },
  render: function() {
    while (search.DOM.list.firstChild) {
      search.DOM.list.removeChild(search.DOM.list.firstChild);
    }
    if (search.results.length === 0) {
      const list_item = document.createElement('li');
      list_item.classList.add('mdc-list-item');
      list_item.textContent = search.DOM.bar.input_.value === '' ? 'No customers' : 'No search results';
      search.DOM.list.appendChild(list_item);
    } else {
      search.results
        .sort((a, b) => {
          a = a[1].toLowerCase();
          b = b[1].toLowerCase();
          return a < b ? -1 : (a > b ? 1 : 0)
        })
        .slice(0, 50)
        .forEach(result => {
          const cid = result[0];
          const list_item = document.createElement('li');
          list_item.classList.add('mdc-list-item');
          list_item.textContent = search.index[cid];
          mdc.ripple.MDCRipple.attachTo(list_item);
          list_item.addEventListener('click', () => {
            if (profile.cid != cid) {
              profile.render(cid);
              if (search.selected) {
                search.selected.classList.remove('mdc-list-item--selected');
              }
              search.selected = list_item;
              search.selected.classList.add('mdc-list-item--selected');
            }
          });
          search.DOM.list.appendChild(list_item);
        });
      if (search.results.length > 50) {
        const list_item = document.createElement('li');
        list_item.classList.add('mdc-list-item');
        list_item.textContent = 'Search To See More Results';
        search.DOM.list.appendChild(list_item);
      }
    }
  },
  update: function(cid) {
    const query = search.DOM.bar.input_.value.trim().toLowerCase().split(' ');
    const name = search.index[cid];
    search.results = search.results.filter(result => result[0] != cid);
    if (query.every(chunk => name.toLowerCase().split(' ').some(part => part.startsWith(chunk)))) {
      search.results.push([cid, name]);
      search.render();
    }
  },
  keyup: function() {
    const results = []
    const query = search.DOM.bar.input_.value.trim().toLowerCase().split(' ');
    for (let cid in search.index) {
      const name = search.index[cid];
      if (query.every(chunk => name.toLowerCase().split(' ').some(part => part.startsWith(chunk)))) {
        results.push([cid, name]);
      }
    }
    // if Array search.results != Array results, reduces number of renders
    if (search.results.length != results.length || search.results.some((value, index) => value[0] != results[index][0]) || search.results.length == 0) {
      search.results = results;
      search.render();
    }
  },
  init: function() {
    this.DOM.bar.input_.addEventListener('keyup', this.keyup);
    this.keyup();
  }
};
