// AUTHENTICATION TOKEN
let user_token = null;

// API URL
const basic_api_url = 'https://sandrozimmer.pythonanywhere.com/sisys';

// USER TAGS
let user_tags = null;

document.addEventListener("DOMContentLoaded", function () {

    // CONTAINER ELEMENTS
    const search = document.querySelector('#search');
    const search__basic = document.querySelector('#search__basic');
    const search__basic__keyword = document.querySelector('#search__basic__keyword');
    const search_advanced = document.querySelector('#search_advanced');
    const container_alert = document.querySelector('#container_alert');
    const form_login = document.querySelector('#form_login');
    const login_alert = document.querySelector('#login_alert');
    const content = document.querySelector('#content');
    const content__info_cards = document.querySelector('#content__info_cards');
    const content__new_info = document.querySelector('#content__new_info');
    const content__new_info__tags = document.querySelector('#content__new_info__tags');
    const content__edit_info = document.querySelector('#content__edit_info');
    const content__edit_info__title = document.querySelector('#content__edit_info__title');
    const content__edit_info__text = document.querySelector('#content__edit_info__title');
    const content__edit_tags = document.querySelector('#content__edit_tags');
    const content__edit_tags__input_new_tag = document.querySelector('#content__edit_tags__input_new_tag');

    // MOUNT TAGS MENU
    mountTagsMenu();


    // BUTTON LISTENER    
    document.querySelector('#search__basic__btn_search').onclick = function() {
        searchInfo();
    }

    document.querySelector('#search__basic__btn_new_info').onclick = function() {
        newInfo();
    }    

    document.querySelector('#search__basic__btn_edit_tags').onclick = function() {
        editTags();
    }

    document.querySelector('#search__btn_home').onclick = function() {
        goHome();
    }

    document.querySelector('#content__edit_info__btn_save').onclick = function() {
        saveEditInfo();
    }

    document.querySelector('#content__edit_info__btn_cancel').onclick = function() {
        exitEditInfo();
    }

    document.querySelector('#content__edit_info__btn_delete').onclick = function() {
        deleteEditInfo();
    }

    document.querySelector('#content__edit_tags__btn_save_new_tag').onclick = function() {
        saveNewTag();
    }

    document.querySelector('#form_login__btn_login').onclick = function() {
        logInUser();
    }

    document.querySelector('#search__logout').onclick = function() {
        logOutUser();
    }

    document.querySelector('#btn_import').onclick = function() {
        importInfo();
    }  

    // KEYBOARD SHORTCUT KEYS LISTENER
    window.addEventListener("keydown", function(event) {
        if (event.defaultPrevented) {
          return; // Do nothing if event already handled
        }
      
        switch(event.code) {
            case "Enter":
            case "NumpadEnter":
                if (search__basic__keyword === document.activeElement) {
                    searchInfo();
                    break;                  
                }
                break;
            case "Escape":
                goHome();
                break;
        }
        return;
    })
})

///////////////////////////////
// FUNCTIONS
///////////////////////////////

// Get token from local storage
function getLocalToken() {
    let local_token = localStorage.getItem('sisys_token');
    return local_token
}

// Check user login
function checkLogin() {
    let sisys_token = localStorage.getItem('sisys_token');
    if(sisys_token == null || sisys_token == '') {
        return false
    } else {
        return true
    }
}

function logInUser() {
    let email = document.querySelector('#form_login__email').value;
    let password = document.querySelector('#form_login__password').value;

    // Send data to API - POST method
    fetch(basic_api_url + '/login/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
        body: JSON.stringify({
            'username': email,
            'password': password,
        })
    })
    .then(response => {
        if (!response.ok) {
            login_alert.style.display = 'block';
            setTimeout(function(){login_alert.style.display = 'none'}, 4000);
            return
        } else {
            return response.json();
        }
    })
    .then(result => {
        if (result != undefined && !result.error) {
            localStorage.setItem('sisys_token', 'Token ' + result.token);
            user_token = getLocalToken();
            mountTagsMenu();
            goHome();
            document.querySelector('#form_login__email').value = '';
            document.querySelector('#form_login__password').value = '';
            return
        } else {
            return
        }
    })    
    return
}

function logOutUser() {
    localStorage.removeItem('sisys_token');
    user_token = null;
    mountTagsMenu();
    return
}

function goLogin() {
    search.style.display = 'none';
    content.style.display = 'none';
    form_login.style.display = 'block';
    return
}

