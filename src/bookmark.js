import store from './store.js';
import api from './api.js';

const render = function (generatingFunction) {
  $('main').html(generatingFunction);
};

const showUIError = function(message){
  let err = `
  <div>
  <p>${message}</p>
  </div>`;
  $('#errors-div').html(err);
};

function clearUIError(){
  $('#errors-div').html('');
}

const generateStarRatingElement = function (bookmark) {
  let ratingImageString = '<div class="star-rating flex-item">';

  for(let i=0; i<bookmark.rating; i++) {
    ratingImageString += '<img class="star filled-star" alt="filled rating star" src="./images/star.png" />';
  }

  for(let i=0; i<5-bookmark.rating; i++) {
    ratingImageString += '<img class="star unfilled-star" alt="unfilled rating star" src="./images/no-star.png" />';
  }

  ratingImageString += '</div>';
  return ratingImageString;
};

const generateBookmarkElement = function (bookmark) {
  let bookmarkElementString = `
    <div class="bookmark-element" data-id="${bookmark.id}" tabindex="0">
      <div class="bookmark-section">
        <div>Title:</div>
        <div>${bookmark.title}</div>
      </div>  
      <div class="bookmark-rating bookmark-section">
        <div class="flex-item">Rating:</div>
        ${generateStarRatingElement(bookmark)}
      </div>
  `;

  if(bookmark.expanded) {
    bookmarkElementString += `
      <div class="bookmark-section">
        <div>Description:</div>
        <div>${bookmark.desc}</div>
      </div>
      <div class="bookmark-section">
        <div class="bookmark-link" onclick="event.stopPropagation()"><a href="${bookmark.url}" target="_blank">Visit Site</a></div>
      </div>
      <div class="bookmark-buttons bookmark-section">
        <button class="flex-item delete-button">Delete</button>
      </div>
    `;
  }

  else {
    bookmarkElementString += `
      <span class="expand-prompt">(Click for details)</span></button>`;
  }

  bookmarkElementString += `
    </div>
  `;
  return bookmarkElementString;
};

const generateBookmarkListString = function (bookmarkList) {
  let list = bookmarkList.filter(bookmark => bookmark.rating >= store.state.filter);
  list = list.map(bookmark => generateBookmarkElement(bookmark));
  return list.join('');
};

const generateMainView = function () {
  return `
  <div id="main-wrapper" class='main-wrapper'>
    <button id="create-button" name="create-button">Add New</button>
    <div class="filter-results">
      <label for="filter-results">Filter results</label>
      <select name="filter-results" id="filter-results">
        <option value=""></option>
        <option value="1">★☆☆☆☆</option>
        <option value="2">★★☆☆☆</option>
        <option value="3">★★★☆☆</option>
        <option value="4">★★★★☆</option>
        <option value="5">★★★★★</option>
      </select>
    </div>
    <div class='bkm-list'>
    ${generateBookmarkListString(store.bookmarks)}
    </div>
  </div>
  `;
};

const generateCreateView = function () {
  return `
  <legend>
    <div id="create-view" class="create-view">
      <h2>Create a new bookmark</h2>
      <form id="create-form" action="" method="post">
        <div class="form-field">
          <label for="title">Title:</label>
          <input type="text" name="title" id="title">
        </div>      
        <div class="form-field">
          <label for="url">URL:</label>
          <input type="text" name="url" id="url" value="https://">
        </div>
        <div class="form-field">
          <label for="description">Description:</label>
          <textarea name="description" id="description" placeholder="(optional)"></textarea>
        </div>
        <div class="form-field">
          <label for="rating">Rating:</label>
          <select name="rating" id="rating">      
          <option value=""></option>
          <option value="1">★☆☆☆☆</option>
          <option value="2">★★☆☆☆</option>
          <option value="3">★★★☆☆</option>
          <option value="4">★★★★☆</option>
          <option value="5">★★★★★</option>
          </select>
        </div>
        <div class="form-field">
          <button class="cancel-button" type="button" id="cancel-button">Cancel</button>
          <button class="save-button" type="submit" id="save-button">Save</button>
        </div>
      </form>
    </div>
    </legend>
  `;
};

