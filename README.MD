# Search Info System - SIS

Front-end project to consume the REST API sisys_api.

## Resources used to develop this project:
- HTML5
- CSS3
- JavaScript
- Bootstrap

## The system allows the user:
- Get an authorization token to access the API (login).
- Get data from API (search for information by keyword).
- Save new data to API.
- Update data in API.
- Delete data in API.
  
## Login screen
The login screen is composed by the logo, the system name, fields for usename and password and login button.

In this project, it was not established a way to create user. So, it is necessary to the API administrator to create a new user and to generate a token autorization access. With username and password, the user will be able to login and receive its token.

Important to notice that the API request an email as username.

After login, the system will save the access token at the browser local storage and will be kept there untill user logs out or local storage is deleted from browser.

![SIS login screen](/document/sis_login.png "SIS login screen")

## Main screen
After login, the user get to the main screen, where we have:
- A SIS icon, which is a link to this starting page.
- An input search field, where the user will type their keywords.
- The search button to perform the search. This can be done by pressing the Enter key.
- An Advanced button that shows some more options.
- The name os the user logged in.
- And a Logout button to disconnect user and go back to login page.

![SIS main screen](/document/sis_main_screen.png "SIS main screen")

## The Advanced Menu

The main screen is aimed to be as clean as possible. The user should be able to just arrive and make a search.

The Advanced Menu options allows the user to:

- Set a tag and search for info only with the selected tag.
- Edit tags, including creating new and deleting any.
- Create new info.

![SIS advanced menu](/document/advanced_menu.png "SIS advanced menu")

## The search result

When a search is executed, the result will be a list of items containing the keyword typed. There is an  alert message informing how many items were found.

We also can notice that there is an edit button in every item, where is possible to edit the title and text, change related tags or even delete that item.

![SIS search result](/document/search_result.png "SIS search result")

## Copy function

If the user moves the cursor over the item, it will turn green. And when clicked, the text is copied to clipboard.

This is the main use of the system: provide a quick and easy way to find and copy a piece of information.

![SIS copy text](/document/copy_text.png "SIS copy text")