// Hide all elements from content area (keeps search menu visible)
function hideContent() {
    content__info_cards.style.display = 'none';
    content__new_info.style.display = 'none';
    content__edit_info.style.display = 'none';
    content__edit_tags.style.display = 'none';

    content__info_cards.innerHTML = '';
    content__new_info__tags.innerHTML = '';
    content__edit_info__tags.innerHTML = '';

    return
}

// Go to starting point (ready to make a search)
function goHome() {

    // Check user login
    if(!checkLogin()) {
        goLogin();
        return
    } else {
        user_token = getLocalToken();
    }

    hideContent();
    form_login.style.display = 'none';
    search.style.display = 'block';
    search__basic__keyword.value = '';
    search__basic__keyword.focus();
    content__edit_tags__input_new_tag.value = '';

    // Uncheck all tags in advanced search menu
    let element = document.querySelectorAll('[id^="search__advanced__tags__radio_"]');
    for (let x = 0; x < element.length; x++) {
        element[x].checked = false;
    }
    return
}

// Get user tags
function mountTagsMenu() {
    // Clear Search Advanced menu tags
    search__advanced__tags.innerHTML = '';

    // Clear Edit Tags menu tags
    let content__edit_tags__tag_item = document.querySelectorAll('.content__edit_tags__tag_item');
    content__edit_tags__tag_item.forEach ( item => {
        item.remove();
    })

    // Check user login
    if(!checkLogin()) {
        goLogin();
        return
    } else {
        user_token = getLocalToken();
    }

    const userTags = fetch(basic_api_url + '/tag', {
        headers: {
            'Authorization': user_token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw Error(response.status + ' ' + response.statusText);
        } else {
            return response.json();
        }
    })
    .then((data) => {
        user_tags = data;
        data.forEach (tag => {
            // Mount Search Advanced menu
            let radio_tags = `
            <input type="radio" class="btn-check" name="search__advanced__tags__radio" id="search__advanced__tags__radio_${tag.id}" autocomplete="off" value='${tag.id}'>
            <label class="btn btn-outline-primary" for="search__advanced__tags__radio_${tag.id}">${tag.text}</label>`
    
            search__advanced__tags.innerHTML += radio_tags;
            search.style.display = 'block';

            // Mount Edit Tags menu
            let tag_item = `
            <div class="input-group mb-3 content__edit_tags__item content__edit_tags__tag_item" id="content__edit_tags__tag_item_${tag.id}">
                <input type="text" class="form-control" id="content__edit_tags__tag_input_${tag.id}" value="${tag.text}">
                <button class="btn btn-outline-success edit-tag-btn-save" type="button" data-info_id="${tag.id}">Save</button>
                <button class="btn btn-outline-danger edit-tag-btn-delete" type="button" data-info_id="${tag.id}">Delete</button>
            </div>`

            document.querySelector('#content__edit_tags__container_new_tag').insertAdjacentHTML('afterend', tag_item);            
            })

            document.querySelectorAll(".edit-tag-btn-save").forEach(button => {
                button.onclick = function() {
                    let tag_text = document.querySelector('#content__edit_tags__tag_input_' + this.dataset.info_id).value;
                    editThisTag(this.dataset.info_id, tag_text);
                }
            })

            document.querySelectorAll(".edit-tag-btn-delete").forEach(button => {
                button.onclick = function() {
                    deleteThisTag(this.dataset.info_id);
                }
            })
            return
    })
    .catch(error => console.log(error))
}

// Show alert message
// type can be 'success' OR 'warning' OR 'danger' OR 'info'
// position can be 'top' OR 'bottom'
function showAlert(type,position,text) {
    let alert_box = `
    <div class="container-fluid fixed-${position} alert-dismissible fade show text-center sisys_alert" id="content__alert">
        <div class="alert alert-${type}" role="alert">
            <strong>${text}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    </div>`
    container_alert.innerHTML += alert_box;
    document.querySelector('#content__alert').style.display = 'block';
    setTimeout(function(){document.querySelector('#content__alert').remove()}, 4000);
    return
}

