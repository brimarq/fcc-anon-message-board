# fCC Information Security and Quality Assurance Projects: Anon Message Board  

- Build a full stack JavaScript app that is functionally similar to this: [https://horn-celery.glitch.me/](https://horn-celery.glitch.me/).  
- Working on this project will involve you writing your code on Glitch on our starter project. After completing this project you can copy your public glitch url (to the homepage of your app) and paste into [this 'unofficial' app](https://pricey-hugger.glitch.me/) to test it! Optionally you may choose to write your project on another platform but must be publicly visible for our testing.  
- Start this project on Glitch using [this link](https://glitch.com/#!/import/github/freeCodeCamp/boilerplate-project-messageboard/) or clone [this repository](https://github.com/freeCodeCamp/boilerplate-project-messageboard/) on GitHub. If you use Glitch, remember to save the link to your project somewhere safe.

---

1) Set `NODE_ENV` to `test` without quotes when ready to write tests and `MONGODB_URI` to your database connection string (in `.env`)
2) Recommended to create controllers/handlers and handle routing in `routes/api.js`.  
3) You will add any security features to `server.js`.  
4) You will create all of the functional/unit tests in `tests/2_functional-tests.js` and `tests/1_unit-tests.js` but only functional will be tested.  

---

## User Stories  
* [ ] 1. Only allow your site to be loading in an iframe on your own pages.  
* [ ] 2. Do not allow DNS prefetching.  
* [ ] 3. Only allow your site to send the referrer for your own pages.  
* [ ] 4. I can **POST** a thread to a specific message board by passing form data `text` and `delete_password` to `/api/threads/{board}` (recommend `res.redirect` to board page `/b/{board}`). Saved will be `_id`, `text`, `created_on` (date&time), `bumped_on` (date&time, starts same as `created_on`), `reported` (boolean), `delete_password`, & `replies` (array).  
* [ ] 5. I can **POST** a reply to a thread on a specific board by passing form data `text`, `delete_password`, & `thread_id` to `/api/replies/{board}` and it will also update the `bumped_on` date to the comment date (recommend `res.redirect` to thread page `/b/{board}/{thread_id}`). In the thread's 'replies' array will be saved `_id`, `text`, `created_on`, `delete_password`, & `reported`.  
* [ ] 6. I can **GET** an array of the most recent 10 bumped threads on the board with only the most recent 3 replies from `/api/threads/{board}`. The `reported` and `delete_passwords` fields will not be sent.  
* [ ] 7. I can **GET** an entire thread with all it's replies from `/api/replies/{board}?thread_id={thread_id}`. Also hiding the same fields.  
* [ ] 8. I can delete a thread completely if I send a **DELETE** request to `/api/threads/{board}` and pass along the `thread_id` & `delete_password`. (Text response will be 'incorrect password' or 'success').  
* [ ] 9. I can delete a post (just changing the text to '[deleted]') if I send a **DELETE** request to `/api/replies/{board}` and pass along the `thread_id`, `reply_id`, & `delete_password`. (Text response will be 'incorrect password' or 'success').  
* [ ] 10. I can report a thread and change it's reported value to true by sending a **PUT** request to `/api/threads/{board}` and pass along the `thread_id`. (Text response will be 'success').  
* [ ] 11. I can report a reply and change it's reported value to true by sending a **PUT** request to `/api/replies/{board}` and pass along the `thread_id` & `reply_id`. (Text response will be 'success').  
* [ ] 12. Complete functional tests that wholly test routes and pass.  

|   | GET | POST | PUT | DELETE |
|---|---|---|---|---|
| /api/threads/{board} | list recent threads | create thread | report thread | delete thread with password |
| /api/replies/{board} | show all replies on thread | create reply on thread | report reply on thread | change reply to '[deleted]'on thread |

---

## Issues/"Gotchas"  

### Flaw in unofficial tester   
Contrary to the specs in the user stories, the [unofficial tester](https://pricey-hugger.glitch.me) expects 'reported' to be the response from successful PUT requests 
(See [here](https://github.com/JosephLivengood/FCC_InfoSec_QA_API-tester/blob/d9091e2970da2c7fe5d2175efe9e017ab4b4b53a/public/tests.js#L1099) and [here](https://github.com/JosephLivengood/FCC_InfoSec_QA_API-tester/blob/d9091e2970da2c7fe5d2175efe9e017ab4b4b53a/public/tests.js#L1123)). Using 'success' (as instructed above) to pass your own functional tests will fail those tests in the tester unless you code a 'workaround'. Here's a hint: the unofficial tester uses the `fcc` board for queries.

### Undocumented field requirement
The reply counter displayed before the 'See the full thread here' link on the `board.html` page expects a `replycount` field on each thread returned from the GET request to `/api/threads/:board`. If this field is not present, the reply counter will display 'undefined replies total (NaN hidden)'. This is *not mentioned anywhere in the user stories*. See [boilerplate](https://github.com/freeCodeCamp/boilerplate-project-messageboard/search?q=replycount&unscoped_q=replycount) vs [example project](https://github.com/JosephLivengood/ISQA_3-Anon-Message-Board/search?q=replycount&unscoped_q=replycount).  

### Broken forms for reporting threads  
In the boilerplate code, the `<script>` tags in both `board.html` and `thread.html` use `name="report_id"` in the forms for reporting threads, which breaks the "Report" buttons for threads on those pages. Correction: `name="thread_id"`. See [here](https://github.com/freeCodeCamp/boilerplate-project-messageboard/search?q=report_id+path%3A%2Fviews%2F&unscoped_q=report_id+path%3A%2Fviews%2F). 

### Misleading `<form>` action
In `index.html`, `action="/api/threads/test"` is used in POST forms, giving the initial impression that inputs for those are being submitted to the `test` board. **They're NOT**. Each HTML form submission is actually handled by jQuery in the script at the end of the page, where (in the case of these POST forms) the URL is re-written to match the board name that is submitted. Why these are coded this way (when the others are not) is a mystery. At best, the inconsistency seems to be bad form (excuse the pun); at worst - it's just plain misleading. "WTH...Do I need to juggle *two* `board` values with these, one in `req.params` and one in `req.body`?!" Nope. The one in `req.params` is the only one to use for coding the API.  