const generateEditView = function (bookmark) {
  return `
  <legend>
    <div id="edit-view" class="bookmark-element" data-id="${bookmark.id}">
      <h2>Create a new bookmark</h2>
      <form id="edit-form" action="" method="post">
        <div class="form-field">
          <label for="title">Title:</label>
          <input type="text" name="title" id="title" value="${bookmark.title}" required>
        </div>      
        <div class="form-field">
          <label for="url">URL:</label>
          <input type="url" name="url" id="url" value="${bookmark.url}" required>
        </div>
        <div class="form-field">
          <label for="description">Description:</label>
          <textarea name="description" id="description" value="${bookmark.desc}"></textarea>
        </div>
        <div class="form-field">
          <label for="rating">Rating:</label>
          <select name="rating" id="rating" value="${bookmark.rating}" required>      
            <option value="">Select one</option>
            <option value="1">1-star</option>
            <option value="2">2-stars</option>
            <option value="3">3-stars</option>
            <option value="4">4-stars</option>
            <option value="5">5-stars</option>
          </select>
        </div>
        <div class="form-field button-section">
          <input class="cancel-button" type="" id="cancel-button">
          <input class="save-button" type="submit" id="save-button">
        </div>
      </form>
    </div>
    </legend>
  `;
};

const getBookmarkIdFromElement = function (element) {
  return $(element)
    .closest('.bookmark-element')
    .data('id');
};

const handleRatingFilterChange = function () {
  $('main').on('change', '#filter-results', event => {
    let filterSelection = parseInt($(event.target).val());
    store.state.filter = filterSelection;
    render(generateMainView);
  });
};

const handleExpandToggleClick = function () {
  $('main').on('click', '.bookmark-element', event => {
    let id = getBookmarkIdFromElement($(event.target));
    let currentBookmark = store.bookmarks.find(bookmark => bookmark.id === id);
    currentBookmark.expanded = !currentBookmark.expanded;
    render(generateMainView);
  });

  $('main').on('keypress', '.bookmark-element', event => {
    let id = getBookmarkIdFromElement($(event.target));
    let currentBookmark = store.bookmarks.find(bookmark => bookmark.id === id);
    currentBookmark.expanded = !currentBookmark.expanded;
    render(generateMainView);
  });
};

const handleEditButtonClick = function () {
  $('.bookmark-element').on('click', '.edit-button', event => {
    store.state.editing = true;
    const id = $(event.currentTarget).closest('.bookmark-element').data('id');
    render(generateEditView);
  });
};

const handleDeleteButtonClick = function () {
  $('main').on('click', '.delete-button', event => {
    const id = getBookmarkIdFromElement(event.target);
    
    clearUIError();
    
    api.deleteBookmark(id)
      .then(() => {
        store.findAndDelete(id);
        render(generateMainView);
      }).catch((err) => {
        showUIError(err.message);
      });
  });
  
  
  $('main').on('keypress', '.delete-button', event => {
    const id = getBookmarkIdFromElement(event.target);
    
    clearUIError();
    
    api.deleteBookmark(id)
      .then( () => {
        store.findAndDelete(id);
        render(generateMainView);
      }).catch((err) => {
        showUIError(err.message);
      });
  });
};

const handleCancelButtonClick = function () {
  $('main').on('click', '#cancel-button', event => {
    clearUIError();
    store.state.creating = false;
    store.state.editing = false;
    render(generateMainView);
  });
};

const handleSaveButtonClick = function () {

  $('main').on('submit', '#create-form', event => {
    event.preventDefault();
    let title = $('#title').val();
    let url = $('#url').val();
    let desc = $('#description').val();
    let rating = parseInt($('#rating').val());
    let expanded = false;

    let newBookmark = {title, url, desc, rating, expanded};

    clearUIError();

    api.createBookmark(newBookmark)
      .then( (data) => {
        store.addBookmark(data);
        render(generateMainView);
      }).catch((err) => {
        showUIError(err.message);
      });
  });

};

const handleCreateButtonClick = function () {
  $('main').on('click', '#create-button', event => {
    store.state.creating = true;
    render(generateCreateView);
  });
};

const bindEventListeners = function () {
  handleRatingFilterChange();
  handleExpandToggleClick();
  handleCreateButtonClick();
  handleEditButtonClick();
  handleDeleteButtonClick();
  handleCancelButtonClick();
  handleSaveButtonClick();
  showUIError();
  clearUIError();
};

export {
  generateMainView,
  bindEventListeners,
  render,
  showUIError,
  clearUIError,
};