// Show info in the screen
function showInfo(info_id, info_title, info_text, info_tags) {
    let info_card = `
    <div class="card my-2" id='content__info_cards__info_card_${info_id}'>
        <div class="card-body position-relative">
            <div class="container position-absolute text-center top-50 start-50 translate-middle copy_icon">
                <div><i class="bi bi-clipboard-check"></i></div>
                <div>Text coppied!</div>
            </div>        
            <h5 class="card-title" id='info_title_${info_id}'>${info_title}</h5>
            <p class="card-text" id='info_text_${info_id}'>${info_text}</p>
        </div>
        <div class="card-footer text-muted d-inline-flex">
            <div class="container info_tags" id="info_tags_${info_id}">
            </div>
            <div class="d-flex flex-row-reverse">
                <button type="button" class="btn btn-sm btn-outline-primary btn-edit-info" id='btn_edit_info_${info_id}' data-info_id="${info_id}" data-info_tags="${info_tags}">Edit</button>
            </div>
        </div>
    </div>`

    content__info_cards.innerHTML += info_card;
                    
    info_tags.forEach(tag => {
        let tag_text = user_tags.find(x => x.id == tag).text;
        let t = `
        <span class="badge rounded-pill">${tag_text}</span>`
        document.querySelector('#info_tags_' + info_id).innerHTML += t;
    })
    content__info_cards.style.display = 'block';
    content.style.display = 'block';

    document.querySelectorAll(".btn-edit-info").forEach(button => {
        button.onclick = function() {
            editInfo(this.dataset.info_id, this.dataset.info_tags);
        }
    })

    document.querySelectorAll(".card").forEach(card => {
        card.querySelector('.card-body').onclick = function() {
            let text = this.querySelector('.card-text').innerHTML;
            copyInfo(text);
            this.querySelector('.copy_icon').style.display = "block";
            setTimeout(function(){card.querySelector('.copy_icon').style.display = "none"}, 2000);
        }
    })

    return
}

////////////////////////////////
// BUTTON FUNCTIONS
////////////////////////////////

// Copy info text to clipboard
function copyInfo(text) {
    navigator.clipboard.writeText(text);

    return;
}

// Search info containing the keyword
function searchInfo() {
    // Clear content area
    hideContent();

    // Get keyword
    const keyword = search__basic__keyword.value;

    // Get selected tag, if any
    let selected_tag = '';
    let search__advanced__tags__radio = document.querySelector('input[name="search__advanced__tags__radio"]:checked');
    if (search__advanced__tags__radio != null) {
        selected_tag = search__advanced__tags__radio.value;
    }

    // Check if there is a keyword OR a selected tag
    if (keyword.trim().length === 0 && selected_tag == '') {
        showAlert('warning', 'top', 'Please type a keyword.');
        return
    }

    let tag_search_parameter = '';

    if (selected_tag != '') {
        tag_search_parameter = '&tags=' + selected_tag;
    }

    // Array of found info
    let info_found = [];   

    // Send API request to search info by keyword in TITLE field
    fetch(basic_api_url + '/info/?title__icontains=&text__icontains=' + keyword + tag_search_parameter, {
        headers: {
            'Authorization': user_token}
        })
    .then(response => {
        if (!response.ok) {
            throw Error(response.status + ' ' + response.statusText);
        } else {
            return response.json();
        }
    }  )
    .then((data) => {
        if(!data.error) {
                data.forEach(info => {
                    info_found.push(info.id);
                    showInfo(info.id, info.title, info.text, info.tags);
                })
                search_info_in_text();
        } else {
            return false
        }
    })

    function search_info_in_text() {
        // Send API request to search info by keyword in TEXT field
        fetch(basic_api_url + '/info/?title__icontains=' + keyword + '&text__icontains=' + tag_search_parameter, {
            headers: {
                'Authorization': user_token}
            })
        .then(response => {
            if (!response.ok) {
                throw Error(response.status + ' ' + response.statusText);
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if(!data.error) {
                    data.forEach(info => {
                        if (!(info_found.includes(info.id))) {
                            info_found.push(info.id);
                            showInfo(info.id, info.title, info.text, info.tags);
                        }
                    })
                    if (info_found.length == 0) {
                        showAlert('danger', 'top', 'You have no results.')
                    } else {
                        showAlert('success', 'top', 'You have found ' + info_found.length + ' info.')
                    }
            } else {
                return false
            }
        })
    }

    return
}

function newInfo() {
    hideContent();

    user_tags.forEach (tag => {
        let checkbox_tags = `
        <input type="checkbox" class="btn-check" name="content__new_info__tags" id="content__new_info__tags_${tag.id}" autocomplete="off" value='${tag.id}'>
        <label class="btn btn-outline-primary" for="content__new_info__tags_${tag.id}">${tag.text}</label>`

        content__new_info__tags.innerHTML += checkbox_tags;
    })

    content__new_info__tags.style.display = 'block';
    content__new_info.style.display = 'block';
    content.style.display = 'block';
    return
}

function getCheckedTags(element_name) {
    let checked_tags = [];
    const element = document.getElementsByName(element_name);
    for (let i=0; i<element.length; i++) {
        if (element[i].checked) {
            let tag_id = parseInt(element[i].value);
            checked_tags.push(tag_id);
        }
    }
    return checked_tags
}

function saveNewInfo() {
    title = content__new_info__title.value;
    text = content__new_info__text.value;

    let checked_tags = getCheckedTags('content__new_info__tags');

    if(checked_tags == '') {
        let confirmation = confirm("There is no TAG selected. Do you want to proceed?");
        if (confirmation != true) {
            return false;
        } 
    }

    // Send data to API - POST method
    fetch(basic_api_url + '/info/', {
        method: 'POST',
        headers: {
            'Authorization': user_token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
        body: JSON.stringify({
            'title': title,
            'text': text,
            'tags': checked_tags,
        })
    })
    .then(response => {
        if (!response.ok) {
            throw Error(response.status + ' ' + response.statusText);
        } else {
            return response.json();
        }
    })
    .then(result => {
        if (!result.error) {
            showAlert('success','top','Info saved!');
            content__new_info__title.value = '';
            content__new_info__text.value = '';
            return true;
        } else {
            return false;
        }
    })
}

function editInfo(info_id, info_tags) {
    let title = document.querySelector('#info_title_' + info_id).innerHTML;
    let text = document.querySelector('#info_text_' + info_id).innerHTML;

    content__edit_info__title.dataset.info_id = info_id;
    content__edit_info__title.value = title;
    content__edit_info__text.value = text;

    user_tags.forEach (tag => {
        let checkbox_tags = `
        <input type="checkbox" class="btn-check" name="content__edit_info__tags" id="content__edit_info__tags_${tag.id}" value='${tag.id}'>
        <label class="btn btn-outline-primary" for="content__edit_info__tags_${tag.id}">${tag.text}</label>`

        info_tags_array = JSON.parse('[' + info_tags + ']');

        content__edit_info__tags.innerHTML += checkbox_tags;

        if(info_tags_array.includes(tag.id)) {
            document.querySelector('#content__edit_info__tags_' + tag.id).setAttribute('checked', true);
        }
    })

    content__info_cards.style.display = 'none';
    content__edit_info.style.display = 'block';
    
    return
}

function saveEditInfo() {
    let info_id = document.querySelector('#content__edit_info__title').dataset.info_id;
    let title = document.querySelector('#content__edit_info__title').value;
    let text = document.querySelector('#content__edit_info__text').value;
    let checked_tags = getCheckedTags('content__edit_info__tags');

    if(checked_tags == '') {
        let confirmation = confirm("There is no TAG selected. Do you want to proceed?");
        if (confirmation != true) {
            return false;
        } 
    }

    // Send data to API - PUT method
    fetch(basic_api_url + '/info/' + info_id, {
        method: 'PUT',
        headers: {
            'Authorization': user_token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
        body: JSON.stringify({
            'id': info_id,
            'title': title,
            'text': text,
            'tags': checked_tags,
        })
    })
    .then(response => {
        if (!response.ok) {
            throw Error(response.status + ' ' + response.statusText);
        } else {
            return response.json();
        }
    })
    .then(result => {
        if (!result.error) {
            showAlert('success','top','Info updated!');
            document.querySelector('#info_title_' + info_id).innerHTML = content__edit_info__title.value;
            document.querySelector('#info_text_' + info_id).innerHTML = content__edit_info__text.value;

            document.querySelector('#info_tags_' + info_id).innerHTML = '';
            checked_tags.forEach(tag => {
                let tag_text = user_tags.find(x => x.id == tag).text;
                let t = `
                <span class="badge rounded-pill">${tag_text}</span>`
                document.querySelector('#info_tags_' + info_id).innerHTML += t;
            })

            document.querySelector('#btn_edit_info_' + info_id).dataset.info_tags = checked_tags;

            exitEditInfo();
            return true;
        } else {
            return false;
        }
    })

}

function exitNewInfo() {
    content__new_info.style.display = 'none';
    content__new_info__title.value = '';
    content__new_info__text.value = '';
    content__new_info__tags.innerHTML = '';
    goHome();
    return
}

function exitEditInfo() {
    content__edit_info.style.display = 'none';
    content__info_cards.style.display = 'block';
    content__edit_info__title.value = '';
    content__edit_info__text.value = '';
    content__edit_info__tags.innerHTML = '';
    return
}

function deleteEditInfo() {
    let confirmation = confirm("Do you want to DELETE this info?");
    if (confirmation != true) {
        return false;
    }    

    let info_id = document.querySelector('#content__edit_info__title').dataset.info_id;

    // Send data to API - POST method
    fetch(basic_api_url + '/info/' + info_id, {
        method: 'DELETE',
        headers: {
            'Authorization': user_token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw Error(response.status + ' ' + response.statusText);
        } else {
            return response;
        }
    })
    .then(result => {
        if (!result.error) {
            document.querySelector('#content__info_cards__info_card_' + info_id).remove();                
            showAlert('success','top','Info deleted successfuly!');        
            exitEditInfo();
            return true;
        } else {
            return false;
        }
    })
    return
}

function editTags() {
    hideContent();
    content__edit_tags.style.display = 'block';
    content.style.display = 'block';
    return
}

function saveNewTag() {
    let text = document.querySelector('#content__edit_tags__input_new_tag').value;

    if(text.trim().length === 0) {
        return
    }

    // Send data to API - POST method
    fetch(basic_api_url + '/tag/', {
        method: 'POST',
        headers: {
            'Authorization': user_token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
        body: JSON.stringify({
            'text': text,
        })
    })
    .then(response => {
        if (!response.ok) {
            throw Error(response.status + ' ' + response.statusText);
        } else {
            return response.json();
        }
    })
    .then(result => {
        if (!result.error) {
            showAlert('success','top','Tag saved!');
            document.querySelector('#content__edit_tags__input_new_tag').value = '';
            mountTagsMenu();
            editTags();
            return true;
        } else {
            return false;
        }
    })
    return    
}

function editThisTag(tag_id, tag_text) {
    // Check if tag is empty or withespace
    if(tag_text.trim().length === 0) {
        return
    }

    // Send data to API - PUT method
    fetch(basic_api_url + '/tag/' + tag_id, {
        method: 'PUT',
        headers: {
            'Authorization': user_token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
        body: JSON.stringify({
            'id': tag_id,
            'text': tag_text,
        })
    })
    .then(response => {
        if (!response.ok) {
            throw Error(response.status + ' ' + response.statusText);
        } else {
            return response.json();
        }
    })
    .then(result => {
        if (!result.error) {
            showAlert('success','top','Tag updated!');
            document.querySelector('#content__edit_tags__tag_input_' + tag_id).value = tag_text;
            document.querySelector('label[for="search__advanced__tags__radio_' + tag_id + '"]').innerHTML = tag_text;
            return
        } else {
            return false;
        }
    })    
}

function deleteThisTag(tag_id) {
    let confirmation = confirm("Do you want to DELETE this tag?");
    if (confirmation != true) {
        return false;
    }  

    // Send data to API - DELETE method
    fetch(basic_api_url + '/tag/' + tag_id, {
        method: 'DELETE',
        headers: {
            'Authorization': user_token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw Error(response.status + ' ' + response.statusText);
        } else {
            return response;
        }
    })
    .then(result => {
        if (!result.error) {
            showAlert('success','top','Tag deleted!');
            document.querySelector('#content__edit_tags__tag_item_' + tag_id).remove();
            document.querySelector('#search__advanced__tags__radio_' + tag_id).remove();
            document.querySelector('label[for="search__advanced__tags__radio_' + tag_id + '"]').remove();
            user_tags.splice(user_tags.findIndex(tag => tag.id === tag_id), 1);
            return
        } else {
            return false;
        }
    }) 
    return
}

function importInfo() {
    console.log('import!!!!');

    fetch('https://sandrozimmer.pythonanywhere.com/static/db.json',
    {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })
    .then((response) => response.json())
    .then((json) => {
        json.forEach( item => {
            let title = item.title;
            let text = item.info;

            if(title == '' || title == null){
                title = '_';
            }

            setTimeout(function(){console.log('Enviar info.')}, 1000);
            
            // Send data to API - POST method
            fetch(basic_api_url + '/info/', {
                method: 'POST',
                headers: {
                    'Authorization': user_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'},
                body: JSON.stringify({
                    'title': title,
                    'text': text,
                    'tags': [28],
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw Error(response.status + ' ' + response.statusText);
                } else {
                    return response.json();
                }
            })
            .then(result => {
                if (!result.error) {
                    console.log('Info OK!');
                    return true;
                } else {
                    return false;
                }
            })            
        })
    })
    
    return
}